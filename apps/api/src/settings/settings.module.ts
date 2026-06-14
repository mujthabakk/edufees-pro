import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { AccountType, PaymentGateway, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { Roles } from '../common/decorators/roles.decorator';

class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  academicYearStart?: number;
}

class UpsertBankDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountHolderName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ifscCode!: string;

  @ApiPropertyOptional({ enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional({ enum: PaymentGateway })
  @IsOptional()
  @IsEnum(PaymentGateway)
  paymentGateway?: PaymentGateway;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewayApiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewaySecret?: string;
}

class CreateStaffUserDto {
  @ApiProperty({ enum: [UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT, UserRole.TEACHER] })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}

class UpdateStaffUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  getProfile() {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.school.findUnique({
      where: { id: schoolId },
      include: { bankDetail: true, subscription: true },
    });
  }

  updateProfile(dto: UpdateProfileDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.addressLine1 !== undefined ? { addressLine1: dto.addressLine1 } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.state !== undefined ? { state: dto.state } : {}),
        ...(dto.primaryPhone !== undefined ? { primaryPhone: dto.primaryPhone } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.academicYearStart !== undefined
          ? { academicYearStart: dto.academicYearStart }
          : {}),
      },
    });
  }

  upsertBank(dto: UpsertBankDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.schoolBankDetail.upsert({
      where: { schoolId },
      update: {
        accountHolderName: dto.accountHolderName,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        accountType: dto.accountType ?? AccountType.CURRENT,
        ...(dto.branchName !== undefined ? { branchName: dto.branchName } : {}),
        ...(dto.upiId !== undefined ? { upiId: dto.upiId } : {}),
        ...(dto.paymentGateway !== undefined
          ? { paymentGateway: dto.paymentGateway }
          : {}),
        ...(dto.gatewayApiKey !== undefined
          ? { gatewayApiKey: dto.gatewayApiKey }
          : {}),
        ...(dto.gatewaySecret !== undefined
          ? { gatewaySecret: dto.gatewaySecret }
          : {}),
      },
      create: {
        schoolId,
        accountHolderName: dto.accountHolderName,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        accountType: dto.accountType ?? AccountType.CURRENT,
        branchName: dto.branchName ?? null,
        upiId: dto.upiId ?? null,
        paymentGateway: dto.paymentGateway ?? PaymentGateway.MANUAL,
        gatewayApiKey: dto.gatewayApiKey ?? null,
        gatewaySecret: dto.gatewaySecret ?? null,
      },
    });
  }

  listUsers() {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.user.findMany({
      where: { schoolId, role: { not: UserRole.PARENT } },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(dto: CreateStaffUserDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.user.create({
      data: {
        schoolId,
        role: dto.role,
        email: dto.email,
        username: dto.username,
        passwordHash: await bcrypt.hash(dto.password, 10),
        mustChangePassword: true,
      },
      select: { id: true, email: true, username: true, role: true, isActive: true },
    });
  }

  async updateUser(id: string, dto: UpdateStaffUserDto) {
    const schoolId = this.tenant.requireSchoolId();
    const user = await this.prisma.user.findFirst({ where: { id, schoolId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}) },
      select: { id: true, email: true, role: true, isActive: true },
    });
  }
}

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('profile')
  getProfile() {
    return this.settings.getProfile();
  }

  @Patch('profile')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.settings.updateProfile(dto);
  }

  @Put('bank')
  @Roles(UserRole.SCHOOL_ADMIN)
  upsertBank(@Body() dto: UpsertBankDto) {
    return this.settings.upsertBank(dto);
  }

  @Get('users')
  @Roles(UserRole.SCHOOL_ADMIN)
  listUsers() {
    return this.settings.listUsers();
  }

  @Post('users')
  @Roles(UserRole.SCHOOL_ADMIN)
  createUser(@Body() dto: CreateStaffUserDto) {
    return this.settings.createUser(dto);
  }

  @Patch('users/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateUser(@Param('id') id: string, @Body() dto: UpdateStaffUserDto) {
    return this.settings.updateUser(id, dto);
  }
}

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
