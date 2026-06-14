import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  QUEUE_BULK_IMPORT,
  QUEUE_NOTIFICATIONS,
  QUEUE_REMINDERS,
} from './queue.constants';

/**
 * Registers the shared BullMQ connection and the application's queues.
 * Processors live in their owning feature modules (e.g. bulk-import in students).
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_BULK_IMPORT },
      { name: QUEUE_REMINDERS },
      { name: QUEUE_NOTIFICATIONS },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
