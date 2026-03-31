'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Users,
  Activity,
  ArrowRight,
  Compass,
  Plus,
  CreditCard,
  Gauge,
} from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import {
  getSavedBirthData,
  getSavedKlineResult,
  useBirthInfoModal,
} from '@/components/astrokline/ui/birth-info-context';
import {
  getDailyEnergy,
  extractCurrentYearScore,
  extractSunSign,
  extractMoonSign,
  type DailyEnergy,
} from '@/lib/astrokline/daily-energy';
import { Heading } from '@/components/astrokline/ui/heading';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  userName?: string;
  userTier: string;
  hasKline: boolean;
  klineResult?: unknown;
  birthDate?: string;
  chartCount: number;
}

const TIER_LABELS: Record<string, string> = {
  FREE: 'Free',
  STANDARD: 'Lite',
  PREMIUM: 'Pro',
};

const TOOLS = [
  {
    id: 'energy',
    icon: TrendingUp,
    label: 'Energy Forecast',
    desc: 'Monthly energy peaks & dips',
    href: '/tools/energy',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/20 hover:border-purple-400/40',
    bgColor: 'bg-purple-400/10',
  },
  {
    id: 'calendar',
    icon: Calendar,
    label: 'Action Calendar',
    desc: 'Daily guidance for your chart',
    href: '/tools/calendar',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/20 hover:border-emerald-400/40',
    bgColor: 'bg-emerald-400/10',
  },
  {
    id: 'charts',
    icon: Activity,
    label: 'My Charts',
    desc: '',
    href: '/dashboard/kline',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/20 hover:border-amber-400/40',
    bgColor: 'bg-amber-400/10',
  },
  {
    id: 'compatibility',
    icon: Users,
    label: 'Compatibility',
    desc: 'Chemistry with anyone',
    href: '/tools/compatibility',
    color: 'text-rose-400',
    borderColor: 'border-rose-400/20 hover:border-rose-400/40',
    bgColor: 'bg-rose-400/10',
  },
];

export function DashboardClient({
  userName,
  userTier,
  hasKline,
  klineResult,
  birthDate,
  chartCount,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [localHasData, setLocalHasData] = useState<boolean | null>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [energy, setEnergy] = useState<DailyEnergy | null>(null);
  const { open: openModal } = useBirthInfoModal();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedBirth = getSavedBirthData();
    setLocalHasData(!!savedBirth || hasKline);

    if (savedBirth) {
      const klineRes = getSavedKlineResult();
      if (klineRes?.profile) setLocalProfile(klineRes.profile);
    }

    // Calculate daily energy
    if (klineResult && birthDate) {
      const yearScore = extractCurrentYearScore(klineResult);
      if (yearScore !== null) {
        setEnergy(getDailyEnergy(yearScore, birthDate));
      }
    }
  }, [hasKline, klineResult, birthDate]);

  if (!mounted || localHasData === null) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-48 w-full animate-pulse bg-white/5" />
      </div>
    );
  }

  // Extract profile data
  const sunSign = extractSunSign(klineResult) || localProfile?.sun?.sign;
  const moonSign = extractMoonSign(klineResult) || localProfile?.moon?.sign;
  const tierLabel = TIER_LABELS[userTier] || 'Free';
  const displayName = userName || localProfile?.name || 'Traveler';

  // Dynamic chart count desc
  const chartsDesc = chartCount > 0
    ? `${chartCount} chart${chartCount > 1 ? 's' : ''} saved`
    : 'View saved charts';

  const toolsWithDynamicDesc = TOOLS.map(t =>
    t.id === 'charts' ? { ...t, desc: chartsDesc } : t
  );

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
              onClick={() => openModal(() => {
                setLocalHasData(true);
                router.refresh();
              })}
              className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-all hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create My K-Line
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL DASHBOARD ---
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Energy Banner */}
      <div className="relative overflow-hidden border border-white/5 bg-[#15131A]/60 p-6 md:p-8 backdrop-blur-xl">
        <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 bg-primary/5 blur-[80px]" />

        <div className="relative z-10">
          {/* Greeting + Tier */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">
              {energy?.greeting || 'Welcome'}, {displayName}
            </span>
            <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <CreditCard className="h-3 w-3" />
              {tierLabel}
            </span>
          </div>

          {/* Signs */}
          {(sunSign || moonSign) && (
            <p className="text-xs text-muted-foreground/70 mb-4">
              {sunSign && `${sunSign} Sun`}
              {sunSign && moonSign && ' · '}
              {moonSign && `${moonSign} Moon`}
            </p>
          )}

          {/* Energy Score */}
          {energy ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{energy.score}</span>
                    <span className={`text-sm font-semibold ${energy.labelColor}`}>
                      {energy.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block border-l border-white/10 pl-6">
                <p className="text-sm text-white/60 italic leading-relaxed max-w-xs">
                  &ldquo;{energy.message}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Your Dashboard</p>
                <p className="text-xs text-muted-foreground">Your cosmic tools at a glance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4-Grid Tools */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {toolsWithDynamicDesc.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className={`group flex flex-col gap-3 border p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${tool.borderColor} bg-[#15131A]/40 backdrop-blur-sm`}
          >
            <div className={`flex h-10 w-10 items-center justify-center ${tool.bgColor}`}>
              <tool.icon className={`h-5 w-5 ${tool.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90">{tool.label}</h3>
              <p className="mt-0.5 text-xs text-white/40 leading-relaxed">{tool.desc}</p>
            </div>
            <span className={`mt-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${tool.color}`}>
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      {/* Subscription Bar */}
      <div className="flex items-center justify-between border border-white/5 bg-[#15131A]/40 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-white/70">
            {tierLabel} Plan · Active
          </span>
        </div>
        {userTier !== 'PREMIUM' && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Upgrade {userTier === 'FREE' ? 'to Lite' : 'to Pro'}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
