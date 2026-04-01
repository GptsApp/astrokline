'use client';

import React from 'react';
import { Check, CreditCard, ExternalLink, Loader2, X, AlertCircle, PartyPopper } from 'lucide-react';
import { useCheckout, TIER_CONFIG } from './checkout-context';
import { cn } from '@/shared/lib/utils';

export function CheckoutModal() {
  const { state, closeCheckout, startPayment } = useCheckout();

  if (!state.isOpen) return null;

  const config = TIER_CONFIG[state.tier];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md border border-white/10 bg-[#15131A] shadow-2xl">
        {/* Close button */}
        {state.stage !== 'processing' && (
          <button
            onClick={closeCheckout}
            className="absolute top-4 right-4 text-white/40 hover:text-white z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* CONFIRM STAGE */}
        {state.stage === 'confirm' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center bg-primary/10 border border-primary/20">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Upgrade to {config.title}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{config.price}</span>
                  <span className="text-xs text-white/40">{config.unit}</span>
                </div>
              </div>
            </div>

            <div className="border border-white/5 bg-white/[0.02] p-4 mb-5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                {state.tier === 'pro' ? 'Everything in Lite, plus' : 'Includes'}
              </p>
              <div className="space-y-2">
                {config.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-white/60">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startPayment}
              className="w-full flex items-center justify-center gap-2 bg-primary py-3.5 font-bold text-primary-foreground transition-all hover:scale-[1.02]"
            >
              <CreditCard className="h-4 w-4" /> Pay with Creem
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

            <p className="mt-3 text-center text-[10px] text-white/30">
              Secure checkout opens in a new tab · Cancel anytime
            </p>
          </div>
        )}

        {/* PROCESSING STAGE */}
        {state.stage === 'processing' && (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-sm font-bold text-white mb-1">
              Preparing secure checkout...
            </h2>
            <p className="text-xs text-white/50">
              This takes a few seconds. Keep this page open.
            </p>
          </div>
        )}

        {/* WAITING STAGE */}
        {state.stage === 'waiting' && (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-sky-500/20 bg-sky-500/10">
              <ExternalLink className="h-6 w-6 text-sky-400 animate-pulse" />
            </div>
            <h2 className="text-sm font-bold text-white mb-2">
              Complete payment in the Creem tab
            </h2>
            <p className="text-xs text-white/50 mb-5">
              This page will update automatically once payment is confirmed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => state.checkoutUrl && window.open(state.checkoutUrl, '_blank')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-sky-500/30 bg-sky-500/10 py-2.5 text-xs font-medium text-sky-400 hover:bg-sky-500/20"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Reopen Checkout
              </button>
              <button
                onClick={closeCheckout}
                className="flex-1 border border-white/10 py-2.5 text-xs font-medium text-white/50 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STAGE */}
        {state.stage === 'success' && (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
              <PartyPopper className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">
              Payment Successful!
            </h2>
            <p className="text-xs text-white/50 mb-5">
              Welcome to {config.title}! Refreshing your dashboard...
            </p>
            <Loader2 className="mx-auto h-4 w-4 animate-spin text-white/30" />
          </div>
        )}

        {/* ERROR STAGE */}
        {state.stage === 'error' && (
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Checkout failed</h2>
                <p className="text-xs text-white/50">{state.error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={startPayment}
                className="flex-1 bg-primary py-2.5 text-xs font-bold text-primary-foreground"
              >
                Retry
              </button>
              <button
                onClick={closeCheckout}
                className="flex-1 border border-white/10 py-2.5 text-xs text-white/50 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
