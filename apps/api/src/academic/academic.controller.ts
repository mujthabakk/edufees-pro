import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AcademicService } from './academic.service';
import {
  CreateAcademicYearDto,
  CreateClassDto,
  CreateDivisionDto,
  CreateQuotaDto,
} from './dto/academic.dto';

@ApiTags('academic')
@ApiBearerAuth()
@Controller('academic')
export class AcademicController {
  constructor(private readonly academic: AcademicService) {}

  @Get('years')
  listYears() {
    return this.academic.listAcademicYears();
  }

  @Post('years')
  @Roles(UserRole.SCHOOL_ADMIN)
  createYear(@Body() dto: CreateAcademicYearDto) {
    return this.academic.createAcademicYear(dto);
  }

  @Patch('years/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateYear(@Param('id') id: string, @Body() dto: CreateAcademicYearDto) {
    return this.academic.updateAcademicYear(id, dto);
  }

  @Delete('years/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  deleteYear(@Param('id') id: string) {
    return this.academic.deleteAcademicYear(id);
  }

  @Patch('years/:id/current')
  @Roles(UserRole.SCHOOL_ADMIN)
  setCurrentYear(@Param('id') id: string) {
    return this.academic.setCurrentAcademicYear(id);
  }

  @Get('classes')
  listClasses() {
    return this.academic.listClasses();
  }

  @Post('classes')
  @Roles(UserRole.SCHOOL_ADMIN)
  createClass(@Body() dto: CreateClassDto) {
    return this.academic.createClass(dto);
  }

  @Patch('classes/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateClass(@Param('id') id: string, @Body() dto: CreateClassDto) {
    return this.academic.updateClass(id, dto);
  }

  @Delete('classes/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  deleteClass(@Param('id') id: string) {
    return this.academic.deleteClass(id);
  }

  @Post('divisions')
  @Roles(UserRole.SCHOOL_ADMIN)
  createDivision(@Body() dto: CreateDivisionDto) {
    return this.academic.createDivision(dto);
  }

  @Patch('divisions/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateDivision(
    @Param('id') id: string,
    @Body() dto: { name: string },
  ) {
    return this.academic.updateDivision(id, dto.name);
  }

  @Delete('divisions/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  deleteDivision(@Param('id') id: string) {
    return this.academic.deleteDivision(id);
  }

  @Get('quotas')
  listQuotas() {
    return this.academic.listQuotas();
  }

  @Post('quotas')
  @Roles(UserRole.SCHOOL_ADMIN)
  createQuota(@Body() dto: CreateQuotaDto) {
    return this.academic.createQuota(dto);
  }

  @Patch('quotas/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateQuota(@Param('id') id: string, @Body() dto: CreateQuotaDto) {
    return this.academic.updateQuota(id, dto);
  }

  @Delete('quotas/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  deleteQuota(@Param('id') id: string) {
    return this.academic.deleteQuota(id);
  }
}
