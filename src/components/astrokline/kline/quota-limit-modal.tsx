'use client';

import { trackEvent } from '@/lib/astrokline/track-event';
import { Lock, Zap } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { Heading } from "@/components/astrokline/ui/heading";
import { useCheckout } from '@/components/astrokline/checkout/checkout-context';

interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  used: number;
  total: number;
  isLifetime: boolean;
  userTier: string;
  onUpgradeClick?: () => void;
}

export function QuotaLimitModal({
  isOpen,
  onClose,
  used,
  total,
  isLifetime,
  userTier,
  onUpgradeClick,
}: QuotaLimitModalProps) {
  if (!isOpen) return null;

  const normalizedTier = userTier.toUpperCase();
  const upgradePlan =
    normalizedTier === 'STANDARD'
      ? {
          name: 'Pro',
          detail:
            '30 saved K-Lines / month + exact transit detail + premium dashboard tools',
        }
      : normalizedTier === 'PREMIUM'
        ? {
            name: 'Pro',
            detail:
              'You are already on the highest plan. Reach out if you need a higher quota.',
          }
        : {
            name: 'Lite',
            detail:
              '10 saved K-Lines / month + career, wealth, love, health AI modules',
          };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="border-primary/20 bg-background/95 relative mx-4 w-full max-w-md  border p-6 shadow-[0_0_60px_rgba(212,175,55,0.1)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 border-primary/30 flex h-14 w-14 items-center justify-center border">
            <Lock className="text-primary h-6 w-6" />
          </div>
        </div>

        {/* Title */}
        <Heading level={3} className="text-foreground mb-2 text-center text-xl font-bold">
          Query Limit Reached
        </Heading>

        {/* Status */}
        <p className="text-muted-foreground mb-6 text-center text-sm">
          {userTier} plan · {used}/{total} used
          {isLifetime ? ' (lifetime)' : ' (this month)'}
        </p>

        {/* Upgrade card */}
        <div className="border-primary/20 bg-primary/5 mb-4  border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="text-primary h-4 w-4" />
            <span className="text-foreground text-sm font-bold">
              {upgradePlan.name} Plan
            </span>
          </div>
          <p className="text-muted-foreground mb-3 text-xs">
            {upgradePlan.detail}
          </p>
          {normalizedTier === 'PREMIUM' ? (
            <button
              type="button"
              onClick={onClose}
              className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full py-2.5 text-center text-sm font-bold transition-all"
            >
              Got It
            </button>
          ) : onUpgradeClick ? (
            <button
              type="button"
              onClick={() => {
                trackEvent('premium_cta_click', { source: 'quota_modal' });
                onUpgradeClick();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full py-2.5 text-center text-sm font-bold transition-all"
            >
              Upgrade Now
            </button>
          ) : (
            <QuotaUpgradeButton tier={upgradePlan.name.toLowerCase() as 'lite' | 'pro'} />
          )}
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

function QuotaUpgradeButton({ tier }: { tier: 'lite' | 'pro' }) {
  const { openCheckout } = useCheckout();
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent('premium_cta_click', { source: 'quota_modal' });
        openCheckout(tier);
      }}
      className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full py-2.5 text-center text-sm font-bold transition-all"
    >
      Upgrade Now
    </button>
  );
}
