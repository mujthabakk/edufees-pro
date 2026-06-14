import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import {
  CreateAcademicYearDto,
  CreateClassDto,
  CreateDivisionDto,
  CreateQuotaDto,
} from './dto/academic.dto';

@Injectable()
export class AcademicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  // ---- Academic years ----
  listAcademicYears() {
    return this.prisma
      .scoped()
      .academicYear.findMany({ orderBy: { startDate: 'desc' } });
  }

  createAcademicYear(dto: CreateAcademicYearDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.academicYear.create({
      data: {
        schoolId,
        label: dto.label,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async updateAcademicYear(
    id: string,
    dto: Partial<CreateAcademicYearDto>,
  ) {
    const schoolId = this.tenant.requireSchoolId();
    const year = await this.prisma.academicYear.findFirst({
      where: { id, schoolId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.startDate !== undefined
          ? { startDate: new Date(dto.startDate) }
          : {}),
        ...(dto.endDate !== undefined ? { endDate: new Date(dto.endDate) } : {}),
      },
    });
  }

  async deleteAcademicYear(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const year = await this.prisma.academicYear.findFirst({
      where: { id, schoolId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    if (year.isCurrent) {
      throw new BadRequestException('Cannot delete the current academic year');
    }
    const studentCount = await this.prisma.student.count({
      where: { academicYearId: id },
    });
    if (studentCount > 0) {
      throw new BadRequestException(
        'Cannot delete academic year with enrolled students',
      );
    }
    await this.prisma.academicYear.delete({ where: { id } });
    return { deleted: true };
  }

  async setCurrentAcademicYear(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const year = await this.prisma.academicYear.findFirst({
      where: { id, schoolId },
    });
    if (!year) {
      throw new NotFoundException('Academic year not found');
    }
    await this.prisma.$transaction([
      this.prisma.academicYear.updateMany({
        where: { schoolId },
        data: { isCurrent: false },
      }),
      this.prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);
    return this.prisma.academicYear.findUnique({ where: { id } });
  }

  // ---- Classes ----
  listClasses() {
    return this.prisma.scoped().class.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { divisions: { orderBy: { name: 'asc' } } },
    });
  }

  createClass(dto: CreateClassDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.class.create({
      data: { schoolId, name: dto.name, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async updateClass(id: string, dto: Partial<CreateClassDto>) {
    const schoolId = this.tenant.requireSchoolId();
    const klass = await this.prisma.class.findFirst({
      where: { id, schoolId },
    });
    if (!klass) throw new NotFoundException('Class not found');
    return this.prisma.class.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  async deleteClass(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const klass = await this.prisma.class.findFirst({
      where: { id, schoolId },
    });
    if (!klass) throw new NotFoundException('Class not found');
    const studentCount = await this.prisma.student.count({
      where: { classId: id },
    });
    if (studentCount > 0) {
      throw new BadRequestException('Cannot delete class with students');
    }
    await this.prisma.class.delete({ where: { id } });
    return { deleted: true };
  }

  // ---- Divisions ----
  async createDivision(dto: CreateDivisionDto) {
    const schoolId = this.tenant.requireSchoolId();
    const klass = await this.prisma.class.findFirst({
      where: { id: dto.classId, schoolId },
    });
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
    return this.prisma.division.create({
      data: { schoolId, classId: dto.classId, name: dto.name },
    });
  }

  async updateDivision(id: string, name: string) {
    const schoolId = this.tenant.requireSchoolId();
    const division = await this.prisma.division.findFirst({
      where: { id, schoolId },
    });
    if (!division) throw new NotFoundException('Division not found');
    return this.prisma.division.update({
      where: { id },
      data: { name },
    });
  }

  async deleteDivision(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const division = await this.prisma.division.findFirst({
      where: { id, schoolId },
    });
    if (!division) throw new NotFoundException('Division not found');
    const studentCount = await this.prisma.student.count({
      where: { divisionId: id },
    });
    if (studentCount > 0) {
      throw new BadRequestException('Cannot delete division with students');
    }
    await this.prisma.division.delete({ where: { id } });
    return { deleted: true };
  }

  // ---- Quotas ----
  listQuotas() {
    return this.prisma.scoped().quota.findMany({ orderBy: { name: 'asc' } });
  }

  createQuota(dto: CreateQuotaDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.quota.create({
      data: { schoolId, name: dto.name, description: dto.description },
    });
  }

  async updateQuota(id: string, dto: Partial<CreateQuotaDto>) {
    const schoolId = this.tenant.requireSchoolId();
    const quota = await this.prisma.quota.findFirst({
      where: { id, schoolId },
    });
    if (!quota) throw new NotFoundException('Quota not found');
    return this.prisma.quota.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
    });
  }

  async deleteQuota(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const quota = await this.prisma.quota.findFirst({
      where: { id, schoolId },
    });
    if (!quota) throw new NotFoundException('Quota not found');
    const structureCount = await this.prisma.feeStructure.count({
      where: { quotaId: id },
    });
    if (structureCount > 0) {
      throw new BadRequestException('Cannot delete quota used in fee structures');
    }
    await this.prisma.quota.delete({ where: { id } });
    return { deleted: true };
  }
}
