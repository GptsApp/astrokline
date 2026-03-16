'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { LifeRadar } from '@/components/astrokline/kline/life-radar';
import { ReportFooter } from '@/components/astrokline/kline/report-footer';
import { useBirthInfoModal, getSavedBirthData, saveKlineResult } from '@/components/astrokline/ui/birth-info-context';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { LifeStageScores } from '@/components/astrokline/kline/life-stage-scores';
import { CrossLinkCard } from '@/components/astrokline/shared/cross-link-card';
import { AiPersonalityInsight } from '@/components/astrokline/kline/ai-personality-insight';
import { RegistrationNudge } from '@/components/astrokline/kline/registration-nudge';
import { QuotaLimitModal } from '@/components/astrokline/kline/quota-limit-modal';
import { AstrologyChartWheel } from '@/components/astrokline/kline/astrology-chart-wheel';
import { Sparkles, Sun, Moon, ArrowUp, BarChart3, Star, Brain, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { trackEvent } from '@/lib/astrokline/track-event';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import type { BirthData } from '@/components/astrokline/ui/birth-info-context';
import {
  MOCK_USER_PROFILE,
  MOCK_KLINE_DATA,
  MOCK_TRANSIT_DETAILS,
  MOCK_DESTINY_READING,
  MOCK_NEXT_30_DAYS,
  MOCK_RADAR_DATA,
} from '@/lib/astrokline/mock-astrology-data';

// ─── API to Profile mapper ───
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
    const el = elementMap[p.sign]; const mod = modalityMap[p.sign];
    if (el) (elCounts as any)[el]++; if (mod) (modCounts as any)[mod]++;
  });
  const elements = {
    fire: Math.round((elCounts.fire / total) * 100), earth: Math.round((elCounts.earth / total) * 100),
    air: Math.round((elCounts.air / total) * 100), water: Math.round((elCounts.water / total) * 100),
  };
  const modalities = {
    cardinal: Math.round((modCounts.cardinal / total) * 100), fixed: Math.round((modCounts.fixed / total) * 100),
    mutable: Math.round((modCounts.mutable / total) * 100),
  };
  const dateDigits = birthData.date.replace(/-/g, "").split("").map(Number);
  let lpn = dateDigits.reduce((a, b) => a + b, 0);
  while (lpn > 9 && lpn !== 11 && lpn !== 22) lpn = String(lpn).split("").map(Number).reduce((a, b) => a + b, 0);
  return {
    name: birthData.name, birthDate: birthData.date,
    birthTime: birthData.timeSlot === "unknown" ? "12:00" : birthData.timeSlot.split("-")[0],
    birthLocation: birthData.location,
    sun: findPlanet("Sun"), moon: findPlanet("Moon"),
    rising: { sign: asc.sign, degree: ascDeg, minute: ascMin, house: 1, name: "Ascendant" },
    planets: planets.map((p: any) => ({ sign: p.sign, degree: Math.floor(p.signDegree), minute: Math.round((p.signDegree - Math.floor(p.signDegree)) * 60), house: p.house || 1, name: p.name })),
    elements, modalities, lifePathNumber: lpn, overallAverageScore: 82,
  };
}

