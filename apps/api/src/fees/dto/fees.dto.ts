import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeFrequency } from '@prisma/client';
import { Type } from 'class-transformer';
import {
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

export class CreateFeeTypeDto {
  @ApiProperty({ example: 'Tuition Fee' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isLateFee?: boolean;
}

export class CreateFeeStructureDto {
  @ApiPropertyOptional({ description: 'Defaults to current academic year' })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quotaId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  feeTypeId!: string;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ enum: FeeFrequency })
  @IsEnum(FeeFrequency)
  frequency!: FeeFrequency;

  @ApiPropertyOptional({ minimum: 1, maximum: 31 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dueDay?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class ListFeeStructuresQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class AssignFeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  feeStructureId!: string;

  @ApiPropertyOptional({
    description: 'Overrides structure amount when provided',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  grossAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  concessionNote?: string;

  @ApiProperty()
  @IsDateString()
  dueDate!: string;
}
