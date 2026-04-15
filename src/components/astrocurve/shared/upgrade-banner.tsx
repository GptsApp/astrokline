'use client';

import { PLAN_ENTITLEMENTS } from '@/lib/astrokline/plan-entitlements';
import { trackEvent } from '@/lib/astrokline/track-event';
import { motion } from 'framer-motion';
import { Lock, Shield, Sparkles, TrendingUp } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useCheckout } from '@/components/astrocurve/checkout/checkout-context';

interface UpgradeBannerProps {
  context?: 'kline' | 'ideal-partner' | 'general';
  className?: string;
  onUpgradeClick?: () => void;
}

const contextMessages: Record<string, { headline: string; subtext: string }> = {
  kline: {
    headline: 'Unlock AI Reading, Saved Reports, and Pro Timing Tools',
    subtext:
      'Free already includes your full 100-year life curve. Upgrade for AI reading, Ask Your Chart, saved reports, and deeper timing tools.',
  },
  'ideal-partner': {
    headline: 'Generate Unlimited Partner Readings',
    subtext:
      'Upgrade for more credits and deeper AI-powered compatibility analysis based on your natal chart.',
  },
  general: {
    headline: 'Compare Lite and Pro benefits',
    subtext:
      'Upgrade for AI reading modules, Ask Your Chart access, saved reports, PDF export, and Pro-only timing tools.',
  },
};

const tiers = [
  {
    icon: Sparkles,
    name: 'Free',
    highlight: PLAN_ENTITLEMENTS.FREE.comparisonHighlight,
    color: 'text-muted-foreground',
  },
  {
    icon: TrendingUp,
    name: 'Lite',
    highlight: PLAN_ENTITLEMENTS.LITE.comparisonHighlight,
    color: 'text-primary',
  },
  {
    icon: Shield,
    name: 'Pro',
    highlight: PLAN_ENTITLEMENTS.PRO.comparisonHighlight,
    color: 'text-emerald-400',
  },
];

export function UpgradeBanner({
  context = 'general',
  className,
  onUpgradeClick,
}: UpgradeBannerProps) {
  const msg = contextMessages[context] || contextMessages.general;
  const { openCheckout } = useCheckout();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`px-6 py-16 ${className || ''}`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="border-primary/20 from-primary/5 via-background to-primary/5 relative overflow-hidden  border bg-gradient-to-br p-8 md:p-12">
          {/* Glow effect */}
          <div className="bg-primary/10 pointer-events-none absolute -top-20 -right-20 h-60 w-60 blur-3xl" />
          <div className="bg-primary/5 pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 blur-3xl" />

          <div className="relative z-10 text-center">
            {/* Lock icon */}
            <div className="bg-primary/10 border-primary/20 mb-6 inline-flex h-12 w-12 items-center justify-center border">
              <Lock className="text-primary h-5 w-5" />
            </div>

            {/* Headline */}
            <h3 className="mb-3 text-2xl font-bold md:text-3xl">
              {msg.headline}
            </h3>
            <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-sm md:text-base">
              {msg.subtext}
            </p>

            {/* Tier comparison row */}
            <div className="mb-8 flex flex-wrap justify-center gap-4 md:gap-8">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <tier.icon className={`h-4 w-4 ${tier.color}`} />
                  <span className="font-medium">{tier.name}</span>
                  <span className={`text-xs ${tier.color} font-mono`}>
                    {tier.highlight}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {onUpgradeClick ? (
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  trackEvent('premium_cta_click', {
                    source: 'upgrade_banner',
                    context,
                  });
                  onUpgradeClick();
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90  font-bold shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:shadow-[0_0_30px_-5px_var(--primary)]"
              >
                Compare Plans →
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  trackEvent('premium_cta_click', { source: 'upgrade_banner', context });
                  openCheckout('lite');
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90  font-bold shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:shadow-[0_0_30px_-5px_var(--primary)]"
              >
                Upgrade Now →
              </Button>
            )}

            <p className="text-muted-foreground/50 mt-4 font-mono text-xs">
              Free tier included · No credit card required · Upgrade anytime
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