// ─── Floating Mini Nav ───
function FloatingNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const items = [
    { id: 'kline-chart', icon: BarChart3, label: 'K-Line' },
    { id: 'natal-chart', icon: Star, label: 'Natal' },
    { id: 'ai-reading', icon: Brain, label: 'AI' },
    { id: 'daily-link', icon: Clock, label: 'Daily' },
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
          <span className="text-[10px] text-white/0 group-hover:text-white/60 transition-all w-0 group-hover:w-10 overflow-hidden whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Hero Score Card ───
function HeroScoreCard({ profile, klineData }: { profile: UserProfile; klineData: typeof MOCK_KLINE_DATA }) {
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(profile.birthDate?.split('-')[0] || '1990');
  const currentAge = currentYear - birthYear;
  const currentData = klineData[Math.min(currentAge, klineData.length - 1)];
  const prevData = klineData[Math.max(0, Math.min(currentAge - 1, klineData.length - 1))];
  const score = currentData?.score || 50;
  const trend = score - (prevData?.score || 50);

  // Dominant element
  const el = profile.elements;
  const dominant = Object.entries(el).sort(([,a], [,b]) => b - a)[0];
  const elementEmoji: Record<string, string> = { fire: '🔥', earth: '🌍', air: '💨', water: '💧' };
  const elementName: Record<string, string> = { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' };

  return (
    <div className="relative w-full max-w-sm mx-auto text-center py-6">
      {/* Glow */}
      <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative space-y-3">
        {/* Score Circle */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full border-2 border-primary/40 bg-primary/5 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <span className="text-2xl sm:text-3xl font-bold text-primary leading-none">{score}</span>
          <span className="text-[8px] font-mono text-white/40 mt-0.5">{currentYear} Score</span>
        </div>

        {/* Trend */}
        <div className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
          trend > 0 ? "bg-emerald-500/10 text-emerald-400" : trend < 0 ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-white/40"
        )}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {trend > 0 ? 'Rising' : trend < 0 ? 'Declining' : 'Stable'}
        </div>

        {/* Name & Birth Year */}
        <p className="text-sm text-white/60">{profile.name} · Born {birthYear}</p>

        {/* Dominant Element */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          {elementEmoji[dominant[0]] || '✦'} {elementName[dominant[0]] || 'Unknown'} Dominant
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export function KlineClient({ userTier, isLoggedIn = false }: { userTier: string; isLoggedIn?: boolean }) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [isUserData, setIsUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const { open: openBirthModal } = useBirthInfoModal();

  // Content States
  const [transitDetails, setTransitDetails] = useState(MOCK_TRANSIT_DETAILS);
  const [radarData, setRadarData] = useState(MOCK_RADAR_DATA);

  // Registration nudge & quota modal state
  const [showNudge, setShowNudge] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({ used: 0, total: 2, isLifetime: true, userTier: 'FREE' });
  const [currentBirthData, setCurrentBirthData] = useState<BirthData | null>(null);

  // ─── Data Calculation ───
  const handleCalculateBirthData = useCallback(async (birthData: BirthData) => {
    setIsLoading(true);

    try {
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
          // Cache result + show registration nudge
          saveKlineResult({ profile: newProfile, rawApiData: result.data, birthData });
          setTimeout(() => setShowNudge(true), 3000);
        }

        // Fetch transit data in background
        fetch('/api/astrology/daily-transit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: newProfile })
        }).then(res => res.json()).then(transitRes => {
          if (transitRes.success && transitRes.data) {
            const yr = new Date().getFullYear();
            setTransitDetails({ [yr]: transitRes.data.transits });
          }
        }).catch(err => console.error("Transit fetch error:", err));

        // Scroll to results
        setTimeout(() => document.getElementById('kline-chart')?.scrollIntoView({ behavior: 'smooth' }), 200);
      } else {
        console.error("API Error:", result.error);
      }
    } catch (err) {
      console.error("Failed to fetch natal chart:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // ─── Load from cache or auto-open modal ───
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
      const t = setTimeout(() => openBirthModal(handleCalculateBirthData), 500);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGetMyKline = () => {
    openBirthModal(handleCalculateBirthData);
  };

  const birthYear = parseInt(profile.birthDate?.split('-')[0] || '1990');

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background astro-starfield">

      {/* ── Loading Spinner (lightweight, no theatrical animation) ── */}
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
          {/* ── Floating Mini Nav (desktop only) ── */}
          <FloatingNav />

          {/* ── Identity Bar (merged into page, below global header) ── */}
          <div className="mt-16 bg-[#0A0A0F]/90 border-b border-white/5">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
                <span className="text-sm font-medium text-white/80">{profile.name}</span>
                <span className="text-white/15 hidden sm:inline">|</span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
                  <Sun className="w-3 h-3 text-yellow-500/60" />
                  <span>{profile.sun.sign}</span>
                  <Moon className="w-3 h-3 text-blue-400/60" />
                  <span>{profile.moon.sign}</span>
                  <ArrowUp className="w-3 h-3 text-purple-400/60" />
                  <span>{profile.rising.sign}</span>
                </div>
              </div>
              <button
                onClick={handleGetMyKline}
                className="shrink-0 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
              >
                Recalculate
              </button>
            </div>
          </div>

          {/* ── 1. Hero Score Card ── */}
          <ReportSection id="hero-score" divider={false} className="pt-6 pb-2">
            <HeroScoreCard profile={profile} klineData={MOCK_KLINE_DATA} />
          </ReportSection>

          {/* ── 2. K-Line Chart (100 years, all free) ── */}
          <ReportSection id="kline-chart" divider={false} className="pt-2 pb-4">
            <InteractiveChart
              data={MOCK_KLINE_DATA}
              transitDetails={transitDetails}
              onNodeClick={(year) => setSelectedYear(year)}
              selectedYear={selectedYear}
            />
          </ReportSection>

          {/* ── 3. Life Stage Scores + Summary Stats ── */}
          <ReportSection id="life-stages" divider={false} className="pb-4">
            <LifeStageScores data={MOCK_KLINE_DATA} birthYear={birthYear} />
          </ReportSection>

          {/* ── 4. Natal Chart — Chart Wheel + Planet Table ── */}
          <ReportSection id="natal-chart" className="pb-4">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary/60" />
                <h3 className="text-lg font-serif text-white/90">Natal Chart</h3>
                <span className="text-[10px] font-mono text-white/30 ml-auto">Swiss Ephemeris DE431 · Tropical · Placidus</span>
              </div>

              {/* Two column on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Wheel */}
                <div className="rounded-2xl border border-white/5 bg-[#15131A]/30 p-4 flex items-center justify-center">
                  <AstrologyChartWheel planets={profile.planets} rising={profile.rising} size={320} />
                </div>
                {/* Planet Table */}
                <ChartHero profile={profile} />
              </div>
            </div>
          </ReportSection>

          {/* ── 5. Life Radar ── */}
          <ReportSection id="life-radar" className="pb-4">
            <LifeRadar data={radarData} />
          </ReportSection>

          {/* ── 6. AI Deep Reading CTA (button-triggered) ── */}
          <ReportSection id="ai-reading" className="pb-4">
            <AiPersonalityInsight profile={profile} />
          </ReportSection>

          {/* ── 7. Daily Cross-Link ── */}
          <ReportSection id="daily-link" className="pb-4">
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
      />
    </div>
  );
}
