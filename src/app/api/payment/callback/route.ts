import { redirect } from 'next/navigation';

import { envConfigs } from '@/config';
import { PaymentType } from '@/extensions/payment/types';
import { findOrderByOrderNo, Order } from '@/shared/models/order';
import { getUserInfo } from '@/shared/models/user';
import {
  getPaymentService,
  handleCheckoutSuccess,
} from '@/shared/services/payment';

function getOrigin(value?: string | null) {
  if (!value) {
    return '';
  }

  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function isLocalOrigin(origin: string) {
  if (!origin) {
    return false;
  }

  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function getRuntimeAppBaseUrl(req: Request) {
  const requestOrigin = getOrigin(req.url);
  if (isLocalOrigin(requestOrigin)) {
    return requestOrigin;
  }

  return getOrigin(envConfigs.app_url) || requestOrigin || 'http://localhost:3000';
}

function getOrderRedirectUrl(order: Order, appBaseUrl: string) {
  return (
    order.callbackUrl ||
    (order.paymentType === PaymentType.SUBSCRIPTION
      ? `${appBaseUrl}/settings/billing`
      : `${appBaseUrl}/settings/payments`)
  );
}

function getSafeInternalCallbackPath(targetUrl: string, appBaseUrl: string) {
  try {
    const appUrl = new URL(appBaseUrl);
    const target = new URL(targetUrl, appBaseUrl);
    if (target.origin !== appUrl.origin) {
      return '/';
    }

    return `${target.pathname}${target.search}${target.hash}` || '/';
  } catch {
    return '/';
  }
}

function getSignInRedirectUrl(targetUrl: string, appBaseUrl: string) {
  const callbackPath = getSafeInternalCallbackPath(targetUrl, appBaseUrl);
  return `${appBaseUrl}/sign-in?callbackUrl=${encodeURIComponent(callbackPath)}`;
}

function appendQuery(
  targetUrl: string,
  params: Record<string, string | null | undefined>,
  appBaseUrl: string
) {
  const url = new URL(targetUrl, appBaseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function GET(req: Request) {
  let redirectUrl = '';
  let orderNo = '';
  const appBaseUrl = getRuntimeAppBaseUrl(req);

  try {
    // get callback params
    const { searchParams } = new URL(req.url);
    orderNo = searchParams.get('order_no') || '';

    if (!orderNo) {
      throw new Error('invalid callback params');
    }

    const user = await getUserInfo(req);

    // get order
    const order = await findOrderByOrderNo(orderNo);
    if (!order) {
      throw new Error('order not found');
    }

    // validate order and user
    if (!order.paymentSessionId || !order.paymentProvider) {
      throw new Error('invalid order');
    }

    const paymentService = await getPaymentService();

    const paymentProvider = paymentService.getProvider(order.paymentProvider);
    if (!paymentProvider) {
      throw new Error('payment provider not found');
    }

    // get payment session
    const session = await paymentProvider.getPaymentSession({
      sessionId: order.paymentSessionId,
    });

    // console.log('callback payment session', session);

    await handleCheckoutSuccess({
      order,
      session,
    });

    redirectUrl = appendQuery(getOrderRedirectUrl(order, appBaseUrl), {
      payment: 'success',
      order_no: order.orderNo,
      provider: order.paymentProvider,
    }, appBaseUrl);

    // External checkout providers may return without an active session cookie,
    // or with a different account still signed in on the same browser.
    // The order itself is the source of truth here; do not turn a successful
    // payment into a pricing-page failure because of session state.
    if (user?.id && order.userId && order.userId !== user.id) {
      redirectUrl = getSignInRedirectUrl(redirectUrl, appBaseUrl);
    }
  } catch (e: any) {
    console.log('checkout callback failed:', e);
    redirectUrl = appendQuery(`${appBaseUrl}/pricing`, {
      payment: 'failed',
      order_no: orderNo,
    }, appBaseUrl);
  }

  redirect(redirectUrl);
}
