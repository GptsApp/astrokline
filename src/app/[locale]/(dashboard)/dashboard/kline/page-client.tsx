'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SharedKlineResult } from '@/components/astrokline/kline/shared-kline-result';
import { ChartHero } from '@/components/astrokline/kline/chart-hero';
import { ExportPdfButton } from '@/components/astrokline/kline/export-pdf-button';
import { QuotaLimitModal } from '@/components/astrokline/kline/quota-limit-modal';
import { ReferralCard } from '@/components/astrokline/kline/referral-card';
import { ReportFooter } from '@/components/astrokline/kline/report-footer';
import {
  clearSavedKlineResult,
  getSavedBirthData,
  getSavedKlineResult,
  useBirthInfoModal,
  type BirthData,
} from '@/components/astrokline/ui/birth-info-context';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import {
  type DestinyScorePoint,
  type TransitEvent,
  type UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { apiToProfile } from '@/lib/astrokline/profile-transform';
import {
  ArrowLeft,
  Lock,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { useCheckout } from '@/components/astrokline/checkout/checkout-context';
import { Heading } from "@/components/astrokline/ui/heading";

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

// ──────────────────────────────────────
//  KLine Card for List View
// ──────────────────────────────────────
function KlineCard({
  kline,
  onView,
  onDelete,
}: {
  kline: KlineItem;
  onView: () => void;
  onDelete: () => void;
}) {
  const profile = kline.klineResult?.profile;
  const sunSign = profile?.sun?.sign || '—';
  const moonSign = profile?.moon?.sign || '—';
  const [shareStatus, setShareStatus] = useState<'idle' | 'loading' | 'copied'>(
    'idle'
  );

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
    } catch {
      setShareStatus('idle');
    }
  };

  return (
    <div
      className="group hover:border-primary/30 relative cursor-pointer  border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/8 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]"
      onClick={onView}
    >
      {kline.isSelf && (
        <div className="bg-primary/20 border-primary/40 text-primary absolute -top-2.5 left-4 flex items-center gap-1 border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          <Star className="h-3 w-3" /> My Chart
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center border">
            <User className="text-primary/70 h-5 w-5" />
          </div>
          <div className="min-w-0">
            <Heading level={3} className="text-foreground truncate text-base font-bold">
              {kline.label || 'Unnamed'}
            </Heading>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {sunSign} ☉ · {moonSign} ☽ · {kline.birthDate}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
          <button
            onClick={handleShare}
            className={cn(
              ' p-2 transition-all',
              shareStatus === 'copied'
                ? 'bg-green-500/10 text-green-400'
                : 'text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400'
            )}
            title={shareStatus === 'copied' ? 'Copied!' : 'Share'}
          >
            <Share2 className="h-4 w-4" />
          </button>
          {!kline.isSelf && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-muted-foreground  p-2 transition-all hover:bg-red-500/10 hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
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
  const chartTier = isPremium
    ? 'PRO'
    : userTier === 'STANDARD'
      ? 'LITE'
      : 'FREE';
  const { open: openBirthModal } = useBirthInfoModal();
  const { openCheckout } = useCheckout();

  // View state: 'list' | 'detail'
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [klines, setKlines] = useState<KlineItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Detail view state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const [klineData, setKlineData] = useState<DestinyScorePoint[]>([]);
          const [transitDetails, setTransitDetails] = useState<
    Record<number, TransitEvent[]>
  >({});
  const [dataReady, setDataReady] = useState(false);
  const animationDoneRef = useRef(false);

  // Quota modal
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({
    used: 0,
    total: 2,
    isLifetime: true,
    userTier: 'FREE',
  });

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

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

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
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            clearSavedKlineResult();
            fetchKlines(); // Refresh list
          }
        })
        .catch((err) => console.error('Auto-migrate error:', err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // View a saved KLine
  const handleViewKline = useCallback((kline: KlineItem) => {
    if (kline.klineResult?.profile) {
      setProfile(kline.klineResult.profile);
      setKlineData(
        Array.isArray(kline.klineResult.klineData)
          ? kline.klineResult.klineData
          : []
      );
      setTransitDetails(kline.klineResult.transitDetails ?? {});
                              setSelectedYear(undefined);
      setView('detail');
    }
  }, []);

  // Delete a KLine
  const handleDeleteKline = useCallback(async (klineId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this KLine? This cannot be undone.'
      )
    )
      return;
    try {
      const res = await fetch(`/api/kline/delete?id=${klineId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setKlines((prev) => prev.filter((k) => k.id !== klineId));
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
      setDataReady(false);
      animationDoneRef.current = false;
      try {
        const [year, month, day] = birthData.date.split('-').map(Number);
        const timezone = -(new Date().getTimezoneOffset() / 60);
        const response = await fetch('/api/astrology/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year,
            month,
            day,
            timeSlot: birthData.timeSlot,
            timezone,
            latitude: birthData.lat,
            longitude: birthData.lon,
          }),
        });
        const result = await response.json();
        if (result.success && result.data) {
          const newProfile = {
            ...apiToProfile(result.data, birthData),
            overallAverageScore: result.reportData?.overallAverageScore ?? 82,
          };
          const cachedResult = {
            profile: newProfile,
            birthData,
            rawApiData: result.data,
            klineData: result.reportData?.klineData ?? [],
            transitDetails: result.reportData?.transitDetails ?? {},
          };

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
              klineResult: cachedResult,
            }),
          });

          // Refresh list
          await fetchKlines();
        }
      } catch (err) {
        console.error('Query error:', err);
      } finally {
        setDataReady(true);
      }
    });
  }, [openBirthModal, fetchKlines]);

  const handleLoaderComplete = useCallback(() => {
    animationDoneRef.current = true;
    if (dataReady) {
      setIsCalculating(false);
    }
  }, [dataReady]);

  useEffect(() => {
    if (dataReady && animationDoneRef.current && isCalculating) {
      setIsCalculating(false);
    }
  }, [dataReady, isCalculating]);

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="space-y-6 pb-24">
        {isCalculating && (
          <div className="bg-background/95 fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl">
            <AstrologyLoader
              isLoading={isCalculating}
              onComplete={handleLoaderComplete}
              durationMs={5000}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4  border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:flex-row">
          <div>
            <Heading level={2} className="flex items-center gap-2 text-xl font-bold text-white">
              <Sparkles className="text-primary h-5 w-5" /> My K-Line Collection
            </Heading>
            <p className="text-muted-foreground mt-1 text-sm">
              {klines.length === 0
                ? 'No charts yet. Create your first one!'
                : `${klines.length} chart${klines.length > 1 ? 's' : ''} saved`}
            </p>
          </div>
          <button
            onClick={handleNewQuery}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" /> New Query
          </button>
        </div>

        {/* List */}
        {isLoadingList ? (
          <div className="flex items-center justify-center py-20">
            <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin border-2" />
          </div>
        ) : klines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary/10 border-primary/20 mb-4 flex h-16 w-16 items-center justify-center border">
              <Sparkles className="text-primary/50 h-7 w-7" />
            </div>
            <Heading level={3} className="text-foreground mb-2 text-lg font-bold">
              No Charts Yet
            </Heading>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Enter your birth details to generate your personal K-Line, or
              query a friend&apos;s chart.
            </p>
            <button
              onClick={handleNewQuery}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all"
            >
              <Plus className="h-4 w-4" /> Create First Chart
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {klines.map((kline) => (
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
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Collection
        </button>
        {isPremium ? (
          <ExportPdfButton
            targetId="kline-report"
            fileName={`kline-${profile?.name || 'report'}`}
          />
        ) : (
          <a
            href="/settings/billing"
            className="text-primary hover:border-primary/30 flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all"
          >
            Upgrade to export PDF
          </a>
        )}
      </div>
      <div id="kline-report">
        {profile && (
          <SharedKlineResult
            profile={profile}
            klineData={klineData}
            transitDetails={transitDetails}
            tier={chartTier}
            onActionGate={() => openCheckout('lite')}
            hideFloatingNav={true}
          />
        )}
      </div>
      {profile && <ReportFooter profile={profile} tier={chartTier} onUpgradeClick={() => openCheckout(chartTier === 'FREE' ? 'lite' : 'pro')} />}
    </div>
  );
}
