'use client';

import { Lock, Zap } from 'lucide-react';
import { trackEvent } from '@/lib/astrokline/track-event';

interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  used: number;
  total: number;
  isLifetime: boolean;
  userTier: string;
  onUpgradeClick?: () => void;
}

export function QuotaLimitModal({ isOpen, onClose, used, total, isLifetime, userTier, onUpgradeClick }: QuotaLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative max-w-md w-full mx-4 rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-xl shadow-[0_0_60px_rgba(212,175,55,0.1)] p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-center text-foreground mb-2">
          Query Limit Reached
        </h3>

        {/* Status */}
        <p className="text-center text-sm text-muted-foreground mb-6">
          {userTier} plan · {used}/{total} used{isLifetime ? ' (lifetime)' : ' (this month)'}
        </p>

        {/* Upgrade card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-foreground">Standard Plan</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">10 queries/month + full analysis modules</p>
          {onUpgradeClick ? (
            <button
              onClick={() => {
                trackEvent('premium_cta_click', { source: 'quota_modal' });
                onUpgradeClick();
              }}
              className="block w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold text-center hover:bg-primary/90 transition-all"
            >
              Upgrade Now
            </button>
          ) : (
            <a
              href="/#pricing"
              className="block w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold text-center hover:bg-primary/90 transition-all"
            >
              Upgrade Now
            </a>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
