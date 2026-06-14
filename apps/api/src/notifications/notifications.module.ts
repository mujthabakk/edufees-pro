import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Get,
  Inject,
  Injectable,
  Module,
  Post,
  Query,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Job, Queue } from 'bullmq';
import { NotificationChannel, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/cls/tenant-context.service';
import { paginate, PaginationQueryDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import {
  MESSAGING_SERVICE,
  MessageChannel,
  MessagingService,
} from '../providers/messaging/messaging.interface';
import {
  NotificationJobData,
  QUEUE_NOTIFICATIONS,
  QUEUE_REMINDERS,
  ReminderJobData,
} from '../queues/queue.constants';

class BroadcastDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ type: [String], description: 'Omit to target all active students' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}

class ReminderDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({ type: [String], description: 'Omit to target all defaulters' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}

@Injectable()
class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notifyQueue: Queue,
    @InjectQueue(QUEUE_REMINDERS) private readonly reminderQueue: Queue,
  ) {}

  async listLogs(query: PaginationQueryDto) {
    const scoped = this.prisma.scoped();
    const [rows, total] = await Promise.all([
      scoped.notificationLog.findMany({
        orderBy: { sentAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      scoped.notificationLog.count({}),
    ]);
    return paginate(rows, total, query.page, query.pageSize);
  }

  async broadcast(dto: BroadcastDto) {
    const schoolId = this.tenant.requireSchoolId();
    const studentIds = dto.studentIds ?? (await this.allActiveStudentIds(schoolId));
    const data: NotificationJobData = {
      schoolId,
      studentIds,
      channel: dto.channel,
      template: dto.template,
      message: dto.message,
    };
    const job = await this.notifyQueue.add('broadcast', data);
    return { jobId: String(job.id), recipients: studentIds.length };
  }

  async sendReminders(dto: ReminderDto) {
    const schoolId = this.tenant.requireSchoolId();
    const studentIds = dto.studentIds ?? (await this.defaulterStudentIds(schoolId));
    const data: ReminderJobData = {
      schoolId,
      studentIds,
      channel: dto.channel,
      template: dto.template ?? 'OVERDUE_REMINDER',
    };
    const job = await this.reminderQueue.add('reminder', data);
    return { jobId: String(job.id), recipients: studentIds.length };
  }

  private async allActiveStudentIds(schoolId: string): Promise<string[]> {
    const rows = await this.prisma.student.findMany({
      where: { schoolId, isActive: true },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  private async defaulterStudentIds(schoolId: string): Promise<string[]> {
    const rows = await this.prisma.student.findMany({
      where: {
        schoolId,
        isActive: true,
        feeAssignments: {
          some: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        },
      },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}

/** Shared delivery helper for both queue processors. */
async function deliver(
  prisma: PrismaService,
  messaging: MessagingService,
  data: { schoolId: string; studentIds: string[]; channel: NotificationChannel; template: string; message?: string },
): Promise<{ sent: number }> {
  const students = await prisma.student.findMany({
    where: { id: { in: data.studentIds } },
    select: { id: true, parentMobile: true, parentEmail: true, whatsappNumber: true },
  });
  const channels: MessageChannel[] =
    data.channel === NotificationChannel.BOTH
      ? ['WHATSAPP', 'EMAIL']
      : [data.channel as MessageChannel];

  let sent = 0;
  for (const student of students) {
    for (const ch of channels) {
      const recipient =
        ch === 'EMAIL'
          ? student.parentEmail ?? ''
          : student.whatsappNumber ?? student.parentMobile;
      if (!recipient) continue;
      const result = await messaging.send({
        channel: ch,
        recipient,
        template: data.template,
        body: data.message ?? data.template,
      });
      await prisma.notificationLog.create({
        data: {
          schoolId: data.schoolId,
          studentId: student.id,
          channel:
            ch === 'EMAIL'
              ? NotificationChannel.EMAIL
              : NotificationChannel.WHATSAPP,
          template: data.template,
          recipient,
          message: data.message ?? data.template,
          status: result.status === 'SENT' ? 'SENT' : 'FAILED',
        },
      });
      sent++;
    }
  }
  return { sent };
}

@Processor(QUEUE_NOTIFICATIONS)
class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MESSAGING_SERVICE) private readonly messaging: MessagingService,
  ) {
    super();
  }
  async process(job: Job<NotificationJobData>) {
    return deliver(this.prisma, this.messaging, job.data);
  }
}

@Processor(QUEUE_REMINDERS)
class RemindersProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MESSAGING_SERVICE) private readonly messaging: MessagingService,
  ) {
    super();
  }
  async process(job: Job<ReminderJobData>) {
    return deliver(this.prisma, this.messaging, job.data);
  }
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  listLogs(@Query() query: PaginationQueryDto) {
    return this.notifications.listLogs(query);
  }

  @Post('broadcast')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  broadcast(@Body() dto: BroadcastDto) {
    return this.notifications.broadcast(dto);
  }

  @Post('reminders')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  sendReminders(@Body() dto: ReminderDto) {
    return this.notifications.sendReminders(dto);
  }
}

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NOTIFICATIONS },
      { name: QUEUE_REMINDERS },
    ),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor, RemindersProcessor],
})
export class NotificationsModule {}
