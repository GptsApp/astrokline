'use client';

import { ChartHero } from '@/components/astrocurve/kline/chart-hero';
import { LifeRadar } from '@/components/astrocurve/kline/life-radar';
import { TrustBadge } from '@/components/astrocurve/ui/trust-badge';
import { Share2, Sparkles } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { Heading } from "@/components/astrocurve/ui/heading";

interface SharedKlineClientProps {
  kline: {
    label: string;
    birthDate: string;
    birthPlace: string;
    klineResult: {
      profile?: Parameters<typeof ChartHero>[0]['profile'];
      radarData?: Parameters<typeof LifeRadar>[0]['data'];
    };
    createdAt: Date;
  };
}

export function SharedKlineClient({ kline }: SharedKlineClientProps) {
  const profile = kline.klineResult?.profile;
  const radarData = kline.klineResult?.radarData;

  if (!profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chart data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="bg-background astro-starfield min-h-screen">
      {/* Shared badge */}
      <div className="via-primary/5 sticky top-16 z-50 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-purple-500/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-purple-500/20 px-2.5 py-1 text-[11px] font-bold tracking-wider text-purple-400 uppercase">
              <Share2 className="h-3 w-3" /> Shared Chart
            </div>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">{kline.label}</span>
              &apos;s cosmic blueprint
            </p>
          </div>
          <Link
            href="/kline"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex shrink-0 items-center gap-2 px-5 py-2 text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
          >
            <Sparkles className="h-4 w-4" /> Get Your Own Life Curve
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 pt-8">
        <ChartHero profile={profile} />

        <div className="mt-6">
          <TrustBadge className="justify-center" />
        </div>
      </section>

      {/* Radar preview (blurred for non-premium) */}
      {radarData && (
        <section className="mx-auto max-w-5xl px-6 pt-12">
          <LifeRadar data={radarData} />
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-lg px-6 text-center">
          <Heading level={2} className="text-foreground mb-3 text-2xl font-bold">
            Curious About Your Own Chart?
          </Heading>
          <p className="text-muted-foreground mb-6">
            Enter your birth details to discover your unique cosmic DNA, life
            trajectory, and hidden potentials.
          </p>
          <Link
            href="/kline"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 px-8 py-3 font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
          >
            <Sparkles className="h-5 w-5" /> Create My Life Curve — Free
          </Link>
        </div>
      </section>
    </div>
  );
}
