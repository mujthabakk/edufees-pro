import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '../common/cls/cls.types';
import { tenantExtension } from './tenant.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly cls: ClsService<AppClsStore>) {
    // Prisma 7 requires a driver adapter; the connection string is supplied
    // here at runtime (CLI/migrations read it from prisma.config.ts instead).
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Returns a client automatically scoped to the request's active school.
   * SUPER_ADMIN (no schoolId) gets the unscoped base client.
   *
   * The returned client adds `schoolId` to where/data for tenant models on
   * the common operations; single-record lookups by id must still include
   * `schoolId` explicitly in the service layer.
   */
  scoped() {
    const schoolId = this.cls.get('schoolId');
    if (!schoolId) {
      return this;
    }
    return this.$extends(tenantExtension(schoolId));
  }
}
