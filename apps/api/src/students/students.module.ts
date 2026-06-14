import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_BULK_IMPORT } from '../queues/queue.constants';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { BulkImportProcessor } from './bulk-import.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_BULK_IMPORT })],
  controllers: [StudentsController],
  providers: [StudentsService, BulkImportProcessor],
  exports: [StudentsService],
})
export class StudentsModule {}
