'use client';

import { ReactNode } from 'react';
import { CheckoutProvider } from '@/components/astrokline/checkout/checkout-context';
import { CheckoutModal } from '@/components/astrokline/checkout/checkout-modal';

export function CheckoutWrapper({ children }: { children: ReactNode }) {
  return (
    <CheckoutProvider>
      {children}
      <CheckoutModal />
    </CheckoutProvider>
  );
}
