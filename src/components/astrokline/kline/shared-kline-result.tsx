'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUp, BarChart3, Brain, Layers, Star, Target, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

import { AiReadingPanels } from '@/components/astrokline/kline/ai-reading-panels';
import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { DestinySummaryCard } from '@/components/astrokline/kline/destiny-summary-card';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { LifeStageScores } from '@/components/astrokline/kline/life-stage-scores';
import { PremiumDownloadButton } from '@/components/astrokline/kline/premium-download-button';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { TrustEvidenceBar } from '@/components/astrokline/kline/trust-evidence-bar';
import { cn } from '@/shared/lib/utils';
import type { DestinyScorePoint, TransitEvent, UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Heading } from "@/components/astrokline/ui/heading";

// Helper functions
function getScoreBand(score: number, t: any) {
  if (score >= 82) return { label: t('bands.expansion.label'), summary: t('bands.expansion.summary') };
  if (score <= 38) return { label: t('bands.protection.label'), summary: t('bands.protection.summary') };
  return { label: t('bands.build.label'), summary: t('bands.build.summary') };
}

function InsightCard({
  icon: Icon,
  label,
  title,
  detail,
  accentClass,
  delay = 0,
}: {
  icon: typeof TrendingUp;
  label: string;
  title: string;
  detail: string;
  accentClass: string;
  glowClass?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      className="group relative flex flex-col pt-6 border-t border-foreground/10"
    >
      <div className="relative z-10 flex h-full flex-col">
        <div
          className={cn(
            'mb-4 w-fit inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase',
            accentClass
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{detail}</p>
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

    const sections = ['destiny-summary', 'kline-hero', 'kline-reading', 'life-stages', 'natal-chart', 'ai-insight'];
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
    { id: 'natal-chart', icon: Star, label: 'Chart' },
    { id: 'ai-insight', icon: Brain, label: 'Guidance' },
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
  onUpgradeClick: () => void;
  hideFloatingNav?: boolean;
}

export function SharedKlineResult({
  profile,
  klineData,
  transitDetails,
  tier,
  onUpgradeClick,
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
                className="mb-8 inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.22em] text-primary uppercase"
              >
                <div className="h-px w-6 bg-primary" />
                {t("reading_title")}
              </motion.div>
              <Heading level={2} as={motion.h2}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-6xl leading-[1.1]"
              >
                See the big picture.
                <br />
                Then decide.
              </Heading>
            </div>
            <div className="flex items-end lg:pb-4">
              <motion.p 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="text-base leading-relaxed text-muted-foreground md:text-lg border-l border-foreground/10 pl-6"
              >
                Your curve shows which years carry natural momentum and which carry friction. Use it to time career moves, financial decisions, and life changes with confidence.
              </motion.p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <InsightCard
              icon={TrendingUp}
              label={t("cards.highest_point.title")}
              title={highestPoint ? `${t("cards.highest_point.stat", { age: highestPoint.year - birthYear })} · ${highestPoint.year} · Score ${highestPoint.score}` : 'Highest point unavailable'}
              detail={t("cards.highest_point.desc")}
              accentClass="border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              glowClass="bg-emerald-500"
              delay={0.1}
            />
            <InsightCard
              icon={TrendingDown}
              label={t("cards.lowest_point.title")}
              title={lowestPoint ? `${t("cards.lowest_point.stat", { age: lowestPoint.year - birthYear })} · ${lowestPoint.year} · Score ${lowestPoint.score}` : 'Lowest point unavailable'}
              detail={t("cards.lowest_point.desc")}
              accentClass="border-sky-400/20 bg-sky-500/10 text-sky-300"
              glowClass="bg-sky-500"
              delay={0.2}
            />
            <InsightCard
              icon={Target}
              label={t("cards.current_status.title")}
              title={currentPoint ? `${t("cards.current_status.stat", { age: currentPoint.year - birthYear })} · ${currentPoint.year} · Score ${currentPoint.score}` : 'Current year is outside the chart'}
              detail={currentPoint ? t("cards.current_status.desc", { trend: currentPoint.score > 50 ? 'expansion' : 'protection' }) : 'Your current age is outside the visible range.'}
              accentClass="border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#F4E1A1]"
              glowClass="bg-[#D4AF37]"
              delay={0.3}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative overflow-hidden  border border-white/10 bg-[#050505] p-8 transition-colors duration-300 hover:border-[#D4AF37]/30 hover:bg-[#0A0A0A]"
            >
              <div className="relative z-10 mb-8 inline-flex items-center gap-2  border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">
                <Brain className="h-4 w-4" />
                {t("how_it_is_calculated")}
              </div>
              
              <div className="relative z-10 grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Life direction', desc: 'Shows which decades naturally support growth and which call for patience and restructuring.' },
                  { title: 'Year-by-year pacing', desc: 'Some years stack momentum. Others are better for consolidating wins and preparing for the next push.' },
                  { title: 'Turning points', desc: 'Pinpoints the exact years where your trajectory shifts — so you can adjust before the change arrives.' },
                ].map((item, i) => (
                  <div key={i} className=" border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05] hover:shadow-xl">
                    <div className="text-base font-bold text-white/90">{item.title}</div>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="group relative overflow-hidden  border border-white/10 bg-[#050505] p-8 transition-colors duration-300 hover:border-[#D4AF37]/30 hover:bg-[#0A0A0A]"
            >
              <div className="relative z-10 mb-8 inline-flex items-center gap-2  border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">
                <Target className="h-4 w-4" />
                {t("how_to_read")}
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-5  border border-emerald-400/10 bg-emerald-500/5 p-5 transition-all duration-300 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center  bg-emerald-500/20 text-emerald-300 shadow-inner">
                    <Star className="h-5 w-5" />
                  </div>
                  <div className="text-sm leading-relaxed text-white/60">
                    <span className="font-bold text-emerald-200">Green star</span> — your strongest year. This is when momentum peaks and big moves pay off.
                  </div>
                </div>
                
                <div className="flex items-center gap-5  border border-sky-400/10 bg-sky-500/5 p-5 transition-all duration-300 hover:bg-sky-500/10 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center  bg-sky-500/20 text-sky-300 shadow-inner">
                    <Star className="h-5 w-5" />
                  </div>
                  <div className="text-sm leading-relaxed text-white/60">
                    <span className="font-bold text-sky-200">Blue star</span> — your most challenging year. Slow down, protect what you have, and build resilience.
                  </div>
                </div>
                
                <div className="flex items-center gap-5  border border-[#D4AF37]/10 bg-[#D4AF37]/5 p-5 transition-all duration-300 hover:bg-[#D4AF37]/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#D4AF37]/20 text-[#D4AF37] shadow-inner">
                    <div className="h-0.5 w-5 bg-[#D4AF37] opacity-80 mix-blend-screen" />
                  </div>
                  <div className="text-sm leading-relaxed text-white/60">
                    <span className="font-bold text-[#F4E1A1]">Gold line</span> — your current age. See how close you are to your next peak or shift.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
          onUpgradeClick={onUpgradeClick}
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
                onUpgradeClick={onUpgradeClick}
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
