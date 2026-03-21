'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AiReadingPanels } from '@/components/astrokline/kline/ai-reading-panels';
import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { DestinySummaryCard } from '@/components/astrokline/kline/destiny-summary-card';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { LifeStageScores } from '@/components/astrokline/kline/life-stage-scores';
import { QuotaLimitModal } from '@/components/astrokline/kline/quota-limit-modal';
import { RegistrationNudge } from '@/components/astrokline/kline/registration-nudge';
import { ReportFooter } from '@/components/astrokline/kline/report-footer';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import {
  getSavedBirthData,
  getSavedKlineResult,
  saveKlineResult,
} from '@/components/astrokline/ui/birth-info-context';
import { PageBreadcrumb } from '@/components/astrokline/ui/page-breadcrumb';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import {
  type DestinyScorePoint,
  type TransitEvent,
  type UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { apiToProfile } from '@/lib/astrokline/profile-transform';
import { trackEvent } from '@/lib/astrokline/track-event';
import {
  ArrowUp,
  BarChart3,
  Brain,
  Layers,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { useRouter } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';

function getScoreBand(score: number) {
  if (score >= 82) {
    return {
      label: 'Attack Window',
      summary:
        'Push visible moves, ask for leverage, and turn momentum into concrete outcomes.',
    };
  }

  if (score <= 38) {
    return {
      label: 'Protect Window',
      summary:
        'Reduce risk, protect cash flow, and stabilize your position before expanding again.',
    };
  }

  return {
    label: 'Build Window',
    summary:
      'Build capability, improve positioning, and prepare for the next stronger window.',
  };
}

function formatAgeYearLabel(year: number, birthYear: number) {
  return `Age ${year - birthYear} · ${year}`;
}

function InsightCard({
  icon: Icon,
  label,
  title,
  detail,
  accentClass,
}: {
  icon: typeof TrendingUp;
  label: string;
  title: string;
  detail: string;
  accentClass: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div
        className={cn(
          'mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase',
          accentClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-lg font-semibold text-white md:text-xl">{title}</div>
      <p className="mt-3 text-sm leading-7 text-white/62">{detail}</p>
    </div>
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

    const sections = [
      'destiny-summary',
      'kline-hero',
      'kline-reading',
      'life-stages',
      'natal-chart',
      'ai-insight',
    ];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const items = [
    { id: 'destiny-summary', icon: ArrowUp, label: 'Profile' },
    { id: 'kline-hero', icon: BarChart3, label: 'K-Line' },
    { id: 'kline-reading', icon: Target, label: 'Reading' },
    { id: 'life-stages', icon: Layers, label: 'Stages' },
    { id: 'natal-chart', icon: Star, label: 'Natal' },
    { id: 'ai-insight', icon: Brain, label: 'AI Reading' },
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
              'group flex items-center gap-2 rounded-xl border p-2 backdrop-blur-md transition-all hover:scale-105',
              isActive
                ? 'bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'hover:border-primary/30 border-white/10 bg-[#0A0A0F]/80'
            )}
            title={item.label}
          >
            <item.icon
              className={cn(
                'h-4 w-4 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'group-hover:text-primary text-white/40'
              )}
            />
            <span
              className={cn(
                'overflow-hidden text-[10px] whitespace-nowrap transition-all',
                isActive
                  ? 'text-primary/90 w-16 px-1 opacity-100'
                  : 'w-0 text-white/0 opacity-0 group-hover:w-16 group-hover:px-1 group-hover:text-white/60 group-hover:opacity-100'
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

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

export function ResultClient({
  userTier,
  isLoggedIn = false,
}: {
  userTier: string;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const tier: AppTier = !isLoggedIn
    ? 'GUEST'
    : userTier === 'PREMIUM'
      ? 'PRO'
      : userTier === 'STANDARD'
        ? 'LITE'
        : 'FREE';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const [klineData, setKlineData] = useState<DestinyScorePoint[]>([]);
  const [transitDetails, setTransitDetails] = useState<
    Record<number, TransitEvent[]>
  >({});

  const birthYear = parseInt(profile?.birthDate?.split('-')[0] || '1990', 10);
  const currentYear = new Date().getFullYear();
  const highestPoint = useMemo(
    () =>
      klineData.length > 0
        ? klineData.reduce((prev, current) =>
            prev.score > current.score ? prev : current
          )
        : null,
    [klineData]
  );
  const lowestPoint = useMemo(
    () =>
      klineData.length > 0
        ? klineData.reduce((prev, current) =>
            prev.score < current.score ? prev : current
          )
        : null,
    [klineData]
  );
  const currentPoint = useMemo(
    () => klineData.find((point) => point.year === currentYear) ?? null,
    [currentYear, klineData]
  );
  const currentBand = getScoreBand(
    currentPoint?.score ?? profile?.overallAverageScore ?? 50
  );
  const highestBand = getScoreBand(highestPoint?.score ?? 50);
  const lowestBand = getScoreBand(lowestPoint?.score ?? 50);
  const selectedYearFocus =
    selectedYear !== undefined ? transitDetails[selectedYear]?.[0] ?? null : null;

  // Registration nudge & quota modal state
  const [showNudge, setShowNudge] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo] = useState({
    used: 0,
    total: 2,
    isLifetime: true,
    userTier: 'FREE',
  });
  const [showPricingInline, setShowPricingInline] = useState(false);

  // Open inline pricing modal
  const openPricing = () => {
    trackEvent('pricing_modal_open', { source: 'kline_result_view' });
    setShowPricingInline(true);
  };

  // Recover state or redirect back
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const hydrateFromSavedResult = () => {
      const savedResult = getSavedKlineResult();

      if (
        !savedResult?.profile ||
        !Array.isArray(savedResult.klineData) ||
        savedResult.klineData.length === 0
      ) {
        return false;
      }

      setProfile(savedResult.profile);
      setKlineData(savedResult.klineData);
      setTransitDetails(savedResult.transitDetails ?? {});
      setIsInitializing(false);
      if (!isLoggedIn) {
        setTimeout(() => setShowNudge(true), 3500);
      }

      return true;
    };

    if (hydrateFromSavedResult()) {
      return () => {
        cancelled = true;
      };
    }

    const rebuildFromSavedBirthData = async () => {
      const savedBirthData = getSavedBirthData();

      if (!savedBirthData) {
        if (!cancelled) {
          setIsInitializing(false);
          router.replace('/kline');
        }
        return;
      }

      try {
        const [year, month, day] = savedBirthData.date.split('-').map(Number);
        const timezone = -(new Date().getTimezoneOffset() / 60);

        const response = await fetch('/api/astrology/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year,
            month,
            day,
            timeSlot: savedBirthData.timeSlot,
            timezone,
            latitude: savedBirthData.lat,
            longitude: savedBirthData.lon,
          }),
        });
        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || 'Failed to rebuild K-Line result');
        }

        const rebuiltProfile = {
          ...apiToProfile(result.data, savedBirthData),
          overallAverageScore: result.reportData?.overallAverageScore ?? 82,
        };
        const rebuiltResult = {
          profile: rebuiltProfile,
          birthData: savedBirthData,
          rawApiData: result.data,
          klineData: result.reportData?.klineData ?? [],
          transitDetails: result.reportData?.transitDetails ?? {},
        };

        saveKlineResult(rebuiltResult);

        if (cancelled) {
          return;
        }

        setProfile(rebuiltProfile);
        setKlineData(rebuiltResult.klineData);
        setTransitDetails(rebuiltResult.transitDetails);
        setIsInitializing(false);
        if (!isLoggedIn) {
          setTimeout(() => setShowNudge(true), 3500);
        }
      } catch (error) {
        console.error('Failed to recover result from saved birth data:', error);
        if (!cancelled) {
          setIsInitializing(false);
          router.replace('/kline');
        }
      }
    };

    void rebuildFromSavedBirthData();

    return () => {
      cancelled = true;
    };
  }, [router, isLoggedIn]);

  if (isInitializing || !profile) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-2xl">
        <AstrologyLoader
          isLoading={true}
          durationMs={6000}
          className="scale-110"
        />
      </div>
    );
  }

  return (
    <div className="bg-background astro-starfield min-h-screen">
      <div className="relative z-50 mx-auto w-full max-w-7xl px-4 pt-24 md:px-8">
        <PageBreadcrumb className="mb-0" />
      </div>

      <div className="mt-16" />
      <FloatingNav />

      {/* -- 1. HERO IDENTITY CARD -- */}
      <ReportSection
        id="destiny-summary"
        divider={false}
        className="relative z-[60] pt-4 pb-2"
      >
        <DestinySummaryCard profile={profile} klineData={klineData} />
      </ReportSection>

      {/* ── 2. THE KARMIC K-LINE ── */}
      <ReportSection
        id="kline-hero"
        divider={false}
        className="relative z-[50] overflow-visible pt-4 pb-4"
      >
        <InteractiveChart
          data={klineData}
          transitDetails={transitDetails}
          onNodeClick={(year) => setSelectedYear(year)}
          selectedYear={selectedYear}
          birthYear={birthYear}
          tier={tier}
        />
      </ReportSection>

      {/* ── 3. K-LINE READING ── */}
      <ReportSection
        id="kline-reading"
        divider={false}
        className="relative z-[40] pb-6"
      >
        <div className="rounded-[32px] border border-white/8 bg-[#111015]/82 p-6 shadow-2xl backdrop-blur-md md:p-8">
          <div className="mb-8 max-w-3xl">
            <div className="text-primary/80 mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              K-Line Reading
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
              Read the position first, then decide the move
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62 md:text-base">
              This chart answers the questions users actually care about: are
              you in an expansion phase or a protection phase, which years are
              strongest for aggressive action, and which years require tighter
              risk control.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <InsightCard
              icon={TrendingUp}
              label="Highest Point"
              title={
                highestPoint
                  ? `${formatAgeYearLabel(highestPoint.year, birthYear)} · Score ${highestPoint.score}`
                  : 'Highest point unavailable'
              }
              detail={highestBand.summary}
              accentClass="border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            />
            <InsightCard
              icon={TrendingDown}
              label="Lowest Point"
              title={
                lowestPoint
                  ? `${formatAgeYearLabel(lowestPoint.year, birthYear)} · Score ${lowestPoint.score}`
                  : 'Lowest point unavailable'
              }
              detail={lowestBand.summary}
              accentClass="border-sky-400/20 bg-sky-500/10 text-sky-200"
            />
            <InsightCard
              icon={Target}
              label="Current Position"
              title={
                currentPoint
                  ? `${formatAgeYearLabel(currentPoint.year, birthYear)} · Score ${currentPoint.score}`
                  : 'Current year is outside the chart'
              }
              detail={
                currentPoint
                  ? currentBand.summary
                  : 'Your current age is outside the visible range, so use the long-term average as the better reference point.'
              }
              accentClass="border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#F4E1A1]"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                How The Curve Is Calculated
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white">
                    Long cycle
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Sets the broad direction of the life curve and shows which
                    periods naturally support expansion versus restructuring.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white">
                    Medium cycle
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Controls pacing. Some years stack momentum, while others are
                    better for consolidation and cleanup.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white">
                    Turning points
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Highlights inflection years so users can change strategy
                    before pressure becomes obvious.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                How To Read The Markers
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 p-4 text-sm leading-6 text-white/65">
                  <span className="font-semibold text-emerald-200">
                    Green star
                  </span>{' '}
                  marks the strongest expansion window across the full curve.
                </div>
                <div className="rounded-2xl border border-sky-400/15 bg-sky-500/8 p-4 text-sm leading-6 text-white/65">
                  <span className="font-semibold text-sky-200">Blue star</span>{' '}
                  marks the deepest protection window where structure matters
                  more than speed.
                </div>
                <div className="rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/8 p-4 text-sm leading-6 text-white/65">
                  <span className="font-semibold text-[#F4E1A1]">
                    Dashed line
                  </span>{' '}
                  shows your current age so users can judge how close they are
                  to a peak, a low, or a reversal zone.
                </div>
              </div>
            </div>
          </div>
        </div>
      </ReportSection>

      {/* ── 4. LIFE STAGE SCORES ── */}
      <ReportSection
        id="life-stages"
        divider={false}
        className="relative z-[30] pb-8"
      >
        <LifeStageScores data={klineData} birthYear={birthYear} />
      </ReportSection>

      {/* ── 5. AI INLINE DEEP READING ── */}
      <ReportSection
        id="ai-insight"
        divider={false}
        className="relative z-[20] pb-16"
      >
        <AiReadingPanels
          profile={profile}
          tier={tier}
          onUpgradeClick={openPricing}
          selectedYear={selectedYear}
          yearFocusEvent={selectedYearFocus}
        />
      </ReportSection>

      {/* -- 6. ADVANCED RAW DATA -- */}
      <ReportSection
        id="natal-chart"
        divider={false}
        className="relative z-[10] pb-24"
      >
        <details className="group mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm transition-all duration-300 open:bg-[#111015]/80">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-white/50 transition-colors hover:text-white">
            <span className="text-[11px] font-bold tracking-widest uppercase">
              Advanced Raw Data (For Astrologers)
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

      {/* ── 8. Footer ── */}
      <ReportSection id="report-footer" className="pb-12">
        <ReportFooter profile={profile} />
      </ReportSection>

      {/* Registration Nudge for non-logged-in users */}
      {!isLoggedIn && (
        <RegistrationNudge
          isVisible={showNudge}
          onClose={() => setShowNudge(false)}
        />
      )}

      {/* Quota Limit Modal */}
      <QuotaLimitModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        used={quotaInfo.used}
        total={quotaInfo.total}
        isLifetime={quotaInfo.isLifetime}
        userTier={quotaInfo.userTier}
        onUpgradeClick={openPricing}
      />

      {/* Inline Pricing Modal */}
      {showPricingInline && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setShowPricingInline(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="border-primary/20 bg-background/95 relative mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-8 shadow-[0_0_60px_rgba(212,175,55,0.15)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPricingInline(false)}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 text-lg transition-colors"
            >
              ✕
            </button>
            <div className="mb-6 text-center">
              <div className="bg-primary/10 border-primary/30 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
                <Sparkles className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold">Unlock Your Full Blueprint</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Choose a plan to unlock your complete 10-year destiny K-Line and
                deep analysis.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: 'Lite',
                  price: '$39.9',
                  desc: '10 saved K-Lines / month + career, wealth, love, health AI modules',
                  id: 'standard',
                },
                {
                  name: 'Pro',
                  price: '$79.9',
                  desc: '30 saved K-Lines / month + exact transit detail + premium dashboard tools',
                  id: 'premium',
                  featured: true,
                },
              ].map((plan) => (
                <a
                  key={plan.id}
                  href={`/pricing`}
                  onClick={() =>
                    trackEvent('pricing_plan_click', {
                      plan: plan.id,
                      source: 'inline_modal',
                    })
                  }
                  className={cn(
                    'block rounded-xl border p-5 transition-all hover:scale-[1.02]',
                    plan.featured
                      ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-foreground font-bold">{plan.name}</h4>
                    <span className="text-primary text-lg font-bold">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">{plan.desc}</p>
                </a>
              ))}
            </div>
            <p className="text-muted-foreground/50 mt-6 text-center font-mono text-xs">
              7-day money-back guarantee · Secure checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
