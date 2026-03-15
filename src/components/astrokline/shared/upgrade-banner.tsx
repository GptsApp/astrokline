'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { trackEvent } from '@/lib/astrokline/track-event';

interface UpgradeBannerProps {
  context?: 'kline' | 'daily' | 'ideal-partner' | 'general';
  className?: string;
  onUpgradeClick?: () => void;
}

const contextMessages: Record<string, { headline: string; subtext: string }> = {
  kline: {
    headline: 'Unlock Your Full 10+ Year Destiny K-Line',
    subtext: 'See Career, Love, Wealth & Health trajectories — and know exactly when your next cosmic peak arrives.',
  },
  daily: {
    headline: 'Unlock All 4 Life Dimensions',
    subtext: 'Upgrade to see Wealth & Health forecasts alongside Love & Career — powered by real-time planetary transits.',
  },
  'ideal-partner': {
    headline: 'Generate Unlimited Partner Readings',
    subtext: 'Upgrade for more credits and deeper AI-powered compatibility analysis based on your natal chart.',
  },
  general: {
    headline: 'Unlock Your Complete Cosmic Blueprint',
    subtext: 'Upgrade to access the full power of AstroKline — from K-Line projections to AI astrologer deep chat.',
  },
};

const tiers = [
  {
    icon: Sparkles,
    name: 'Free',
    highlight: 'Past K-Line only',
    color: 'text-muted-foreground',
  },
  {
    icon: TrendingUp,
    name: 'Compass',
    highlight: '1-2 Year Future',
    color: 'text-primary',
  },
  {
    icon: Shield,
    name: 'Blueprint',
    highlight: '10+ Year Full Access',
    color: 'text-emerald-400',
  },
];

export function UpgradeBanner({ context = 'general', className, onUpgradeClick }: UpgradeBannerProps) {
  const msg = contextMessages[context] || contextMessages.general;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`py-16 px-6 ${className || ''}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 md:p-12 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            {/* Lock icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Lock className="w-5 h-5 text-primary" />
            </div>

            {/* Headline */}
            <h3 className="text-2xl md:text-3xl font-bold mb-3">{msg.headline}</h3>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8">{msg.subtext}</p>

            {/* Tier comparison row */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
              {tiers.map((tier) => (
                <div key={tier.name} className="flex items-center gap-2 text-sm">
                  <tier.icon className={`w-4 h-4 ${tier.color}`} />
                  <span className="font-medium">{tier.name}</span>
                  <span className={`text-xs ${tier.color} font-mono`}>{tier.highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {onUpgradeClick ? (
              <Button
                size="lg"
                onClick={() => {
                  trackEvent('premium_cta_click', { source: 'upgrade_banner', context });
                  onUpgradeClick();
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-[0_0_20px_-5px_var(--primary)] hover:shadow-[0_0_30px_-5px_var(--primary)] transition-all"
              >
                Compare Plans →
              </Button>
            ) : (
              <a href="/#pricing">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-[0_0_20px_-5px_var(--primary)] hover:shadow-[0_0_30px_-5px_var(--primary)] transition-all"
                >
                  Compare Plans →
                </Button>
              </a>
            )}

            <p className="text-xs text-muted-foreground/50 font-mono mt-4">
              Free tier included · No credit card required · Upgrade anytime
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
