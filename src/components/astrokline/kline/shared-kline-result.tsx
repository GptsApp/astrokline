'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Briefcase, Coins, Heart, Leaf, Lock, Sparkles, TrendingUp, Users } from 'lucide-react';

import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { AiReadingPanels } from '@/components/astrokline/kline/ai-reading-panels';
import { FiveYearPlan } from '@/components/astrokline/kline/five-year-plan';
import { FloatingNav } from '@/components/astrokline/kline/floating-nav';
import { LifeRadar } from '@/components/astrokline/kline/life-radar';
import { Next30Days } from '@/components/astrokline/kline/next-30-days';
import { ResultCommandDeck } from '@/components/astrokline/kline/result-command-deck';
import { CosmicIdCard } from '@/components/astrokline/kline/cosmic-id-card';
import { AskChartPanel, InlineAskChartEntry } from '@/components/astrokline/kline/ask-chart-panel';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { cn } from '@/shared/lib/utils';
import type { AiInsightData } from '@/lib/astrokline/ai-insight-cache';
import { trackEvent } from '@/lib/astrokline/track-event';
import type { DestinyScorePoint, Next30DaysGuidance, TransitEvent, UserProfile } from '@/lib/astrokline/mock-astrology-data';
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


function ActionableFutureCliffhanger({ onActionGate, tier, profile, klineData, transitDetails }: any) {
  if (tier === 'PRO') {
    return (
      <FiveYearPlan
        klineData={klineData}
        transitDetails={transitDetails}
        profileName={profile?.name}
      />
    );
  }

  return (
    <div className="relative mt-8 py-16">
       {/* Teaser content that fades out */}
       <div 
         className="mx-auto flex max-w-4xl flex-col items-center space-y-8 px-4 pb-40 text-center opacity-50 select-none [mask-image:linear-gradient(to_bottom,black_0%,transparent_60%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,transparent_60%)]" 
         aria-hidden="true" 
       >
          <Heading level={3} className="font-serif text-2xl text-white/90 md:text-3xl">The Next Chapter of Your Story</Heading>
          <p className="max-w-prose leading-loose text-white/70">
            Between 2026 and 2028, {profile?.sun?.sign ? `as a ${profile.sun.sign}` : 'your'} love sector activates with unusual intensity. If you are single, this is when connections carry real emotional weight. If you are partnered, this is when the relationship either deepens or demands honest renegotiation.
          </p>
          <p className="max-w-prose leading-loose text-white/70">
            {profile?.sun?.sign ? `With ${profile.sun.sign} energy driving your chart,` : 'Your'} career curve shows a critical pivot point around 2027. The decision you make in that window determines whether the next decade accelerates or stalls. The chart strongly favors...
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

function SectionLead({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10 flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
        <Sparkles className="h-4 w-4" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{eyebrow}</span>
      </div>
      <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
        {title}
      </Heading>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">
        {description}
      </p>
    </div>
  );
}

function DiagnosisPreview({
  profile,
  onActionGate,
  tier,
}: {
  profile: UserProfile;
  onActionGate: (context?: string, tier?: string) => void;
  tier: string;
}) {
  const previewCards = [
    {
      title: 'Core Pattern',
      text: `${profile.sun.sign} drive and ${profile.moon.sign} sensitivity create your baseline timing tension. That inner split explains why some windows feel powerful and fragile at the same time.`,
    },
    {
      title: 'Career Trigger',
      text: 'Your chart is not asking for endless effort. It is asking for precise timing, especially around public visibility, leverage, and reputation shifts.',
    },
    {
      title: 'Relationship Lesson',
      text: 'One repeating emotional pattern is shaping the curve more than you think. The full diagnosis shows when to lean in and when to stop repeating it.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {previewCards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">{card.title}</p>
            <p className="mt-4 text-sm leading-7 text-white/72">{card.text}</p>
          </div>
        ))}
      </div>

      <div className="border border-[#D4AF37]/15 bg-[#D4AF37]/[0.04] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Diagnosis Preview</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/75">
              The full diagnosis unlocks your timing logic across career, money, love, health, strengths, and shadow patterns. This is where the chart stops being decorative and starts becoming useful.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onActionGate?.('diagnosis_preview', tier === 'GUEST' ? 'FREE' : 'LITE')}
            className="inline-flex shrink-0 items-center gap-2 bg-[#D4AF37] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.01]"
          >
            Unlock Full Diagnosis
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
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
  radarData?: any[] | null;
  next30Days?: Next30DaysGuidance | null;
  klineId?: string;
  initialAiInsight?: AiInsightData | null;
  onAiInsightResolved?: (insight: AiInsightData) => void;
}

