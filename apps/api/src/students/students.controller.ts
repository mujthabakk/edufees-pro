import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { BulkImportDto } from './dto/bulk-import.dto';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List students (paginated, filterable)' })
  list(@Query() query: ListStudentsQueryDto) {
    return this.students.list(query);
  }

  @Post('import')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Queue a bulk student import (CSV/XLSX rows)' })
  bulkImport(@Body() dto: BulkImportDto) {
    return this.students.enqueueBulkImport(dto.rows, dto.academicYearId);
  }

  @Get('import/:jobId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get bulk import job status' })
  importStatus(@Param('jobId') jobId: string) {
    return this.students.getImportStatus(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single student with profile + fee summary' })
  findOne(@Param('id') id: string) {
    return this.students.findOne(id);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a student (creates a linked login account)' })
  create(@Body() dto: CreateStudentDto) {
    return this.students.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.students.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a student' })
  remove(@Param('id') id: string) {
    return this.students.remove(id);
  }
}
