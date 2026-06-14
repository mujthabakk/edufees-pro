export const MESSAGING_SERVICE = Symbol('MESSAGING_SERVICE');

export type MessageChannel = 'WHATSAPP' | 'EMAIL' | 'SMS';

export interface SendMessageInput {
  channel: MessageChannel;
  recipient: string;
  template?: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageResult {
  channel: MessageChannel;
  recipient: string;
  providerMessageId: string;
  status: 'SENT' | 'FAILED';
}

export interface MessagingService {
  send(input: SendMessageInput): Promise<SendMessageResult>;
}
