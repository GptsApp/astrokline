'use client';

import React from 'react';
import { TrendingUp, ArrowRight, Lock } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MONTH_ADVICE = [
  'Plant seeds for long-term goals.',
  'Build steadily on January foundations.',
  'Movement accelerates — stay focused.',
  'A window for bold decisions opens.',
  'Consolidate recent gains carefully.',
  'Creative energy peaks — express yourself.',
  'Relationships take center stage now.',
  'Deep reflection brings unexpected clarity.',
  'Your consistent efforts start compounding.',
  'New opportunities emerge — stay open.',
  'Strategic patience pays off this month.',
  'Close the year with clear intention.',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateMonthlyEnergy(yearScore: number, birthDate: string) {
  return MONTH_NAMES.map((name, i) => {
    const seed = hashCode(birthDate + '-month-' + i);
    const variation = (seed % 21) - 10;
    const score = Math.max(20, Math.min(95, yearScore + variation));
    const label = score >= 70 ? 'Strong' : score >= 45 ? 'Steady' : 'Low';
    const color = score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-rose-500';
    const textColor = score >= 70 ? 'text-emerald-400' : score >= 45 ? 'text-amber-400' : 'text-rose-400';
    return { name, score, label, color, textColor, advice: MONTH_ADVICE[i] };
  });
}

interface EnergyToolProps {
  tier: string;
  klineResult: any;
}

export function EnergyTool({ tier, klineResult }: EnergyToolProps) {
  const data = typeof klineResult === 'string' ? JSON.parse(klineResult) : klineResult;
  const klineData = data?.klineData || [];
  const birthDate = data?.profile?.birthDate || '2000-01-01';
  const currentYear = new Date().getFullYear();
  const yearPoint = klineData.find((p: any) => p.year === currentYear);
  const yearScore = yearPoint?.score ?? 65;
  const months = generateMonthlyEnergy(yearScore, birthDate);
  const currentMonth = new Date().getMonth();
  const isFree = tier === 'FREE';
  const visibleMonths = isFree ? 3 : 12;
  const maxScore = Math.max(...months.map(m => m.score));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Energy Forecast</h1>
            <p className="text-xs text-muted-foreground">{currentYear} · Based on your birth chart</p>
          </div>
        </div>
      </div>

      {/* Year overview score */}
      <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Year baseline</span>
          <span className="text-2xl font-bold text-white">{yearScore}</span>
          <span className={cn('text-sm font-semibold', yearScore >= 70 ? 'text-emerald-400' : yearScore >= 45 ? 'text-amber-400' : 'text-rose-400')}>
            {yearScore >= 70 ? 'Strong Year' : yearScore >= 45 ? 'Steady Year' : 'Rebuilding Year'}
          </span>
        </div>
      </div>

      {/* Monthly bars */}
      <div className="space-y-2">
        {months.map((m, i) => {
          const isLocked = i >= visibleMonths;
          const isCurrent = i === currentMonth;
          return (
            <div key={m.name} className={cn(
              'rounded-lg border p-4 transition-all',
              isCurrent ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-white/[0.01]',
              isLocked && 'opacity-40 blur-[2px] select-none'
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-xs font-mono text-muted-foreground">{m.name}</span>
                  <span className="text-lg font-bold text-white">{isLocked ? '--' : m.score}</span>
                  <span className={cn('text-xs font-semibold', m.textColor)}>{isLocked ? '' : m.label}</span>
                  {isCurrent && <span className="text-[10px] rounded-full bg-primary/20 text-primary px-2 py-0.5">NOW</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', m.color)}
                    style={{ width: isLocked ? '0%' : `${(m.score / maxScore) * 100}%` }} />
                </div>
              </div>
              {!isLocked && (
                <p className="mt-2 text-xs text-white/40 italic">{m.advice}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for FREE */}
      {isFree && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
          <Lock className="mx-auto h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-medium text-white">See all 12 months</p>
          <p className="text-xs text-muted-foreground mt-1">Upgrade to Lite for the full year forecast</p>
          <Link href="/pricing" className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
            See Plans <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
