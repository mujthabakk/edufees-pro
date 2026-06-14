import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { PdfService } from '../providers/pdf/pdf.service';
import {
  STORAGE_SERVICE,
  StorageService,
} from '../providers/storage/storage.interface';
import { CreatePaymentDto, ListPaymentsQueryDto } from './dto/payments.dto';
import { renderInvoiceHtml } from './invoice.template';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly pdf: PdfService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async list(query: ListPaymentsQueryDto) {
    const scoped = this.prisma.scoped();
    const where: Prisma.PaymentWhereInput = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.paymentMode ? { paymentMode: query.paymentMode } : {}),
      ...(query.search
        ? {
            student: {
              OR: [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { admissionNo: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      scoped.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip: query.skip,
        take: query.take,
        include: {
          student: { select: { fullName: true, admissionNo: true } },
          invoice: { select: { id: true, invoiceNo: true } },
        },
      }),
      scoped.payment.count({ where }),
    ]);

    const data = rows.map((p) => this.toDto(p));
    return paginate(data, total, query.page, query.pageSize);
  }

  async record(dto: CreatePaymentDto) {
    const schoolId = this.tenant.requireSchoolId();
    const recordedById = this.tenant.userId;
    if (!recordedById) {
      throw new BadRequestException('Missing user context');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
      include: { class: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    if (dto.assignmentId) {
      const assignment = await this.prisma.studentFeeAssignment.findFirst({
        where: { id: dto.assignmentId, studentId: dto.studentId },
      });
      if (!assignment) {
        throw new NotFoundException('Fee assignment not found for student');
      }
    }

    const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();

    // Record the payment and update the linked assignment atomically.
    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          schoolId,
          studentId: dto.studentId,
          assignmentId: dto.assignmentId ?? null,
          recordedById,
          amount: new Prisma.Decimal(dto.amount),
          paymentMode: dto.paymentMode,
          referenceNo: dto.referenceNo ?? null,
          notes: dto.notes ?? null,
          paymentDate,
          isOnline: dto.isOnline ?? false,
          gatewayOrderId: dto.gatewayOrderId ?? null,
          gatewayPaymentId: dto.gatewayPaymentId ?? null,
        },
      });

      if (dto.assignmentId) {
        const assignment = await tx.studentFeeAssignment.findUniqueOrThrow({
          where: { id: dto.assignmentId },
        });
        const newPaid = new Prisma.Decimal(assignment.paidAmount).plus(
          dto.amount,
        );
        const net = new Prisma.Decimal(assignment.netAmount);
        let status: PaymentStatus = PaymentStatus.PARTIAL;
        if (newPaid.greaterThanOrEqualTo(net)) {
          status = PaymentStatus.PAID;
        } else if (newPaid.lessThanOrEqualTo(0)) {
          status = PaymentStatus.PENDING;
        }
        await tx.studentFeeAssignment.update({
          where: { id: dto.assignmentId },
          data: { paidAmount: newPaid, status },
        });
      }

      return created;
    });

    const invoice = await this.generateInvoice(payment.id, {
      schoolId,
      studentName: student.fullName,
      admissionNo: student.admissionNo,
      className: student.class?.name ?? '-',
      amount: dto.amount,
      paymentMode: dto.paymentMode,
      referenceNo: dto.referenceNo ?? null,
      paymentDate: paymentDate.toISOString().slice(0, 10),
    });

    return this.toDto({
      ...payment,
      student: {
        fullName: student.fullName,
        admissionNo: student.admissionNo,
      },
      invoice: { id: invoice.id, invoiceNo: invoice.invoiceNo },
    });
  }

  private async generateInvoice(
    paymentId: string,
    data: {
      schoolId: string;
      studentName: string;
      admissionNo: string;
      className: string;
      amount: number;
      paymentMode: string;
      referenceNo: string | null;
      paymentDate: string;
    },
  ) {
    const school = await this.prisma.school.findUnique({
      where: { id: data.schoolId },
      select: { name: true, currency: true },
    });
    const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}-${randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;

    const html = renderInvoiceHtml({
      invoiceNo,
      schoolName: school?.name ?? 'School',
      studentName: data.studentName,
      admissionNo: data.admissionNo,
      className: data.className,
      amount: data.amount,
      paymentMode: data.paymentMode,
      referenceNo: data.referenceNo,
      paymentDate: data.paymentDate,
      currency: school?.currency ?? 'INR',
    });

    let pdfKey: string | null = null;
    try {
      const rendered = await this.pdf.renderHtmlToPdf(html);
      const key = `invoices/${data.schoolId}/${invoiceNo}.${rendered.extension}`;
      await this.storage.put({
        key,
        body: rendered.buffer,
        contentType: rendered.contentType,
      });
      pdfKey = key;
    } catch (err) {
      // Invoice metadata is still created; PDF can be regenerated later.
      this.logger.warn(`Invoice PDF generation failed: ${(err as Error).message}`);
    }

    return this.prisma.invoice.create({
      data: {
        schoolId: data.schoolId,
        studentId: (
          await this.prisma.payment.findUniqueOrThrow({
            where: { id: paymentId },
            select: { studentId: true },
          })
        ).studentId,
        paymentId,
        invoiceNo,
        pdfUrl: pdfKey,
      },
    });
  }

  /** Deletes a payment, its invoice, and reverses any linked assignment balance. */
  async remove(id: string) {
    const schoolId = this.tenant.requireSchoolId();
    const payment = await this.prisma.payment.findFirst({
      where: { id, schoolId },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.$transaction(async (tx) => {
      if (payment.assignmentId) {
        const assignment = await tx.studentFeeAssignment.findUnique({
          where: { id: payment.assignmentId },
        });
        if (assignment) {
          const newPaid = new Prisma.Decimal(assignment.paidAmount).minus(
            payment.amount,
          );
          const clamped = newPaid.lessThan(0)
            ? new Prisma.Decimal(0)
            : newPaid;
          const net = new Prisma.Decimal(assignment.netAmount);
          let status: PaymentStatus = PaymentStatus.PARTIAL;
          if (clamped.lessThanOrEqualTo(0)) {
            status = PaymentStatus.PENDING;
          } else if (clamped.greaterThanOrEqualTo(net)) {
            status = PaymentStatus.PAID;
          }
          await tx.studentFeeAssignment.update({
            where: { id: payment.assignmentId },
            data: { paidAmount: clamped, status },
          });
        }
      }

      if (payment.invoice) {
        await tx.invoice.delete({ where: { id: payment.invoice.id } });
      }
      await tx.payment.delete({ where: { id } });
    });

    if (payment.invoice?.pdfUrl) {
      try {
        await this.storage.remove(payment.invoice.pdfUrl);
      } catch (err) {
        this.logger.warn(
          `Failed to delete invoice PDF: ${(err as Error).message}`,
        );
      }
    }

    return { deleted: true };
  }

  /** Returns a time-limited URL for an invoice PDF. */
  async getInvoiceUrl(invoiceId: string): Promise<{ url: string }> {
    const schoolId = this.tenant.requireSchoolId();
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, schoolId },
    });
    if (!invoice || !invoice.pdfUrl) {
      throw new NotFoundException('Invoice PDF not available');
    }
    const url = await this.storage.getSignedUrl(invoice.pdfUrl);
    return { url };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDto(p: any) {
    return {
      id: p.id as string,
      studentId: p.studentId as string,
      studentName: p.student?.fullName ?? '',
      admissionNo: p.student?.admissionNo ?? '',
      assignmentId: (p.assignmentId as string | null) ?? null,
      amount: Number(p.amount),
      paymentMode: p.paymentMode,
      referenceNo: (p.referenceNo as string | null) ?? null,
      notes: (p.notes as string | null) ?? null,
      paymentDate: (p.paymentDate as Date).toISOString(),
      isOnline: Boolean(p.isOnline),
      invoiceId: p.invoice?.id ?? null,
      invoiceNo: p.invoice?.invoiceNo ?? null,
    };
  }
}
