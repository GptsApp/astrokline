import crypto from 'crypto';

import {
  CheckoutSession,
  PaymentBilling,
  PaymentEventType,
  PaymentInterval,
  PaymentInvoice,
  PaymentStatus,
  PaymentType,
  SubscriptionCycleType,
  SubscriptionInfo,
  SubscriptionStatus,
  type PaymentConfigs,
  type PaymentEvent,
  type PaymentOrder,
  type PaymentProvider,
  type PaymentSession,
} from './types';

/**
 * Infini payment provider configs
 * @docs https://developer.infini.money/docs/zh/1-overview
 */
export interface InfiniConfigs extends PaymentConfigs {
  keyId: string;
  secretKey: string;
  webhookSecret?: string;
  environment?: 'sandbox' | 'production';
}

/**
 * Infini payment provider implementation
 * Uses hosted checkout mode with HMAC-SHA256 authentication
 * @website https://infini.money/
 */
export class InfiniProvider implements PaymentProvider {
  readonly name = 'infini';
  configs: InfiniConfigs;

  private baseUrl: string;

  constructor(configs: InfiniConfigs) {
    this.configs = configs;
    this.baseUrl =
      configs.environment === 'production'
        ? 'https://openapi.infini.money'
        : 'https://openapi-sandbox.infini.money';
  }

