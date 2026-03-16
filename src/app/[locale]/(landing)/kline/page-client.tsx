'use client';

import { useState, useCallback, useEffect } from 'react';
import { BarChart3, Star, Brain, Clock } from 'lucide-react';
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
// AstrologyLoader removed — using lightweight spinner instead
import { ChartSettingsPanel } from '@/components/astrokline/kline/chart-settings-panel';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { DestinySummaryCard } from '@/components/astrokline/kline/destiny-summary-card';
import { LifeStageScores } from '@/components/astrokline/kline/life-stage-scores';
import { AstrologyChartWheel } from '@/components/astrokline/kline/astrology-chart-wheel';
import { CrossLinkCard } from '@/components/astrokline/shared/cross-link-card';
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

// ─── Floating Mini Nav ───
function FloatingNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const items = [
    { id: 'kline-hero', icon: BarChart3, label: 'Chart' },
    { id: 'natal-chart', icon: Star, label: 'Natal Chart' },
    { id: 'ai-insight', icon: Brain, label: 'AI Reading' },
    { id: 'daily-link', icon: Clock, label: 'Transits' },
  ];
  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className="group flex items-center gap-2 p-2 rounded-xl bg-[#0A0A0F]/80 border border-white/10 hover:border-primary/30 backdrop-blur-md transition-all hover:scale-105"
          title={item.label}
        >
          <item.icon className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
          <span className="text-[10px] text-white/0 group-hover:text-white/60 transition-all w-0 group-hover:w-14 overflow-hidden whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
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
  // All users get 100-year K-Line free
  const isPremium = true; // always treat as premium for content visibility
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [isUserData, setIsUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(false);
      setTimeout(() => document.getElementById('kline-hero')?.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);

  // Load from cache on mount, or auto-open birth modal if no data
  useEffect(() => {
    const saved = getSavedBirthData();
    if (saved) {
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
    } else {
      // No saved data — auto-open birth info modal after brief delay
      const t = setTimeout(() => openBirthModal(handleCalculateBirthData), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleGetMyKline = () => {
    openBirthModal(handleCalculateBirthData);
  };

  return (
    <div className="min-h-screen bg-background astro-starfield">

      {/* ===== LIGHTWEIGHT LOADING SPINNER ===== */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-white/50 font-mono animate-pulse">Calculating natal positions...</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* =================== RESULT PAGE (有数据) =================== */}
      {/* ============================================================ */}
      {isUserData ? (
        <>
          {/* ── Identity Bar ── */}
          <div className="mt-16 bg-[#0A0A0F]/90 border-b border-white/5">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
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

          {/* ─── FloatingNav (右侧浮动导航) ─── */}
          <FloatingNav />

          {/* ── 1. HERO IDENTITY CARD (全宽分数卡) ── */}
          <ReportSection id="destiny-summary" divider={false} className="pt-6 pb-4">
            <DestinySummaryCard
              profile={profile}
              klineData={MOCK_KLINE_DATA}
            />
          </ReportSection>

          {/* ── 2. K-LINE CHART ── */}
          <ReportSection id="kline-hero" divider={false} className="pt-2 pb-4">
            <InteractiveChart
              data={MOCK_KLINE_DATA}
              transitDetails={transitDetails}
              onNodeClick={(year) => setSelectedYear(year)}
              selectedYear={selectedYear}
            />
          </ReportSection>

          {/* ── 3. LIFE STAGE SCORES ── */}
          <ReportSection id="life-stages" divider={false} className="pb-4">
            <LifeStageScores
              data={MOCK_KLINE_DATA}
              birthYear={parseInt(profile.birthDate?.split('-')[0] || '1990')}
            />
          </ReportSection>

          {/* ── 4. NATAL CHART (星盘 + 行星表格) ── */}
          <ReportSection id="natal-chart">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-[#15131A]/30 p-4 flex items-center justify-center">
                <AstrologyChartWheel planets={profile.planets} rising={profile.rising} size={320} />
              </div>
              <ChartHero profile={profile} />
            </div>
          </ReportSection>

          {/* ── 5. AI DEEP READING CTA ── */}
          <ReportSection id="ai-insight" divider={false} className="pb-4">
            <AiPersonalityInsight profile={profile} isPremium={isPremium} />
          </ReportSection>

          {/* ── 6. COSMIC PERSONALITY + DEEP ANALYSIS ── */}
          <ReportSection id="personality">
            <CosmicPersonalityProfile profile={profile} />
          </ReportSection>
          <ReportSection id="radar"><LifeRadar data={radarData} /></ReportSection>
          <ReportSection id="energy"><CurrentEnergy /></ReportSection>
          <ReportSection id="reading"><ReadingSummary reading={destinyReading} /></ReportSection>
          <ReportSection id="next30"><Next30Days data={next30Days} /></ReportSection>

          {/* ── 7. Daily Cross-Link ── */}
          <ReportSection id="daily-link">
            <CrossLinkCard target="daily" />
          </ReportSection>

          {/* ── 8. Footer ── */}
          <ReportSection id="report-footer" className="pb-12">
            <ReportFooter profile={profile} />
          </ReportSection>
        </>
      ) : (
        /* ============================================================ */
        /* ======= EMPTY STATE — Auto-opens BirthInfoModal =========== */
        /* ============================================================ */
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white/90 mb-3">
            Your Destiny K-Line
          </h1>
          <p className="text-sm text-white/50 mb-8 leading-relaxed max-w-md">
            Enter your birth details to calculate your personalized cosmic trajectory — peaks, valleys, and turning points mapped across your lifetime.
          </p>
          <button
            onClick={handleGetMyKline}
            className="px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 hover:scale-105 transition-all"
          >
            Enter Birth Info
          </button>
        </div>
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
