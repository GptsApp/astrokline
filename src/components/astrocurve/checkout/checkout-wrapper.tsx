'use client';

import { ReactNode } from 'react';
import { CheckoutProvider } from '@/components/astrocurve/checkout/checkout-context';
import { CheckoutModal } from '@/components/astrocurve/checkout/checkout-modal';

export function CheckoutWrapper({ children }: { children: ReactNode }) {
  return (
    <CheckoutProvider>
      {children}
      <CheckoutModal />
    </CheckoutProvider>
  );
}
