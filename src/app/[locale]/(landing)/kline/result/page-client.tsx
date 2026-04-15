'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SharedKlineResult } from '@/components/astrocurve/kline/shared-kline-result';
import { QuotaLimitModal } from '@/components/astrocurve/kline/quota-limit-modal';
import { RegistrationNudge } from '@/components/astrocurve/kline/registration-nudge';
import { ReportFooter } from '@/components/astrocurve/kline/report-footer';
import { ReportSection } from '@/components/astrocurve/kline/report-section';
import {
  getSavedBirthData,
  getSavedKlineResult,
  saveKlineResult,
  clearSavedKlineResult,
} from '@/components/astrocurve/ui/birth-info-context';
import { PageBreadcrumb } from '@/components/astrocurve/ui/page-breadcrumb';
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
import { PLAN_ENTITLEMENTS } from '@/lib/astrokline/plan-entitlements';
import { apiToProfile } from '@/lib/astrokline/profile-transform';
import { trackEvent } from '@/lib/astrokline/track-event';
import { ShieldCheck, Briefcase, Heart, Sparkles, Share2, Compass } from 'lucide-react';
import { useRouter } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';
import { Heading } from "@/components/astrocurve/ui/heading";
import { useAppContext } from '@/shared/contexts/app';
import { Lock } from 'lucide-react';

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';
type ResultRecoveryMode = 'missing-birth-data' | 'rebuild-error';

