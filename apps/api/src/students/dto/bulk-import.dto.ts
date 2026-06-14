import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class BulkImportDto {
  @ApiPropertyOptional({ description: 'Target academic year; defaults to current' })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiProperty({
    type: [Object],
    description: 'Parsed CSV/XLSX rows keyed by column header',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5000)
  @IsObject({ each: true })
  rows!: Record<string, unknown>[];
}
