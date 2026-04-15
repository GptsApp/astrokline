'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CHECKOUT_TIER_COPY } from '@/lib/astrokline/plan-entitlements';
import { type CheckoutSource, normalizeCheckoutSource } from './checkout-copy';
import { useAppContext } from '@/shared/contexts/app';

declare global {
  interface Window {
    __AK_OPEN_CHECKOUT__?: (tier: CheckoutTier, source?: CheckoutSource) => void;
  }
}

type CheckoutTier = 'lite' | 'pro';
type CheckoutStage = 'confirm' | 'processing' | 'redirecting' | 'waiting' | 'success' | 'error';

type CheckoutBilling = 'monthly' | 'yearly';

interface CheckoutState {
  isOpen: boolean;
  tier: CheckoutTier;
  billing: CheckoutBilling;
  stage: CheckoutStage;
  source?: CheckoutSource;
  error?: string;
  checkoutUrl?: string;
  orderNo?: string;
}

interface CheckoutContextType {
  state: CheckoutState;
  openCheckout: (tier: CheckoutTier, source?: CheckoutSource | string) => void;
  closeCheckout: () => void;
  setBilling: (billing: CheckoutBilling) => void;
  startPayment: () => Promise<void>;
}

const TIER_CONFIG = {
  lite: {
    title: 'Lite',
    monthly: {
      productId: 'standard-monthly',
      price: '$39.9',
      unit: '/ month',
      originalPrice: null,
      tip: 'Billed monthly',
      saveLabel: undefined as string | undefined,
    },
    yearly: {
      productId: 'standard-yearly',
      price: '$19.9',
      originalPrice: '$39.9',
      unit: '/ month',
      tip: 'Billed yearly at $238.8',
      saveLabel: 'Save 50%',
    },
    features: CHECKOUT_TIER_COPY.lite.features,
  },
  pro: {
    title: 'Pro',
    monthly: {
      productId: 'premium-monthly',
      price: '$79.9',
      unit: '/ month',
      originalPrice: null,
      tip: 'Billed monthly',
      saveLabel: undefined as string | undefined,
    },
    yearly: {
      productId: 'premium-yearly',
      price: '$39.9',
      originalPrice: '$79.9',
      unit: '/ month',
      tip: 'Billed yearly at $478.8',
      saveLabel: 'Save 50%',
    },
    features: CHECKOUT_TIER_COPY.pro.features,
  },
};

const defaultState: CheckoutState = {
  isOpen: false,
  tier: 'lite',
  billing: 'yearly',
  stage: 'confirm',
  source: 'general',
};

const CheckoutContext = createContext<CheckoutContextType>({
  state: defaultState,
  openCheckout: () => {},
  closeCheckout: () => {},
  setBilling: () => {},
  startPayment: async () => {},
});

export const useCheckout = () => useContext(CheckoutContext);
export { TIER_CONFIG };
export type { CheckoutTier, CheckoutBilling, CheckoutStage, CheckoutState, CheckoutSource };

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>(defaultState);
  const { user, setIsShowSignModal } = useAppContext();

  const openCheckout = useCallback((tier: CheckoutTier, source?: CheckoutSource | string) => {
    if (!user?.id) {
      setIsShowSignModal(true);
      return;
    }
    setState({
      isOpen: true,
      tier,
      billing: 'yearly',
      stage: 'confirm',
      source: normalizeCheckoutSource(source),
    });
  }, [user, setIsShowSignModal]);

  const closeCheckout = useCallback(() => {
    setState(defaultState);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    window.__AK_OPEN_CHECKOUT__ = (tier, source) => {
      setState({
        isOpen: true,
        tier,
        billing: 'yearly',
        stage: 'confirm',
        source: normalizeCheckoutSource(source),
      });
    };

    return () => {
      delete window.__AK_OPEN_CHECKOUT__;
    };
  }, [setState]);

  const setBilling = useCallback((billing: CheckoutBilling) => {
    setState(prev => ({ ...prev, billing }));
  }, []);

  const startPayment = useCallback(async () => {
    if (!user?.id) return;

    const config = TIER_CONFIG[state.tier];
    const plan = config[state.billing];
    setState(prev => ({ ...prev, stage: 'processing' }));

    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: plan.productId,
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
    <CheckoutContext.Provider value={{ state, openCheckout, closeCheckout, setBilling, startPayment }}>
      {children}
    </CheckoutContext.Provider>
  );
}