function StickyUpgradeBar({ tier, onUpgrade }: { tier: AppTier; onUpgrade: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-[#D4AF37]/20 bg-black/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3 md:justify-center md:gap-6 animate-in slide-in-from-bottom-4">
      <p className="text-xs text-white/60 hidden sm:block">
        <Lock className="inline h-3 w-3 mr-1 text-[#D4AF37]/60" />
        {tier === 'GUEST' ? 'Sign up to save your chart & unlock insights' : 'Upgrade to see your full 100-year timeline'}
      </p>
      <button onClick={onUpgrade} className="shrink-0 bg-[#D4AF37] px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:scale-105 transition-transform flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        {tier === 'GUEST' ? 'Unlock Free' : 'Upgrade Now'}
      </button>
    </div>
  );
}

function ResultRecoveryState({
  mode,
  isLoggedIn,
  onStartOver,
  onOpenDashboard,
}: {
  mode: ResultRecoveryMode;
  isLoggedIn: boolean;
  onStartOver: () => void;
  onOpenDashboard: () => void;
}) {
  const content =
    mode === 'rebuild-error'
      ? {
          title: 'We could not restore this Life Curve',
          description:
            'This result page can recover a chart when saved birth data is still available. In this session, the recovery data was incomplete or expired.',
        }
      : {
          title: 'This page needs a fresh chart session',
          description:
            'The result page is the handoff after chart generation. Start from the Life Curve generator to create a new chart, then return here with live data.',
        };

  return (
    <div className="bg-background astro-starfield min-h-screen px-6 pt-32 pb-20">
      <div className="mx-auto max-w-3xl border border-white/10 bg-[#111015] p-8 text-center shadow-2xl md:p-12">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <Heading level={2} className="text-3xl md:text-4xl">
          {content.title}
        </Heading>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
          {content.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex h-12 items-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.01] hover:bg-primary/90"
          >
            Start A New Life Curve
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex h-12 items-center border border-white/10 px-6 text-sm font-semibold text-white/80 transition-colors hover:border-primary/30 hover:text-primary"
            >
              Open My Dashboard
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

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
  const [radarData, setRadarData] = useState<any[] | null>(null);
  const [next30Days, setNext30Days] = useState<any | null>(null);
  const [aiInsight, setAiInsight] = useState<AiInsightData | null>(null);
  const [savedKlineId, setSavedKlineId] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<ResultRecoveryMode | null>(null);

  // Registration nudge & quota modal state
  const [showNudge, setShowNudge] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo] = useState({ used: 0, total: 2, isLifetime: true, userTier: 'FREE' });
  const [showPricingInline, setShowPricingInline] = useState(false);
  const nudgeTriggered = useRef(false);

  // Trigger registration nudge for guest users after 45 seconds OR scrolling past paywall
  useEffect(() => {
    if (tier !== 'GUEST' || nudgeTriggered.current) return;
    const timer = setTimeout(() => {
      if (nudgeTriggered.current) return;
      nudgeTriggered.current = true;
      setShowNudge(true);
    }, 45000);

    // Also trigger when user scrolls past the paywall cliffhanger
    const scrollHandler = () => {
      if (nudgeTriggered.current) return;
      const paywall = document.getElementById('future-cliffhanger');
      if (paywall) {
        const rect = paywall.getBoundingClientRect();
        if (rect.bottom < 0) {
          nudgeTriggered.current = true;
          setShowNudge(true);
        }
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [tier]);

  // Exit-intent capture: show nudge when mouse leaves viewport (desktop) or tab loses focus
  const [showExitIntent, setShowExitIntent] = useState(false);
  const exitIntentShown = useRef(false);
  useEffect(() => {
    if (tier !== 'GUEST' || isLoggedIn) return;
    const mouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown.current && !nudgeTriggered.current) {
        exitIntentShown.current = true;
        setShowExitIntent(true);
        trackEvent('exit_intent_shown');
      }
    };
    document.addEventListener('mouseleave', mouseLeave);
    return () => document.removeEventListener('mouseleave', mouseLeave);
  }, [tier, isLoggedIn]);

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleDirectCheckout = async (productId: string) => {
    if (!isLoggedIn) {
      setShowPricingInline(false);
      setAuthModalType('sign-up');
      setIsShowSignModal(true);
      return;
    }
    try {
      setCheckoutLoading(productId);
      trackEvent('pricing_plan_click', { plan: productId, source: 'inline_modal' });
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, currency: 'USD', locale: 'en' }),
      });
      const { code, data, message } = await res.json();
      if (message === 'no auth, please sign in') {
        setAuthModalType('sign-in');
        setIsShowSignModal(true);
        return;
      }
      if (code !== 0 || !data?.checkoutUrl) throw new Error(message || 'Checkout failed');
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error('Checkout failed:', e);
    } finally {
      setCheckoutLoading(null);
    }
  };

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

  const handleAiInsightResolved = (nextInsight: AiInsightData) => {
    setAiInsight(nextInsight);

    const savedResult = getSavedKlineResult() ?? {};
    saveKlineResult({
      ...savedResult,
      ...(savedKlineId ? { klineId: savedKlineId } : {}),
      aiInsight: nextInsight,
    });
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
      setRadarData((savedResult as any).radarData ?? null);
      setNext30Days((savedResult as any).next30Days ?? null);
      setAiInsight((savedResult as any).aiInsight ?? null);
      setSavedKlineId((savedResult as any).klineId ?? null);
      setRecoveryMode(null);
      setIsInitializing(false);
      return true;
    };

    if (hydrateFromSavedResult()) return () => { cancelled = true; };

    const rebuildFromSavedBirthData = async () => {
      const savedBirthData = getSavedBirthData();
      if (!savedBirthData) {
        if (!cancelled) {
          setRecoveryMode('missing-birth-data');
          setIsInitializing(false);
        }
        return;
      }
      try {
        const normalizedBirthData = enrichBirthDataWithTimezone(savedBirthData);
        const response = await fetch('/api/astrology/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildNatalChartPayload(normalizedBirthData)),
        });
        const result = await response.json();
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || 'Failed to rebuild chart result');
        }

        const rebuiltProfile = {
          ...apiToProfile(result.data, normalizedBirthData),
          overallAverageScore: result.reportData?.overallAverageScore ?? 82,
        };
        let rebuiltResult: Record<string, unknown> = {
          profile: rebuiltProfile,
          birthData: normalizedBirthData,
          rawApiData: result.data,
          klineData: result.reportData?.klineData ?? [],
          transitDetails: result.reportData?.transitDetails ?? {},
        };

        if (isLoggedIn) {
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
              klineResult: rebuiltResult,
            }),
          });

          if (saveRes.ok) {
            const saveJson = await saveRes.json();
            rebuiltResult = {
              ...(saveJson.data?.klineResult ?? rebuiltResult),
              klineId: saveJson.data?.id ?? null,
            };
          }
        }

        saveKlineResult(rebuiltResult);

        if (cancelled) return;
        setProfile(rebuiltProfile);
        setKlineData((rebuiltResult.klineData as DestinyScorePoint[]) ?? []);
        setTransitDetails((rebuiltResult.transitDetails as Record<number, TransitEvent[]>) ?? {});
        setRadarData((rebuiltResult as any).radarData ?? null);
        setNext30Days((rebuiltResult as any).next30Days ?? null);
        setAiInsight((rebuiltResult as any).aiInsight ?? null);
        setSavedKlineId((rebuiltResult as any).klineId ?? null);
        setRecoveryMode(null);
        setIsInitializing(false);
      } catch (error) {
        if (!cancelled) {
          setRecoveryMode('rebuild-error');
          setIsInitializing(false);
        }
      }
    };

    void rebuildFromSavedBirthData();
    return () => { cancelled = true; };
  }, [router, isLoggedIn]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-2xl">
        <AstrologyLoader isLoading={true} durationMs={6000} className="scale-110" />
      </div>
    );
  }

  if (!profile) {
    return (
      <ResultRecoveryState
        mode={recoveryMode ?? 'missing-birth-data'}
        isLoggedIn={isLoggedIn}
        onStartOver={() => router.push('/kline')}
        onOpenDashboard={() => router.push('/dashboard/kline')}
      />
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
        radarData={radarData}
        next30Days={next30Days}
        klineId={savedKlineId ?? undefined}
        initialAiInsight={aiInsight}
        onAiInsightResolved={handleAiInsightResolved}
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
                { name: 'Lite', price: '$19.9/mo', desc: PLAN_ENTITLEMENTS.LITE.upgradeCardDescription, id: 'standard-yearly', hidden: tier === 'LITE' || tier === 'PRO', featured: false },
                { name: 'Pro', price: '$39.9/mo', desc: PLAN_ENTITLEMENTS.PRO.upgradeCardDescription, id: 'premium-yearly', featured: true, hidden: tier === 'PRO' },
              ].filter(p => !p.hidden).map((plan) => (
                <button key={plan.id} onClick={() => handleDirectCheckout(plan.id)} disabled={!!checkoutLoading} className={cn('block w-full text-left border p-5 transition-all hover:scale-[1.02]', plan.featured ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-white/10 bg-white/[0.02] hover:border-white/20')}>
                  <div className="mb-2 flex items-center justify-between"><Heading level={4} className="text-foreground font-bold">{plan.name}</Heading><span className="text-primary text-lg font-bold">{checkoutLoading === plan.id ? '...' : plan.price}</span></div>
                  <p className="text-muted-foreground text-xs">{plan.desc}</p>
                  <p className="text-[10px] text-[#D4AF37]/50 mt-2 font-mono uppercase tracking-wider">Billed yearly · Save 50% · 7-day money-back</p>
                </button>
              ))}
            </div>
            
            <div className="mt-6 border-t border-white/10 pt-4">
              <button 
                onClick={() => {
                  trackEvent('share_to_unlock_clicked');
                  setShowPricingInline(false);
                  if (navigator.share) {
                    navigator.share({
                      title: 'AstroCurve — My Cosmic Timing Map',
                      text: 'I just mapped my 100-year timing curve. See yours free:',
                      url: window.location.origin + '/kline',
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(
                      `I just mapped my 100-year timing curve on AstroCurve! See yours free: ${window.location.origin}/kline`
                    ).then(() => {
                      alert('Link copied! Share it to unlock a free report.');
                    }).catch(() => {});
                  }
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
      {/* ── EXIT-INTENT MODAL (GUEST only) ── */}
      {showExitIntent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center animate-in fade-in" onClick={() => setShowExitIntent(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative mx-4 w-full max-w-sm border border-[#D4AF37]/20 bg-[#0a0a12] p-8 text-center shadow-[0_0_80px_rgba(212,175,55,0.1)]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowExitIntent(false)} className="absolute top-3 right-3 text-white/30 hover:text-white/60 text-lg">✕</button>
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" />
            <Heading level={3} className="text-xl font-bold text-white mb-2">Don't Lose Your Reading</Heading>
            <p className="text-sm text-white/50 mb-6">Your chart took real calculations. Sign up in 10 seconds to save it forever — free.</p>
            <button
              onClick={() => {
                setShowExitIntent(false);
                setAuthModalType('sign-up');
                setIsShowSignModal(true);
                trackEvent('exit_intent_signup_clicked');
              }}
              className="w-full bg-[#D4AF37] py-3 text-sm font-bold uppercase tracking-wider text-black hover:scale-105 transition-transform"
            >
              Save My Chart — It's Free
            </button>
            <p className="mt-3 text-[10px] text-white/25 font-mono">No credit card · Takes 10 seconds</p>
          </div>
        </div>
      )}

      {/* ── FLOATING STICKY UPGRADE BAR (GUEST/FREE) ── */}
      {(tier === 'GUEST' || tier === 'FREE') && (
        <StickyUpgradeBar tier={tier} onUpgrade={() => handleActionGate('sticky_bar_upgrade', tier === 'GUEST' ? 'FREE' : 'LITE')} />
      )}
    </div>
  );
}
