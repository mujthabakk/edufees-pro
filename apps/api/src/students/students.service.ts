import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Gender,
  Prisma,
  PaymentStatus,
  Student,
  UserRole,
} from '@prisma/client';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { paginate } from '../common/dto/pagination.dto';
import {
  BulkImportJobData,
  QUEUE_BULK_IMPORT,
} from '../queues/queue.constants';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';

const DEFAULT_STUDENT_PASSWORD = 'Student@123';

type AssignmentAggregate = {
  netAmount: Prisma.Decimal;
  paidAmount: Prisma.Decimal;
  status: PaymentStatus;
  dueDate: Date;
};

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    @InjectQueue(QUEUE_BULK_IMPORT) private readonly bulkImportQueue: Queue,
  ) {}

  async list(query: ListStudentsQueryDto) {
    const where: Prisma.StudentWhereInput = {
      isActive: true,
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.divisionId ? { divisionId: query.divisionId } : {}),
      ...(query.academicYearId
        ? { academicYearId: query.academicYearId }
        : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { admissionNo: { contains: query.search, mode: 'insensitive' } },
              { parentMobile: { contains: query.search } },
            ],
          }
        : {}),
    };

    const scoped = this.prisma.scoped();
    const include = {
      class: true,
      division: true,
      quota: true,
      feeAssignments: {
        select: {
          netAmount: true,
          paidAmount: true,
          status: true,
          dueDate: true,
        },
      },
    } as const;

    // Payment status is a derived field (computed from fee assignments), so it
    // cannot be filtered at the database level. When a status filter is set we
    // load all matching rows, derive + filter in memory, then paginate so that
    // the pagination meta (total/pageCount) stays accurate.
    if (query.status) {
      const rows = await scoped.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
      });
      const filtered = rows
        .map((s) => this.toSummary(s))
        .filter((s) => s.status === query.status);
      const pageRows = filtered.slice(query.skip, query.skip + query.take);
      return paginate(pageRows, filtered.length, query.page, query.pageSize);
    }

    const [rows, total] = await Promise.all([
      scoped.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
        include,
      }),
      scoped.student.count({ where }),
    ]);

    const summaries = rows.map((s) => this.toSummary(s));
    return paginate(summaries, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        class: true,
        division: true,
        quota: true,
        feeAssignments: {
          select: {
            netAmount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.toDetail(student);
  }

  async create(dto: CreateStudentDto) {
    const schoolId = this.tenant.requireSchoolId();
    const academicYearId = await this.resolveAcademicYearId(
      schoolId,
      dto.academicYearId,
    );

    await this.assertAdmissionNoFree(schoolId, dto.admissionNo);

    const student = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          // UserRole has no STUDENT variant; parent/student logins use PARENT.
          role: UserRole.PARENT,
          email: this.generateStudentEmail(schoolId, dto.admissionNo),
          username: this.generateStudentUsername(schoolId, dto.admissionNo),
          passwordHash: await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10),
          mustChangePassword: true,
        },
      });

      return tx.student.create({
        data: {
          schoolId,
          userId: user.id,
          academicYearId,
          classId: dto.classId,
          divisionId: dto.divisionId ?? null,
          batchId: dto.batchId ?? null,
          quotaId: dto.quotaId ?? null,
          fullName: dto.fullName,
          admissionNo: dto.admissionNo,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender ?? null,
          rollNo: dto.rollNo ?? null,
          parentMobile: dto.parentMobile,
          parentEmail: dto.parentEmail ?? null,
          whatsappNumber: dto.whatsappNumber ?? null,
          alternatePhone: dto.alternatePhone ?? null,
          fatherName: dto.fatherName ?? null,
          motherName: dto.motherName ?? null,
          guardianName: dto.guardianName ?? null,
          guardianRelation: dto.guardianRelation ?? null,
          addressLine1: dto.addressLine1 ?? null,
          addressLine2: dto.addressLine2 ?? null,
          city: dto.city ?? null,
          state: dto.state ?? null,
          pinCode: dto.pinCode ?? null,
        },
        include: {
          class: true,
          division: true,
          quota: true,
          feeAssignments: {
            select: {
              netAmount: true,
              paidAmount: true,
              status: true,
              dueDate: true,
            },
          },
        },
      });
    });

    return this.toDetail(student);
  }

  async update(id: string, dto: UpdateStudentDto) {
    const schoolId = this.tenant.requireSchoolId();
    const existing = await this.prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      throw new NotFoundException('Student not found');
    }
    if (dto.admissionNo && dto.admissionNo !== existing.admissionNo) {
      await this.assertAdmissionNoFree(schoolId, dto.admissionNo);
    }

    const updated = await this.prisma.student.update({
      where: { id },
      data: this.buildStudentData(dto),
      include: {
        class: true,
        division: true,
        quota: true,
        feeAssignments: {
          select: {
            netAmount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });
    return this.toDetail(updated);
  }

  async remove(id: string): Promise<{ id: string }> {
    const schoolId = this.tenant.requireSchoolId();
    const existing = await this.prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      throw new NotFoundException('Student not found');
    }
    // Soft delete keeps fee/payment history intact.
    await this.prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
    return { id };
  }

  async enqueueBulkImport(
    rows: Record<string, unknown>[],
    academicYearId?: string,
  ): Promise<{ jobId: string; queued: number }> {
    const schoolId = this.tenant.requireSchoolId();
    const resolvedYear = await this.resolveAcademicYearId(
      schoolId,
      academicYearId,
    );
    const data: BulkImportJobData = {
      schoolId,
      academicYearId: resolvedYear,
      uploadedById: this.tenant.userId ?? 'system',
      rows,
    };
    const job = await this.bulkImportQueue.add('import-students', data);
    return { jobId: String(job.id), queued: rows.length };
  }

  async getImportStatus(jobId: string) {
    const schoolId = this.tenant.requireSchoolId();
    const job = await this.bulkImportQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }
    if (job.data?.schoolId && job.data.schoolId !== schoolId) {
      throw new ForbiddenException('Import job not found');
    }
    const state = await job.getState();
    return {
      jobId,
      state,
      progress: job.progress,
      result: job.returnvalue ?? null,
      failedReason: job.failedReason ?? null,
    };
  }

  // ---- helpers ----

  private buildStudentData(
    dto: UpdateStudentDto,
  ): Prisma.StudentUncheckedUpdateInput {
    const data: Prisma.StudentUncheckedUpdateInput = {};
    if (dto.classId !== undefined) data.classId = dto.classId;
    if (dto.divisionId !== undefined) data.divisionId = dto.divisionId ?? null;
    if (dto.batchId !== undefined) data.batchId = dto.batchId ?? null;
    if (dto.quotaId !== undefined) data.quotaId = dto.quotaId ?? null;
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.admissionNo !== undefined) data.admissionNo = dto.admissionNo;
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.gender !== undefined) data.gender = dto.gender ?? null;
    if (dto.rollNo !== undefined) data.rollNo = dto.rollNo ?? null;
    if (dto.parentMobile !== undefined) data.parentMobile = dto.parentMobile;
    if (dto.parentEmail !== undefined) data.parentEmail = dto.parentEmail ?? null;
    if (dto.whatsappNumber !== undefined) {
      data.whatsappNumber = dto.whatsappNumber ?? null;
    }
    if (dto.alternatePhone !== undefined) {
      data.alternatePhone = dto.alternatePhone ?? null;
    }
    if (dto.fatherName !== undefined) data.fatherName = dto.fatherName ?? null;
    if (dto.motherName !== undefined) data.motherName = dto.motherName ?? null;
    if (dto.guardianName !== undefined) {
      data.guardianName = dto.guardianName ?? null;
    }
    if (dto.guardianRelation !== undefined) {
      data.guardianRelation = dto.guardianRelation ?? null;
    }
    if (dto.addressLine1 !== undefined) {
      data.addressLine1 = dto.addressLine1 ?? null;
    }
    if (dto.addressLine2 !== undefined) {
      data.addressLine2 = dto.addressLine2 ?? null;
    }
    if (dto.city !== undefined) data.city = dto.city ?? null;
    if (dto.state !== undefined) data.state = dto.state ?? null;
    if (dto.pinCode !== undefined) data.pinCode = dto.pinCode ?? null;
    return data;
  }

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
      throw new BadRequestException(
        'No current academic year set for this school',
      );
    }
    return current.id;
  }

  private async assertAdmissionNoFree(
    schoolId: string,
    admissionNo: string,
  ): Promise<void> {
    const existing = await this.prisma.student.findFirst({
      where: { schoolId, admissionNo },
    });
    if (existing) {
      throw new BadRequestException(
        `Admission number ${admissionNo} already exists`,
      );
    }
  }

  private generateStudentEmail(schoolId: string, admissionNo: string): string {
    const slug = admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${slug}.${schoolId.slice(-8)}@students.edufees.local`;
  }

  private generateStudentUsername(
    schoolId: string,
    admissionNo: string,
  ): string {
    return `${schoolId.slice(-6)}-${admissionNo}-${randomUUID().slice(0, 4)}`;
  }

  private summariseFees(assignments: AssignmentAggregate[]): {
    totalFee: number;
    paidAmount: number;
    status: PaymentStatus;
  } {
    let totalFee = 0;
    let paidAmount = 0;
    let hasOverdue = false;
    for (const a of assignments) {
      totalFee += Number(a.netAmount);
      paidAmount += Number(a.paidAmount);
      if (a.status === PaymentStatus.OVERDUE) hasOverdue = true;
      if (a.status !== PaymentStatus.PAID && a.dueDate < new Date()) {
        hasOverdue = true;
      }
    }
    let status: PaymentStatus;
    if (totalFee === 0) {
      status = PaymentStatus.PENDING;
    } else if (paidAmount >= totalFee) {
      status = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      status = PaymentStatus.PARTIAL;
    } else {
      status = hasOverdue ? PaymentStatus.OVERDUE : PaymentStatus.PENDING;
    }
    return { totalFee, paidAmount, status };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toSummary(s: any) {
    const fees = this.summariseFees(s.feeAssignments ?? []);
    return {
      id: s.id as string,
      fullName: s.fullName as string,
      admissionNo: s.admissionNo as string,
      className: s.class?.name ?? null,
      divisionName: s.division?.name ?? null,
      quotaName: s.quota?.name ?? null,
      parentMobile: s.parentMobile as string,
      parentEmail: (s.parentEmail as string | null) ?? null,
      totalFee: fees.totalFee,
      paidAmount: fees.paidAmount,
      status: fees.status,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDetail(s: any) {
    const summary = this.toSummary(s);
    const student = s as Student;
    return {
      ...summary,
      schoolId: student.schoolId,
      academicYearId: student.academicYearId,
      classId: student.classId,
      divisionId: student.divisionId,
      batchId: student.batchId,
      quotaId: student.quotaId,
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.toISOString()
        : null,
      gender: student.gender,
      photoUrl: student.photoUrl,
      rollNo: student.rollNo,
      whatsappNumber: student.whatsappNumber,
      alternatePhone: student.alternatePhone,
      fatherName: student.fatherName,
      motherName: student.motherName,
      guardianName: student.guardianName,
      guardianRelation: student.guardianRelation,
      addressLine1: student.addressLine1,
      addressLine2: student.addressLine2,
      city: student.city,
      state: student.state,
      pinCode: student.pinCode,
      isActive: student.isActive,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  }
}
