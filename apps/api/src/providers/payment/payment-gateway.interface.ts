export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface CreateOrderInput {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrder {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  status: 'CREATED';
}

export interface VerifyPaymentInput {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export interface PaymentGatewayService {
  createOrder(input: CreateOrderInput): Promise<GatewayOrder>;
  verifyPayment(input: VerifyPaymentInput): Promise<boolean>;
}
