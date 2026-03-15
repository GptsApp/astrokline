'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { LifeRadar } from '@/components/astrokline/kline/life-radar';
import { ReadingSummary } from '@/components/astrokline/kline/reading-summary';
import { CurrentEnergy } from '@/components/astrokline/kline/current-energy';
import { Next30Days } from '@/components/astrokline/kline/next-30-days';
import { ReportFooter } from '@/components/astrokline/kline/report-footer';
import { UpgradeBanner } from '@/components/astrokline/shared/upgrade-banner';
import { CosmicPersonalityProfile } from '@/components/astrokline/kline/cosmic-personality-profile';
import { useBirthInfoModal, getSavedBirthData, saveKlineResult } from '@/components/astrokline/ui/birth-info-context';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import { ChartSettingsPanel } from '@/components/astrokline/kline/chart-settings-panel';
import { Lock, Sparkles, Eye, ChevronDown, ChevronUp, Sun, Moon, ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { trackEvent } from '@/lib/astrokline/track-event';
import {
  ToolFeatures,
  ToolHowItWorks,
  ToolAudience,
  ToolCrossLinks
} from '@/themes/default/blocks';
import { AstroFaq } from '@/themes/default/blocks/astro-faq';
import { KLINE_SEO_CONTENT } from '@/lib/astrokline/kline-seo-data';
import { TrustBadge } from '@/components/astrokline/ui/trust-badge';
import { TrustEvidenceBar } from '@/components/astrokline/kline/trust-evidence-bar';
import { AiPersonalityInsight } from '@/components/astrokline/kline/ai-personality-insight';
import { RegistrationNudge } from '@/components/astrokline/kline/registration-nudge';
import { QuotaLimitModal } from '@/components/astrokline/kline/quota-limit-modal';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import {
  MOCK_USER_PROFILE,
  MOCK_KLINE_DATA,
  MOCK_TRANSIT_DETAILS,
  MOCK_DESTINY_READING,
  MOCK_NEXT_30_DAYS,
  MOCK_RADAR_DATA,
} from '@/lib/astrokline/mock-astrology-data';
import type { BirthData } from '@/components/astrokline/ui/birth-info-context';

/**
 * Convert natal chart API response to UserProfile for ChartHero
 */
function apiToProfile(apiData: any, birthData: BirthData): UserProfile {
  const planets = apiData.planets || [];
  const findPlanet = (name: string) => {
    const p = planets.find((pl: any) => pl.name === name);
    if (!p) return { sign: "Unknown", degree: 0, minute: 0, house: 1 };
    const deg = Math.floor(p.signDegree);
    const min = Math.round((p.signDegree - deg) * 60);
    return { sign: p.sign, degree: deg, minute: min, house: p.house || 1 };
  };

  const asc = apiData.ascendant || { sign: "Unknown", degree: 0 };
  const ascDeg = Math.floor(asc.degree);
  const ascMin = Math.round((asc.degree - ascDeg) * 60);

  // Calculate element percentages from planet signs
  const elementMap: Record<string, string> = {
    Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
    Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
    Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
  };
  const modalityMap: Record<string, string> = {
    Aries: "cardinal", Taurus: "fixed", Gemini: "mutable", Cancer: "cardinal",
    Leo: "fixed", Virgo: "mutable", Libra: "cardinal", Scorpio: "fixed",
    Sagittarius: "mutable", Capricorn: "cardinal", Aquarius: "fixed", Pisces: "mutable",
  };

  const elCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const modCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  const total = planets.length || 1;

  planets.forEach((p: any) => {
    const el = elementMap[p.sign];
    const mod = modalityMap[p.sign];
    if (el) (elCounts as any)[el]++;
    if (mod) (modCounts as any)[mod]++;
  });

  // Convert to percentages
  const elements = {
    fire: Math.round((elCounts.fire / total) * 100),
    earth: Math.round((elCounts.earth / total) * 100),
    air: Math.round((elCounts.air / total) * 100),
    water: Math.round((elCounts.water / total) * 100),
  };
  const modalities = {
    cardinal: Math.round((modCounts.cardinal / total) * 100),
    fixed: Math.round((modCounts.fixed / total) * 100),
    mutable: Math.round((modCounts.mutable / total) * 100),
  };

  // Simple life path number from birthdate
  const dateDigits = birthData.date.replace(/-/g, "").split("").map(Number);
  let lpn = dateDigits.reduce((a, b) => a + b, 0);
  while (lpn > 9 && lpn !== 11 && lpn !== 22) {
    lpn = String(lpn).split("").map(Number).reduce((a, b) => a + b, 0);
  }

  return {
    name: birthData.name,
    birthDate: birthData.date,
    birthTime: birthData.timeSlot === "unknown" ? "12:00" : birthData.timeSlot.split("-")[0],
    birthLocation: birthData.location,
    sun: findPlanet("Sun"),
    moon: findPlanet("Moon"),
    rising: { sign: asc.sign, degree: ascDeg, minute: ascMin, house: 1, name: "Ascendant" },
    planets: planets.map((p: any) => ({
      sign: p.sign,
      degree: Math.floor(p.signDegree),
      minute: Math.round((p.signDegree - Math.floor(p.signDegree)) * 60),
      house: p.house || 1,
      name: p.name
    })),
    elements,
    modalities,
    lifePathNumber: lpn,
    overallAverageScore: 82,
  };
}

// ─── Compact Premium CTA (replaces huge blurred gates) ───
function CompactPremiumCTA({ label, description, onUnlock }: { label: string; description: string; onUnlock?: () => void }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
        <Lock className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white/80">{label}</h4>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onUnlock}
        className="shrink-0 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
      >
        Unlock
      </button>
    </div>
  );
}

