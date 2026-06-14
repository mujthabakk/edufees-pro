import {
  Controller,
  Get,
  Injectable,
  Logger,
  Module,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';

@Injectable()
class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  async dashboardStats() {
    const schoolId = this.tenant.requireSchoolId();
    const [totalStudents, collectedAgg, assignmentAgg] = await Promise.all([
      this.prisma.student.count({ where: { schoolId, isActive: true } }),
      this.prisma.payment.aggregate({
        where: { schoolId },
        _sum: { amount: true },
      }),
      this.prisma.studentFeeAssignment.findMany({
        where: { student: { schoolId } },
        select: { netAmount: true, paidAmount: true, status: true, dueDate: true },
      }),
    ]);

    const totalCollected = Number(collectedAgg._sum.amount ?? 0);
    let totalPending = 0;
    let totalOverdue = 0;
    for (const a of assignmentAgg) {
      const outstanding = Number(a.netAmount) - Number(a.paidAmount);
      if (outstanding <= 0) continue;
      if (a.status === PaymentStatus.OVERDUE || a.dueDate < new Date()) {
        totalOverdue += outstanding;
      } else {
        totalPending += outstanding;
      }
    }
    const billed = totalCollected + totalPending + totalOverdue;
    const collectionRate = billed > 0 ? Math.round((totalCollected / billed) * 1000) / 10 : 0;

    return {
      totalStudents,
      totalCollected,
      totalPending,
      totalOverdue,
      collectionRate,
    };
  }

  async monthlyCollection() {
    const schoolId = this.tenant.requireSchoolId();
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    const payments = await this.prisma.payment.findMany({
      where: { schoolId, paymentDate: { gte: since } },
      select: { amount: true, paymentDate: true },
    });
    const buckets = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      buckets.set(d.toLocaleString('en-US', { month: 'short' }), 0);
    }
    for (const p of payments) {
      const key = p.paymentDate.toLocaleString('en-US', { month: 'short' });
      if (buckets.has(key)) buckets.set(key, buckets.get(key)! + Number(p.amount));
    }
    return Array.from(buckets.entries()).map(([month, collected]) => ({
      month,
      collected,
    }));
  }

  async classWiseCollection() {
    const schoolId = this.tenant.requireSchoolId();
    const assignments = await this.prisma.studentFeeAssignment.findMany({
      where: { student: { schoolId } },
      select: {
        netAmount: true,
        paidAmount: true,
        student: { select: { class: { select: { name: true, sortOrder: true } } } },
      },
    });
    const map = new Map<string, { total: number; collected: number; sortOrder: number }>();
    for (const a of assignments) {
      const name = a.student.class?.name ?? 'Unassigned';
      const sortOrder = a.student.class?.sortOrder ?? 999;
      const entry = map.get(name) ?? { total: 0, collected: 0, sortOrder };
      entry.total += Number(a.netAmount);
      entry.collected += Number(a.paidAmount);
      map.set(name, entry);
    }
    return Array.from(map.entries())
      .map(([className, v]) => ({
        class: className,
        total: v.total,
        collected: v.collected,
        percent: v.total > 0 ? Math.round((v.collected / v.total) * 100) : 0,
        sortOrder: v.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ sortOrder, ...rest }) => rest);
  }

  async paymentModeBreakdown() {
    const schoolId = this.tenant.requireSchoolId();
    const grouped = await this.prisma.payment.groupBy({
      by: ['paymentMode'],
      where: { schoolId },
      _sum: { amount: true },
      _count: { _all: true },
    });
    const total = grouped.reduce((s, g) => s + Number(g._sum.amount ?? 0), 0);
    return grouped
      .map((g) => {
        const amount = Number(g._sum.amount ?? 0);
        return {
          mode: g.paymentMode,
          amount,
          count: g._count._all,
          percent: total > 0 ? Math.round((amount / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  async quotaWiseCollection() {
    const schoolId = this.tenant.requireSchoolId();
    const assignments = await this.prisma.studentFeeAssignment.findMany({
      where: { student: { schoolId } },
      select: {
        netAmount: true,
        paidAmount: true,
        student: { select: { quota: { select: { name: true } } } },
      },
    });
    const map = new Map<string, { collected: number; total: number; students: Set<string> }>();
    for (const a of assignments) {
      const name = a.student.quota?.name ?? 'General';
      const entry = map.get(name) ?? { collected: 0, total: 0, students: new Set<string>() };
      entry.collected += Number(a.paidAmount);
      entry.total += Number(a.netAmount);
      map.set(name, entry);
    }
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      collected: v.collected,
      total: v.total,
    }));
  }
}

/** Daily job that flags overdue fee assignments across all tenants. */
@Injectable()
class OverdueCron {
  private readonly logger = new Logger('OverdueCron');
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async markOverdue(): Promise<void> {
    const result = await this.prisma.studentFeeAssignment.updateMany({
      where: {
        dueDate: { lt: new Date() },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      data: { status: PaymentStatus.OVERDUE },
    });
    this.logger.log(`Marked ${result.count} assignments overdue`);
  }
}

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.reports.dashboardStats();
  }

  @Get('monthly-collection')
  monthly() {
    return this.reports.monthlyCollection();
  }

  @Get('class-wise')
  classWise() {
    return this.reports.classWiseCollection();
  }

  @Get('payment-modes')
  paymentModes() {
    return this.reports.paymentModeBreakdown();
  }

  @Get('quota-wise')
  quotaWise() {
    return this.reports.quotaWiseCollection();
  }
}

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, OverdueCron],
})
export class ReportsModule {}
