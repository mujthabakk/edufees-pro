import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  MessagingService,
  SendMessageInput,
  SendMessageResult,
} from './messaging.interface';

/**
 * Development messaging stub: logs the message instead of contacting a real
 * WhatsApp/Email/SMS provider. Swap behind MESSAGING_SERVICE for production.
 */
@Injectable()
export class ConsoleMessagingService implements MessagingService {
  private readonly logger = new Logger('Messaging');

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    this.logger.log(
      `[${input.channel}] -> ${input.recipient}${
        input.template ? ` (${input.template})` : ''
      }: ${input.body.slice(0, 120)}`,
    );
    return {
      channel: input.channel,
      recipient: input.recipient,
      providerMessageId: randomUUID(),
      status: 'SENT',
    };
  }
}
