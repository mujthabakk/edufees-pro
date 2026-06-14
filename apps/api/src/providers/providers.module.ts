import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_SERVICE } from './storage/storage.interface';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';
import { MESSAGING_SERVICE } from './messaging/messaging.interface';
import { ConsoleMessagingService } from './messaging/console-messaging.service';
import { PAYMENT_GATEWAY } from './payment/payment-gateway.interface';
import { MockPaymentGatewayService } from './payment/mock-payment-gateway.service';
import { PdfService } from './pdf/pdf.service';

@Global()
@Module({
  providers: [
    LocalStorageService,
    S3StorageService,
    ConsoleMessagingService,
    MockPaymentGatewayService,
    PdfService,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, LocalStorageService, S3StorageService],
      useFactory: (
        config: ConfigService,
        local: LocalStorageService,
        s3: S3StorageService,
      ) => (config.get('storage.driver') === 's3' ? s3 : local),
    },
    {
      provide: MESSAGING_SERVICE,
      useExisting: ConsoleMessagingService,
    },
    {
      provide: PAYMENT_GATEWAY,
      useExisting: MockPaymentGatewayService,
    },
  ],
  exports: [STORAGE_SERVICE, MESSAGING_SERVICE, PAYMENT_GATEWAY, PdfService],
})
export class ProvidersModule {}
