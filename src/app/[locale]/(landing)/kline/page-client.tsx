'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AiReadingPanels } from '@/components/astrocurve/kline/ai-reading-panels';
import { ChartHero } from '@/components/astrocurve/kline/chart-hero';
import { DestinySummaryCard } from '@/components/astrocurve/kline/destiny-summary-card';
import { InteractiveChart } from '@/components/astrocurve/kline/interactive-chart';
import { LifeStageScores } from '@/components/astrocurve/kline/life-stage-scores';
import { QuotaLimitModal } from '@/components/astrocurve/kline/quota-limit-modal';
// Removed unused lock / Star import
import { RegistrationNudge } from '@/components/astrocurve/kline/registration-nudge';
import { ReportFooter } from '@/components/astrocurve/kline/report-footer';
import { ReportSection } from '@/components/astrocurve/kline/report-section';
import {
  getSavedBirthData,
  getSavedKlineResult,
  saveKlineResult,
  useBirthInfoModal,
  type BirthData,
} from '@/components/astrocurve/ui/birth-info-context';
import { PageBreadcrumb } from '@/components/astrocurve/ui/page-breadcrumb';
import { AstrologyLoader } from '@/components/astrocurve/ui/theatrical-loader';
import {
  generateKlineData,
  MOCK_TRANSIT_DETAILS,
  MOCK_USER_PROFILE,
  type UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import {
  buildNatalChartPayload,
  enrichBirthDataWithTimezone,
} from '@/lib/astrokline/birth-timezone';
import { PLAN_ENTITLEMENTS } from '@/lib/astrokline/plan-entitlements';
import { apiToProfile } from '@/lib/astrokline/profile-transform';
import { trackEvent } from '@/lib/astrokline/track-event';
import {
  ArrowUp,
  Award,
  BarChart3,
  Binary,
  Brain,
  Clock,
  Cpu,
  Database,
  GraduationCap,
  Layers,
  Lock,
  SearchCode,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { useRouter } from '@/core/i18n/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';
import { Heading } from "@/components/astrocurve/ui/heading";

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
    { id: 'kline-hero', icon: BarChart3, label: 'Life Curve' },
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
              'group flex items-center gap-2  border p-2 backdrop-blur-md transition-all hover:scale-105',
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

export function KlineClient({
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
  const [isUserData, setIsUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const { open: openBirthModal } = useBirthInfoModal();

  // Dynamically generate 100-year Kline data based on actual birth year (fallback to 1990)
  const birthYear = parseInt(profile?.birthDate?.split('-')[0] || '1990', 10);
  const klineData = useMemo(() => generateKlineData(birthYear), [birthYear]);

  const [transitDetails, setTransitDetails] = useState(MOCK_TRANSIT_DETAILS);

  // Registration nudge & quota modal state
  const [showNudge, setShowNudge] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({
    used: 0,
    total: 2,
    isLifetime: true,
    userTier: 'FREE',
  });
  const [showPricingInline, setShowPricingInline] = useState(false);

  // Open inline pricing modal
  const openPricing = () => {
    trackEvent('pricing_modal_open', { source: 'kline_result' });
    setShowPricingInline(true);
  };

  const handleCalculateBirthData = useCallback(
    async (birthData: BirthData) => {
      setIsLoading(true);
      let shouldResetLoading = true;

      try {
        const normalizedBirthData = enrichBirthDataWithTimezone(birthData);

        const profileToSave = {
          ...buildNatalChartPayload(normalizedBirthData),
        };

        // Fetch actual data
        const response = await fetch('/api/astrology/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileToSave),
        });

        const result = await response.json();

        if (result.success && result.data) {
          const newProfile = {
            ...apiToProfile(result.data, normalizedBirthData),
            overallAverageScore:
              result.reportData?.overallAverageScore ?? 82,
          };
          const persistedResult = {
            profile: newProfile,
            birthData: normalizedBirthData,
          };
          const cachedResult = {
            ...persistedResult,
            rawApiData: result.data,
            klineData: result.reportData?.klineData,
            transitDetails: result.reportData?.transitDetails,
          };

          let resultForStorage: Record<string, unknown> = cachedResult;

          if (isLoggedIn) {
            try {
              const saveRes = await fetch('/api/kline/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  isSelf: true,
                  label: normalizedBirthData.name || 'Me',
                  birthDate: normalizedBirthData.date,
                  birthTime: normalizedBirthData.timeSlot,
                  birthPlace: normalizedBirthData.location,
                  birthLat: String(normalizedBirthData.lat),
                  birthLng: String(normalizedBirthData.lon),
                  klineResult: cachedResult,
                }),
              });

              if (saveRes.ok) {
                const saveJson = await saveRes.json();
                resultForStorage = {
                  ...(saveJson.data?.klineResult ?? cachedResult),
                  klineId: saveJson.data?.id ?? null,
                };
              }
            } catch (err) {
              console.error('Auto-save error:', err);
            }
          }

          // The result page hydrates from localStorage first, so persist the
          // freshest saved chart before navigation.
          saveKlineResult(resultForStorage);
          const hydratedResult = getSavedKlineResult();
          if (!hydratedResult?.profile) {
            throw new Error('Failed to persist generated chart result');
          }
          setProfile(newProfile);
          trackEvent('kline_result_loaded');

          if (!isLoggedIn) {
            // Show registration nudge after 3 seconds for non-logged-in users
            setTimeout(() => setShowNudge(true), 3000);
          }

          // Removed unnecessary and slow Destiny AI calculations which are hidden on the page.
          shouldResetLoading = false;
          router.replace('/kline/result');
          return;
        } else {
          console.error('API Error:', result.error);
        }
      } catch (err) {
        console.error('Failed to fetch natal chart:', err);
      } finally {
        if (shouldResetLoading) {
          setIsLoading(false);
          setTimeout(
            () =>
              document
                .getElementById('kline-hero')
                ?.scrollIntoView({ behavior: 'smooth' }),
            200
          );
        }
      }
    },
    [isLoggedIn, router]
  );

  // Auto-open modal if no birth data, or auto-calculate if birth data exists but no result
  useEffect(() => {
    const savedBirth = getSavedBirthData();
    if (!savedBirth) {
      // No birth data at all → open modal to collect info
      const t = setTimeout(() => openBirthModal(handleCalculateBirthData), 500);
      return () => clearTimeout(t);
    }
    // Birth data exists but no result yet → auto-trigger calculation
    const savedResult = getSavedKlineResult();
    if (!savedResult?.profile) {
      const t = setTimeout(() => handleCalculateBirthData(savedBirth), 300);
      return () => clearTimeout(t);
    }
  }, [openBirthModal, handleCalculateBirthData]);

  const handleGetMyKline = () => {
    openBirthModal(handleCalculateBirthData);
  };

  return (
    <div className="bg-background astro-starfield min-h-screen">
      {/* ── Global Page Breadcrumb ── */}
      <div className="relative z-40 mx-auto w-full max-w-7xl px-4 pt-24 md:px-8 pointer-events-none">
        <div className="pointer-events-auto inline-block">
          <PageBreadcrumb className="mb-0" />
        </div>
      </div>

      {/* ===== 3D SPATIAL LOADER ===== */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-2xl">
          <AstrologyLoader
            isLoading={true}
            durationMs={6000}
            className="scale-110"
          />
        </div>
      )}

      <div className="flex w-full flex-col pb-24">
        {/* Hero Section */}
        <div className="relative flex flex-col justify-center border-b border-white/5 bg-[#050505] px-6 py-32 md:px-12">
          <div className="relative z-10 w-full max-w-4xl space-y-8">
            <Heading level={1} className="font-serif text-5xl tracking-normal text-white/95 md:text-7xl lg:text-8xl lg:leading-[1.1]">
              Your 100-Year<br/>
              Life Timeline
            </Heading>
            <p className="max-w-prose text-lg font-light leading-relaxed tracking-wide text-white/50 md:text-2xl">
              See when your biggest opportunities, turning points, and growth windows arrive — mapped from the stars. Created for anyone ready to understand their path.
            </p>
            <button
              onClick={handleGetMyKline}
              className="group relative inline-flex h-14 items-center justify-center gap-4 bg-[#D4AF37] px-10 text-sm font-bold tracking-[0.1em] text-black uppercase transition-transform hover:scale-105 active:scale-95"
            >
              Reveal My Timeline ✨
              <ArrowUp className="h-4 w-4 rotate-45 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>

            {/* Trust & Authority Badges */}
            <div className="mx-auto mt-10 w-full max-w-4xl border-t border-white/5 pt-10">
              <p className="mb-6 text-[10px] font-medium tracking-[0.2em] text-white/30 uppercase md:text-xs">
                Built on trusted astronomical data
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 opacity-70 grayscale transition-all duration-500 hover:grayscale-0 md:gap-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#15131A] shadow-inner">
                    <Cpu className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white/80">
                      Swiss Ephemeris
                    </p>
                    <p className="text-[10px] text-zinc-500">DE431 Engine</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#15131A] shadow-inner">
                    <GraduationCap className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white/80">
                      Vedic + Western
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Blended Approach
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#15131A] shadow-inner">
                    <Award className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white/80">NASA JPL</p>
                    <p className="text-[10px] text-zinc-500">
                      Planetary dataset
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#15131A] shadow-inner">
                    <ShieldCheck className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white/80">
                      Encrypted
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Private by default
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Algorithmic Scoring Methodology */}
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-16 text-center">
            <Heading level={2} variant="section" className="mb-4 text-3xl text-white md:text-4xl">
              How To Read Your Turning Points
            </Heading>
            <p className="text-muted-foreground mx-auto max-w-3xl">
              Your score isn't a grade on your life. It's a weather forecast for your decisions—built from long cycles, transit pressure, and chart structure.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="hover:border-primary/20  border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-colors">
              <div className="mb-6 flex h-12 w-12 items-center justify-center  bg-green-500/10 text-green-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Heading level={3} className="mb-3 text-xl font-bold text-white">
                Strong Windows (Push)
              </Heading>
              <p className="text-sm leading-relaxed text-white/50">
                The cosmic wind is at your back. This is when you shine — launch something new, say yes to opportunities, or take the leap you’ve been dreaming of.
              </p>
            </div>

            <div className="hover:border-primary/20  border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-colors">
              <div className="mb-6 flex h-12 w-12 items-center justify-center  bg-red-500/10 text-red-400">
                <TrendingDown className="h-6 w-6" />
              </div>
              <Heading level={3} className="mb-3 text-xl font-bold text-white">
                Weak Windows (Protect)
              </Heading>
              <p className="text-sm leading-relaxed text-white/50">
                Friction is high. Pushing forward now drains your energy. This is your time to rest, reflect, heal, and let the universe prepare you for what’s next.
              </p>
            </div>

            <div className="hover:border-primary/20  border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-colors">
              <div className="mb-6 flex h-12 w-12 items-center justify-center  bg-blue-500/10 text-blue-400">
                <Clock className="h-6 w-6" />
              </div>
              <Heading level={3} className="mb-3 text-xl font-bold text-white">
                Transition Years (Prepare)
              </Heading>
              <p className="text-sm leading-relaxed text-white/50">
                The board is resetting. You might feel stuck, but the foundation you build during these neutral years determines how high you fly in the next strong window.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Case Study */}
        <div className="w-full border-y border-white/5 bg-[#110F15] py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold tracking-widest text-white/60 uppercase">
                <SearchCode className="h-3.5 w-3.5" /> Case Study
              </div>
              <Heading level={2} variant="section" className="text-3xl leading-tight text-white md:text-4xl">
                Timing Is Everything: <br />
                <span className="text-primary italic">
                  Steve Jobs&apos; Life Curve
                </span>
              </Heading>
              <p className="text-base leading-relaxed text-white/60">
                Success isn't just hard work; it's doing the right thing at the right time. His timing curve mirrors his real-world turning points with unusual clarity.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="mt-2 h-1.5 w-1.5 shrink-0 bg-red-500 shadow-[0_0_10px_#ef4444]" />
                  <div>
                    <strong className="mb-1 block text-white">
                      1985: Forced Out (Weak Window)
                    </strong>
                    <span className="text-sm text-white/50">
                      The curve hits a brutal low. Massive friction. He was ousted from Apple. Pushing harder here would have destroyed him; he used this transit block to retreat and build NeXT.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-2 h-1.5 w-1.5 shrink-0 bg-green-500 shadow-[0_0_10px_#22c55e]" />
                  <div>
                    <strong className="mb-1 block text-white">
                      1997: The Return (Strong Window)
                    </strong>
                    <span className="text-sm text-white/50">
                      The score turns sharply upward. Cosmic momentum shifts. He strikes when the iron is hot, returning to Apple as interim CEO to save the company.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 shadow-[0_0_10px_#D4AF37]" />
                  <div>
                    <strong className="mb-1 block text-white">
                      2007: Maximum Peak (The iPhone)
                    </strong>
                    <span className="text-sm text-white/50">
                      The curve peaks. Perfect alignment between his natal promise and transit timing. He launches the iPhone, changing the world forever.
                    </span>
                  </div>
                </li>
              </ul>
              <div className="pt-4">
                <button
                  onClick={handleGetMyKline}
                  className="text-primary hover:text-primary/80 flex cursor-pointer items-center gap-2 font-bold transition-colors"
                >
                  See my timeline{' '}
                  <ArrowUp className="h-4 w-4 rotate-45" />
                </button>
              </div>
            </div>
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden  border border-white/10 bg-black p-6 shadow-2xl md:aspect-[4/3]">
              {/* Fake abstract chart representing the case study */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
              <svg
                viewBox="0 0 400 300"
                className="h-full w-full drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                <path
                  d="M 0 250 C 50 180, 80 280, 120 280 C 180 280, 200 150, 250 80 C 300 10, 350 40, 400 20"
                  fill="none"
                  stroke="url(#steveGrad)"
                  strokeWidth="4"
                />
                <defs>
                  <linearGradient id="steveGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <circle cx="120" cy="280" r="5" fill="#ef4444" />
                <circle cx="250" cy="80" r="5" fill="#D4AF37" />
                <circle cx="400" cy="20" r="5" fill="#22c55e" />
              </svg>
              <div className="absolute bottom-10 left-10 font-mono text-[10px] tracking-widest text-white/50 uppercase">
                1985 (Exile)
              </div>
              <div className="absolute top-[40%] right-[30%] font-mono text-[10px] tracking-widest text-white/50 uppercase">
                1997 (Return)
              </div>
              <div className="text-primary absolute top-10 right-4 font-mono text-[10px] font-bold tracking-widest uppercase drop-shadow-md">
                2007 (iPhone)
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Tech Methodology */}
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Cpu className="text-primary/50 mx-auto mb-6 h-10 w-10" />
          <Heading level={2} variant="section" className="mb-6 text-2xl text-white md:text-3xl">
            Built on verified astronomy data
          </Heading>
          <p className="mb-8 leading-relaxed text-white/50">
            We calculate planetary movement data, then turn it into a readable
            score and timing curve.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs tracking-widest text-white/30 uppercase">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" /> SWISSEPH DE431
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Binary className="h-3 w-3" /> Advanced Transit Scoring
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" /> Classical Aspect Analysis
            </span>
          </div>
        </div>

        {/* Section 4: Deep Horoscope FAQ */}
        <div className="mx-auto w-full max-w-4xl px-6 py-16">
          <div className="mb-12 text-center">
            <Heading level={2} variant="section" className="mb-4 text-3xl text-white">
              Frequently Asked Questions
            </Heading>
            <p className="text-muted-foreground">
              Common questions about the chart, timing, and privacy.
            </p>
          </div>

          <div className=" border border-white/5 bg-[#15131A] p-6 shadow-2xl md:p-10">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question:
                    'What if I make a major decision during a "Weak Window"?',
                  answer:
                    "Weak windows, the dips in your Life Curve, represent high cosmic friction, usually driven by heavy Saturn or Pluto transits. Pushing for rapid expansion during these periods often leads to burnout, financial loss, or blocked progress. These years are designed for defense: protecting assets, cutting losses, and restructuring. Knowing it's a weak window prevents you from blaming yourself for the friction.",
                },
                {
                  question: 'Does this actually predict my future?',
                  answer:
                    "AstroCurve doesn't predict events; it predicts the weather. If we tell you it's going to rain, meaning a high-pressure transit, you can still choose to go outside, but you'll bring an umbrella. By mapping your planetary transits into a Life Curve, we show you exactly when your environment will be supportive, high momentum, and when it will be resistant.",
                },
                {
                  question: 'Why do you need my exact birth time and place?',
                  answer:
                    "Your exact birth time and location determine your Ascendant and House placements. A 5-minute difference can shift planetary emphasis entirely, changing the timing of your 'Peak' and 'Valley' years. We use Swiss Ephemeris and NASA JPL data to calculate your geometry down to 0.001° for maximum precision.",
                },
                {
                  question: 'What if I don\'t know my exact birth time?',
                  answer:
                    "If you don't know your exact time, you can select 'I don't know' or estimate a time block. Our system will generate a baseline Life Curve focusing on slower-moving outer planets, including Jupiter, Saturn, and Uranus, which dominate long-term life chapters. While you lose some exact day-to-day precision, your macro 10-year trends remain highly accurate.",
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-white/10 last:border-0"
                >
                  <AccordionTrigger className="hover:text-primary py-6 text-left text-base font-semibold transition-colors md:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pr-6 pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

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

      {/* ─── Inline Pricing Modal ─── */}
      {showPricingInline && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setShowPricingInline(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="border-primary/20 bg-background/95 relative mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto  border p-8 shadow-[0_0_60px_rgba(212,175,55,0.15)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPricingInline(false)}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 text-lg transition-colors"
            >
              ✕
            </button>
            <div className="mb-6 text-center">
              <div className="bg-primary/10 border-primary/30 mx-auto mb-4 flex h-12 w-12 items-center justify-center border">
                <Sparkles className="text-primary h-5 w-5" />
              </div>
              <Heading level={3} className="text-2xl font-bold">Unlock AI Reading, Saved Reports, and Pro Tools</Heading>
              <p className="text-muted-foreground mt-2 text-sm">
                Free already includes your full 100-year Life Curve. Upgrade for AI reading, Ask Your Chart, saved reports, PDF export, and Pro-only timing tools.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: 'Lite',
                  price: '$39.9',
                  desc: PLAN_ENTITLEMENTS.LITE.upgradeCardDescription,
                  id: 'standard',
                },
                {
                  name: 'Pro',
                  price: '$79.9',
                  desc: PLAN_ENTITLEMENTS.PRO.upgradeCardDescription,
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
                    'block  border p-5 transition-all hover:scale-[1.02]',
                    plan.featured
                      ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Heading level={4} className="text-foreground font-bold">{plan.name}</Heading>
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
