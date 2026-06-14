import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, PaymentMode, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { paginate, PaginationQueryDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentsService } from '../payments/payments.service';
import {
  MESSAGING_SERVICE,
  MessagingService,
} from '../providers/messaging/messaging.interface';
import {
  STORAGE_SERVICE,
  StorageService,
} from '../providers/storage/storage.interface';

class SendInvoiceDto {
  @ApiProperty({ enum: ['EMAIL', 'WHATSAPP'] })
  @IsEnum({ EMAIL: 'EMAIL', WHATSAPP: 'WHATSAPP' })
  channel!: 'EMAIL' | 'WHATSAPP';
}

class GenerateInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignmentId?: string;

  @ApiPropertyOptional({ enum: PaymentMode, default: PaymentMode.CASH })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentDate?: string;
}

@Injectable()
class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly payments: PaymentsService,
    @Inject(MESSAGING_SERVICE) private readonly messaging: MessagingService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async list(query: PaginationQueryDto) {
    const scoped = this.prisma.scoped();
    const where = query.search
      ? {
          OR: [
            { invoiceNo: { contains: query.search, mode: 'insensitive' as const } },
            {
              student: {
                fullName: { contains: query.search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      scoped.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
        include: {
          student: { select: { fullName: true, class: { select: { name: true } } } },
          payment: { select: { amount: true } },
        },
      }),
      scoped.invoice.count({ where }),
    ]);
    const data = rows.map((i) => ({
      id: i.id,
      invoiceNo: i.invoiceNo,
      studentId: i.studentId,
      studentName: i.student.fullName,
      class: i.student.class?.name ?? '-',
      amount: Number(i.payment.amount),
      date: i.createdAt.toISOString(),
      sentEmail: i.sentViaEmail,
      sentWA: i.sentViaWA,
      hasPdf: Boolean(i.pdfUrl),
    }));
    return paginate(data, total, query.page, query.pageSize);
  }

  async send(id: string, channel: 'EMAIL' | 'WHATSAPP') {
    const schoolId = this.tenant.requireSchoolId();
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, schoolId },
      include: { student: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const recipient =
      channel === 'EMAIL'
        ? invoice.student.parentEmail ?? ''
        : invoice.student.whatsappNumber ?? invoice.student.parentMobile;

    await this.messaging.send({
      channel: channel === 'EMAIL' ? 'EMAIL' : 'WHATSAPP',
      recipient,
      template: 'INVOICE',
      subject: `Invoice ${invoice.invoiceNo}`,
      body: `Your fee receipt ${invoice.invoiceNo} is ready.`,
    });

    await this.prisma.notificationLog.create({
      data: {
        schoolId,
        studentId: invoice.studentId,
        channel:
          channel === 'EMAIL'
            ? NotificationChannel.EMAIL
            : NotificationChannel.WHATSAPP,
        template: 'INVOICE',
        recipient,
        message: `Invoice ${invoice.invoiceNo}`,
      },
    });

    return this.prisma.invoice.update({
      where: { id },
      data:
        channel === 'EMAIL' ? { sentViaEmail: true } : { sentViaWA: true },
    });
  }

  async getUrl(id: string): Promise<{ url: string }> {
    const schoolId = this.tenant.requireSchoolId();
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, schoolId },
    });
    if (!invoice || !invoice.pdfUrl) {
      throw new NotFoundException('Invoice PDF not available');
    }
    return { url: await this.storage.getSignedUrl(invoice.pdfUrl) };
  }

  generate(dto: GenerateInvoiceDto) {
    return this.payments.record({
      studentId: dto.studentId,
      amount: dto.amount,
      assignmentId: dto.assignmentId,
      paymentMode: dto.paymentMode ?? PaymentMode.CASH,
      notes: dto.notes,
      paymentDate: dto.paymentDate,
    });
  }

  async remove(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, schoolId },
      select: { paymentId: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.payments.remove(invoice.paymentId);
  }
}

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.invoices.list(query);
  }

  @Post('generate')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  generate(@Body() dto: GenerateInvoiceDto) {
    return this.invoices.generate(dto);
  }

  @Post(':id/send')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  send(@Param('id') id: string, @Body() dto: SendInvoiceDto) {
    return this.invoices.send(id, dto.channel);
  }

  @Get(':id/url')
  getUrl(@Param('id') id: string) {
    return this.invoices.getUrl(id);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  remove(@Param('id') id: string) {
    return this.invoices.remove(id);
  }
}

@Module({
  imports: [PaymentsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
