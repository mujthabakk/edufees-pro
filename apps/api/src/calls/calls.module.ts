import { Module } from '@nestjs/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { Roles } from '../common/decorators/roles.decorator';

class CreateCallLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  calledAt?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextAction?: string;
}

@Injectable()
class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  async list(studentId?: string) {
    const schoolId = this.tenant.requireSchoolId();
    const logs = await this.prisma.callLog.findMany({
      where: { student: { schoolId }, ...(studentId ? { studentId } : {}) },
      include: {
        student: { select: { fullName: true, admissionNo: true, parentMobile: true } },
      },
      orderBy: { calledAt: 'desc' },
    });
    return logs.map((c) => ({
      id: c.id,
      studentId: c.studentId,
      studentName: c.student.fullName,
      admissionNo: c.student.admissionNo,
      mobile: c.student.parentMobile,
      calledAt: c.calledAt.toISOString(),
      duration: c.duration,
      summary: c.summary,
      nextAction: c.nextAction,
    }));
  }

  async create(dto: CreateCallLogDto) {
    const schoolId = this.tenant.requireSchoolId();
    const madeById = this.tenant.userId;
    if (!madeById) throw new ForbiddenException('Missing user context');
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.callLog.create({
      data: {
        studentId: dto.studentId,
        madeById,
        calledAt: dto.calledAt ? new Date(dto.calledAt) : new Date(),
        duration: dto.duration ?? null,
        summary: dto.summary ?? null,
        nextAction: dto.nextAction ?? null,
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    const schoolId = this.tenant.requireSchoolId();
    const log = await this.prisma.callLog.findFirst({
      where: { id, student: { schoolId } },
    });
    if (!log) throw new NotFoundException('Call log not found');
    await this.prisma.callLog.delete({ where: { id } });
    return { id };
  }
}

@ApiTags('calls')
@ApiBearerAuth()
@Controller('calls')
class CallsController {
  constructor(private readonly calls: CallsService) {}

  @Get()
  list(@Query('studentId') studentId?: string) {
    return this.calls.list(studentId);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  create(@Body() dto: CreateCallLogDto) {
    return this.calls.create(dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  remove(@Param('id') id: string) {
    return this.calls.remove(id);
  }
}

@Module({
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
