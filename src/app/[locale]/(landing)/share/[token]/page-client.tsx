'use client';

import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { LifeRadar } from '@/components/astrokline/kline/life-radar';
import { TrustBadge } from '@/components/astrokline/ui/trust-badge';
import { Sparkles, Share2 } from 'lucide-react';

interface SharedKlineClientProps {
  kline: {
    label: string;
    birthDate: string;
    birthPlace: string;
    klineResult: any;
    createdAt: Date;
  };
}

export function SharedKlineClient({ kline }: SharedKlineClientProps) {
  const profile = kline.klineResult?.profile;
  const radarData = kline.klineResult?.radarData;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chart data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background astro-starfield">
      {/* Shared badge */}
      <div className="sticky top-16 z-50 bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 border-b border-purple-500/20 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-bold uppercase tracking-wider">
              <Share2 className="w-3 h-3" /> Shared Chart
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{kline.label}</span>&apos;s cosmic blueprint
            </p>
          </div>
          <a
            href="/kline"
            className="shrink-0 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Get Your Own K-Line
          </a>
        </div>
      </div>

      <section className="pt-8 max-w-5xl mx-auto px-6">
        <ChartHero profile={profile} />

        <div className="mt-6">
          <TrustBadge className="justify-center" />
        </div>
      </section>

      {/* Radar preview (blurred for non-premium) */}
      {radarData && (
        <section className="max-w-5xl mx-auto px-6 pt-12">
          <LifeRadar data={radarData} />
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-lg mx-auto text-center px-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">Curious About Your Own Chart?</h2>
          <p className="text-muted-foreground mb-6">Enter your birth details to discover your unique cosmic DNA, life trajectory, and hidden potentials.</p>
          <a
            href="/kline"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:bg-primary/90 transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" /> Create My K-Line — Free
          </a>
        </div>
      </section>
    </div>
  );
}
