'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { LifeRadar } from '@/components/astrokline/kline/life-radar';
import { ReadingSummary } from '@/components/astrokline/kline/reading-summary';
import { CurrentEnergy } from '@/components/astrokline/kline/current-energy';
import { Next30Days } from '@/components/astrokline/kline/next-30-days';
import { ReportFooter } from '@/components/astrokline/kline/report-footer';
import { useBirthInfoModal, getSavedBirthData, getSavedKlineResult, clearSavedKlineResult } from '@/components/astrokline/ui/birth-info-context';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import { QuotaLimitModal } from '@/components/astrokline/kline/quota-limit-modal';
import { ExportPdfButton } from '@/components/astrokline/kline/export-pdf-button';
import { ReferralCard } from '@/components/astrokline/kline/referral-card';
import { Lock, Sparkles, ChevronDown, Plus, Star, Trash2, ArrowLeft, User, Share2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
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

interface KlineItem {
  id: string;
  isSelf: boolean;
  label: string;
  birthDate: string;
  birthTime: string | null;
  birthPlace: string;
  klineResult: any;
  createdAt: string;
}

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

function PremiumGate({ label, isPremium, children }: { label: string; isPremium: boolean; children: React.ReactNode }) {
  if (isPremium) return <>{children}</>;
  return (
    <div className="relative overflow-hidden group">
      <div className="blur-[10px] pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/20 backdrop-blur-[1px]">
        <div className="flex flex-col items-center gap-4 px-8 py-6 rounded-3xl bg-background/90 border border-primary/20 shadow-[0_0_40px_rgba(212,175,55,0.15)] max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"><Lock className="w-5 h-5 text-primary" /></div>
          <h4 className="text-lg font-bold">{label}</h4>
          <a href="/settings/billing" className="w-full py-3 rounded-full bg-primary/10 border border-primary/40 text-primary text-sm font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2">Upgrade Now</a>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
//  KLine Card for List View
// ──────────────────────────────────────
function KlineCard({ kline, onView, onDelete }: { kline: KlineItem; onView: () => void; onDelete: () => void }) {
  const profile = kline.klineResult?.profile;
  const sunSign = profile?.sun?.sign || '—';
  const moonSign = profile?.moon?.sign || '—';
  const [shareStatus, setShareStatus] = useState<'idle' | 'loading' | 'copied'>('idle');

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareStatus('loading');
    try {
      const res = await fetch('/api/kline/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klineId: kline.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.shareUrl) {
        await navigator.clipboard.writeText(data.data.shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch { setShareStatus('idle'); }
  };

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] cursor-pointer" onClick={onView}>
      {kline.isSelf && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-wider">
          <Star className="w-3 h-3" /> My Chart
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary/70" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{kline.label || 'Unnamed'}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {sunSign} ☉ · {moonSign} ☽ · {kline.birthDate}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={handleShare}
            className={cn(
              "p-2 rounded-lg transition-all",
              shareStatus === 'copied'
                ? "text-green-400 bg-green-500/10"
                : "text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10"
            )}
            title={shareStatus === 'copied' ? 'Copied!' : 'Share'}
          >
            <Share2 className="w-4 h-4" />
          </button>
          {!kline.isSelf && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{kline.birthPlace}</span>
        <span>{new Date(kline.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
//  Main Dashboard Component
// ──────────────────────────────────────
export function DashboardKlineClient({ userTier }: { userTier: string }) {
  const isPremium = userTier === 'PREMIUM';
  const { open: openBirthModal } = useBirthInfoModal();

  // View state: 'list' | 'detail'
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [klines, setKlines] = useState<KlineItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Detail view state
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [destinyReading, setDestinyReading] = useState(MOCK_DESTINY_READING);
  const [radarData, setRadarData] = useState(MOCK_RADAR_DATA);
  const [next30Days, setNext30Days] = useState(MOCK_NEXT_30_DAYS);
  const [transitDetails, setTransitDetails] = useState(MOCK_TRANSIT_DETAILS);

  // Quota modal
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({ used: 0, total: 2, isLifetime: true, userTier: 'FREE' });

  // Fetch KLine list
  const fetchKlines = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/kline/list');
      const data = await res.json();
      if (data.success) setKlines(data.data || []);
    } catch (err) {
      console.error('Failed to fetch KLines:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchKlines(); }, [fetchKlines]);

  // Auto-migrate localStorage data from pre-signup session
  useEffect(() => {
    const cached = getSavedKlineResult();
    const birthData = getSavedBirthData();
    if (cached && birthData) {
      fetch('/api/kline/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData, klineResult: cached }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            clearSavedKlineResult();
            fetchKlines(); // Refresh list
          }
        })
        .catch(err => console.error('Auto-migrate error:', err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // View a saved KLine
  const handleViewKline = useCallback((kline: KlineItem) => {
    if (kline.klineResult?.profile) {
      setProfile(kline.klineResult.profile);
      if (kline.klineResult.radarData) setRadarData(kline.klineResult.radarData);
      if (kline.klineResult.destinyReading) setDestinyReading(kline.klineResult.destinyReading);
      if (kline.klineResult.next30Days) setNext30Days(kline.klineResult.next30Days);
      setView('detail');
    }
  }, []);

  // Delete a KLine
  const handleDeleteKline = useCallback(async (klineId: string) => {
    if (!confirm('Are you sure you want to delete this KLine? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/kline/delete?id=${klineId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKlines(prev => prev.filter(k => k.id !== klineId));
      }
    } catch (err) {
      console.error('Failed to delete KLine:', err);
    }
  }, []);

  // New KLine query (check quota first)
  const handleNewQuery = useCallback(async () => {
    try {
      const res = await fetch('/api/kline/quota');
      const data = await res.json();
      if (data.success && !data.data.hasQuota) {
        setQuotaInfo(data.data);
        setShowQuotaModal(true);
        return;
      }
    } catch {}

    openBirthModal(async (birthData: BirthData) => {
      setIsCalculating(true);
      try {
        const [year, month, day] = birthData.date.split('-').map(Number);
        const timezone = -(new Date().getTimezoneOffset() / 60);
        const response = await fetch('/api/astrology/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, month, day, timeSlot: birthData.timeSlot, timezone, latitude: birthData.lat, longitude: birthData.lon }),
        });
        const result = await response.json();
        if (result.success && result.data) {
          const newProfile = apiToProfile(result.data, birthData);

          // Save to DB
          await fetch('/api/kline/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isSelf: false,
              label: birthData.name || 'Friend',
              birthDate: birthData.date,
              birthTime: birthData.timeSlot,
              birthPlace: birthData.location,
              birthLat: String(birthData.lat),
              birthLng: String(birthData.lon),
              klineResult: { profile: newProfile, rawApiData: result.data },
            }),
          });

          // Refresh list
          await fetchKlines();
        }
      } catch (err) {
        console.error('Query error:', err);
      } finally {
        setIsCalculating(false);
      }
    });
  }, [openBirthModal, fetchKlines]);

  const handleLoaderComplete = useCallback(() => setIsCalculating(false), []);

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="space-y-6 pb-24">
        {isCalculating && (
          <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center">
            <AstrologyLoader isLoading={isCalculating} onComplete={handleLoaderComplete} durationMs={5000} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> My K-Line Collection
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {klines.length === 0 ? 'No charts yet. Create your first one!' : `${klines.length} chart${klines.length > 1 ? 's' : ''} saved`}
            </p>
          </div>
          <button
            onClick={handleNewQuery}
            className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Query
          </button>
        </div>

        {/* List */}
        {isLoadingList ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : klines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Charts Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">Enter your birth details to generate your personal K-Line, or query a friend&apos;s chart.</p>
            <button
              onClick={handleNewQuery}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Chart
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {klines.map(kline => (
              <KlineCard
                key={kline.id}
                kline={kline}
                onView={() => handleViewKline(kline)}
                onDelete={() => handleDeleteKline(kline.id)}
              />
            ))}
          </div>
        )}

        {/* Referral Card */}
        <ReferralCard />

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

  // ── DETAIL VIEW ──
  return (
    <div className="space-y-12 pb-24">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </button>
        <ExportPdfButton
          targetId="kline-report"
          fileName={`kline-${profile.name || 'report'}`}
        />
      </div>

      <div id="kline-report">
      <ChartHero profile={profile} />

      <section id="kline" className="relative">
        <InteractiveChart
          data={MOCK_KLINE_DATA}
          transitDetails={transitDetails}
          onNodeClick={(year) => setSelectedYear(year)}
          selectedYear={selectedYear}
        />
      </section>

      <div className="pt-12 space-y-16 border-t border-white/5">
        <PremiumGate label="Life Radar (All Dimensions)" isPremium={isPremium}>
          <LifeRadar data={radarData} />
        </PremiumGate>
        <PremiumGate label="AI Destiny Reading" isPremium={isPremium}>
          <ReadingSummary reading={destinyReading} />
        </PremiumGate>
        <PremiumGate label="Current Cosmic Energy" isPremium={isPremium}>
          <CurrentEnergy />
        </PremiumGate>
        <PremiumGate label="Next 30 Days Forecast" isPremium={isPremium}>
          <Next30Days data={next30Days} />
        </PremiumGate>
      </div>
      </div> {/* end #kline-report */}

      <ReportFooter profile={profile} />
    </div>
  );
}
