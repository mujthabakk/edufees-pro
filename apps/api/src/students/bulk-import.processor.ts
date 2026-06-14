import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkImportJobData,
  QUEUE_BULK_IMPORT,
} from '../queues/queue.constants';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

// Maps common spreadsheet header variants to student fields.
function pick(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of Object.keys(row)) {
    const normalized = key.trim().toLowerCase().replace(/[\s_]/g, '');
    if (keys.includes(normalized)) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
  }
  return undefined;
}

@Processor(QUEUE_BULK_IMPORT)
export class BulkImportProcessor extends WorkerHost {
  private readonly logger = new Logger(BulkImportProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<BulkImportJobData>): Promise<ImportResult> {
    const { schoolId, academicYearId, rows } = job.data;
    const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

    const classes = await this.prisma.class.findMany({ where: { schoolId } });
    const classByName = new Map(
      classes.map((c) => [c.name.toLowerCase(), c.id]),
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const fullName = pick(row, ['fullname', 'name', 'studentname']);
        const admissionNo = pick(row, [
          'admissionno',
          'admission',
          'admno',
          'admissionnumber',
        ]);
        const className = pick(row, ['class', 'classname', 'grade']);
        const parentMobile = pick(row, [
          'parentmobile',
          'mobile',
          'phone',
          'contact',
        ]);

        if (!fullName || !admissionNo || !className || !parentMobile) {
          result.errors.push({
            row: i + 1,
            reason: 'Missing required fields (fullName, admissionNo, class, parentMobile)',
          });
          continue;
        }

        const classId = classByName.get(className.toLowerCase());
        if (!classId) {
          result.errors.push({
            row: i + 1,
            reason: `Unknown class "${className}"`,
          });
          continue;
        }

        const exists = await this.prisma.student.findFirst({
          where: { schoolId, admissionNo },
          select: { id: true },
        });
        if (exists) {
          result.skipped++;
          continue;
        }

        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              schoolId,
              role: UserRole.PARENT,
              email: `${admissionNo
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')}.${schoolId.slice(-8)}@students.edufees.local`,
              username: `${schoolId.slice(-6)}-${admissionNo}-${randomUUID().slice(0, 4)}`,
              passwordHash: await bcrypt.hash('Student@123', 10),
              mustChangePassword: true,
            },
          });
          await tx.student.create({
            data: {
              schoolId,
              userId: user.id,
              academicYearId,
              classId,
              fullName,
              admissionNo,
              parentMobile,
              parentEmail: pick(row, ['parentemail', 'email']) ?? null,
              fatherName: pick(row, ['fathername', 'father']) ?? null,
              motherName: pick(row, ['mothername', 'mother']) ?? null,
            },
          });
        });
        result.imported++;
      } catch (err) {
        const reason =
          err instanceof Prisma.PrismaClientKnownRequestError
            ? `DB error ${err.code}`
            : (err as Error).message;
        result.errors.push({ row: i + 1, reason });
      }
      await job.updateProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    this.logger.log(
      `Bulk import ${job.id}: imported=${result.imported} skipped=${result.skipped} errors=${result.errors.length}`,
    );
    return result;
  }
}
