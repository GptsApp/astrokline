'use client';

import React, { useEffect, useState } from 'react';
import { SharedKlineResult } from '@/components/astrokline/kline/shared-kline-result';
import { QuotaLimitModal } from '@/components/astrokline/kline/quota-limit-modal';
import { RegistrationNudge } from '@/components/astrokline/kline/registration-nudge';
import { ReportFooter } from '@/components/astrokline/kline/report-footer';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import {
  getSavedBirthData,
  getSavedKlineResult,
  saveKlineResult,
  clearSavedKlineResult,
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
import { ShieldCheck, Briefcase, Heart, Sparkles, Share2 } from 'lucide-react';
import { useRouter } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';
import { Heading } from "@/components/astrokline/ui/heading";
import { useAppContext } from '@/shared/contexts/app';

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
  const [klineData, setKlineData] = useState<DestinyScorePoint[]>([]);
  const [transitDetails, setTransitDetails] = useState<Record<number, TransitEvent[]>>({});

  // Registration nudge & quota modal state
  const [showNudge, setShowNudge] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo] = useState({ used: 0, total: 2, isLifetime: true, userTier: 'FREE' });
  const [showPricingInline, setShowPricingInline] = useState(false);

  const { setAuthModalType, setIsShowSignModal } = useAppContext();
  const [pricingModalContext, setPricingModalContext] = useState({ title: 'Upgrade Your Reading', icon: ShieldCheck as any });

  const handleActionGate = (actionContext?: string, requiredTier?: string) => {
    if (tier === 'GUEST') {
       trackEvent('auth_gate_triggered', { source: actionContext || 'unknown' });
       setAuthModalType('sign-up');
       setIsShowSignModal(true);
       return;
    }
    
    trackEvent('pricing_modal_open', { source: actionContext || 'kline_result_view' });
    
    const contextMessages: Record<string, { title: string, icon: any }> = {
       career: { title: 'Unlock Career Timing', icon: Briefcase },
       love: { title: 'Unlock Soulmate Timing', icon: Heart },
       wealth: { title: 'Unlock Financial Timing', icon: Sparkles },
       chart_tooltip: { title: 'Unlock Year Forecast', icon: Sparkles }
    };
    
    const ctx = actionContext && contextMessages[actionContext] ? contextMessages[actionContext] : { title: 'Upgrade Your Reading', icon: ShieldCheck };
    setPricingModalContext(ctx);
    setShowPricingInline(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    const hydrateFromSavedResult = () => {
      const savedResult = getSavedKlineResult();
      if (!savedResult?.profile || !Array.isArray(savedResult.klineData) || savedResult.klineData.length === 0) {
        return false;
      }
      // Validate cache matches current birth data
      const currentBirth = getSavedBirthData();
      const cachedBirth = savedResult.birthData as { name?: string; date?: string } | undefined;
      if (currentBirth && cachedBirth && (currentBirth.name !== cachedBirth.name || currentBirth.date !== cachedBirth.date)) {
        // Birth data changed, invalidate stale cache
        clearSavedKlineResult();
        return false;
      }
      setProfile(savedResult.profile as UserProfile);
      setKlineData(savedResult.klineData as DestinyScorePoint[]);
      setTransitDetails((savedResult.transitDetails as Record<number, TransitEvent[]>) ?? {});
      setIsInitializing(false);
      return true;
    };

    if (hydrateFromSavedResult()) return () => { cancelled = true; };

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
          body: JSON.stringify({ year, month, day, timeSlot: savedBirthData.timeSlot, timezone, latitude: savedBirthData.lat, longitude: savedBirthData.lon }),
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

        if (cancelled) return;
        setProfile(rebuiltProfile);
        setKlineData(rebuiltResult.klineData);
        setTransitDetails(rebuiltResult.transitDetails);
        setIsInitializing(false);
      } catch (error) {
        if (!cancelled) {
          setIsInitializing(false);
          router.replace('/kline');
        }
      }
    };

    void rebuildFromSavedBirthData();
    return () => { cancelled = true; };
  }, [router, isLoggedIn]);

  if (isInitializing || !profile) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-2xl">
        <AstrologyLoader isLoading={true} durationMs={6000} className="scale-110" />
      </div>
    );
  }

  return (
    <div className="bg-background astro-starfield min-h-screen">
      <div className="relative z-40 mx-auto w-full max-w-7xl px-4 pt-24 md:px-8 pointer-events-none">
        <div className="pointer-events-auto inline-block">
          <PageBreadcrumb className="mb-0" />
        </div>
      </div>

      <SharedKlineResult 
        profile={profile} 
        klineData={klineData} 
        transitDetails={transitDetails} 
        tier={tier} 
        onActionGate={handleActionGate} 
      />

      <ReportSection id="report-footer" className="pb-12">
        <ReportFooter profile={profile} tier={tier} onUpgradeClick={() => handleActionGate()} />
      </ReportSection>

      {!isLoggedIn && <RegistrationNudge isVisible={showNudge} onClose={() => setShowNudge(false)} />}
      <QuotaLimitModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} used={quotaInfo.used} total={quotaInfo.total} isLifetime={quotaInfo.isLifetime} userTier={quotaInfo.userTier} onUpgradeClick={() => handleActionGate()} />

      {showPricingInline && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowPricingInline(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="border-primary/20 bg-background/95 relative mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto  border p-8 shadow-[0_0_60px_rgba(212,175,55,0.15)] backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPricingInline(false)} className="text-muted-foreground hover:text-foreground absolute top-4 right-4 text-lg transition-colors">✕</button>
            <div className="mb-6 text-center">
              <div className="bg-[#D4AF37]/10 border-[#D4AF37]/30 mx-auto mb-4 flex h-12 w-12 items-center justify-center border">
                {React.createElement(pricingModalContext.icon, { className: "text-[#D4AF37] h-5 w-5" })}
              </div>
              <Heading level={3} className="text-2xl font-bold tracking-tight">{pricingModalContext.title}</Heading>
            </div>
            <div className="space-y-4">
              {tier === 'LITE' && (
                <div className="mb-2 text-center">
                  <span className="inline-flex items-center gap-1.5 border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-3 py-1 text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                    ✓ You're on Lite
                  </span>
                </div>
              )}
              {[
                { name: 'Lite', price: '$39.9', desc: 'Full tooltip details + Career, Wealth, Love & Health AI reading + 5 charts/mo', id: 'standard', hidden: tier === 'LITE' || tier === 'PRO' },
                { name: 'Pro', price: '$79.9', desc: 'Transit details + 5-Year Strategic Plan + Unlimited charts + PDF export', id: 'premium', featured: true, hidden: tier === 'PRO' },
              ].filter(p => !p.hidden).map((plan) => (
                <a key={plan.id} href={`/pricing`} onClick={() => trackEvent('pricing_plan_click', { plan: plan.id, source: 'inline_modal' })} className={cn('block  border p-5 transition-all hover:scale-[1.02]', plan.featured ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-white/10 bg-white/[0.02] hover:border-white/20')}>
                  <div className="mb-2 flex items-center justify-between"><Heading level={4} className="text-foreground font-bold">{plan.name}</Heading><span className="text-primary text-lg font-bold">{plan.price}</span></div>
                  <p className="text-muted-foreground text-xs">{plan.desc}</p>
                </a>
              ))}
            </div>
            
            <div className="mt-6 border-t border-white/10 pt-4">
              <button 
                onClick={() => {
                  trackEvent('share_to_unlock_clicked');
                  // Trigger share modal
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-bold">Or share to unlock 1 report for free</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
