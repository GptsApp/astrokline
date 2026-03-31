'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Briefcase, Coins, Heart, Leaf, Lock, Sparkles } from 'lucide-react';

import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { DestinySummaryCard } from '@/components/astrokline/kline/destiny-summary-card';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { AiReadingPanels } from '@/components/astrokline/kline/ai-reading-panels';
import { CosmicIdCard } from '@/components/astrokline/kline/cosmic-id-card';
import { SynastryPanel } from '@/components/astrokline/kline/synastry-panel';
import { ActionCalendar } from '@/components/astrokline/kline/action-calendar';
import { AskChartPanel } from '@/components/astrokline/kline/ask-chart-panel';
import { YearlyEnergyCurve } from '@/components/astrokline/kline/yearly-energy-curve';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { cn } from '@/shared/lib/utils';
import type { DestinyScorePoint, TransitEvent, UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Heading } from "@/components/astrokline/ui/heading";

function extractDimensionPreviews(
  klineData: DestinyScorePoint[],
  transitDetails: Record<number, TransitEvent[]>,
  currentYear: number,
  birthYear: number
) {
  const future = Object.entries(transitDetails)
    .filter(([y]) => Number(y) > currentYear && Number(y) <= currentYear + 30)
    .sort(([a], [b]) => Number(a) - Number(b));

  const findPeak = (theme: string) => {
    for (const [y, events] of future) {
      const hit = events.find(e => e.theme === theme && e.impactScore >= 6);
      if (hit) return { year: Number(y), age: Number(y) - birthYear, event: hit };
    }
    return null;
  };

  const healthDip = klineData.find(p => p.year > currentYear && p.score < 45);

  return {
    love: findPeak('Love'),
    career: findPeak('Career'),
    wealth: findPeak('Wealth'),
    health: healthDip ? { year: healthDip.year, age: healthDip.year - birthYear } : null,
  };
}