export function SharedKlineResult({
  profile,
  klineData,
  transitDetails,
  tier,
  onActionGate,
  hideFloatingNav,
  radarData,
  next30Days,
  klineId,
  initialAiInsight,
  onAiInsightResolved,
}: SharedKlineResultProps) {
  const t = useTranslations('pages.index.page.sections.kline_result.page_client');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [askChartOpen, setAskChartOpen] = useState(false);
  const [validatePastOpen, setValidatePastOpen] = useState(false);

  const birthYear = parseInt(profile?.birthDate?.split('-')[0] || '1990', 10);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dims = extractDimensionPreviews(klineData, transitDetails, currentYear, birthYear);

  // Current energy snapshot
  const currentPoint = klineData.find(p => p.year === currentYear);
  const currentScore = currentPoint?.score ?? 65;
  const energyLabel = currentScore >= 75 ? 'Strong' : currentScore >= 55 ? 'Steady' : 'Rebuilding';
  const energyColor = currentScore >= 75 ? 'text-emerald-400' : currentScore >= 55 ? 'text-amber-400' : 'text-rose-400';
  const firstName = (profile?.name || 'Voyager').split(' ')[0];

  const handleHeroPrimaryAction = () => {
    if (tier === 'LITE' || tier === 'PRO') {
      trackEvent('result_ask_chart_open', { source: 'hero_deck' });
      setAskChartOpen(true);
      return;
    }

    trackEvent('result_upgrade_cta_click', {
      source: 'hero_deck',
      tier,
    });
    onActionGate?.('hero_deck_upgrade', tier === 'GUEST' ? 'FREE' : 'LITE');
  };

  const handleHeroSecondaryAction = () => {
    document
      .getElementById('life-curve')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeroYearSelect = (year: number) => {
    setSelectedYear(year);
    trackEvent('result_key_year_click', {
      year,
      source: 'hero_deck',
    });
    document
      .getElementById('life-curve')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDimCta = (context: string) => {
    if (tier === 'LITE' || tier === 'PRO') {
      // Paid users: scroll to AI reading section
      const target = document.getElementById('ai-reading');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onActionGate?.(context, tier === 'GUEST' ? 'FREE' : 'LITE');
    }
  };

  // ── P4: AI Key Year Insights Prefetch ──
  const [aiYearInsights, setAiYearInsights] = useState<Record<number, { aiSummary: string; aiAdvice: string }>>({});

  const prefetchAiInsights = useCallback(async () => {
    if (!profile || !klineData?.length || !transitDetails) return;
    // Only for paid tiers
    const paidTiers = ['LITE', 'PRO', 'PREMIUM', 'STANDARD'];
    if (!paidTiers.includes(tier.toUpperCase())) return;

    // Find top 8 peak/crossroads years with transit data
    const keyYears = klineData
      .filter(d => (d.isPeak || d.isCrossroads) && transitDetails[d.year]?.length > 0)
      .sort((a, b) => Math.abs(b.score - 55) - Math.abs(a.score - 55))
      .slice(0, 8)
      .map(d => {
        const t = transitDetails[d.year][0];
        return {
          year: d.year,
          score: d.score,
          stage: d.stage,
          transitTitle: t.title,
          transitPlanet: t.planet,
          transitAspect: t.aspect,
          transitTheme: t.theme,
          targetSign: profile.sun?.sign || 'Aries',
          targetHouse: 1,
        };
      });

    if (keyYears.length === 0) return;

    try {
      const res = await fetch('/api/astrology/key-year-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, keyYears }),
      });
      if (!res.ok) return;
      const { insights } = await res.json();
      if (Array.isArray(insights)) {
        const map: Record<number, { aiSummary: string; aiAdvice: string }> = {};
        insights.forEach((i: any) => { if (i.year && i.aiSummary) map[i.year] = i; });
        setAiYearInsights(map);
      }
    } catch {}
  }, [profile, klineData, transitDetails, tier]);

  useEffect(() => {
    prefetchAiInsights();
  }, [prefetchAiInsights]);

  return (
    <>
    <div className="w-full">
      {!hideFloatingNav ? <FloatingNav /> : null}

      <ReportSection id="hero" divider={false} className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:pt-12">
        <ResultCommandDeck
          profile={profile}
          klineData={klineData}
          transitDetails={transitDetails}
          tier={tier as AppTier}
          onPrimaryAction={handleHeroPrimaryAction}
          onSecondaryAction={handleHeroSecondaryAction}
          onYearSelect={handleHeroYearSelect}
        />
      </ReportSection>

      {/* ── 1. LIFE CURVE CHART & PROFILE RIBBON ── */}
      <ReportSection id="life-curve" divider={false} className="w-full overflow-visible px-0 py-0 pb-8 pt-4 md:pt-8">
        <div id="kline-hero">
        <InteractiveChart
          data={klineData}
          transitDetails={transitDetails}
          onNodeClick={(year) => setSelectedYear(year)}
          selectedYear={selectedYear}
          birthYear={birthYear}
          profileName={profile?.name}
          tier={tier as any}
          onActionGate={onActionGate}
          aiYearInsights={aiYearInsights}
        />
        </div>
      </ReportSection>

      {/* ── 2. ENERGY SNAPSHOT — Co-Star style 'Right Now' anchor ── */}
      <ReportSection id="energy-now" divider={false} className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between border border-white/5 bg-white/[0.01] px-6 py-5"
        >
          <div className="flex items-center gap-4">
            <div className={cn('flex h-14 w-14 items-center justify-center border border-white/10 font-serif text-2xl font-bold', energyColor)}>
              {currentScore}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{monthNames[currentMonth]} {currentYear}</p>
              <p className="text-sm text-white/80">Your energy this month is <span className={cn('font-bold', energyColor)}>{energyLabel}</span></p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/20">{profile.sun.sign} Season</p>
          </div>
        </motion.div>
      </ReportSection>

      {/* ── 2a. SOCIAL PROOF BAR ── */}
      {(tier === 'GUEST' || tier === 'FREE') && (
        <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
          <div className="flex items-center justify-center gap-3 border border-[#D4AF37]/10 bg-[#D4AF37]/[0.03] px-4 py-2.5">
            <div className="flex -space-x-1.5">
              {['🇺🇸', '🇬🇧', '🇦🇺', '🇨🇦'].map((f) => (
                <span key={f} className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">{f}</span>
              ))}
            </div>
            <p className="text-[11px] text-white/50">
              <span className="font-bold text-[#D4AF37]/80">14,283</span> people have mapped their timeline this month
            </p>
          </div>
        </div>
      )}

      {/* ── 2b. INLINE ASK CHART ENTRY (mobile only) ── */}
      <div className="mx-auto w-full max-w-4xl px-4 py-3 md:px-8">
        <InlineAskChartEntry
          tier={tier}
          onActionGate={onActionGate}
          onOpenChat={() => setAskChartOpen(true)}
          onValidatePast={() => setValidatePastOpen(true)}
        />
      </div>

      {/* ── 3. FOUR-DIMENSION LIFE PREVIEW ── */}
      <ReportSection id="kline-insights" divider={false} className="mx-auto w-full max-w-4xl px-4 py-14 md:px-8">
        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">What's Written for You</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            {firstName}'s Next Chapter
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl mx-auto">
            Your chart carries quiet signals about what's coming. Here's what we found for you.
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
         <ActionableFutureCliffhanger tier={tier} onActionGate={onActionGate} profile={profile} klineData={klineData} transitDetails={transitDetails} />
      </ReportSection>

      <ReportSection id="diagnosis" divider={false} className="mx-auto w-full max-w-4xl px-4 py-14 md:px-8">
        <SectionLead
          eyebrow="Cosmic Diagnosis"
          title="Why The Curve Bends This Way"
          description="This layer translates your timing structure into actual causes: what keeps repeating, what is opening, and what your chart is trying to teach right now."
        />

        {(tier === 'LITE' || tier === 'PRO') ? (
          <div id="ai-reading">
            <AiReadingPanels
              profile={profile}
              tier={tier}
              onActionGate={onActionGate}
              selectedYear={selectedYear}
              klineId={klineId}
              initialInsight={initialAiInsight}
              onInsightResolved={onAiInsightResolved}
            />
          </div>
        ) : (
          <DiagnosisPreview profile={profile} onActionGate={onActionGate} tier={tier} />
        )}
      </ReportSection>

      {/* ── 5b. PRO EXCLUSIVE: Life Radar + Next 30 Days ── */}
      {tier === 'PRO' && radarData && radarData.length > 0 && (
        <ReportSection id="radar" divider={false} className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <SectionLead
            eyebrow="Life Radar"
            title="Your Life Balance Right Now"
            description="A multi-dimensional snapshot of where your energy, career, love, and health stand this cycle."
          />
          <LifeRadar data={radarData} />
        </ReportSection>
      )}

      {(tier === 'LITE' || tier === 'PRO') && next30Days && (
        <ReportSection id="next-30-days" divider={false} className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
          <SectionLead
            eyebrow="Action Window"
            title="Your Next 30 Days"
            description="The macro timing translated into micro moves. What to prioritize, what to defer, and where the windows open this month."
          />
          <Next30Days data={next30Days} />
        </ReportSection>
      )}

      {/* ── 6. CONTINUE YOUR JOURNEY — entry cards to Dashboard tools ── */}
      <ReportSection id="explore-tools" divider={false} className="mx-auto w-full max-w-4xl px-4 py-14 md:px-8">
        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Go Deeper</span>
          </div>
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            Continue Your Journey
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-md mx-auto">
            Your chart has more to say. Explore these tools in your Dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: TrendingUp, label: 'Energy Forecast', desc: 'See your month-by-month energy peaks & dips', color: 'text-purple-400', borderColor: 'border-purple-400/20 hover:border-purple-400/40', bgColor: 'bg-purple-400/5', href: '/dashboard/tools/energy' },
            { icon: Users, label: 'Compatibility', desc: 'Discover chemistry with anyone', color: 'text-rose-400', borderColor: 'border-rose-400/20 hover:border-rose-400/40', bgColor: 'bg-rose-400/5', href: '/dashboard/tools/compatibility' },
          ].map((tool, i) => (
            <motion.a
              key={tool.label}
              href={tool.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'group flex flex-col items-center gap-3 border p-6 text-center transition-all hover:scale-[1.02] hover:shadow-lg',
                tool.borderColor, 'bg-white/[0.01]'
              )}
            >
              <div className={cn('flex h-12 w-12 items-center justify-center border', tool.borderColor, tool.bgColor)}>
                <tool.icon className={cn('h-5 w-5', tool.color)} />
              </div>
              <Heading level={4} className="text-sm font-bold text-white/80">{tool.label}</Heading>
              <p className="text-[11px] leading-relaxed text-white/40">{tool.desc}</p>
              <span className={cn('mt-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity', tool.color)}>
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </motion.a>
          ))}
        </div>
      </ReportSection>

      {/* ── 6b. VIRAL SHARE PROMPT (GUEST/FREE) ── */}
      {(tier === 'GUEST' || tier === 'FREE') && (
        <ReportSection id="share-prompt" divider={false} className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
          <div className="relative overflow-hidden border border-[#D4AF37]/15 bg-gradient-to-r from-[#D4AF37]/[0.04] to-transparent p-6 md:p-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                <Users className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white/80">Know someone who needs this?</p>
                <p className="mt-1 text-xs text-white/40">Share your reading — when 3 friends sign up through your link, you unlock Lite features free for a month.</p>
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/kline/result?ref=${encodeURIComponent(firstName)}`;
                  if (navigator.share) {
                    navigator.share({ title: `${firstName}'s Cosmic Timeline`, url });
                  } else {
                    navigator.clipboard.writeText(url);
                  }
                }}
                className="shrink-0 flex items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:scale-105 transition-transform"
              >
                <ArrowRight className="h-3.5 w-3.5" /> Share My Reading
              </button>
            </div>
          </div>
        </ReportSection>
      )}

      {/* ── 7. COSMIC ID CARD — moved to end (share after being wowed) ── */}
      <ReportSection id="cosmic-id" divider={false} className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8">
        <CosmicIdCard profile={profile} klineData={klineData} />
      </ReportSection>
    </div>

    {/* ── FLOATING: ASK YOUR CHART (desktop FAB + mobile full-screen panel) ── */}
    <AskChartPanel
      profile={profile}
      tier={tier}
      onActionGate={onActionGate}
      externalOpen={askChartOpen}
      onExternalClose={() => { setAskChartOpen(false); setValidatePastOpen(false); }}
      externalValidatePast={validatePastOpen}
    />
    </>
  );
}

