'use client';

import React from 'react';
import { Calendar, ArrowRight, Lock, Check, X, Minus } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { useCheckout } from '@/components/astrokline/checkout/checkout-context';
import { cn } from '@/shared/lib/utils';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ACTION_THEMES = [
  { do: 'Start new projects', dont: 'Avoid confrontations' },
  { do: 'Schedule meetings', dont: 'Skip major purchases' },
  { do: 'Focus on creative work', dont: 'Avoid signing contracts' },
  { do: 'Pursue financial goals', dont: 'Skip risky investments' },
  { do: 'Nurture relationships', dont: 'Avoid isolating yourself' },
  { do: 'Rest and recharge', dont: 'Skip overcommitting' },
  { do: 'Plan for the future', dont: 'Avoid rushing decisions' },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateWeekCalendar(yearScore: number, birthDate: string) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const seed = hashCode(birthDate + dateStr);
    const variation = (seed % 25) - 12;
    const score = Math.max(15, Math.min(95, yearScore + variation));
    const label = score >= 72 ? 'Peak' : score >= 50 ? 'Neutral' : 'Rest';
    const color = score >= 72 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
    const bgColor = score >= 72 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';
    const theme = ACTION_THEMES[seed % ACTION_THEMES.length];
    return {
      date, dateStr, dayName: DAY_NAMES[date.getDay()],
      dayNum: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0, score, label, color, bgColor, theme,
    };
  });
}

interface CalendarToolProps {
  tier: string;
  klineResult: any;
}

export function CalendarTool({ tier, klineResult }: CalendarToolProps) {
  const { openCheckout } = useCheckout();
  const data = typeof klineResult === 'string' ? JSON.parse(klineResult) : klineResult;
  const klineData = data?.klineData || [];
  const birthDate = data?.profile?.birthDate || '2000-01-01';
  const currentYear = new Date().getFullYear();
  const yearPoint = klineData.find((p: any) => p.year === currentYear);
  const yearScore = yearPoint?.score ?? 65;
  const days = generateWeekCalendar(yearScore, birthDate);
  const isFree = tier === 'FREE';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center bg-emerald-500/10">
            <Calendar className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Action Calendar</h1>
            <p className="text-xs text-muted-foreground">7-day forecast · Based on your chart</p>
          </div>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.dateStr} className={cn(
            'border p-4 text-center transition-all',
            day.isToday ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-white/5 bg-white/[0.02]'
          )}>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">{day.dayName}</p>
            <p className="text-lg font-bold text-white">{day.dayNum}</p>
            <p className="text-[10px] text-muted-foreground">{day.monthName}</p>
            <div className={cn('mt-2 px-2 py-0.5 text-[10px] font-bold border', day.bgColor, day.color)}>
              {day.score} · {day.label}
            </div>
          </div>
        ))}
      </div>

      {/* Daily detail cards */}
      <div className="mt-6 space-y-3">
        {days.map((day, i) => {
          const isLocked = isFree && i >= 3;
          return (
            <div key={day.dateStr} className={cn(
              'border p-5 transition-all',
              day.isToday ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-white/[0.01]',
              isLocked && 'opacity-40 blur-[2px] select-none'
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{day.dayName}, {day.monthName} {day.dayNum}</span>
                  {day.isToday && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5">TODAY</span>}
                </div>
                <span className={cn('text-sm font-bold', day.color)}>{isLocked ? '--' : day.score}</span>
              </div>
              {!isLocked && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-white/60">{day.theme.do}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-white/60">{day.theme.dont}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isFree && (
        <div className="mt-6 border border-primary/20 bg-primary/5 p-5 text-center">
          <Lock className="mx-auto h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-medium text-white">Full 30-day calendar</p>
          <p className="text-xs text-muted-foreground mt-1">Upgrade to see detailed daily guidance for the month ahead</p>
          <button onClick={() => openCheckout('lite')} className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
            Upgrade to Lite <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