function DimensionPreviewRow({
  icon: Icon,
  label,
  tease,
  ctaText,
  accentClass,
  onCta,
  delay = 0,
}: {
  icon: typeof Heart;
  label: string;
  tease: string;
  ctaText: string;
  accentClass: string;
  onCta: () => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      className="group relative flex flex-col gap-4 border-b border-white/5 py-8 last:border-b-0 md:flex-row md:items-center md:gap-8"
    >
      <div className="flex shrink-0 items-center gap-3 md:w-[120px]">
        <div className={cn('flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5', accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn('text-xs font-bold uppercase tracking-widest', accentClass)}>{label}</span>
      </div>
      <p className="flex-1 text-sm leading-relaxed tracking-wide text-white/70">{tease}</p>
      <button
        onClick={onCta}
        className={cn('flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white', accentClass)}
      >
        {ctaText}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}


function ActionableFutureCliffhanger({ onActionGate, tier }: any) {
  if (tier === 'PRO') {
    return (
      <div className="mx-auto mt-16 max-w-4xl px-4 py-8 pb-24 text-center">
         <p className="text-white/40">You are on the PRO tier. Your full 5-year outlook is unlocked.</p>
         {/* Insert real PRO content here */}
      </div>
    );
  }

  return (
    <div className="relative mt-8 py-16">
       {/* Teaser content that fades out */}
       <div 
         className="mx-auto max-w-4xl space-y-8 px-4 opacity-50 select-none pb-40 flex flex-col items-start" 
         aria-hidden="true" 
         style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)' }}
       >
          <Heading level={3} className="font-serif text-2xl text-white/90 md:text-3xl">The Next Chapter of Your Story</Heading>
          <p className="max-w-prose leading-loose text-white/70">
            Between 2026 and 2028, your love sector activates with unusual intensity. If you are single, this is when connections carry real emotional weight. If you are partnered, this is when the relationship either deepens or demands honest renegotiation.
          </p>
          <p className="max-w-prose leading-loose text-white/70">
            Your career curve shows a critical pivot point around 2027. The decision you make in that window determines whether the next decade accelerates or stalls. The chart strongly favors...
          </p>
       </div>

      {/* Overlay Paywall */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex h-3/4 flex-col items-center justify-end bg-gradient-to-t from-background via-background/90 to-transparent pb-16">
        <button 
          onClick={() => onActionGate?.('unlock_5_year_plan', 'FREE')}
          className="group flex flex-col items-center gap-1 transition-transform hover:scale-105"
        >
          <span className="flex items-center gap-2 bg-[#D4AF37] px-10 py-4 text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_40px_rgba(212,175,55,0.1)]">
            <Sparkles className="h-4 w-4" />
            See What's Coming for You
          </span>
          <span className="mt-4 font-mono text-[9.5px] uppercase tracking-widest text-[#D4AF37]/50 transition-colors group-hover:text-[#D4AF37]/80">
            Your love, career, and wealth timing — revealed
          </span>
        </button>
      </div>
    </div>
  );
}

interface SharedKlineResultProps {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
  hideFloatingNav?: boolean;
}

export function SharedKlineResult({
  profile,
  klineData,
  transitDetails,
  tier,
  onActionGate,
}: SharedKlineResultProps) {
  const t = useTranslations('pages.index.page.sections.kline_result.page_client');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const birthYear = parseInt(profile?.birthDate?.split('-')[0] || '1990', 10);
  const currentYear = new Date().getFullYear();
  const dims = extractDimensionPreviews(klineData, transitDetails, currentYear, birthYear);

  const handleDimCta = (context: string) => {
    onActionGate?.(context, tier === 'GUEST' ? 'FREE' : 'LITE');
  };

  return (
    <>
    <div className="w-full">
      {/* ── 1. K-LINE CHART & PROFILE RIBBON ── */}
      <ReportSection id="kline-hero" divider={false} className="w-full overflow-hidden px-0 py-0 pb-8 pt-12 md:pt-16">
        <InteractiveChart
          data={klineData}
          transitDetails={transitDetails}
          onNodeClick={(year) => setSelectedYear(year)}
          selectedYear={selectedYear}
          birthYear={birthYear}
          profileName={profile?.name}
          tier={tier as any}
          onActionGate={onActionGate}
        />
      </ReportSection>

      {/* ── 3. FOUR-DIMENSION LIFE PREVIEW ── */}
      <ReportSection id="kline-insights" divider={false} className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">What's Written for You</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            Your Next Chapter
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl mx-auto">
            Your chart carries quiet signals about what's coming. Here's what we found.
          </p>
        </div>

        <div className="flex flex-col">
          <DimensionPreviewRow
            icon={Heart}
            label="Love"
            tease={dims.love
              ? `The love you're waiting for? It's closer than you think — your chart lights up around age ${dims.love.age}.`
              : `Your love timeline carries a quietly powerful current. Something is building beneath the surface.`}
            ctaText="Go deeper"
            accentClass="text-rose-400"
            onCta={() => handleDimCta('love_timeline')}
            delay={0.1}
          />
          <DimensionPreviewRow
            icon={Briefcase}
            label="Career"
            tease={dims.career
              ? `You're building toward something bigger. Your chart shows it landing around age ${dims.career.age}.`
              : `Your career arc contains a clear acceleration window. The timing matters more than you think.`}
            ctaText="Go deeper"
            accentClass="text-amber-400"
            onCta={() => handleDimCta('career_details')}
            delay={0.2}
          />
          <DimensionPreviewRow
            icon={Coins}
            label="Wealth"
            tease={dims.wealth
              ? `You're not bad with money — your timing was just off. A real wealth window opens around age ${dims.wealth.age}.`
              : `Your financial curve points to a clear accumulation window ahead. The timing is everything.`}
            ctaText="Go deeper"
            accentClass="text-emerald-400"
            onCta={() => handleDimCta('wealth_forecast')}
            delay={0.3}
          />
          <DimensionPreviewRow
            icon={Leaf}
            label="Health"
            tease={dims.health
              ? `Your body already knows. Around age ${dims.health.age}, your energy needs extra attention.`
              : `Your energy has clear rhythms. Understanding them helps you stay ahead of the dips.`}
            ctaText="Go deeper"
            accentClass="text-sky-400"
            onCta={() => handleDimCta('health_insights')}
            delay={0.4}
          />
        </div>
      </ReportSection>

      {/* ── 4. CLIFFHANGER — moved up from position 7 for max conversion ── */}
      <ReportSection id="future-cliffhanger" divider={false} className="w-full">
         <ActionableFutureCliffhanger tier={tier} onActionGate={onActionGate} />
      </ReportSection>

      {/* ── 5. AI DEEP READING (LITE+ only, hidden for FREE to avoid lock fatigue) ── */}
      {(tier === 'LITE' || tier === 'PRO') && (
        <ReportSection id="ai-reading" divider={false} className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
          <AiReadingPanels
            profile={profile}
            tier={tier}
            onActionGate={onActionGate}
            selectedYear={selectedYear}
          />
        </ReportSection>
      )}

      {/* ── 6. YOUR PERSONAL FORECAST (merged Strategic Timing + Connections) ── */}
      <ReportSection id="personal-forecast" divider={false} className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Your Personal Forecast</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            Tools Built Around You
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl mx-auto">
            Energy forecasts, daily guidance, and relationship insights — all shaped by your unique chart.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <YearlyEnergyCurve klineData={klineData} tier={tier} onActionGate={onActionGate} />
          <ActionCalendar profile={profile} tier={tier} onActionGate={onActionGate} />
        </div>

        <div className="mt-4">
          <SynastryPanel profile={profile} tier={tier} onActionGate={onActionGate} />
        </div>
      </ReportSection>

      {/* ── 7. COSMIC ID CARD — moved to end (share after being wowed) ── */}
      <ReportSection id="cosmic-id" divider={false} className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8">
        <CosmicIdCard profile={profile} klineData={klineData} />
      </ReportSection>
    </div>

    {/* ── FLOATING: ASK YOUR CHART ── */}
    <AskChartPanel profile={profile} tier={tier} onActionGate={onActionGate} />
    </>
  );
}

