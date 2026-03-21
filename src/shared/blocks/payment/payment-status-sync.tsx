'use client';

import { useEffect } from 'react';

import {
  clearPaymentAttempt,
  updatePaymentAttemptStatus,
} from '@/shared/lib/payment-attempt';

export function PaymentStatusSync({
  status,
}: {
  status?: 'success' | 'cancelled' | 'failed' | null;
}) {
  useEffect(() => {
    if (!status) {
      return;
    }

    if (status === 'success') {
      clearPaymentAttempt();
      return;
    }

    updatePaymentAttemptStatus(status);
  }, [status]);

  return null;
}
