'use client';

import React from 'react';
import { Check, CreditCard, ExternalLink, Loader2, X, AlertCircle, PartyPopper } from 'lucide-react';
import { useCheckout, TIER_CONFIG } from './checkout-context';
import { getCheckoutContextCopy } from './checkout-copy';
import { cn } from '@/shared/lib/utils';

export function CheckoutModal() {
  const { state, closeCheckout, setBilling, startPayment } = useCheckout();

  if (!state.isOpen) return null;

  const config = TIER_CONFIG[state.tier];
  const plan = config[state.billing];
  const contextualCopy = getCheckoutContextCopy(state.tier, state.source);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md border border-white/10 bg-[#15131A] shadow-2xl">
        {/* Close button */}
        {state.stage !== 'processing' && (
          <button
            onClick={closeCheckout}
            aria-label="Close checkout"
            title="Close checkout"
            className="absolute top-4 right-4 text-white/40 hover:text-white z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* CONFIRM STAGE */}
        {state.stage === 'confirm' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 border border-primary/20">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">{contextualCopy.eyebrow}</p>
                <h2 className="text-lg font-bold text-white">{contextualCopy.title}</h2>
                <p className="mt-1 max-w-sm text-xs leading-5 text-white/50">{contextualCopy.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{plan.price}</span>
                  <span className="text-xs text-white/40">{plan.unit}</span>
                </div>
              </div>
            </div>

            {/* Toggle switch */}
            <div className="flex items-center justify-between border-y border-white/5 py-4 mb-5">
               <div className="flex items-center gap-3">
                 <span className={cn("text-xs transition-colors", state.billing === 'monthly' ? "text-white font-bold" : "text-white/40 font-medium")}>
                   Monthly
                 </span>
                 <button
                   onClick={() => setBilling(state.billing === 'monthly' ? 'yearly' : 'monthly')}
                   aria-label={state.billing === 'monthly' ? 'Switch to yearly billing' : 'Switch to monthly billing'}
                   title={state.billing === 'monthly' ? 'Switch to yearly billing' : 'Switch to monthly billing'}
                   className="relative flex h-[22px] w-10 items-center bg-primary focus:outline-none"
                 >
                   <span
                     className={cn(
                       "inline-block h-4 w-4 bg-[#15131A] transition-transform duration-200",
                       state.billing === 'yearly' ? "translate-x-5" : "translate-x-1"
                     )}
                   />
                 </button>
                 <span className={cn("text-xs transition-colors", state.billing === 'yearly' ? "text-white font-bold" : "text-white/40 font-medium")}>
                   Yearly
                 </span>
               </div>
               
               <div className="text-[10px] font-bold text-primary border border-primary/30 px-1.5 py-0.5 whitespace-nowrap">
                 {plan.saveLabel || 'Billed monthly'}
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
