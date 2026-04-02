'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SharedKlineResult } from '@/components/astrokline/kline/shared-kline-result';
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
//  Main Dashboard Component
// ──────────────────────────────────────
export function DashboardKlineClient({ userTier }: { userTier: string }) {
  const isPremium = userTier === 'PREMIUM';
  const canExport = isPremium || userTier === 'STANDARD';
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
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [klineData, setKlineData] = useState<DestinyScorePoint[]>([]);
  const [transitDetails, setTransitDetails] = useState<Record<number, TransitEvent[]>>({});
  const [radarData, setRadarData] = useState<any[] | null>(null);
  const [next30Days, setNext30Days] = useState<any | null>(null);
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
          const defaultTab = data.data.find((k: KlineItem) => k.isSelf) || data.data[0];
          // We set the active tab using functional logic to avoid stale closures
          setActiveKlineId((prev) => {
            if (!prev) {
               applyKlineData(defaultTab);
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
      setProfile(kline.klineResult.profile);
      setKlineData(Array.isArray(kline.klineResult.klineData) ? kline.klineResult.klineData : []);
      setTransitDetails(kline.klineResult.transitDetails ?? {});
      setRadarData(kline.klineResult.radarData ?? null);
      setNext30Days(kline.klineResult.next30Days ?? null);
      setSelectedYear(undefined);
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
          body: JSON.stringify({ year, month, day, timeSlot: birthData.timeSlot, timezone, latitude: birthData.lat, longitude: birthData.lon }),
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

          const saveRes = await fetch('/api/kline/save', {
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
          
          if (saveRes.ok) {
             const saveJson = await saveRes.json();
             await fetchKlines();
             if (saveJson.data?.id) {
                // Instantly select the new chart
                setActiveKlineId(saveJson.data.id);
                applyKlineData({ id: saveJson.data.id, klineResult: cachedResult } as any);
             }
          }
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
             Enter your birth details to generate your personal K-Line, or query a friend&apos;s chart.
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

  // ── UNIFIED TAB VIEW ──
  return (
    <div className="space-y-6 pb-24">
      {/* Astrology Loader Overlay */}
      {isCalculating && (
        <div className="bg-background/95 fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl">
          <AstrologyLoader isLoading={isCalculating} onComplete={handleLoaderComplete} durationMs={5000} />
        </div>
      )}

      {/* ── TOP HORIZONTAL TAB BAR ── */}
      <div className="flex w-full items-end gap-2 overflow-x-auto border-b border-white/10 pb-0 pt-4 scrollbar-hide">
        {klines.map((kline) => {
          const isActive = activeKlineId === kline.id;
          const sunSign = kline.klineResult?.profile?.sun?.sign || '—';
          const moonSign = kline.klineResult?.profile?.moon?.sign || '—';
          const currentShareStatus = shareStatus[kline.id] || 'idle';
          
          return (
            <button
              key={kline.id}
              onClick={() => handleViewKline(kline)}
              className={cn(
                "group relative flex shrink-0 items-center justify-between gap-3 overflow-hidden border transition-all text-left",
                isActive 
                  ? "bg-[#15131A] border-white/10 shadow-[inset_0_2px_15px_rgba(212,175,55,0.08)] border-b-transparent z-10 px-5 pt-4 pb-3"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-white/50 border-b-transparent px-5 pt-3 pb-2 -mb-[1px] opacity-70 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Tab Icon */}
                <div className={cn("flex h-8 w-8 items-center justify-center shrink-0 border", isActive ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10' : 'border-white/10 bg-white/5')}>
                  {kline.isSelf ? (
                     <Star className={cn("h-4 w-4", isActive ? "text-[#D4AF37]" : "text-white/40")} />
                  ) : (
                     <User className={cn("h-4 w-4", isActive ? "text-[#D4AF37]" : "text-white/40")} />
                  )}
                </div>
                
                <div className="flex flex-col items-start whitespace-nowrap">
                  <div className="flex items-center gap-2 max-w-[120px] md:max-w-none">
                     <span className={cn("font-serif font-bold transition-all truncate", isActive ? "text-lg text-white" : "text-sm text-white/70 group-hover:text-white/90")}>
                       {kline.label || 'Unnamed'}
                     </span>
                     {kline.isSelf && <span className={cn("text-[9px] font-mono tracking-widest uppercase", isActive ? "text-[#D4AF37]" : "text-white/30")}>(My Chart)</span>}
                  </div>
                  
                  {/* Expandable Details when active */}
                  {isActive && (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       transition={{ duration: 0.3, ease: 'easeOut' }}
                       className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-white/50"
                     >
                       <span>{sunSign} ☉ · {moonSign} ☽</span>
                       <span className="w-1 h-1 rounded-full bg-white/20" />
                       <span>{kline.birthDate}</span>
                     </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons purely visible when active AND hovered */}
              {isActive && (
                <div className="ml-4 flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span 
                      className={cn("p-1.5 transition-colors cursor-pointer rounded-full", currentShareStatus === 'copied' ? 'text-green-400 bg-green-400/10' : 'hover:text-[#D4AF37] hover:bg-white/5')} 
                      onClick={(e) => handleShare(e, kline.id)}
                      title="Share Profile"
                   >
                     <Share2 className="h-3.5 w-3.5"/>
                   </span>
                   {!kline.isSelf && (
                     <span 
                       className="p-1.5 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer rounded-full" 
                       onClick={(e) => { e.stopPropagation(); handleDeleteKline(kline.id); }}
                       title="Delete Profile"
                     >
                       <Trash2 className="h-3.5 w-3.5"/>
                     </span>
                   )}
                </div>
              )}
            </button>
          )
        })}
        
        {/* New Query Button as Tab */}
        <button
          onClick={handleNewQuery}
          className="group flex h-[42px] shrink-0 items-center gap-2 px-4 transition-all hover:bg-white/5 -mb-[1px]"
        >
          <Plus className="h-4 w-4 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
        </button>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
         <div /> {/* spacing */}
        {canExport ? (
          <ExportPdfButton targetId="kline-report" fileName={`kline-${profile?.name || 'report'}`} />
        ) : (
          <button onClick={() => openCheckout('lite')} className="text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all">
            Upgrade to Export PDF
          </button>
        )}
      </div>

      {/* ── CHART RENDER ── */}
      <div id="kline-report">
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
              hideFloatingNav={true}
              radarData={radarData}
              next30Days={next30Days}
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
