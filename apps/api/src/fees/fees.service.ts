import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import {
  AssignFeeDto,
  CreateFeeStructureDto,
  CreateFeeTypeDto,
  ListFeeStructuresQueryDto,
} from './dto/fees.dto';

@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  // ---- Fee types ----
  listFeeTypes() {
    return this.prisma.scoped().feeType.findMany({ orderBy: { name: 'asc' } });
  }

  createFeeType(dto: CreateFeeTypeDto) {
    const schoolId = this.tenant.requireSchoolId();
    return this.prisma.feeType.create({
      data: {
        schoolId,
        name: dto.name,
        description: dto.description,
        isLateFee: dto.isLateFee ?? false,
      },
    });
  }

  async updateFeeType(id: string, dto: Partial<CreateFeeTypeDto>) {
    const schoolId = this.tenant.requireSchoolId();
    const feeType = await this.prisma.feeType.findFirst({
      where: { id, schoolId },
    });
    if (!feeType) throw new NotFoundException('Fee type not found');
    return this.prisma.feeType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isLateFee !== undefined ? { isLateFee: dto.isLateFee } : {}),
      },
    });
  }

  async deleteFeeType(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const feeType = await this.prisma.feeType.findFirst({
      where: { id, schoolId },
    });
    if (!feeType) throw new NotFoundException('Fee type not found');
    const structureCount = await this.prisma.feeStructure.count({
      where: { feeTypeId: id },
    });
    if (structureCount > 0) {
      throw new BadRequestException('Cannot delete fee type used in structures');
    }
    await this.prisma.feeType.delete({ where: { id } });
    return { deleted: true };
  }

  // ---- Fee structures ----
  async listFeeStructures(query: ListFeeStructuresQueryDto) {
    const structures = await this.prisma.scoped().feeStructure.findMany({
      where: {
        ...(query.classId ? { classId: query.classId } : {}),
        ...(query.academicYearId
          ? { academicYearId: query.academicYearId }
          : {}),
      },
      include: { feeType: true, class: true },
      orderBy: { createdAt: 'desc' },
    });
    return structures.map((s) => ({
      id: s.id,
      academicYearId: s.academicYearId,
      classId: s.classId,
      quotaId: s.quotaId,
      feeTypeId: s.feeTypeId,
      feeTypeName: s.feeType.name,
      className: s.class.name,
      amount: Number(s.amount),
      frequency: s.frequency,
      dueDay: s.dueDay,
      isOptional: s.isOptional,
      isRefundable: s.isRefundable,
    }));
  }

  async createFeeStructure(dto: CreateFeeStructureDto) {
    const schoolId = this.tenant.requireSchoolId();
    const academicYearId = await this.resolveAcademicYearId(
      schoolId,
      dto.academicYearId,
    );
    await this.assertBelongs('class', dto.classId, schoolId);
    await this.assertBelongs('feeType', dto.feeTypeId, schoolId);
    if (dto.quotaId) await this.assertBelongs('quota', dto.quotaId, schoolId);

    return this.prisma.feeStructure.create({
      data: {
        schoolId,
        academicYearId,
        classId: dto.classId,
        quotaId: dto.quotaId ?? null,
        feeTypeId: dto.feeTypeId,
        amount: new Prisma.Decimal(dto.amount),
        frequency: dto.frequency,
        dueDay: dto.dueDay ?? null,
        isOptional: dto.isOptional ?? false,
      },
    });
  }

  async updateFeeStructure(id: string, dto: Partial<CreateFeeStructureDto>) {
    const schoolId = this.tenant.requireSchoolId();
    const structure = await this.prisma.feeStructure.findFirst({
      where: { id, schoolId },
    });
    if (!structure) throw new NotFoundException('Fee structure not found');
    if (dto.classId) await this.assertBelongs('class', dto.classId, schoolId);
    if (dto.feeTypeId) await this.assertBelongs('feeType', dto.feeTypeId, schoolId);
    if (dto.quotaId) await this.assertBelongs('quota', dto.quotaId, schoolId);
    let academicYearId: string | undefined;
    if (dto.academicYearId) {
      academicYearId = await this.resolveAcademicYearId(
        schoolId,
        dto.academicYearId,
      );
    }
    return this.prisma.feeStructure.update({
      where: { id },
      data: {
        ...(academicYearId !== undefined ? { academicYearId } : {}),
        ...(dto.classId !== undefined ? { classId: dto.classId } : {}),
        ...(dto.quotaId !== undefined ? { quotaId: dto.quotaId } : {}),
        ...(dto.feeTypeId !== undefined ? { feeTypeId: dto.feeTypeId } : {}),
        ...(dto.amount !== undefined
          ? { amount: new Prisma.Decimal(dto.amount) }
          : {}),
        ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
        ...(dto.dueDay !== undefined ? { dueDay: dto.dueDay } : {}),
        ...(dto.isOptional !== undefined ? { isOptional: dto.isOptional } : {}),
      },
    });
  }

  async deleteFeeStructure(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const structure = await this.prisma.feeStructure.findFirst({
      where: { id, schoolId },
    });
    if (!structure) throw new NotFoundException('Fee structure not found');
    const assignmentCount = await this.prisma.studentFeeAssignment.count({
      where: { feeStructureId: id },
    });
    if (assignmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete fee structure with student assignments',
      );
    }
    await this.prisma.feeStructure.delete({ where: { id } });
    return { deleted: true };
  }

  // ---- Student fee assignments ----
  async listAssignments(studentId?: string) {
    const schoolId = this.tenant.requireSchoolId();
    const assignments = await this.prisma.studentFeeAssignment.findMany({
      where: {
        student: { schoolId },
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: { select: { fullName: true } },
        feeStructure: { include: { feeType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return assignments.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      studentName: a.student.fullName,
      feeStructureId: a.feeStructureId,
      feeTypeName: a.feeStructure.feeType.name,
      grossAmount: Number(a.grossAmount),
      discountAmount: Number(a.discountAmount),
      netAmount: Number(a.netAmount),
      paidAmount: Number(a.paidAmount),
      concessionNote: a.concessionNote,
      dueDate: a.dueDate.toISOString(),
      status: a.status,
    }));
  }

  async assignFee(dto: AssignFeeDto) {
    const schoolId = this.tenant.requireSchoolId();
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const structure = await this.prisma.feeStructure.findFirst({
      where: { id: dto.feeStructureId, schoolId },
    });
    if (!structure) throw new NotFoundException('Fee structure not found');

    const gross = dto.grossAmount ?? Number(structure.amount);
    const discount = dto.discountAmount ?? 0;
    if (discount > gross) {
      throw new BadRequestException('Discount cannot exceed gross amount');
    }
    const net = gross - discount;

    const assignment = await this.prisma.studentFeeAssignment.create({
      data: {
        studentId: dto.studentId,
        feeStructureId: dto.feeStructureId,
        grossAmount: new Prisma.Decimal(gross),
        discountAmount: new Prisma.Decimal(discount),
        netAmount: new Prisma.Decimal(net),
        paidAmount: new Prisma.Decimal(0),
        concessionNote: dto.concessionNote ?? null,
        dueDate: new Date(dto.dueDate),
        status: PaymentStatus.PENDING,
      },
      include: {
        student: { select: { fullName: true } },
        feeStructure: { include: { feeType: true } },
      },
    });

    return {
      id: assignment.id,
      studentId: assignment.studentId,
      studentName: assignment.student.fullName,
      feeStructureId: assignment.feeStructureId,
      feeTypeName: assignment.feeStructure.feeType.name,
      grossAmount: Number(assignment.grossAmount),
      discountAmount: Number(assignment.discountAmount),
      netAmount: Number(assignment.netAmount),
      paidAmount: Number(assignment.paidAmount),
      concessionNote: assignment.concessionNote,
      dueDate: assignment.dueDate.toISOString(),
      status: assignment.status,
    };
  }

  // ---- helpers ----
  private async resolveAcademicYearId(
    schoolId: string,
    academicYearId?: string,
  ): Promise<string> {
    if (academicYearId) {
      const year = await this.prisma.academicYear.findFirst({
        where: { id: academicYearId, schoolId },
      });
      if (!year) throw new BadRequestException('Invalid academicYearId');
      return year.id;
    }
    const current = await this.prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });
    if (!current) {
      throw new BadRequestException('No current academic year set');
    }
    return current.id;
  }

  private async assertBelongs(
    model: 'class' | 'feeType' | 'quota',
    id: string,
    schoolId: string,
  ): Promise<void> {
    let found: { id: string } | null = null;
    if (model === 'class') {
      found = await this.prisma.class.findFirst({ where: { id, schoolId } });
    } else if (model === 'feeType') {
      found = await this.prisma.feeType.findFirst({ where: { id, schoolId } });
    } else {
      found = await this.prisma.quota.findFirst({ where: { id, schoolId } });
    }
    if (!found) {
      throw new BadRequestException(`Invalid ${model} reference`);
    }
  }
}
