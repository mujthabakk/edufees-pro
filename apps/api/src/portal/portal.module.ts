import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Injectable,
  Module,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMode, UserRole } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentsService } from '../payments/payments.service';
import {
  PAYMENT_GATEWAY,
  PaymentGatewayService,
} from '../providers/payment/payment-gateway.interface';

class InitiatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assignmentId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assignmentId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gatewayOrderId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gatewayPaymentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature!: string;
}

@Injectable()
class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly payments: PaymentsService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGatewayService,
  ) {}

  private requireUserId(): string {
    const userId = this.tenant.userId;
    if (!userId) throw new ForbiddenException('No user context');
    return userId;
  }

  private async requireLinkedStudent() {
    const userId = this.requireUserId();
    const student = await this.prisma.student.findFirst({
      where: { userId },
      include: { school: { select: { currency: true } } },
    });
    if (!student) throw new NotFoundException('No linked student record');
    return student;
  }

  /** Parent/student: the student linked to the current login. */
  async myStudent() {
    const userId = this.requireUserId();
    const student = await this.prisma.student.findFirst({
      where: { userId },
      include: {
        class: true,
        division: true,
        feeAssignments: {
          select: { netAmount: true, paidAmount: true, status: true },
        },
      },
    });
    if (!student) throw new NotFoundException('No linked student record');
    const totalFee = student.feeAssignments.reduce(
      (s, a) => s + Number(a.netAmount),
      0,
    );
    const paidAmount = student.feeAssignments.reduce(
      (s, a) => s + Number(a.paidAmount),
      0,
    );
    return {
      id: student.id,
      fullName: student.fullName,
      admissionNo: student.admissionNo,
      className: student.class?.name ?? null,
      divisionName: student.division?.name ?? null,
      totalFee,
      paidAmount,
      balance: totalFee - paidAmount,
    };
  }

  async myFees() {
    const student = await this.requireLinkedStudent();
    const assignments = await this.prisma.studentFeeAssignment.findMany({
      where: { studentId: student.id },
      include: { feeStructure: { include: { feeType: true } } },
      orderBy: { dueDate: 'asc' },
    });
    return assignments.map((a) => ({
      id: a.id,
      feeTypeName: a.feeStructure.feeType.name,
      netAmount: Number(a.netAmount),
      paidAmount: Number(a.paidAmount),
      dueDate: a.dueDate.toISOString(),
      status: a.status,
    }));
  }

  async myInvoices() {
    const student = await this.requireLinkedStudent();
    const invoices = await this.prisma.invoice.findMany({
      where: { studentId: student.id },
      include: { payment: { select: { amount: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map((i) => ({
      id: i.id,
      invoiceNo: i.invoiceNo,
      amount: Number(i.payment.amount),
      date: i.createdAt.toISOString(),
      hasPdf: Boolean(i.pdfUrl),
    }));
  }

  async initiatePayment(dto: InitiatePaymentDto) {
    const student = await this.requireLinkedStudent();
    const assignment = await this.prisma.studentFeeAssignment.findFirst({
      where: { id: dto.assignmentId, studentId: student.id },
    });
    if (!assignment) throw new NotFoundException('Fee assignment not found');

    const balance =
      Number(assignment.netAmount) - Number(assignment.paidAmount);
    if (dto.amount > balance) {
      throw new BadRequestException('Amount exceeds outstanding balance');
    }

    const order = await this.gateway.createOrder({
      amount: dto.amount,
      currency: student.school?.currency ?? 'INR',
      receipt: `assignment_${assignment.id}`,
      notes: {
        studentId: student.id,
        assignmentId: assignment.id,
      },
    });

    const mockPaymentId = `pay_mock_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const signature = createHash('sha256')
      .update(`${order.gatewayOrderId}|${mockPaymentId}`)
      .digest('hex');

    return {
      gatewayOrderId: order.gatewayOrderId,
      amount: order.amount,
      currency: order.currency,
      mockPaymentId,
      signature,
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const student = await this.requireLinkedStudent();
    const assignment = await this.prisma.studentFeeAssignment.findFirst({
      where: { id: dto.assignmentId, studentId: student.id },
    });
    if (!assignment) throw new NotFoundException('Fee assignment not found');

    const valid = await this.gateway.verifyPayment({
      gatewayOrderId: dto.gatewayOrderId,
      gatewayPaymentId: dto.gatewayPaymentId,
      signature: dto.signature,
    });
    if (!valid) {
      throw new BadRequestException('Payment verification failed');
    }

    return this.payments.record({
      studentId: student.id,
      assignmentId: dto.assignmentId,
      amount: dto.amount,
      paymentMode: PaymentMode.UPI,
      isOnline: true,
      gatewayOrderId: dto.gatewayOrderId,
      gatewayPaymentId: dto.gatewayPaymentId,
    });
  }

  /** Teacher: students in the divisions assigned to this teacher. */
  async teacherStudents() {
    const userId = this.requireUserId();
    const assignments = await this.prisma.teacherClassAssignment.findMany({
      where: { userId },
      select: { divisionId: true },
    });
    const divisionIds = assignments.map((a) => a.divisionId);
    const students = await this.prisma.student.findMany({
      where: { divisionId: { in: divisionIds }, isActive: true },
      include: {
        class: true,
        division: true,
        feeAssignments: {
          select: { netAmount: true, paidAmount: true, status: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });
    return students.map((s) => {
      const totalFee = s.feeAssignments.reduce(
        (sum, a) => sum + Number(a.netAmount),
        0,
      );
      const paidAmount = s.feeAssignments.reduce(
        (sum, a) => sum + Number(a.paidAmount),
        0,
      );
      return {
        id: s.id,
        fullName: s.fullName,
        admissionNo: s.admissionNo,
        className: s.class?.name ?? null,
        divisionName: s.division?.name ?? null,
        totalFee,
        paidAmount,
        balance: totalFee - paidAmount,
      };
    });
  }
}

@ApiTags('portal')
@ApiBearerAuth()
@Controller('portal')
class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get('me/student')
  @Roles(UserRole.PARENT)
  myStudent() {
    return this.portal.myStudent();
  }

  @Get('me/fees')
  @Roles(UserRole.PARENT)
  myFees() {
    return this.portal.myFees();
  }

  @Get('me/invoices')
  @Roles(UserRole.PARENT)
  myInvoices() {
    return this.portal.myInvoices();
  }

  @Post('me/payments/initiate')
  @Roles(UserRole.PARENT)
  initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.portal.initiatePayment(dto);
  }

  @Post('me/payments/verify')
  @Roles(UserRole.PARENT)
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.portal.verifyPayment(dto);
  }

  @Get('teacher/students')
  @Roles(UserRole.TEACHER)
  teacherStudents() {
    return this.portal.teacherStudents();
  }
}

@Module({
  imports: [PaymentsModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
