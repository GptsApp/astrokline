'use client';

import { TrendingUp, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const MONTHS = [
  { name: 'Jan', score: 82, label: 'Strong', planet: '♂ Mars', theme: 'Plant seeds for long-term goals' },
  { name: 'Feb', score: 71, label: 'Strong', planet: '♀ Venus', theme: 'Build on solid foundations' },
  { name: 'Mar', score: 56, label: 'Steady', planet: '☿ Mercury', theme: 'Movement accelerates' },
  { name: 'Apr', score: 88, label: 'Strong', planet: '♃ Jupiter', theme: 'Bold decisions pay off', current: true, expanded: true },
  { name: 'May', score: 45, label: 'Steady', planet: '♄ Saturn', theme: 'Consolidate gains carefully' },
  { name: 'Jun', score: 31, label: 'Low', planet: '☉ Sun', theme: 'Creative peak' },
  { name: 'Jul', score: 74, label: 'Strong', planet: '♀ Venus', theme: 'Relationships center stage' },
  { name: 'Aug', score: 62, label: 'Steady', planet: '♇ Pluto', theme: 'Deep reflection' },
  { name: 'Sep', score: 79, label: 'Strong', planet: '♃ Jupiter', theme: 'Efforts compound' },
  { name: 'Oct', score: 43, label: 'Steady', planet: '☿ Mercury', theme: 'New doors open' },
  { name: 'Nov', score: 54, label: 'Steady', planet: '♄ Saturn', theme: 'Strategic patience' },
  { name: 'Dec', score: 68, label: 'Strong', planet: '☉ Sun', theme: 'Close with intention' },
];

function scoreColor(s: number) {
  if (s >= 68) return { bg: 'bg-[#D4AF37]', text: 'text-[#D4AF37]' };
  if (s >= 42) return { bg: 'bg-white', text: 'text-white' };
  return { bg: 'bg-white/30', text: 'text-white/40' };
}

export function EnergyMockup() {
  const maxScore = Math.max(...MONTHS.map(m => m.score));

  return (
    <div className="select-none pointer-events-none overflow-hidden bg-[#0a0a0d] border border-white/5 p-4 sm:p-5 text-left max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-purple-400/20 bg-purple-400/10">
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-serif text-white tracking-wide">Energy Forecast</h3>
          <p className="text-[8px] uppercase font-mono tracking-widest text-purple-400/60">2026 · Planetary Transit Analysis</p>
        </div>
      </div>

      {/* Year Baseline */}
      <div className="mb-3 border border-white/10 bg-white/[0.02] p-3 flex items-baseline gap-2">
        <span className="text-[8px] uppercase tracking-widest font-mono text-white/40">Year baseline</span>
        <span className="text-lg font-mono text-white">65</span>
        <span className="text-[8px] uppercase tracking-widest font-mono text-white/60">[Steady Year]</span>
      </div>

      {/* Timeline */}
      <div className="relative ml-3">
        <div className="absolute left-[9px] top-0 bottom-0 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />

        {MONTHS.map((m) => {
          const c = scoreColor(m.score);
          return (
            <div key={m.name} className="relative pl-7 pb-1.5">
              {/* Dot */}
              <div className={cn(
                'absolute left-0 top-[5px] z-10 flex h-[18px] w-[18px] items-center justify-center border bg-black text-[7px] font-mono',
                m.current ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/15 text-white/40'
              )}>
                {MONTHS.indexOf(m) + 1}
              </div>

              {/* Row */}
              <div className={cn(
                'flex items-center gap-2 p-2 border',
                m.current ? 'border-primary/20 bg-primary/5' : 'border-white/[0.03] bg-white/[0.01]'
              )}>
                <span className="w-6 text-[9px] font-mono text-white/30 shrink-0">{m.name}</span>
                <span className="text-sm font-mono text-white tabular-nums w-6">{m.score}</span>
                <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                  <div className={cn('h-full', c.bg)} style={{ width: `${(m.score / maxScore) * 100}%` }} />
                </div>
                <span className={cn('text-[8px] font-mono uppercase tracking-wider shrink-0', c.text)}>{m.label}</span>
                {m.current && <span className="text-[7px] font-mono bg-primary/20 text-primary px-1 py-0.5 animate-pulse">NOW</span>}
                <ChevronDown className={cn('h-2.5 w-2.5 text-white/20 shrink-0', m.expanded && 'rotate-180')} />
              </div>

              {/* Expanded */}
              {m.expanded && (
                <div className="border border-t-0 border-white/[0.03] bg-white/[0.01] p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-white/30">{m.planet}</span>
                    <span className="text-white/10">·</span>
                    <span className={cn('text-[9px] font-semibold', c.text)}>{m.theme}</span>
                  </div>
                  <p className="text-[9px] text-white/35 leading-relaxed">Jupiter aspects your Midheaven, expanding career horizons. Take calculated risks.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
