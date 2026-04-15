'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUp, BarChart3, Brain, Layers, Star, Target, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

import { AiReadingPanels } from '@/components/astrocurve/kline/ai-reading-panels';
import { ChartHero } from '@/components/astrocurve/kline/chart-hero';
import { DestinySummaryCard } from '@/components/astrocurve/kline/destiny-summary-card';
import { InteractiveChart } from '@/components/astrocurve/kline/interactive-chart';
import { LifeStageScores } from '@/components/astrocurve/kline/life-stage-scores';
import { PremiumDownloadButton } from '@/components/astrocurve/kline/premium-download-button';
import { ReportSection } from '@/components/astrocurve/kline/report-section';
import { TrustEvidenceBar } from '@/components/astrocurve/kline/trust-evidence-bar';
import { cn } from '@/shared/lib/utils';
import type { DestinyScorePoint, TransitEvent, UserProfile } from '@/lib/astrocurve/mock-astrology-data';
import { Heading } from "@/components/astrocurve/ui/heading";

// Helper functions
function getScoreBand(score: number, t: any) {
  if (score >= 82) return { label: t('bands.expansion.label'), summary: t('bands.expansion.summary') };
  if (score <= 38) return { label: t('bands.protection.label'), summary: t('bands.protection.summary') };
  return { label: t('bands.build.label'), summary: t('bands.build.summary') };
}

function InsightCard({
  icon: Icon,
  label,
  ageStr,
  yearStr,
  scoreStr,
  detail,
  fallback,
  accentColorClass,
  accentBgClass,
  delay = 0,
}: {
  icon: typeof TrendingUp;
  label: string;
  ageStr?: string;
  yearStr?: string | number;
  scoreStr?: string | number;
  detail: string;
  fallback?: string;
  accentColorClass: string;
  accentBgClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      className="group relative flex flex-col border border-white/5 bg-[#060608] p-8 md:p-10"
    >
      <div className={cn("absolute -top-12 right-0 h-40 w-40 blur-[60px] opacity-[0.03] transition-opacity group-hover:opacity-[0.08]", accentBgClass.replace('/10', ''))} />

      <div className="relative z-10 flex h-full flex-col">
        {/* Label Badge */}
        <div
          className={cn(
            'mb-8 inline-flex w-fit items-center gap-1.5 rounded bg-opacity-10 px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] uppercase',
            accentBgClass,
            accentColorClass
          )}
        >
          <Icon className="h-3 w-3" />
          {label}
        </div>

        {ageStr && yearStr && scoreStr ? (
          <>
            {/* Main Metric: Age & Year */}
            <div className="mb-2 flex items-baseline gap-3">
              <span className="font-serif text-[2.75rem] leading-none text-white md:text-5xl">
                 {ageStr}
              </span>
              <span className="font-mono text-sm tracking-widest text-white/20">
                 {yearStr}
              </span>
            </div>
            
            {/* Score */}
            <div className="mb-8 flex items-center gap-2">
               <span className="font-mono text-[10px] tracking-wider text-white/40 uppercase">Score</span>
               <span className={cn("font-bold text-sm", accentColorClass)}>{scoreStr}</span>
            </div>
          </>
        ) : (
          <div className="mb-8 text-lg font-serif text-white/50">{fallback}</div>
        )}

        <div className="mb-8 h-px w-8 bg-white/10" />
        
        {/* Description */}
        <p className="text-sm leading-relaxed tracking-wide text-white/60">{detail}</p>
      </div>
    </motion.div>
  );
}

