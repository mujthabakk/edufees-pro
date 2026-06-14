import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { FeesService } from './fees.service';
import {
  AssignFeeDto,
  CreateFeeStructureDto,
  CreateFeeTypeDto,
  ListFeeStructuresQueryDto,
} from './dto/fees.dto';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('fees')
export class FeesController {
  constructor(private readonly fees: FeesService) {}

  @Get('types')
  listFeeTypes() {
    return this.fees.listFeeTypes();
  }

  @Post('types')
  @Roles(UserRole.SCHOOL_ADMIN)
  createFeeType(@Body() dto: CreateFeeTypeDto) {
    return this.fees.createFeeType(dto);
  }

  @Patch('types/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateFeeType(@Param('id') id: string, @Body() dto: CreateFeeTypeDto) {
    return this.fees.updateFeeType(id, dto);
  }

  @Delete('types/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  deleteFeeType(@Param('id') id: string) {
    return this.fees.deleteFeeType(id);
  }

  @Get('structures')
  listFeeStructures(@Query() query: ListFeeStructuresQueryDto) {
    return this.fees.listFeeStructures(query);
  }

  @Post('structures')
  @Roles(UserRole.SCHOOL_ADMIN)
  createFeeStructure(@Body() dto: CreateFeeStructureDto) {
    return this.fees.createFeeStructure(dto);
  }

  @Patch('structures/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateFeeStructure(
    @Param('id') id: string,
    @Body() dto: CreateFeeStructureDto,
  ) {
    return this.fees.updateFeeStructure(id, dto);
  }

  @Delete('structures/:id')
  @Roles(UserRole.SCHOOL_ADMIN)
  deleteFeeStructure(@Param('id') id: string) {
    return this.fees.deleteFeeStructure(id);
  }

  @Get('assignments')
  listAssignments(@Query('studentId') studentId?: string) {
    return this.fees.listAssignments(studentId);
  }

  @Post('assignments')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  assignFee(@Body() dto: AssignFeeDto) {
    return this.fees.assignFee(dto);
  }
}
