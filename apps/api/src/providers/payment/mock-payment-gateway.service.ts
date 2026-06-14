import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  CreateOrderInput,
  GatewayOrder,
  PaymentGatewayService,
  VerifyPaymentInput,
} from './payment-gateway.interface';

/**
 * Mock payment gateway for development. Generates deterministic-looking order
 * ids and verifies signatures with a simple hash so the online-payment flow can
 * be exercised end-to-end without real Razorpay/PayU/Stripe credentials.
 */
@Injectable()
export class MockPaymentGatewayService implements PaymentGatewayService {
  private readonly logger = new Logger('PaymentGateway');

  async createOrder(input: CreateOrderInput): Promise<GatewayOrder> {
    const gatewayOrderId = `order_mock_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    this.logger.log(
      `Created mock order ${gatewayOrderId} for ${input.amount} ${input.currency ?? 'INR'}`,
    );
    return {
      gatewayOrderId,
      amount: input.amount,
      currency: input.currency ?? 'INR',
      status: 'CREATED',
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    const expected = createHash('sha256')
      .update(`${input.gatewayOrderId}|${input.gatewayPaymentId}`)
      .digest('hex');
    return expected === input.signature;
  }
}