// ─── Floating Mini Nav ───
function FloatingNav() {
  const [activeId, setActiveId] = useState<string>('destiny-summary');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    const sections = ['destiny-summary', 'kline-hero', 'kline-reading', 'life-stages', 'ai-insight', 'natal-chart'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const items = [
    { id: 'destiny-summary', icon: ArrowUp, label: 'You' },
    { id: 'kline-hero', icon: BarChart3, label: 'Curve' },
    { id: 'kline-reading', icon: Target, label: 'Insights' },
    { id: 'life-stages', icon: Layers, label: 'Decades' },
    { id: 'ai-insight', icon: Brain, label: 'Guidance' },
    { id: 'natal-chart', icon: Star, label: 'Chart' },
  ];
  return (
    <div className="fixed top-1/2 right-3 z-50 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={cn(
              'group flex items-center gap-2  border p-2 backdrop-blur-md transition-all hover:scale-105',
              isActive ? 'bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'hover:border-primary/30 border-white/10 bg-[#0A0A0F]/80'
            )}
            title={item.label}
          >
            <item.icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-primary' : 'group-hover:text-primary text-white/40')} />
            <span
              className={cn(
                'overflow-hidden text-[10px] whitespace-nowrap transition-all',
                isActive ? 'text-primary/90 w-16 px-1 opacity-100' : 'w-0 text-white/0 opacity-0 group-hover:w-16 group-hover:px-1 group-hover:text-white/60 group-hover:opacity-100'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
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
  hideFloatingNav = false,
}: SharedKlineResultProps) {
  const t = useTranslations('pages.index.page.sections.kline_result.page_client');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const birthYear = parseInt(profile?.birthDate?.split('-')[0] || '1990', 10);
  const currentYear = new Date().getFullYear();

  const highestPoint = klineData.length > 0 ? klineData.reduce((prev, current) => (prev.score > current.score ? prev : current)) : null;
  const lowestPoint = klineData.length > 0 ? klineData.reduce((prev, current) => (prev.score < current.score ? prev : current)) : null;
  const currentPoint = klineData.find((point) => point.year === currentYear) ?? null;

  const selectedYearFocus = selectedYear !== undefined ? transitDetails[selectedYear]?.[0] ?? null : null;

  return (
    <>
      <div className="mt-8" />
      {!hideFloatingNav && <FloatingNav />}

      {/* -- 1. HERO IDENTITY CARD -- */}
      <ReportSection id="destiny-summary" divider={false} className="relative z-[60] pt-4 pb-2">
        <DestinySummaryCard profile={profile} klineData={klineData} />
      </ReportSection>

      {/* ── 2. THE LIFE CURVE ── */}
      <ReportSection id="kline-hero" divider={false} className="relative z-[50] overflow-visible pt-2 pb-4">
        <InteractiveChart
          data={klineData}
          transitDetails={transitDetails}
          onNodeClick={(year) => setSelectedYear(year)}
          selectedYear={selectedYear}
          birthYear={birthYear}
          tier={tier as any}
          onActionGate={onActionGate}
        />
        <p className="mt-4 text-center text-xs text-white/30 tracking-wide">Tap any point on the curve to explore that year in detail</p>
      </ReportSection>

      {/* ── 3. K-LINE READING ── */}
      <ReportSection id="kline-reading" divider={false} className="relative z-[40] pb-6">
        <div className="p-8 md:p-12">
          <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mb-6 inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.22em] text-[#D4AF37]/80 uppercase"
              >
                <div className="h-px w-6 bg-[#D4AF37]/50" />
                {t("reading_title")}
              </motion.div>
              <Heading level={2} as={motion.h2}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-3xl font-serif text-white/90 md:text-4xl lg:text-5xl lg:leading-[1.15]"
              >
                See the big picture.
                <br />
                Then decide.
              </Heading>
            </div>
            <div className="flex items-end lg:pb-2">
              <motion.p 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="pl-6 border-l border-white/10 text-sm leading-relaxed text-white/50 md:text-base"
              >
                Your curve shows which years carry natural momentum and which carry friction. Use it to time career moves, financial decisions, and life changes with confidence.
              </motion.p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <InsightCard
              icon={TrendingUp}
              label={t("cards.highest_point.title")}
              ageStr={highestPoint ? t("cards.highest_point.stat", { age: highestPoint.year - birthYear }) : undefined}
              yearStr={highestPoint?.year}
              scoreStr={highestPoint?.score}
              fallback="Highest point unavailable"
              detail={t("cards.highest_point.desc")}
              accentColorClass="text-emerald-400"
              accentBgClass="bg-emerald-400/10"
              delay={0.1}
            />
            <InsightCard
              icon={TrendingDown}
              label={t("cards.lowest_point.title")}
              ageStr={lowestPoint ? t("cards.lowest_point.stat", { age: lowestPoint.year - birthYear }) : undefined}
              yearStr={lowestPoint?.year}
              scoreStr={lowestPoint?.score}
              fallback="Lowest point unavailable"
              detail={t("cards.lowest_point.desc")}
              accentColorClass="text-sky-400"
              accentBgClass="bg-sky-400/10"
              delay={0.2}
            />
            <InsightCard
              icon={Target}
              label={t("cards.current_status.title")}
              ageStr={currentPoint ? t("cards.current_status.stat", { age: currentPoint.year - birthYear }) : undefined}
              yearStr={currentPoint?.year}
              scoreStr={currentPoint?.score}
              fallback="Your current age is outside the visible range."
              detail={currentPoint ? t("cards.current_status.desc", { trend: currentPoint.score > 50 ? 'expansion' : 'protection' }) : 'Your current age is outside the visible range.'}
              accentColorClass="text-[#D4AF37]"
              accentBgClass="bg-[#D4AF37]/10"
              delay={0.3}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.04] px-2 pt-6 pb-2"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-white/30" />
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                Algorithm powered by planetary transits & progressed timeline
              </span>
            </div>
            
            <div className="flex items-center gap-5 text-[10px] font-bold tracking-widest uppercase">
              <div className="flex items-center gap-1.5 text-emerald-400/80">
                <Star className="h-3 w-3" />
                <span>Peak Year</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400/80">
                <Star className="h-3 w-3" />
                <span>Challenge Year</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#D4AF37]/80">
                <div className="h-px w-3 bg-[#D4AF37]" />
                <span>Current Age</span>
              </div>
            </div>
          </motion.div>
        </div>
      </ReportSection>

      {/* ── 4. LIFE STAGE SCORES ── */}
      <ReportSection id="life-stages" divider={false} className="relative z-[30] pb-8">
        <LifeStageScores data={klineData} birthYear={birthYear} />
      </ReportSection>

      {/* ── 5. AI INLINE DEEP READING ── */}
      <ReportSection id="ai-insight" divider={false} className="relative z-[20] pb-16">
        <AiReadingPanels
          profile={profile}
          tier={tier as any}
          onActionGate={onActionGate}
          selectedYear={selectedYear}
          yearFocusEvent={selectedYearFocus}
        />

        {/* ── PREMIUM PDF UPSELL ── */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 border border-foreground/10 bg-muted/30 relative">
          <div className="p-10 md:p-16 flex flex-col justify-center">
            <div className="mb-8 inline-flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              <span className="h-px w-6 bg-primary" /> Keep Your Full Reading
            </div>
            <Heading level={3} variant="section" className="mb-6 text-4xl md:text-5xl leading-[1.1]">
               Download Your <br/>
               <span className="text-primary italic">5-Year Outlook.</span>
             </Heading>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Get a beautiful PDF with your complete timing curve, decade scores, and the top 3 turning points for each of the next 5 years. Refer back anytime — no login needed.
            </p>
          </div>
          <div className="bg-background border-l border-foreground/10 p-10 md:p-16 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm flex flex-col gap-6">
              <PremiumDownloadButton 
                profile={profile} 
                klineData={klineData} 
                transitDetails={transitDetails} 
                tier={tier}
                onUpgradeClick={() => onActionGate()}
              />
              <p className="text-xs text-center text-muted-foreground font-mono">Keep it forever. Revisit before every big decision.</p>
            </div>
          </div>
        </div>
      </ReportSection>

      {/* -- 6. ADVANCED RAW DATA -- */}
      <ReportSection id="natal-chart" divider={false} className="relative z-[10] pb-24">
        <details className="group mx-auto w-full max-w-4xl overflow-hidden  border border-white/5 bg-black/40 backdrop-blur-sm transition-all duration-300 open:bg-[#111015]/80">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-white/50 transition-colors hover:text-white">
            <span className="text-[11px] font-bold tracking-widest uppercase">
              Full Birth Chart Data
            </span>
            <div className="text-white/30 transition-transform duration-300 group-open:rotate-180">
              ▼
            </div>
          </summary>
          <div className="border-t border-white/5 bg-transparent p-2">
            <ChartHero profile={profile} />
          </div>
        </details>
      </ReportSection>
    </>
  );
}
