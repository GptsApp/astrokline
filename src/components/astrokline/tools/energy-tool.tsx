'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Lock, TrendingUp } from 'lucide-react';
import { useCheckout } from '@/components/astrokline/checkout/checkout-context';
import { cn } from '@/shared/lib/utils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ASTRO_INSIGHTS = [
  { planet: '♂ Mars', theme: 'Plant seeds for long-term goals', detail: 'Mars enters your 1st house, fueling initiative. Start projects now — momentum builds through Q1.' },
  { planet: '♀ Venus', theme: 'Build on solid foundations', detail: 'Venus trines your natal Moon, enhancing relationships and financial decisions. Trust your instincts.' },
  { planet: '☿ Mercury', theme: 'Movement accelerates', detail: 'Mercury direct in your 3rd house sharpens communication. Ideal for negotiations and contracts.' },
  { planet: '♃ Jupiter', theme: 'Bold decisions pay off', detail: 'Jupiter aspects your Midheaven, expanding career horizons. Take calculated risks — fortune favors action.' },
  { planet: '♄ Saturn', theme: 'Consolidate gains carefully', detail: 'Saturn stabilizes your 2nd house. Review finances, cut excess, and strengthen what matters.' },
  { planet: '☉ Sun', theme: 'Creative peak', detail: 'Sun conjunct your natal Venus ignites artistic expression. Share your vision — the world is receptive.' },
  { planet: '♀ Venus', theme: 'Relationships center stage', detail: 'Venus enters your 7th house, deepening partnerships. Existing bonds strengthen; new ones form naturally.' },
  { planet: '♇ Pluto', theme: 'Deep reflection', detail: 'Pluto transits trine your Moon, surfacing hidden truths. Embrace transformation — clarity follows surrender.' },
  { planet: '♃ Jupiter', theme: 'Efforts compound', detail: 'Jupiter sextile your natal Sun rewards consistency. Past investments — emotional and financial — begin yielding.' },
  { planet: '☿ Mercury', theme: 'New doors open', detail: 'Mercury enters your 9th house, bringing opportunities through learning, travel, or new perspectives.' },
  { planet: '♄ Saturn', theme: 'Strategic patience', detail: 'Saturn conjunct your progressed Sun demands discipline. Slow progress now prevents future setbacks.' },
  { planet: '☉ Sun', theme: 'Close with intention', detail: 'Sun returns to your natal position. Reflect on growth, release what no longer serves, set next-year intentions.' },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
  return Math.abs(hash);
}
function mixHash(seed: number): number {
  let h = seed | 0; h = Math.imul((h >> 16) ^ h, 0x45d9f3b); h = Math.imul((h >> 16) ^ h, 0x45d9f3b); return Math.abs((h >> 16) ^ h);
}

function generateMonthlyEnergy(yearScore: number, birthDate: string) {
  return MONTHS.map((name, i) => {
    const seed = hashCode(birthDate + '-month-' + i);
    const mixed = mixHash(seed);
    const pct = mixed % 100;
    const highPct = Math.max(10, Math.min(45, Math.round(10 + (yearScore - 20) * 0.4)));
    const lowPct = Math.max(10, Math.min(45, Math.round(50 - (yearScore - 20) * 0.4)));
    const subSeed = mixHash(seed + 7919);
    let score: number;
    if (pct < highPct) score = 68 + (subSeed % 25);
    else if (pct >= (100 - lowPct)) score = 18 + (subSeed % 24);
    else score = 42 + (subSeed % 26);
    score = Math.max(15, Math.min(95, score));
    const label = score >= 68 ? 'Strong' : score >= 42 ? 'Steady' : 'Low';
    return { name, score, label, ...ASTRO_INSIGHTS[i] };
  });
}

function scoreColor(s: number) {
  if (s >= 68) return { bg: 'bg-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-400', glow: 'shadow-emerald-500/40' };
  if (s >= 42) return { bg: 'bg-amber-500', text: 'text-amber-400', dot: 'bg-amber-400', glow: 'shadow-amber-500/40' };
  return { bg: 'bg-rose-500', text: 'text-rose-400', dot: 'bg-rose-400', glow: 'shadow-rose-500/40' };
}

interface EnergyToolProps { tier: string; klineResult: any; }