  /**
   * Create payment (one-time or subscription)
   */
  async createPayment({
    order,
  }: {
    order: PaymentOrder;
  }): Promise<CheckoutSession> {
    try {
      if (!order.price) {
        throw new Error('price is required');
      }

      if (order.type === PaymentType.SUBSCRIPTION) {
        return await this.createSubscriptionPayment(order);
      } else {
        return await this.createOneTimePayment(order);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create one-time payment via hosted checkout
   */
  private async createOneTimePayment(
    order: PaymentOrder
  ): Promise<CheckoutSession> {
    // Infini uses dollar amounts (not cents), so convert from cents
    const amount = (order.price!.amount / 100).toFixed(2);

    const payload: any = {
      amount: amount,
      request_id: order.requestId || crypto.randomUUID(),
      client_reference: order.orderNo || '',
      order_desc: order.description || 'Payment',
    };

    // Set success/failure URLs
    if (order.successUrl) {
      payload.success_url = order.successUrl;
    }
    if (order.cancelUrl) {
      payload.failure_url = order.cancelUrl;
    }

    const result = await this.makeRequest(
      '/v1/acquiring/order',
      'POST',
      payload
    );

    return {
      provider: this.name,
      checkoutParams: payload,
      checkoutInfo: {
        sessionId: result.order_id,
        checkoutUrl: result.checkout_url,
      },
      checkoutResult: result,
      metadata: order.metadata || {},
    };
  }

  /**
   * Create subscription payment
   */
  private async createSubscriptionPayment(
    order: PaymentOrder
  ): Promise<CheckoutSession> {
    if (!order.plan) {
      throw new Error('plan is required for subscription');
    }

    // Infini uses dollar amounts (not cents)
    const amount = (order.price!.amount / 100).toFixed(2);
    const merchantSubId = order.orderNo || crypto.randomUUID();

    const payload: any = {
      amount: amount,
      request_id: order.requestId || crypto.randomUUID(),
      client_reference: order.orderNo || '',
      subscription: {
        merchant_sub_id: merchantSubId,
        plan_name: order.plan.name || 'Subscription',
        amount: amount,
        interval_unit: this.mapIntervalToInfini(order.plan.interval),
        interval_count: order.plan.intervalCount || 1,
        payer_email: order.customer?.email || '',
        invoice_lead_days: 3,
        invoice_due_days: 3,
        subscription_end_at: 0, // Never end
      },
    };

    // Set success/failure URLs
    if (order.successUrl) {
      payload.success_url = order.successUrl;
    }
    if (order.cancelUrl) {
      payload.failure_url = order.cancelUrl;
    }

    const result = await this.makeRequest(
      '/v1/acquiring/subscription',
      'POST',
      payload
    );

    return {
      provider: this.name,
      checkoutParams: payload,
      checkoutInfo: {
        sessionId: result.order_id,
        checkoutUrl: result.checkout_url,
      },
      checkoutResult: result,
      metadata: {
        ...(order.metadata || {}),
        subscription_id: result.subscription?.subscription_id,
        merchant_sub_id: result.subscription?.merchant_sub_id,
      },
    };
  }

  /**
   * Get payment session by session id (order_id)
   */
  async getPaymentSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<PaymentSession> {
    try {
      if (!sessionId) {
        throw new Error('sessionId is required');
      }

      // Try as order first
      try {
        const orderResult = await this.makeRequest(
          `/v1/acquiring/order?order_id=${sessionId}`,
          'GET'
        );

        return this.buildPaymentSessionFromOrder(orderResult);
      } catch (orderError: any) {
        // If order not found, try as subscription (merchant_sub_id)
        if (
          orderError.message?.includes('40401') ||
          orderError.message?.includes('not found')
        ) {
          const subscriptionResult = await this.makeRequest(
            `/v1/acquiring/subscription?merchant_sub_id=${sessionId}`,
            'GET'
          );
          return this.buildPaymentSessionFromSubscription(subscriptionResult);
        }
        throw orderError;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment event from webhook notification
   */
  async getPaymentEvent({ req }: { req: Request }): Promise<PaymentEvent> {
    try {
      const rawBody = await req.text();

      // Verify webhook signature
      if (this.configs.webhookSecret) {
        const signature = req.headers.get('X-Webhook-Signature') || '';
        const timestamp = req.headers.get('X-Webhook-Timestamp') || '';
        const eventId = req.headers.get('X-Webhook-Event-Id') || '';

        if (!signature || !timestamp || !eventId) {
          throw new Error('Missing required webhook headers');
        }

        const signedContent = `${timestamp}.${eventId}.${rawBody}`;
        const expectedSignature = crypto
          .createHmac('sha256', this.configs.webhookSecret)
          .update(signedContent)
          .digest('hex');

        if (expectedSignature !== signature) {
          throw new Error('Invalid webhook signature');
        }
      }

      const event = JSON.parse(rawBody);
      if (!event || !event.event) {
        throw new Error('Invalid webhook payload');
      }

      const eventType = this.mapInfiniEventType(event.event);
      let paymentSession: PaymentSession | undefined = undefined;

      if (
        eventType === PaymentEventType.CHECKOUT_SUCCESS ||
        eventType === PaymentEventType.PAYMENT_SUCCESS
      ) {
        // Order event (order.completed)
        paymentSession = this.buildPaymentSessionFromOrder(event);
      } else if (
        eventType === PaymentEventType.SUBSCRIBE_UPDATED ||
        eventType === PaymentEventType.SUBSCRIBE_CANCELED
      ) {
        // Subscription event
        paymentSession =
          this.buildPaymentSessionFromSubscription(event);
      } else if (eventType === PaymentEventType.PAYMENT_FAILED) {
        paymentSession = {
          provider: this.name,
          paymentStatus: PaymentStatus.FAILED,
          paymentResult: event,
        };
      }

      return {
        eventType: eventType,
        eventResult: event,
        paymentSession: paymentSession,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment invoice (Infini doesn't have a direct invoice URL)
   */
  async getPaymentInvoice({
    invoiceId,
  }: {
    invoiceId: string;
  }): Promise<PaymentInvoice> {
    return {
      invoiceId: invoiceId,
      invoiceUrl: undefined,
    };
  }

  /**
   * Get payment billing URL (Infini doesn't have a direct billing portal)
   */
  async getPaymentBilling({
    customerId: _customerId,
    returnUrl: _returnUrl,
  }: {
    customerId: string;
    returnUrl?: string;
  }): Promise<PaymentBilling> {
    return {
      billingUrl: undefined,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription({
    subscriptionId,
  }: {
    subscriptionId: string;
  }): Promise<PaymentSession> {
    try {
      if (!subscriptionId) {
        throw new Error('subscriptionId is required');
      }

      const result = await this.makeRequest(
        '/v1/acquiring/subscription/cancel',
        'POST',
        {
          merchant_sub_id: subscriptionId,
          cancel_reason: 'by_merchant_api',
        }
      );

      // Query updated subscription info
      const subscription = await this.makeRequest(
        `/v1/acquiring/subscription?merchant_sub_id=${subscriptionId}`,
        'GET'
      );

      return this.buildPaymentSessionFromSubscription(subscription);
    } catch (error) {
      throw error;
    }
  }

  // ============ Private Helper Methods ============

  /**
   * Build payment session from order data
   */
  private buildPaymentSessionFromOrder(order: any): PaymentSession {
    const status = order.status || order.pay_status;
    const paymentStatus = this.mapInfiniOrderStatus(status);

    const amount = order.amount ? parseFloat(order.amount) * 100 : 0; // Convert to cents

    return {
      provider: this.name,
      paymentStatus: paymentStatus,
      paymentInfo: {
        paymentAmount: amount,
        paymentCurrency: (order.currency || 'USD').toUpperCase(),
        paidAt:
          paymentStatus === PaymentStatus.SUCCESS
            ? new Date(
                (order.updated_at || Math.floor(Date.now() / 1000)) * 1000
              )
            : undefined,
        transactionId: order.order_id,
      },
      paymentResult: order,
      metadata: {
        order_no: order.client_reference,
      },
    };
  }

  /**
   * Build payment session from subscription data
   */
  private buildPaymentSessionFromSubscription(sub: any): PaymentSession {
    const subscriptionStatus = this.mapInfiniSubscriptionStatus(sub.status);
    const amount = sub.amount ? parseFloat(sub.amount) * 100 : 0;

    const subscriptionInfo: SubscriptionInfo = {
      subscriptionId: sub.merchant_sub_id || sub.subscription_id,
      description: sub.plan_name,
      amount: amount,
      currency: (sub.currency || 'USD').toUpperCase(),
      interval: this.mapInfiniIntervalToInternal(sub.interval_unit),
      intervalCount: sub.interval_count || 1,
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start * 1000)
        : new Date(),
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : new Date(),
      status: subscriptionStatus,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : undefined,
      canceledReason: sub.cancel_reason,
      canceledReasonType: sub.cancel_reason,
    };

    // Determine subscription cycle type
    let subscriptionCycleType: SubscriptionCycleType | undefined;
    if (sub.event === 'subscription.update' && sub.status === 'active') {
      // If the subscription just became active, it could be a first payment or renewal
      // We check if current_period_start equals created_at to determine
      if (
        sub.current_period_start &&
        sub.created_at &&
        Math.abs(sub.current_period_start - sub.created_at) < 60
      ) {
        subscriptionCycleType = SubscriptionCycleType.CREATE;
      } else {
        subscriptionCycleType = SubscriptionCycleType.RENEWAL;
      }
    }

    return {
      provider: this.name,
      paymentStatus:
        subscriptionStatus === SubscriptionStatus.ACTIVE
          ? PaymentStatus.SUCCESS
          : subscriptionStatus === SubscriptionStatus.CANCELED
            ? PaymentStatus.CANCELED
            : PaymentStatus.PROCESSING,
      paymentInfo: {
        paymentAmount: amount,
        paymentCurrency: (sub.currency || 'USD').toUpperCase(),
        paymentEmail: sub.payer_email,
        paidAt:
          subscriptionStatus === SubscriptionStatus.ACTIVE
            ? new Date(
                (sub.updated_at || Math.floor(Date.now() / 1000)) * 1000
              )
            : undefined,
        subscriptionCycleType: subscriptionCycleType,
      },
      paymentResult: sub,
      subscriptionId: sub.merchant_sub_id || sub.subscription_id,
      subscriptionInfo: subscriptionInfo,
      subscriptionResult: sub,
      metadata: {
        order_no: sub.client_reference,
      },
    };
  }

  /**
   * Sign and make API request to Infini
   */
  private async makeRequest(
    path: string,
    method: string,
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const gmtTime = new Date().toUTCString();

    // Build signing string
    // Format: {keyId}\n{METHOD} {path}\ndate: {GMT_time}\n
    const signingString =
      `${this.configs.keyId}\n` +
      `${method.toUpperCase()} ${path}\n` +
      `date: ${gmtTime}\n`;

    // Calculate signature
    const signature = crypto
      .createHmac('sha256', this.configs.secretKey)
      .update(signingString)
      .digest('base64');

    const headers: Record<string, string> = {
      Date: gmtTime,
      Authorization: `Signature keyId="${this.configs.keyId}",algorithm="hmac-sha256",headers="@request-target date",signature="${signature}"`,
    };

    let body: string | undefined;

    if (data) {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';

      // Calculate body digest (not part of signature, but required as header)
      const bodyDigest = crypto
        .createHash('sha256')
        .update(body, 'utf-8')
        .digest('base64');
      headers['Digest'] = `SHA-256=${bodyDigest}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = body;
    }

    const response = await fetch(url, config);

    // Handle empty response
    if (response.status === 204) {
      return {};
    }

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result.message || result.detail || JSON.stringify(result);
      throw new Error(
        `Infini request failed (${result.code || response.status}): ${errorMessage}`
      );
    }

    // Infini wraps data in a { code, message, data } structure sometimes
    if (result.data !== undefined && result.code !== undefined) {
      if (result.code !== 0) {
        throw new Error(
          `Infini request failed (${result.code}): ${result.message || ''}`
        );
      }
      return result.data;
    }

    return result;
  }

  /**
   * Map internal interval to Infini interval unit
   */
  private mapIntervalToInfini(interval: PaymentInterval): string {
    switch (interval) {
      case PaymentInterval.DAY:
        return 'DAY';
      case PaymentInterval.WEEK:
        return 'DAY'; // Map week to 7 days
      case PaymentInterval.MONTH:
        return 'MONTH';
      case PaymentInterval.YEAR:
        return 'MONTH'; // Map year to 12 months
      default:
        return 'MONTH';
    }
  }

  /**
   * Map Infini interval unit to internal interval
   */
  private mapInfiniIntervalToInternal(
    intervalUnit: string
  ): PaymentInterval {
    switch (intervalUnit?.toUpperCase()) {
      case 'DAY':
        return PaymentInterval.DAY;
      case 'MONTH':
        return PaymentInterval.MONTH;
      default:
        return PaymentInterval.MONTH;
    }
  }

  /**
   * Map Infini event type to internal event type
   */
  private mapInfiniEventType(eventType: string): PaymentEventType {
    switch (eventType) {
      case 'order.create':
      case 'order.created':
        return PaymentEventType.CHECKOUT_SUCCESS;

      case 'order.completed':
        return PaymentEventType.PAYMENT_SUCCESS;

      case 'order.processing':
        return PaymentEventType.CHECKOUT_SUCCESS;

      case 'order.expired':
        return PaymentEventType.PAYMENT_FAILED;

      case 'order.late_payment':
        return PaymentEventType.PAYMENT_SUCCESS;

      case 'subscription.update':
        return PaymentEventType.SUBSCRIBE_UPDATED;

      case 'subscription.cancel':
        return PaymentEventType.SUBSCRIBE_CANCELED;

      default:
        throw new Error(`Unknown Infini event type: ${eventType}`);
    }
  }

  /**
   * Map Infini order status to internal payment status
   */
  private mapInfiniOrderStatus(status: string): PaymentStatus {
    switch (status) {
      case 'pending':
        return PaymentStatus.PROCESSING;
      case 'processing':
        return PaymentStatus.PROCESSING;
      case 'paid':
        return PaymentStatus.SUCCESS;
      case 'partial_paid':
        return PaymentStatus.PROCESSING;
      case 'expired':
        return PaymentStatus.FAILED;
      default:
        return PaymentStatus.PROCESSING;
    }
  }

  /**
   * Map Infini subscription status to internal subscription status
   */
  private mapInfiniSubscriptionStatus(
    status: string
  ): SubscriptionStatus {
    switch (status) {
      case 'pending':
        return SubscriptionStatus.ACTIVE; // Treat pending as active for first payment
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}
