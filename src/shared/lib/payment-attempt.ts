'use client';

const PAYMENT_ATTEMPT_KEY = 'astrokline_payment_attempt';
const PAYMENT_ATTEMPT_MAX_AGE_MS = 30 * 60 * 1000;

export type PaymentAttemptStatus =
  | 'redirecting'
  | 'pending'
  | 'cancelled'
  | 'failed'
  | 'success';

export interface PaymentAttempt {
  orderNo: string;
  productId: string;
  productName: string;
  currency: string;
  provider: string;
  checkoutUrl: string;
  createdAt: number;
  status: PaymentAttemptStatus;
}

function hasWindow() {
  return typeof window !== 'undefined';
}

export function savePaymentAttempt(attempt: PaymentAttempt) {
  if (!hasWindow()) {
    return;
  }

  sessionStorage.setItem(PAYMENT_ATTEMPT_KEY, JSON.stringify(attempt));
}

export function getPaymentAttempt(): PaymentAttempt | null {
  if (!hasWindow()) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(PAYMENT_ATTEMPT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PaymentAttempt;
    if (
      !parsed?.orderNo ||
      !parsed?.productId ||
      !parsed?.provider ||
      !parsed?.checkoutUrl ||
      !parsed?.createdAt ||
      Date.now() - parsed.createdAt > PAYMENT_ATTEMPT_MAX_AGE_MS
    ) {
      sessionStorage.removeItem(PAYMENT_ATTEMPT_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(PAYMENT_ATTEMPT_KEY);
    return null;
  }
}

export function updatePaymentAttemptStatus(status: PaymentAttemptStatus) {
  const existing = getPaymentAttempt();
  if (!existing) {
    return;
  }

  savePaymentAttempt({
    ...existing,
    status,
  });
}

export function clearPaymentAttempt() {
  if (!hasWindow()) {
    return;
  }

  sessionStorage.removeItem(PAYMENT_ATTEMPT_KEY);
}