export function EnergyTool({ tier, klineResult }: EnergyToolProps) {
  const { openCheckout } = useCheckout();
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

  const [expanded, setExpanded] = useState<number>(currentMonth);
  const [visible, setVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggle = (i: number) => {
    if (i >= visibleMonths) return;
    setExpanded(prev => prev === i ? -1 : i);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center bg-purple-500/10">
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Energy Forecast</h1>
            <p className="text-xs text-muted-foreground">{currentYear} · Planetary Transit Analysis</p>
          </div>
        </div>
      </div>

      {/* Year baseline */}
      <div className="mb-8 border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Year baseline</span>
          <span className="text-2xl font-bold text-white">{yearScore}</span>
          <span className={cn('text-sm font-semibold', yearScore >= 70 ? 'text-emerald-400' : yearScore >= 45 ? 'text-amber-400' : 'text-rose-400')}>
            {yearScore >= 70 ? 'Strong Year' : yearScore >= 45 ? 'Steady Year' : 'Rebuilding Year'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative ml-4 sm:ml-8">
        {/* Spine line */}
        <div className="absolute left-[13.5px] top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        {months.map((m, i) => {
          const isLocked = i >= visibleMonths;
          const isCurrent = i === currentMonth;
          const isExpanded = expanded === i && !isLocked;
          const c = scoreColor(m.score);
          const isPast = i < currentMonth;

          return (
            <div
              key={m.name}
              className={cn(
                'relative pl-10 pb-6 transition-all duration-500',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Timeline dot */}
              <div className={cn(
                'absolute left-0 top-[7px] z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-[#0a090d] transition-all duration-300',
                isCurrent ? `${c.dot} border-transparent shadow-lg ${c.glow}` : 'border-white/10'
              )}>
                {!isCurrent && (
                  <span className={cn(
                    'absolute inset-0 rounded-full',
                    isLocked ? 'bg-white/5' : isPast ? `${c.dot}/30` : 'bg-white/5'
                  )} />
                )}
                {isCurrent && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-20" />}
                <span className={cn('relative z-10 text-[9px] font-bold', isCurrent ? 'text-black' : isLocked ? 'text-white/30' : 'text-white/60')}>
                  {i + 1}
                </span>
              </div>

              {/* Month card */}
              <button
                onClick={() => toggle(i)}
                disabled={isLocked}
                className={cn(
                  'w-full text-left transition-all duration-300',
                  isLocked && 'opacity-40 blur-[1.5px] cursor-not-allowed',
                  !isLocked && 'cursor-pointer group'
                )}
              >
                {/* Collapsed row */}
                <div className={cn(
                  'flex items-center gap-3 p-3 border transition-all duration-300',
                  isCurrent ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-white/[0.02] group-hover:bg-white/[0.04]'
                )}>
                  <span className="w-8 text-xs font-mono text-muted-foreground shrink-0">{m.name}</span>
                  <span className={cn('text-lg font-bold tabular-nums', isLocked ? 'text-white/30' : 'text-white')}>{isLocked ? '--' : m.score}</span>

                  {/* Score bar */}
                  <div className="flex-1 h-1.5 bg-white/5 overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-1000 ease-out', c.bg)}
                      style={{ width: visible && !isLocked ? `${(m.score / maxScore) * 100}%` : '0%', transitionDelay: `${i * 80 + 300}ms` }}
                    />
                  </div>

                  <span className={cn('text-[10px] font-mono uppercase tracking-wider shrink-0', isLocked ? 'text-white/20' : c.text)}>
                    {isLocked ? '—' : m.label}
                  </span>

                  {isCurrent && <span className="text-[9px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 shrink-0 animate-pulse">NOW</span>}

                  {!isLocked && (
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 text-white/30 transition-transform duration-300 shrink-0',
                      isExpanded && 'rotate-180'
                    )} />
                  )}
                </div>

                {/* Expanded detail */}
                <div className={cn(
                  'overflow-hidden transition-all duration-500 ease-out',
                  isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  <div className="border border-t-0 border-white/5 bg-white/[0.01] p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/40">{m.planet}</span>
                      <span className="text-white/10">·</span>
                      <span className={cn('text-xs font-semibold', c.text)}>{m.theme}</span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {isFree && (
        <div className="mt-6 ml-4 sm:ml-8 pl-10 relative">
          <div className="absolute left-3 top-0 h-8 w-px bg-gradient-to-b from-white/10 to-transparent" />
          <div className="border border-primary/20 bg-primary/5 p-5 text-center">
            <Lock className="mx-auto h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-medium text-white">Unlock Full Year Timeline</p>
            <p className="text-xs text-muted-foreground mt-1">See all 12 months with detailed planetary analysis</p>
            <button onClick={() => openCheckout('lite')} className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
              Upgrade to Lite <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
