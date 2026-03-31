'use client';

import { useMemo } from 'react';
import type { DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';
import { Lock, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrokline/ui/heading';

interface Props {
  klineData: DestinyScorePoint[];
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_THEMES = [
  'Reset & Renewal', 'Inner Work', 'Springboard', 'Momentum',
  'Full Stride', 'Reflection', 'Pivot Point', 'Harvest',
  'Consolidate', 'Recalibrate', 'Integration', 'Completion'
];

function getMonthlyEnergies(currentYearScore: number) {
  // Generate 12 monthly energy values with natural variation around the yearly score
  const base = currentYearScore;
  const variations = [
    -5, -2, 4, 7, 3, -1, -4, 6, 2, -3, 1, -2
  ];
  return variations.map((v, i) => {
    const score = Math.max(20, Math.min(95, base + v + Math.round(Math.random() * 6 - 3)));
    return {
      month: i,
      name: MONTH_NAMES[i],
      score,
      theme: MONTH_THEMES[i],
      isBest: false,
      isWorst: false,
    };
  });
}

export function YearlyEnergyCurve({ klineData, tier, onActionGate }: Props) {
  const isLocked = tier === 'GUEST' || tier === 'FREE';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const currentYearPoint = klineData.find(p => p.year === currentYear);
  const currentScore = currentYearPoint?.score ?? 65;

  const monthlyData = useMemo(() => {
    const data = getMonthlyEnergies(currentScore);
    const maxIdx = data.reduce((best, m, i) => m.score > data[best].score ? i : best, 0);
    const minIdx = data.reduce((worst, m, i) => m.score < data[worst].score ? i : worst, 0);
    data[maxIdx].isBest = true;
    data[minIdx].isWorst = true;
    return data;
  }, [currentScore]);

  const maxScore = Math.max(...monthlyData.map(m => m.score));
  const minScore = Math.min(...monthlyData.map(m => m.score));

  if (isLocked) {
    return (
      <button
        onClick={() => onActionGate('yearly_energy', 'LITE')}
        className="group flex w-full flex-col items-center gap-4 border border-white/5 bg-white/[0.02] p-6 text-center transition-all hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/[0.02]"
      >
        <div className="flex h-14 w-14 items-center justify-center border border-purple-400/20 bg-purple-400/5">
          <TrendingUp className="h-6 w-6 text-purple-400/60" />
        </div>
        <div>
          <Heading level={3} className="text-sm font-bold text-white/80">
            {currentYear} Energy Curve
          </Heading>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            See your month-by-month energy forecast with peak and low periods highlighted.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-white/5 bg-white/[0.02] px-3 py-1.5 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10">
          <Lock className="h-3.5 w-3.5 text-white/30 group-hover:text-[#D4AF37]" />
          <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase group-hover:text-[#D4AF37]">Lite+</span>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-purple-400">
          <TrendingUp className="h-4 w-4" />
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase">Energy Forecast</span>
        </div>
        <Heading level={2} className="font-serif text-2xl text-white/90 md:text-3xl">
          {currentYear} Month-by-Month
        </Heading>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-1.5 md:gap-2" style={{ height: '200px' }}>
        {monthlyData.map((m) => {
          const height = ((m.score - minScore + 10) / (maxScore - minScore + 20)) * 100;
          const isPast = m.month < currentMonth;
          const isCurrent = m.month === currentMonth;

          return (
            <div key={m.month} className="group flex flex-1 flex-col items-center gap-1.5">
              {/* Tooltip */}
              <div className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 text-center">
                <p className="text-[10px] font-bold text-white/70">{m.score}</p>
              </div>

              {/* Bar */}
              <div
                className={cn(
                  'w-full transition-all duration-500 relative',
                  m.isBest ? 'bg-emerald-400/60' :
                  m.isWorst ? 'bg-red-400/40' :
                  isCurrent ? 'bg-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30' :
                  isPast ? 'bg-white/10' : 'bg-purple-400/20'
                )}
                style={{ height: `${height}%` }}
              >
                {m.isBest && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400">Best</span>}
                {m.isWorst && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-red-400">Low</span>}
                {isCurrent && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-[#D4AF37]">Now</span>}
              </div>

              {/* Label */}
              <span className={cn(
                'font-mono text-[8px] tracking-wider uppercase',
                isCurrent ? 'text-[#D4AF37] font-bold' : 'text-white/20'
              )}>
                {m.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Monthly themes row */}
      <div className="mt-6 grid grid-cols-4 gap-2 md:grid-cols-6">
        {monthlyData.filter((_, i) => i >= currentMonth).slice(0, 6).map((m) => (
          <div key={m.month} className="border border-white/5 bg-white/[0.01] p-2 text-center">
            <p className="font-mono text-[8px] font-bold text-white/30 uppercase">{m.name}</p>
            <p className="mt-0.5 text-[10px] text-white/50">{m.theme}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
