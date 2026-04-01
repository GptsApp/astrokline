'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp, Calendar, Users, Activity, ArrowRight,
  Compass, Plus, CreditCard, ChevronLeft, ChevronRight,
  CalendarDays, Lock, Check, X, Clock, Gauge, Gift,
} from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import {
  getSavedBirthData, getSavedKlineResult, useBirthInfoModal,
} from '@/components/astrokline/ui/birth-info-context';
import {
  extractCurrentYearScore, extractSunSign, extractMoonSign,
} from '@/lib/astrokline/daily-energy';
import { getDailyTransit, getWeekTransits, type NatalMoonInput } from '@/lib/astrokline/daily-transit';

import { Heading } from '@/components/astrokline/ui/heading';
import { useCheckout } from '@/components/astrokline/checkout/checkout-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';

interface DashboardClientProps {
  userName?: string;
  userTier: string;
  hasKline: boolean;
  klineResult?: unknown;
  birthDate?: string;
  chartCount: number;
}

const TIER_LABELS: Record<string, string> = {
  FREE: 'Free', STANDARD: 'Lite', PREMIUM: 'Pro',
};

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const QUICK_LINKS = [
  { icon: TrendingUp, label: 'Energy', href: '/dashboard/tools/energy', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: Activity, label: 'Charts', href: '/dashboard/kline', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: Users, label: 'Compatibility', href: '/dashboard/tools/compatibility', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { icon: Gift, label: 'Invite', href: '/dashboard', color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export function DashboardClient({
  userName, userTier, hasKline, klineResult, birthDate, chartCount,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [localHasData, setLocalHasData] = useState<boolean | null>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { open: openModal } = useBirthInfoModal();
  const { openCheckout } = useCheckout();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedBirth = getSavedBirthData();
    setLocalHasData(!!savedBirth || hasKline);
    if (savedBirth) {
      const klineRes = getSavedKlineResult();
      if (klineRes?.profile) setLocalProfile(klineRes.profile);
    }
  }, [hasKline]);

  // Derived data
  const data = useMemo(() => {
    if (!klineResult) return null;
    const parsed = typeof klineResult === 'string' ? JSON.parse(klineResult) : klineResult;
    const klineData = parsed?.klineData || [];
    const bd = parsed?.profile?.birthDate || birthDate || '2000-01-01';
    const yearPoint = klineData.find((p: any) => p.year === new Date().getFullYear());
    const yearScore = yearPoint?.score ?? 65;
    // Extract natal moon for Vedic transit engine
    const profileMoon = parsed?.profile?.moon;
    const birthYear = bd ? parseInt(bd.split('-')[0], 10) : 2000;
    const natalMoon: NatalMoonInput = profileMoon
      ? { sign: profileMoon.sign, degree: profileMoon.degree ?? 0, minute: profileMoon.minute ?? 0, birthYear }
      : { sign: 'Aries', degree: 0, minute: 0, birthYear };
    return { parsed, klineData, bd, yearScore, natalMoon };
  }, [klineResult, birthDate]);

  const weekTransits = useMemo(() => {
    if (!data) return [];
    return getWeekTransits(data.yearScore, data.natalMoon, selectedDate);
  }, [data, selectedDate]);

  const todayTransit = useMemo(() => {
    if (!data) return null;
    return getDailyTransit(data.yearScore, data.natalMoon, selectedDate);
  }, [data, selectedDate]);

  const getScoreForDate = (d: Date) => {
    if (!data) return 50;
    return getDailyTransit(data.yearScore, data.natalMoon, d).score;
  };

  if (!mounted || localHasData === null) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-48 w-full animate-pulse bg-white/5" />
      </div>
    );
  }

  const sunSign = extractSunSign(klineResult) || localProfile?.sun?.sign;
  const moonSign = extractMoonSign(klineResult) || localProfile?.moon?.sign;
  const tierLabel = TIER_LABELS[userTier] || 'Free';
  const displayName = userName || localProfile?.name || 'Traveler';
  const isFree = userTier === 'FREE';
  const isPro = userTier === 'PREMIUM';

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedStr = selectedDate.toISOString().slice(0, 10);
  const isToday = todayStr === selectedStr;

  // Week navigation
  const shiftWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  // --- EMPTY STATE ---
  if (!localHasData) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-[#15131a]/80 to-primary/5 p-8 backdrop-blur-xl">
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-primary/10 blur-[100px]" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center py-6 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center border border-primary/30 bg-primary/10">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <Heading level={2} className="mb-3 text-3xl text-white md:text-4xl">
              Welcome, {displayName}
            </Heading>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              Generate your first K-Line to unlock your personalized dashboard
              with energy forecasts, action calendar, and more.
            </p>
            <button
              onClick={() => openModal(() => { setLocalHasData(true); router.refresh(); })}
              className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-all hover:scale-105"
            >
              <Plus className="h-5 w-5" /> Create My K-Line
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TODAY-FIRST DASHBOARD ---
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Greeting Bar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
          <div className="flex items-center gap-4">
            <span className="font-serif text-4xl text-white/90 tracking-tight">{displayName}</span>
            {(sunSign || moonSign) && (
              <span className="text-lg text-white/50 tracking-wide font-medium">
                {sunSign && `${sunSign} ☉`}{sunSign && moonSign && ' · '}{moonSign && `${moonSign} ☽`}
              </span>
            )}
          </div>
          <span className="text-sm text-white/30 font-mono tracking-widest uppercase pb-1 md:border-l md:border-white/10 md:pl-6">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <button
          onClick={() => {
            if (isFree || userTier === 'STANDARD') {
              openCheckout('pro');
            }
          }}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1814] to-[#0A0905] px-6 py-2.5 transition-all hover:scale-105 hover:border-[#D4AF37]/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] focus:outline-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] group-hover:via-[#D4AF37]/20" />
          <CreditCard className="relative z-10 h-4 w-4 text-[#D4AF37]" />
          <span className="relative z-10 font-bold uppercase tracking-widest text-[#D4AF37] text-xs">
            {tierLabel}
          </span>
        </button>
      </div>

      {/* Week Navigator */}
      <div className="border border-white/5 bg-[#15131A]/60 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button onClick={() => shiftWeek(-1)} className="p-1 text-white/40 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 justify-between">
            {weekTransits.map((w) => {
              const dayIdx = (w.date.getDay() + 6) % 7;
              const sel = w.dateStr === selectedStr;
              const tod = w.dateStr === todayStr;
              return (
                <button
                  key={w.dateStr}
                  onClick={() => setSelectedDate(w.date)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-2 py-2 transition-all flex-1',
                    sel && !tod ? 'bg-primary/10 ring-1 ring-primary/30' : '',
                    tod ? 'bg-[#D4AF37] ring-1 ring-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'hover:bg-white/5'
                  )}
                >
                  <span className={cn('text-[10px] font-mono uppercase', tod ? 'text-black/60' : 'text-white/30')}>{DAY_SHORT[dayIdx]}</span>
                  <span className={cn('text-lg font-bold', tod ? 'text-black' : sel ? 'text-primary' : 'text-white/60')}>
                    {w.date.getDate()}
                  </span>
                  <span className={cn('h-1.5 w-1.5', tod && w.transit.score >= 68 ? 'bg-black' : tod && w.transit.score >= 42 ? 'bg-black/70' : tod ? 'bg-black/50' : w.transit.score >= 68 ? 'bg-emerald-500' : w.transit.score >= 42 ? 'bg-amber-500' : 'bg-rose-500')} />
                </button>
              );
            })}
          </div>
          <button onClick={() => shiftWeek(1)} className="p-1 text-white/40 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => setSelectedDate(new Date())} className="p-1.5 text-white/40 hover:text-white border border-white/10" title="Go to today">
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Today's Transit Card */}
      {todayTransit && (
        <div className="border border-white/5 bg-[#15131A]/60 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              {isToday && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5">TODAY</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-2xl font-bold', todayTransit.labelColor)}>{todayTransit.score}</span>
              <span className={cn('text-xs font-semibold', todayTransit.labelColor)}>{todayTransit.label}</span>
            </div>
          </div>

          {/* Planet + Element */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="text-lg">{todayTransit.rulingPlanet.symbol}</span>
              <span>{todayTransit.rulingPlanet.name} in {todayTransit.transitSign}</span>
            </div>
            <span className="text-xs text-white/30">·</span>
            <span className="text-sm text-white/40">{todayTransit.element} Day</span>
          </div>

          {/* Vedic Panchang Strip */}
          {todayTransit.vedic && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 pb-3 border-b border-white/5">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">☽ {todayTransit.vedic.transitNakshatra}</span>
              <span className="text-[10px] font-mono text-white/25">|</span>
              <span className={cn(
                'text-[10px] font-mono uppercase tracking-wider',
                todayTransit.vedic.taraBala.score >= 75 ? 'text-emerald-400/70' :
                todayTransit.vedic.taraBala.score >= 40 ? 'text-amber-400/70' : 'text-rose-400/70'
              )}>
                {todayTransit.vedic.taraBala.name}
              </span>
              <span className="text-[10px] font-mono text-white/25">|</span>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                {todayTransit.vedic.tithi.name} · {todayTransit.vedic.tithi.group}
              </span>
              {todayTransit.vedic.yoga.isSiddha && (
                <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 uppercase tracking-wider">
                  Siddha
                </span>
              )}
              {todayTransit.vedic.yoga.isAmrita && (
                <span className="text-[9px] font-mono bg-amber-500/15 text-amber-400 px-1.5 py-0.5 uppercase tracking-wider">
                  Amrita
                </span>
              )}
            </div>
          )}

          {/* Narrative */}
          <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
            {todayTransit.narrative}
          </div>
        </div>
      )}

      {/* DO / DON'T */}
      {todayTransit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-emerald-500/10 bg-emerald-500/[0.02] p-5">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Do</h3>
            <div className="space-y-2.5">
              {todayTransit.doList.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-rose-500/10 bg-rose-500/[0.02] p-5">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">Don&apos;t</h3>
            <div className="space-y-2.5">
              {todayTransit.dontList.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <X className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Best Hours */}
      {todayTransit && (
        <div className={cn('border p-5', isPro ? 'border-white/5 bg-[#15131A]/40' : 'border-primary/10 bg-primary/[0.02]')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/40" />
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Best Hours</h3>
            </div>
            {!isPro && (
              <button onClick={() => openCheckout('pro')} className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                <Lock className="h-3 w-3" /> Pro Only
              </button>
            )}
          </div>
          <div className={cn('grid grid-cols-3 gap-3', !isPro && 'blur-[3px] select-none pointer-events-none')}>
            <div className="border border-emerald-500/10 p-3">
              <span className="text-[10px] font-bold text-emerald-400">🟢 PEAK</span>
              <p className="text-xs text-white/70 mt-1">{todayTransit.bestHours.peak.range}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{todayTransit.bestHours.peak.activity}</p>
            </div>
            <div className="border border-amber-500/10 p-3">
              <span className="text-[10px] font-bold text-amber-400">🟡 NEUTRAL</span>
              <p className="text-xs text-white/70 mt-1">{todayTransit.bestHours.neutral.range}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{todayTransit.bestHours.neutral.activity}</p>
            </div>
            <div className="border border-rose-500/10 p-3">
              <span className="text-[10px] font-bold text-rose-400">🔴 LOW</span>
              <p className="text-xs text-white/70 mt-1">{todayTransit.bestHours.low.range}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{todayTransit.bestHours.low.activity}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group flex flex-col items-center gap-1.5 border border-white/5 bg-[#15131A]/40 p-3 transition-all hover:border-white/10"
          >
            <div className={cn('flex h-8 w-8 items-center justify-center', link.bg)}>
              <link.icon className={cn('h-4 w-4', link.color)} />
            </div>
            <span className="text-[10px] font-medium text-white/50">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Subscription Bar */}
      <div className="flex items-center justify-between border border-white/5 bg-[#15131A]/40 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-white/70">{tierLabel} Plan · Active</span>
        </div>
        {userTier !== 'PREMIUM' && (
          <button onClick={() => openCheckout(userTier === 'FREE' ? 'lite' : 'pro')} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            Upgrade {userTier === 'FREE' ? 'to Lite' : 'to Pro'} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>


    </div>
  );
}
