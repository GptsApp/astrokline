'use client';

import { useMemo } from 'react';
import type { DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';
import { Briefcase, Heart, Coins, Zap } from 'lucide-react';

interface Props {
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  aiYearInsights?: Record<number, { aiSummary: string; aiAdvice: string }>;
}

function normalizeYearCopy(value?: string | null) {
  return (value ?? '')
    .replace(/[*_`#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDimScore(base: number, offset: number): number {
  return Math.min(100, Math.max(5, Math.round(base + offset)));
}

function getScoreWidthClass(value: number) {
  const bucket = Math.max(5, Math.min(100, Math.round(value / 5) * 5));
  const widthClasses: Record<number, string> = {
    5: 'w-[5%]',
    10: 'w-[10%]',
    15: 'w-[15%]',
    20: 'w-[20%]',
    25: 'w-[25%]',
    30: 'w-[30%]',
    35: 'w-[35%]',
    40: 'w-[40%]',
    45: 'w-[45%]',
    50: 'w-[50%]',
    55: 'w-[55%]',
    60: 'w-[60%]',
    65: 'w-[65%]',
    70: 'w-[70%]',
    75: 'w-[75%]',
    80: 'w-[80%]',
    85: 'w-[85%]',
    90: 'w-[90%]',
    95: 'w-[95%]',
    100: 'w-full',
  };

  return widthClasses[bucket];
}

export function FiveYearPlan({ klineData, transitDetails, aiYearInsights = {} }: Props) {
  const currentYear = new Date().getFullYear();

  const yearPlans = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear + i + 1;
      const point = klineData.find(d => d.year === year);
      const prevPoint = klineData.find(d => d.year === year - 1);
      const score = point?.score ?? 50;
      const prevScore = prevPoint?.score ?? score;
      const change = score - prevScore;
      const transits = transitDetails[year] || [];
      const aiInsight = aiYearInsights[year];

      // Derive dimension scores from base + stage influence
      const stageOffsets: Record<string, [number, number, number, number]> = {
        'Peak Flow': [8, 6, 5, 3],
        'Expansion': [6, 5, 3, 2],
        'Harvest': [5, 8, 4, 3],
        'Renewal': [2, -2, 7, 5],
        'Consolidation': [3, 4, 2, 2],
        'Reflection': [-2, -3, 4, -1],
        'Transformation': [2, -4, -3, -2],
        'Challenge': [-4, -5, -2, -4],
        'Grounding': [-2, 1, 0, 4],
      };
      const offsets = stageOffsets[point?.stage ?? ''] ?? [0, 0, 0, 0];

      return {
        year,
        score,
        change,
        stage: point?.stage ?? 'Unknown',
        transits: transits.slice(0, 4),
        aiSummary: normalizeYearCopy(aiInsight?.aiSummary),
        aiAdvice: normalizeYearCopy(aiInsight?.aiAdvice),
        dims: {
          career: getDimScore(score, offsets[0]),
          wealth: getDimScore(score, offsets[1]),
          love: getDimScore(score, offsets[2]),
          health: getDimScore(score, offsets[3]),
        },
      };
    });
  }, [aiYearInsights, klineData, transitDetails, currentYear]);

  return (
    <div className="mx-auto mt-16 w-full max-w-4xl space-y-10 px-4">
      {/* Year Cards */}
      <div className="space-y-6">
        {yearPlans.map((yp) => {
          return (
            <div key={yp.year} className="border border-white/[0.06] bg-[#0A0A0F]/80 overflow-hidden">
              {/* Year Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-3xl font-bold text-white">{yp.year}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]/70">{yp.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#D4AF37]">{yp.score}</span>
                  <span className={`font-mono text-xs font-bold ${yp.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {yp.change >= 0 ? '▲' : '▼'} {yp.change >= 0 ? '+' : ''}{yp.change.toFixed(1)}
                  </span>
                </div>
              </div>

              {(yp.aiSummary || yp.aiAdvice) && (
                <div className="border-b border-white/[0.04] px-6 py-4">
                  {yp.aiSummary ? (
                    <p className="text-sm leading-7 text-white/78">{yp.aiSummary}</p>
                  ) : null}
                  {yp.aiAdvice ? (
                    <p className="mt-3 text-xs leading-6 text-[#D4AF37]/78">{yp.aiAdvice}</p>
                  ) : null}
                </div>
              )}

              {/* 4 Dimensions */}
              <div className="grid grid-cols-2 gap-px bg-white/[0.02] md:grid-cols-4">
                {[
                  { icon: Briefcase, label: 'Career', value: yp.dims.career, color: 'bg-amber-500' },
                  { icon: Coins, label: 'Wealth', value: yp.dims.wealth, color: 'bg-emerald-500' },
                  { icon: Heart, label: 'Love', value: yp.dims.love, color: 'bg-rose-500' },
                  { icon: Zap, label: 'Health', value: yp.dims.health, color: 'bg-blue-500' },
                ].map((dim) => (
                  <div key={dim.label} className="bg-[#0A0A0F] px-5 py-4">
                    <div className="mb-2 flex items-center gap-2">
                      <dim.icon className="h-3.5 w-3.5 text-white/30" />
                      <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{dim.label}</span>
                      <span className="ml-auto font-mono text-sm font-bold text-white/70">{dim.value}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden bg-white/5">
                      <div className={`${dim.color} ${getScoreWidthClass(dim.value)} h-full opacity-60 transition-all`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Transit Events */}
              {yp.transits.length > 0 && (
                <div className="border-t border-white/[0.04] px-6 py-4">
                  <p className="mb-2 font-mono text-[8px] font-bold tracking-widest text-[#D4AF37]/40 uppercase">Key Transits</p>
                  <div className="space-y-2">
                    {yp.transits.map((t, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 bg-[#D4AF37]/50" />
                        <div>
                          <span className="text-xs font-bold text-white/80">{t.title}</span>
                          <span className="ml-2 text-[11px] text-white/40">· {t.planet} {t.aspect}</span>
                          <p className="mt-1 text-[11px] leading-relaxed text-white/50">{t.description}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#D4AF37]/70">{t.advice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
