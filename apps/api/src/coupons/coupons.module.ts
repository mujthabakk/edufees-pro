import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { Roles } from '../common/decorators/roles.decorator';

class CreateCouponDto {
  @ApiProperty({ example: 'SIBLING10' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @ApiProperty()
  @IsDateString()
  validFrom!: string;

  @ApiProperty()
  @IsDateString()
  validUntil!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perStudentLimit?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableFees?: string[];
}

class UpdateCouponDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class AssignCouponDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  couponId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  studentIds!: string[];
}

@Injectable()
class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  list() {
    return this.prisma.scoped().couponCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateCouponDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.couponCode.create({
      data: {
        schoolId,
        code: dto.code,
        discountType: dto.discountType,
        discountValue: new Prisma.Decimal(dto.discountValue),
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        maxUses: dto.maxUses ?? null,
        perStudentLimit: dto.perStudentLimit ?? 1,
        applicableFees: dto.applicableFees ?? [],
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const schoolId = this.tenant.requireSchoolId();
    const coupon = await this.prisma.couponCode.findFirst({
      where: { id, schoolId },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.prisma.couponCode.update({
      where: { id },
      data: { ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}) },
    });
  }

  async listAssignments(couponId?: string) {
    const schoolId = this.tenant.requireSchoolId();
    const rows = await this.prisma.couponStudentAssignment.findMany({
      where: {
        coupon: { schoolId },
        ...(couponId ? { couponId } : {}),
      },
      include: {
        coupon: { select: { code: true, discountType: true, discountValue: true } },
      },
    });
    const students = await this.prisma.student.findMany({
      where: { id: { in: rows.map((r) => r.studentId) } },
      select: { id: true, fullName: true, admissionNo: true },
    });
    const studentMap = new Map(students.map((s) => [s.id, s]));
    return rows.map((r) => ({
      id: r.id,
      couponId: r.couponId,
      couponCode: r.coupon.code,
      discountType: r.coupon.discountType,
      discountValue: Number(r.coupon.discountValue),
      studentId: r.studentId,
      studentName: studentMap.get(r.studentId)?.fullName ?? '',
      admissionNo: studentMap.get(r.studentId)?.admissionNo ?? '',
    }));
  }

  async assign(dto: AssignCouponDto) {
    const schoolId = this.tenant.requireSchoolId();
    const coupon = await this.prisma.couponCode.findFirst({
      where: { id: dto.couponId, schoolId },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    // Only assign to students that belong to this school.
    const validStudents = await this.prisma.student.findMany({
      where: { id: { in: dto.studentIds }, schoolId },
      select: { id: true },
    });
    const result = await this.prisma.couponStudentAssignment.createMany({
      data: validStudents.map((s) => ({
        couponId: dto.couponId,
        studentId: s.id,
      })),
      skipDuplicates: true,
    });
    return { assigned: result.count };
  }

  async removeAssignment(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const row = await this.prisma.couponStudentAssignment.findFirst({
      where: { id, coupon: { schoolId } },
    });
    if (!row) throw new NotFoundException('Assignment not found');
    await this.prisma.couponStudentAssignment.delete({ where: { id } });
    return { deleted: true };
  }
}

@ApiTags('coupons')
@ApiBearerAuth()
@Controller('coupons')
class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get()
  list() {
    return this.coupons.list();
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN)
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Get('assignments')
  listAssignments() {
    return this.coupons.listAssignments();
  }

  @Post('assignments')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  assign(@Body() dto: AssignCouponDto) {
    return this.coupons.assign(dto);
  }

  @Delete('assignments/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  removeAssignment(@Param('id') id: string) {
    return this.coupons.removeAssignment(id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.coupons.update(id, dto);
  }
}

@Module({
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
