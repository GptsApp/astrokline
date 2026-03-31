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
          <Heading level={3} className="font-serif text-2xl text-white/90 md:text-3xl">What the Next 5 Years Hold for You</Heading>
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
            <Lock className="h-4 w-4" />
            Unlock My 5-Year Outlook
          </span>
          <span className="mt-4 font-mono text-[9.5px] uppercase tracking-widest text-[#D4AF37]/50 transition-colors group-hover:text-[#D4AF37]/80">
            See love, career, and wealth timing in detail
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
        <div className="relative z-40 mt-[-1rem]">
          <DestinySummaryCard profile={profile} klineData={klineData} />
        </div>
      </ReportSection>

      {/* ── 2. COSMIC ID CARD ── */}
      <ReportSection id="cosmic-id" divider={false} className="mx-auto w-full max-w-md px-4 py-12 md:px-8">
        <CosmicIdCard profile={profile} />
      </ReportSection>

      {/* ── 3. FOUR-DIMENSION LIFE PREVIEW ── */}
      <ReportSection id="kline-insights" divider={false} className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Your Life Dimensions</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            What Your Chart Reveals
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl mx-auto">
            Your timeline carries distinct signals across four life dimensions. Here is what stands out.
          </p>
        </div>

        <div className="flex flex-col">
          <DimensionPreviewRow
            icon={Heart}
            label="Love"
            tease={dims.love
              ? `A significant connection forms around age ${dims.love.age}. Your chart shows heightened emotional receptivity in that window.`
              : 'Your love timeline carries a quietly powerful current. The details reveal exactly when emotional availability peaks.'}
            ctaText="See love timeline"
            accentClass="text-rose-400"
            onCta={() => handleDimCta('love_timeline')}
            delay={0.1}
          />
          <DimensionPreviewRow
            icon={Briefcase}
            label="Career"
            tease={dims.career
              ? `Your professional momentum peaks sharply at age ${dims.career.age}. This window demands preparation now.`
              : 'Your career arc contains a pronounced acceleration phase. Unlock the full timeline to see when to make your move.'}
            ctaText="See career details"
            accentClass="text-amber-400"
            onCta={() => handleDimCta('career_details')}
            delay={0.2}
          />
          <DimensionPreviewRow
            icon={Coins}
            label="Wealth"
            tease={dims.wealth
              ? `A structural wealth opportunity appears around age ${dims.wealth.age}. The timing favors decisive action over passive waiting.`
              : 'Your financial curve points to a clear accumulation window ahead. See when your chart favors building lasting assets.'}
            ctaText="See wealth forecast"
            accentClass="text-emerald-400"
            onCta={() => handleDimCta('wealth_forecast')}
            delay={0.3}
          />
          <DimensionPreviewRow
            icon={Leaf}
            label="Health"
            tease={dims.health
              ? `Your vitality curve dips around age ${dims.health.age}. Preventive action in the years before makes a measurable difference.`
              : 'Your energy pattern has clear seasonal rhythms. Understanding them lets you protect your vitality before it dips.'}
            ctaText="See health insights"
            accentClass="text-sky-400"
            onCta={() => handleDimCta('health_insights')}
            delay={0.4}
          />
        </div>
      </ReportSection>

      {/* ── 4. AI DEEP READING ── */}
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

      {/* ── 5. STRATEGIC TIMING TOOLS ── */}
      <ReportSection id="strategic-timing" divider={false} className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Strategic Timing</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            Your Timing Intelligence
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl mx-auto">
            Actionable forecasts powered by your natal chart. Know when to move, when to rest, and when to prepare.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <YearlyEnergyCurve klineData={klineData} tier={tier} onActionGate={onActionGate} />
          <ActionCalendar profile={profile} tier={tier} onActionGate={onActionGate} />
        </div>
      </ReportSection>

      {/* ── 6. COSMIC CONNECTIONS ── */}
      <ReportSection id="cosmic-connections" divider={false} className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-rose-400">
            <Heart className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Cosmic Connections</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            Relationship Intelligence
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl mx-auto">
            Discover the chemistry, friction, and deeper patterns between you and anyone.
          </p>
        </div>

        <SynastryPanel profile={profile} tier={tier} onActionGate={onActionGate} />
      </ReportSection>

      {/* ── 7. CLIFFHANGER ── */}
      <ReportSection id="future-cliffhanger" divider={false} className="w-full">
         <ActionableFutureCliffhanger tier={tier} onActionGate={onActionGate} />
      </ReportSection>
    </div>

    {/* ── FLOATING: ASK YOUR CHART ── */}
    <AskChartPanel profile={profile} tier={tier} onActionGate={onActionGate} />
    </>
  );
}