// ─── Expandable Full Premium Lock (used only for landing page) ───
function PremiumGate({ label, isPremium, isUserData, onEnterBirthInfo, children }: { label: string; isPremium: boolean; isUserData?: boolean; onEnterBirthInfo?: () => void; children: React.ReactNode }) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden group">
      <div className="blur-[10px] pointer-events-none select-none opacity-40 transition-all duration-500 group-hover:blur-[12px] group-hover:opacity-30">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/20 backdrop-blur-[1px]">
        <div className="flex flex-col items-center gap-4 px-8 py-6 rounded-3xl bg-background/90 border border-primary/20 shadow-[0_0_40px_rgba(212,175,55,0.15)] max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h4 className="text-lg font-bold text-foreground">{label}</h4>
          
          {!isUserData ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">Enter your birth details to unlock your personalized analysis.</p>
              <button
                onClick={onEnterBirthInfo}
                className="w-full py-3 rounded-full bg-primary/10 border border-primary/40 text-primary text-sm font-bold hover:bg-primary/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Enter Birth Info
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">Upgrade to Premium to unlock your full cosmic blueprint.</p>
              <a
                href="/#pricing"
                className="w-full py-3 rounded-full bg-primary/10 border border-primary/40 text-primary text-sm font-bold hover:bg-primary/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)] flex items-center justify-center gap-2"
              >
                Unlock Analysis
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function KlineClient({ userTier, isLoggedIn = false }: { userTier: string; isLoggedIn?: boolean }) {
  const isPremium = userTier === 'PREMIUM';
  const isLite = userTier === 'STANDARD';
  const klineYears = isPremium ? 100 : isLite ? 20 : 10;
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [isUserData, setIsUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [showChartDetails, setShowChartDetails] = useState(true);
  const { open: openBirthModal } = useBirthInfoModal();

  // Content States for AI Generator
  const [destinyReading, setDestinyReading] = useState(MOCK_DESTINY_READING);
  const [radarData, setRadarData] = useState(MOCK_RADAR_DATA);
  const [next30Days, setNext30Days] = useState(MOCK_NEXT_30_DAYS);
  const [transitDetails, setTransitDetails] = useState(MOCK_TRANSIT_DETAILS);

  // Registration nudge & quota modal state
  const [showNudge, setShowNudge] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({ used: 0, total: 2, isLifetime: true, userTier: 'FREE' });
  const [currentBirthData, setCurrentBirthData] = useState<BirthData | null>(null);
  const [showPricingInline, setShowPricingInline] = useState(false);

  // Open inline pricing modal
  const openPricing = () => {
    trackEvent('pricing_modal_open', { source: 'kline_result' });
    setShowPricingInline(true);
  };

  const handleCalculateBirthData = useCallback(async (birthData: BirthData) => {
    setIsLoading(true);
    setDataReady(false);
    animationDoneRef.current = false;

    try {
      // Parse date
      const [year, month, day] = birthData.date.split('-').map(Number);
      const timezone = -(new Date().getTimezoneOffset() / 60);

      const response = await fetch('/api/astrology/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day,
          timeSlot: birthData.timeSlot,
          timezone,
          latitude: birthData.lat,
          longitude: birthData.lon,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const newProfile = apiToProfile(result.data, birthData);
        setProfile(newProfile);
        setIsUserData(true);
        setCurrentBirthData(birthData);
        trackEvent('kline_result_loaded');

        // Auto-save for logged-in users
        if (isLoggedIn) {
          fetch('/api/kline/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isSelf: true,
              label: birthData.name || 'Me',
              birthDate: birthData.date,
              birthTime: birthData.timeSlot,
              birthPlace: birthData.location,
              birthLat: String(birthData.lat),
              birthLng: String(birthData.lon),
              klineResult: { profile: newProfile, rawApiData: result.data },
            }),
          }).catch(err => console.error('Auto-save error:', err));
        } else {
          // Cache result to localStorage for later migration after signup
          saveKlineResult({ profile: newProfile, rawApiData: result.data, birthData });
          // Show registration nudge after 3 seconds for non-logged-in users
          setTimeout(() => setShowNudge(true), 3000);
        }

        // Fetch AI readings in background
        Promise.all([
          fetch('/api/astrology/destiny-reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: newProfile })
          }).then(res => res.json()),
          fetch('/api/astrology/daily-transit', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ profile: newProfile })
          }).then(res => res.json())
        ]).then(([destinyRes, transitRes]) => {
           if (destinyRes.success && destinyRes.data) {
             setRadarData(destinyRes.data.radarData);
             setDestinyReading(destinyRes.data.destinyReading);
             setNext30Days(destinyRes.data.next30Days);
           }
           if (transitRes.success && transitRes.data) {
             const year = new Date().getFullYear();
             setTransitDetails({ [year]: transitRes.data.transits });
           }
        }).catch(err => console.error("AI Generation Error: ", err));

      } else {
        console.error("API Error:", result.error);
      }
    } catch (err) {
      console.error("Failed to fetch natal chart:", err);
    } finally {
      setDataReady(true);
    }
  }, []);

  const animationDoneRef = useRef(false);

  const handleLoaderComplete = useCallback(() => {
    animationDoneRef.current = true;
    // If data is already ready, dismiss loading immediately
    if (dataReady) {
      setIsLoading(false);
      if (isUserData) {
        setTimeout(() => document.getElementById('kline-hero')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [dataReady, isUserData]);

  // When data becomes ready, check if animation is also done
  useEffect(() => {
    if (dataReady && animationDoneRef.current && isLoading) {
      setIsLoading(false);
      if (isUserData) {
        setTimeout(() => document.getElementById('kline-hero')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [dataReady, isLoading, isUserData]);

  // Load from cache on mount (silent — no loading overlay for cache restore)
  useEffect(() => {
    const saved = getSavedBirthData();
    if (saved) {
      // Silently load from cache without showing loading overlay
      const loadCached = async () => {
        try {
          const [year, month, day] = saved.date.split('-').map(Number);
          const timezone = -(new Date().getTimezoneOffset() / 60);
          const response = await fetch('/api/astrology/natal-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              year, month, day,
              timeSlot: saved.timeSlot,
              timezone,
              latitude: saved.lat,
              longitude: saved.lon,
            }),
          });
          const result = await response.json();
          if (result.success && result.data) {
            const newProfile = apiToProfile(result.data, saved);
            setProfile(newProfile);
            setIsUserData(true);
            setCurrentBirthData(saved);
          }
        } catch (err) {
          console.error('Cache restore error:', err);
        }
      };
      loadCached();
    }
  }, []);

  const handleGetMyKline = () => {
    openBirthModal(handleCalculateBirthData);
  };

  return (
    <div className="min-h-screen bg-background astro-starfield">

      {/* ===== THEATRICAL LOADER OVERLAY ===== */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
          <AstrologyLoader
            isLoading={isLoading}
            onComplete={handleLoaderComplete}
            durationMs={6000}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* =================== RESULT PAGE (有数据) =================== */}
      {/* ============================================================ */}
      {isUserData ? (
        <>
          {/* ── Identity Bar ── */}
          <div className="mt-16 bg-[#0A0A0F]/90 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
                <span className="text-sm font-medium text-white/80">{profile.name}</span>
                <span className="text-white/15">|</span>
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/40">
                  <Sun className="w-3 h-3 text-yellow-500/60" />
                  <span>{profile.sun.sign}</span>
                  <Moon className="w-3 h-3 text-blue-400/60" />
                  <span>{profile.moon.sign}</span>
                  <ArrowUp className="w-3 h-3 text-purple-400/60" />
                  <span>{profile.rising.sign}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChartDetails(!showChartDetails)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] font-medium hover:bg-white/10 transition-all flex items-center gap-1"
                >
                  Chart Details
                  {showChartDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleGetMyKline}
                  className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
                >
                  Recalculate
                </button>
              </div>
            </div>
          </div>

          {/* ── Professional settings ── */}
          <ChartSettingsPanel />

          {/* ── Expandable Chart Details Panel ── */}
          <div className={cn(
            "overflow-hidden transition-all duration-500 bg-[#0A0A0F]/50 border-b border-white/5",
            showChartDetails ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <ChartHero profile={profile} />
          </div>

          {/* ── HERO: K-Line Chart (首屏核心 ≈ 100% viewport) ── */}
          <section id="kline-hero" className="pt-4 pb-4 md:pb-6 max-w-7xl mx-auto px-2 md:px-6">
            <div className="relative">
              <InteractiveChart
                data={MOCK_KLINE_DATA}
                transitDetails={transitDetails}
                onNodeClick={(year) => setSelectedYear(year)}
                selectedYear={selectedYear}
                visibleYears={Math.min(klineYears, MOCK_KLINE_DATA.length)}
                totalYears={klineYears}
              />
            </div>
          </section>

          {/* ── AI Personality Insight (直接展示) ── */}
          <section className="max-w-7xl mx-auto px-3 md:px-6 pb-4 md:pb-6">
            <AiPersonalityInsight profile={profile} isPremium={isPremium} />
          </section>

                   {/* ── Deep Analysis: ReadingSummary (直接展示) ── */}
           {isPremium ? (
             <div className="space-y-10 py-10 border-t border-white/5">
               <section id="reading" className="max-w-7xl mx-auto"><ReadingSummary reading={destinyReading} /></section>
               <section id="radar" className="max-w-7xl mx-auto px-4 md:px-6"><LifeRadar data={radarData} /></section>
               <section id="energy" className="max-w-7xl mx-auto px-4 md:px-6"><CurrentEnergy /></section>
               <section id="next30" className="max-w-7xl mx-auto px-4 md:px-6"><Next30Days data={next30Days} /></section>
             </div>
           ) : (
             <>
               {/* ── FREE: Cosmic Personality Profile (5 dimensions) ── */}
               <section className="max-w-7xl mx-auto px-3 md:px-6 py-8 border-t border-white/5">
                 <CosmicPersonalityProfile profile={profile} />
               </section>

               {/* ── FREE: Life Radar (visible but simplified) ── */}
               <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 border-t border-white/5">
                 <LifeRadar data={radarData} />
               </section>

               {/* ── Premium-only: Deep Analysis locked ── */}
               <section className="max-w-7xl mx-auto px-3 md:px-6 pb-8 md:pb-10 border-t border-white/5 pt-8">
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 mb-4">
                     <Sparkles className="w-4 h-4 text-primary" />
                     <h3 className="text-lg font-serif text-white/80">Go Deeper — Premium Only</h3>
                     <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                   </div>
                   <CompactPremiumCTA label="10-Year Cosmic Diagnosis" description="Deep AI analysis of your chart structure, life phases, turning points, and strategic directives across career, wealth, relationships, health, and timing." onUnlock={openPricing} />
                   <CompactPremiumCTA label="Current Cosmic Energy" description="Real-time planetary transits affecting your chart right now, with daily impact scores and personalized advice." onUnlock={openPricing} />
                   <CompactPremiumCTA label="Next 30 Days Forecast" description="Moon-phase aligned dos and don'ts for the coming month based on your natal chart." onUnlock={openPricing} />
                 </div>
               </section>
             </>
           )}
          {/* ── Minimal Footer ── */}
          <section className="mt-4 pb-8">
            <ReportFooter profile={profile} />
          </section>
        </>
      ) : (
        /* ============================================================ */
        /* =================== LANDING PAGE (无数据) =================== */
        /* ============================================================ */
        <>
          {/* Sample Data Banner */}
          <div className="sticky top-16 z-50 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <Eye className="w-3 h-3" />
                  Sample Preview
                </div>
                <p className="text-sm text-muted-foreground">
                  This is a demo chart for <span className="text-foreground font-medium">Alexander</span>. Enter your birthday to see <strong className="text-primary">your own</strong> K-Line.
                </p>
              </div>
              <button
                onClick={handleGetMyKline}
                className="shrink-0 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Get My Own K-Line
              </button>
            </div>
          </div>

          {/* Landing Hero */}
          <section id="profile" className="pt-8 max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center mb-8 text-center pt-8">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-serif">
                Deep Space <span className="text-[#D4AF37]">Natal Matrix</span>
              </h1>
              <p className="max-w-xl text-muted-foreground mb-8 text-base md:text-lg">
                Decode your precise cosmic geometry. Enter your birth coordinates to let the Swiss Ephemeris engine calculate your archetypal blueprint and 10-year trajectory.
              </p>
              <TrustBadge className="justify-center" />
            </div>
            <ChartHero profile={profile} />
            <div className="mt-6">
              <TrustEvidenceBar birthLocation={profile.birthLocation} calculatedAt={new Date().toISOString()} />
            </div>
          </section>

          <section id="kline" className="relative pb-16 max-w-7xl mx-auto px-6">
            <InteractiveChart
              data={MOCK_KLINE_DATA}
              transitDetails={transitDetails}
              onNodeClick={(year) => setSelectedYear(year)}
              selectedYear={selectedYear}
            />
          </section>

          {/* Deep Analysis Preview for landing — shown freely (demo data, no locks) */}
          <div className="py-16 space-y-16 bg-background/50 backdrop-blur-sm border-y border-white/5">
            <section id="radar"><LifeRadar data={radarData} /></section>
            <section id="reading"><ReadingSummary reading={destinyReading} /></section>
          </div>

          {/* SEO Landing Page Blocks */}
          <div className="max-w-7xl mx-auto px-6">
            <ToolHowItWorks section={KLINE_SEO_CONTENT.howItWorks} className="pt-32" />
            <ToolFeatures section={KLINE_SEO_CONTENT.features} />
            <ToolAudience section={KLINE_SEO_CONTENT.audience} />
          </div>

          <div className="py-24">
            <UpgradeBanner context="kline" onUpgradeClick={openPricing} />
          </div>

          <ToolCrossLinks />
          <AstroFaq section={{ id: "faq" }} className="!pt-0" />

          <section id="report-footer" className="mt-20">
            <ReportFooter profile={profile} />
          </section>
        </>
      )}

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowPricingInline(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative max-w-lg w-full mx-4 rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-xl shadow-[0_0_60px_rgba(212,175,55,0.15)] p-8 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPricingInline(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Unlock Your Full Blueprint</h3>
              <p className="text-sm text-muted-foreground mt-2">Choose a plan to unlock your complete 10-year destiny K-Line and deep analysis.</p>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Standard', price: '$199', desc: '1-2 Year Future K-Line + Career & Love tracks', id: 'standard' },
                { name: 'Premium', price: '$299', desc: 'Full 10+ Year K-Line + All 4 dimensions + AI Deep Chat', id: 'premium', featured: true },
              ].map(plan => (
                <a
                  key={plan.id}
                  href={`/pricing`}
                  onClick={() => trackEvent('pricing_plan_click', { plan: plan.id, source: 'inline_modal' })}
                  className={cn(
                    "block p-5 rounded-xl border transition-all hover:scale-[1.02]",
                    plan.featured
                      ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-foreground">{plan.name}</h4>
                    <span className="text-primary font-bold text-lg">{plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                </a>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground/50 font-mono mt-6">
              7-day money-back guarantee · Secure checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
