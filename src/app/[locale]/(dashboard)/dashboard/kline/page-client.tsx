'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SharedKlineResult } from '@/components/astrocurve/kline/shared-kline-result';
import { QuotaLimitModal } from '@/components/astrocurve/kline/quota-limit-modal';
import { ReportFooter } from '@/components/astrocurve/kline/report-footer';
import {
  clearSavedKlineResult,
  getSavedBirthData,
  getSavedKlineResult,
  useBirthInfoModal,
  type BirthData,
} from '@/components/astrocurve/ui/birth-info-context';
import { AstrologyLoader } from '@/components/astrocurve/ui/theatrical-loader';
import {
  type DestinyScorePoint,
  type TransitEvent,
  type UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import type { AiInsightData } from '@/lib/astrokline/ai-insight-cache';
import {
  buildNatalChartPayload,
  enrichBirthDataWithTimezone,
} from '@/lib/astrokline/birth-timezone';
import { apiToProfile } from '@/lib/astrokline/profile-transform';
import {
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { useCheckout } from '@/components/astrocurve/checkout/checkout-context';
import { Heading } from "@/components/astrocurve/ui/heading";
import { shouldSaveChartAsSelf } from '@/shared/lib/kline-ownership';
import { completeOnboardingStep } from '@/components/astrocurve/dashboard/onboarding-guide';

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

  // Tab View State
  const [activeKlineId, setActiveKlineId] = useState<string | null>(null);
  const [klines, setKlines] = useState<KlineItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Detail view state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [klineData, setKlineData] = useState<DestinyScorePoint[]>([]);
  const [transitDetails, setTransitDetails] = useState<Record<number, TransitEvent[]>>({});
  const [radarData, setRadarData] = useState<any[] | null>(null);
  const [next30Days, setNext30Days] = useState<any | null>(null);
  const [aiInsight, setAiInsight] = useState<AiInsightData | null>(null);
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

  // Share status
  const [shareStatus, setShareStatus] = useState<Record<string, 'idle' | 'loading' | 'copied'>>({});

  // Fetch KLine list
  const fetchKlines = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/kline/list');
      const data = await res.json();
      if (data.success && data.data) {
        setKlines(data.data);
        // Automatically select "My Chart" or the first one if not set
        if (data.data.length > 0) {
          setActiveKlineId((prev) => {
            if (!prev) {
               const defaultTab = data.data.find((k: KlineItem) => k.isSelf) || data.data[0];
               // Defer applyKlineData to avoid stale closure inside setState
               queueMicrotask(() => applyKlineData(defaultTab));
               return defaultTab.id;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch KLines:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  // Auto-migrate localStorage data
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
            fetchKlines();
          }
        })
        .catch((err) => console.error('Auto-migrate error:', err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply KLine Data to state
  const applyKlineData = (kline: KlineItem) => {
    if (kline.klineResult?.profile) {
      // Use kline.label as authoritative name to avoid inconsistency
      const profileWithLabel = {
        ...kline.klineResult.profile,
        name: kline.label || kline.klineResult.profile.name || 'Unknown',
      };
      setProfile(profileWithLabel);
      setKlineData(Array.isArray(kline.klineResult.klineData) ? kline.klineResult.klineData : []);
      setTransitDetails(kline.klineResult.transitDetails ?? {});
      setRadarData(kline.klineResult.radarData ?? null);
      setNext30Days(kline.klineResult.next30Days ?? null);
      setAiInsight(kline.klineResult.aiInsight ?? null);
    }
  };

  // View a saved KLine
  const handleViewKline = useCallback((kline: KlineItem) => {
    setActiveKlineId(kline.id);
    applyKlineData(kline);
  }, []);

  // Delete a KLine
  const handleDeleteKline = useCallback(async (klineId: string) => {
    if (!confirm('Are you sure you want to delete this KLine? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/kline/delete?id=${klineId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKlines((prev) => {
          const updated = prev.filter((k) => k.id !== klineId);
          if (activeKlineId === klineId) {
            if (updated.length > 0) {
               handleViewKline(updated[0]);
            } else {
               setActiveKlineId(null);
               setProfile(null);
            }
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to delete KLine:', err);
    }
  }, [activeKlineId, handleViewKline]);

  // Share a KLine
  const handleShare = async (e: React.MouseEvent, klineId: string) => {
    e.stopPropagation();
    setShareStatus((prev) => ({ ...prev, [klineId]: 'loading' }));
    try {
      const res = await fetch('/api/kline/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klineId }),
      });
      const data = await res.json();
      if (data.success && data.data?.shareUrl) {
        await navigator.clipboard.writeText(data.data.shareUrl);
        setShareStatus((prev) => ({ ...prev, [klineId]: 'copied' }));
        setTimeout(() => setShareStatus((prev) => ({ ...prev, [klineId]: 'idle' })), 2000);
      } else {
        setShareStatus((prev) => ({ ...prev, [klineId]: 'idle' }));
      }
    } catch {
      setShareStatus((prev) => ({ ...prev, [klineId]: 'idle' }));
    }
  };

  // New KLine query
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

    const saveAsSelf = shouldSaveChartAsSelf(klines);

    openBirthModal(async (birthData: BirthData) => {
      setIsCalculating(true);
      setDataReady(false);
      animationDoneRef.current = false;
      try {
        const normalizedBirthData = enrichBirthDataWithTimezone(birthData);
        const response = await fetch('/api/astrology/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildNatalChartPayload(normalizedBirthData)),
        });
        const result = await response.json();
        if (result.success && result.data) {
          const newProfile = {
            ...apiToProfile(result.data, normalizedBirthData),
            overallAverageScore: result.reportData?.overallAverageScore ?? 82,
          };
          const cachedResult = {
            profile: newProfile,
            birthData: normalizedBirthData,
            rawApiData: result.data,
            klineData: result.reportData?.klineData ?? [],
            transitDetails: result.reportData?.transitDetails ?? {},
          };

          const saveRes = await fetch('/api/kline/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isSelf: saveAsSelf,
              label: normalizedBirthData.name || (saveAsSelf ? 'Me' : 'Friend'),
              birthDate: normalizedBirthData.date,
              birthTime: normalizedBirthData.timeSlot,
              birthPlace: normalizedBirthData.location,
              birthLat: String(normalizedBirthData.lat),
              birthLng: String(normalizedBirthData.lon),
              klineResult: cachedResult,
            }),
          });
          
          if (saveRes.ok) {
             completeOnboardingStep('create_chart');
             const saveJson = await saveRes.json();
             const persistedKlineResult = saveJson.data?.klineResult ?? cachedResult;
             if (saveJson.data?.id) {
               const nextKline: KlineItem = {
                 id: saveJson.data.id,
                 isSelf: saveJson.data.isSelf,
                 label: saveJson.data.label,
                 birthDate: saveJson.data.birthDate,
                 birthTime: saveJson.data.birthTime ?? null,
                 birthPlace: saveJson.data.birthPlace,
                 klineResult: persistedKlineResult,
                 createdAt: saveJson.data.createdAt ?? new Date().toISOString(),
               };

               setKlines((prev) => {
                 const withoutCurrent = prev.filter((item) => item.id !== nextKline.id);

                 if (nextKline.isSelf) {
                   return [
                     nextKline,
                     ...withoutCurrent.map((item) =>
                       item.isSelf ? { ...item, isSelf: false } : item
                     ),
                   ];
                 }

                 const selfCharts = withoutCurrent.filter((item) => item.isSelf);
                 const otherCharts = withoutCurrent.filter((item) => !item.isSelf);
                 return [...selfCharts, nextKline, ...otherCharts];
               });

               setActiveKlineId(nextKline.id);
               applyKlineData(nextKline);
             }

             void fetchKlines();
          }
        }
      } catch (err) {
        console.error('Query error:', err);
      } finally {
        setDataReady(true);
      }
    });
  }, [fetchKlines, klines, openBirthModal]);

  const handleLoaderComplete = useCallback(() => {
    animationDoneRef.current = true;
    if (dataReady) setIsCalculating(false);
  }, [dataReady]);

  useEffect(() => {
    if (dataReady && animationDoneRef.current && isCalculating) setIsCalculating(false);
  }, [dataReady, isCalculating]);

  // Loading skeleton
  if (isLoadingList && klines.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-[#D4AF37] h-8 w-8 animate-spin rounded-full border-2 border-white/20" />
      </div>
    );
  }

  // ── EMPTY STATE ──
  if (klines.length === 0) {
     return (
       <div className="space-y-6 pb-24">
         <div className="flex flex-col items-center justify-center py-20 text-center">
           <div className="bg-[#D4AF37]/10 border-[#D4AF37]/30 mb-4 flex h-16 w-16 items-center justify-center border">
             <Sparkles className="text-[#D4AF37] h-7 w-7" />
           </div>
           <Heading level={3} className="text-foreground mb-2 text-lg font-bold">
             No Charts Yet
           </Heading>
           <p className="text-muted-foreground mb-6 max-w-sm text-sm">
             Enter your birth details to generate your personal timing curve, or query a friend&apos;s chart.
           </p>
           <button
             onClick={handleNewQuery}
             className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all"
           >
             <Plus className="h-4 w-4" /> Create First Chart
           </button>
         </div>
       </div>
     );
  }

  const activeKline = klines.find((kline) => kline.id === activeKlineId)
    || klines.find((kline) => kline.isSelf)
    || klines[0];
  const activeShareStatus = activeKline ? shareStatus[activeKline.id] || 'idle' : 'idle';
  const activeSunSign = activeKline?.klineResult?.profile?.sun?.sign || '—';
  const activeMoonSign = activeKline?.klineResult?.profile?.moon?.sign || '—';

  // ── UNIFIED TAB VIEW ──
  return (
    <div className="space-y-6 pb-24">
      {/* Astrology Loader Overlay */}
      {isCalculating && (
        <div className="bg-background/95 fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl">
          <AstrologyLoader isLoading={isCalculating} onComplete={handleLoaderComplete} durationMs={5000} />
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl px-4 pt-4 md:px-6">
        <div className="border border-white/[0.08] bg-[#0F0E13]/88 p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#D4AF37]/20 bg-[#D4AF37]/8">
                  {activeKline?.isSelf ? (
                    <Star className="h-5 w-5 text-[#D4AF37]" />
                  ) : (
                    <User className="h-5 w-5 text-white/55" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D4AF37]/65">My Charts</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-serif text-2xl text-white/92">
                      {activeKline?.label || 'Unnamed'}
                    </span>
                    {activeKline?.isSelf ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">My Chart</span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-white/45">
                    <span>{activeSunSign} ☉</span>
                    <span>{activeMoonSign} ☽</span>
                    <span>{activeKline?.birthDate}</span>
                  </div>
                </div>
              </div>

              {activeKline ? (
                <div className="flex items-center gap-2 self-start">
                  <button
                    type="button"
                    className={cn(
                      'flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03] transition-colors',
                      activeShareStatus === 'copied'
                        ? 'text-green-400'
                        : 'text-white/50 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'
                    )}
                    onClick={(event) => handleShare(event, activeKline.id)}
                    title="Share Profile"
                    aria-label="Share Profile"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  {!activeKline.isSelf ? (
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03] text-white/45 transition-colors hover:border-red-400/30 hover:text-red-400"
                      onClick={() => handleDeleteKline(activeKline.id)}
                      title="Delete Profile"
                      aria-label="Delete Profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/[0.06] pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/32">Saved Chart Menu</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {klines.map((kline) => {
                  const isActive = activeKlineId === kline.id;

                  return (
                    <button
                      key={kline.id}
                      type="button"
                      onClick={() => handleViewKline(kline)}
                      className={cn(
                        'group flex min-w-[150px] items-center gap-3 border px-3 py-3 text-left transition-all',
                        isActive
                          ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-white shadow-[inset_0_1px_0_rgba(212,175,55,0.16)]'
                          : 'border-white/[0.06] bg-white/[0.02] text-white/58 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/85'
                      )}
                    >
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center border transition-colors',
                        isActive ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10' : 'border-white/10 bg-white/[0.03]'
                      )}>
                        {kline.isSelf ? (
                          <Star className={cn('h-4 w-4', isActive ? 'text-[#D4AF37]' : 'text-white/40 group-hover:text-white/70')} />
                        ) : (
                          <User className={cn('h-4 w-4', isActive ? 'text-[#D4AF37]' : 'text-white/40 group-hover:text-white/70')} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'truncate font-serif transition-colors',
                            isActive ? 'text-base text-white' : 'text-sm text-white/72 group-hover:text-white/90'
                          )}>
                            {kline.label || 'Unnamed'}
                          </span>
                          {kline.isSelf ? (
                            <span className={cn('font-mono text-[9px] uppercase tracking-[0.18em]', isActive ? 'text-[#D4AF37]' : 'text-white/28')}>
                              My Chart
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleNewQuery}
                  aria-label="Create a new chart"
                  title="Create a new chart"
                  className="group flex min-w-[150px] items-center gap-3 border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-3 text-left text-white/50 transition-all hover:border-[#D4AF37]/28 hover:bg-white/[0.04] hover:text-[#D4AF37]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-serif text-sm">Create New Chart</span>
                    <p className="mt-1 font-mono text-[10px] text-white/35 group-hover:text-[#D4AF37]/70">Add another profile</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHART RENDER ── */}
      <div id="kline-report" className="bg-[#0A0A0F]">
        {profile && (
          <motion.div
            key={activeKlineId} // Forces re-mount animation when switching tabs
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SharedKlineResult
              profile={profile}
              klineData={klineData}
              transitDetails={transitDetails}
              tier={chartTier}
              onActionGate={() => openCheckout('lite')}
              hideFloatingNav
              radarData={radarData}
              next30Days={next30Days}
              klineId={activeKlineId || undefined}
              initialAiInsight={aiInsight}
              onAiInsightResolved={setAiInsight}
            />
          </motion.div>
        )}
      </div>
      
      {profile && <ReportFooter profile={profile} tier={chartTier} onUpgradeClick={() => openCheckout(chartTier === 'FREE' ? 'lite' : 'pro')} />}

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
