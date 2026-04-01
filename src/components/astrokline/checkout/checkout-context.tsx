'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useAppContext } from '@/shared/contexts/app';

type CheckoutTier = 'lite' | 'pro';
type CheckoutStage = 'confirm' | 'processing' | 'redirecting' | 'waiting' | 'success' | 'error';

interface CheckoutState {
  isOpen: boolean;
  tier: CheckoutTier;
  stage: CheckoutStage;
  error?: string;
  checkoutUrl?: string;
  orderNo?: string;
}

interface CheckoutContextType {
  state: CheckoutState;
  openCheckout: (tier: CheckoutTier) => void;
  closeCheckout: () => void;
  startPayment: () => Promise<void>;
}

const TIER_CONFIG = {
  lite: {
    productId: 'standard-monthly',
    title: 'Lite',
    price: '$39.9',
    unit: '/ month',
    features: [
      'Career, Wealth, Love & Health AI reading',
      '30-Day Action Calendar with daily Do/Don\'t',
      '12-Month Energy Curve forecast',
      'Compatibility Check (synastry)',
      '5 chart generations per month',
    ],
  },
  pro: {
    productId: 'premium-monthly',
    title: 'Pro',
    price: '$79.9',
    unit: '/ month',
    features: [
      '"Ask Your Chart" — AI chat with birth chart',
      'Best Hours — daily peak/low time analysis',
      'Time Travel — explore any past or future year',
      'Unlimited chart generations',
      'HD PDF Life Book export (50+ pages)',
    ],
  },
};

const defaultState: CheckoutState = {
  isOpen: false,
  tier: 'lite',
  stage: 'confirm',
};

const CheckoutContext = createContext<CheckoutContextType>({
  state: defaultState,
  openCheckout: () => {},
  closeCheckout: () => {},
  startPayment: async () => {},
});

export const useCheckout = () => useContext(CheckoutContext);
export { TIER_CONFIG };
export type { CheckoutTier, CheckoutStage, CheckoutState };

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>(defaultState);
  const { user, setIsShowSignModal } = useAppContext();

  const openCheckout = useCallback((tier: CheckoutTier) => {
    if (!user?.id) {
      setIsShowSignModal(true);
      return;
    }
    setState({ isOpen: true, tier, stage: 'confirm' });
  }, [user, setIsShowSignModal]);

  const closeCheckout = useCallback(() => {
    setState(defaultState);
  }, []);

  const startPayment = useCallback(async () => {
    if (!user?.id) return;

    const config = TIER_CONFIG[state.tier];
    setState(prev => ({ ...prev, stage: 'processing' }));

    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: config.productId,
          currency: 'USD',
          locale: 'en',
        }),
      });

      if (res.status === 401) {
        setIsShowSignModal(true);
        setState(defaultState);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { code, message, data } = await res.json();
      if (code !== 0) throw new Error(message);

      const { checkoutUrl, orderNo } = data;
      if (!checkoutUrl) throw new Error('No checkout URL');

      setState(prev => ({
        ...prev,
        stage: 'waiting',
        checkoutUrl,
        orderNo,
      }));

      // Open Creem in new tab
      window.open(checkoutUrl, '_blank');

      // Poll for payment completion
      pollPaymentStatus(orderNo);
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        error: e.message || 'Checkout failed',
      }));
    }
  }, [state.tier, user, setIsShowSignModal]);

  const pollPaymentStatus = useCallback((orderNo: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/payment/status?order_no=${orderNo}`);
        if (res.ok) {
          const { data } = await res.json();
          if (data?.status === 'paid' || data?.status === 'completed') {
            clearInterval(interval);
            setState(prev => ({ ...prev, stage: 'success' }));
            // Refresh page after 2s to reflect new tier
            setTimeout(() => window.location.reload(), 2000);
          }
        }
      } catch {}
    }, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <CheckoutContext.Provider value={{ state, openCheckout, closeCheckout, startPayment }}>
      {children}
    </CheckoutContext.Provider>
  );
}
