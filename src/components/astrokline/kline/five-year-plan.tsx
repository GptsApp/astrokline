'use client';

import { useMemo } from 'react';
import { Heading } from '@/components/astrokline/ui/heading';
import type { DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';
import { Briefcase, Heart, Coins, Zap, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';

interface Props {
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  profileName?: string;
}

function getYearVerdict(score: number, change: number): { label: string; color: string; icon: typeof TrendingUp } {
  if (score >= 75 && change >= 0) return { label: 'Strong Growth', color: 'text-emerald-400', icon: TrendingUp };
  if (score >= 60) return { label: 'Steady Progress', color: 'text-green-400', icon: TrendingUp };
  if (score >= 45) return { label: 'Transition Period', color: 'text-amber-400', icon: Minus };
  if (score >= 30) return { label: 'Challenge Phase', color: 'text-orange-400', icon: TrendingDown };
  return { label: 'Rebuilding', color: 'text-rose-400', icon: TrendingDown };
}

function getDimScore(base: number, offset: number): number {
  return Math.min(100, Math.max(5, Math.round(base + offset)));
}

export function FiveYearPlan({ klineData, transitDetails, profileName }: Props) {
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
      const verdict = getYearVerdict(score, change);

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
        verdict,
        transits: transits.slice(0, 2),
        dims: {
          career: getDimScore(score, offsets[0]),
          wealth: getDimScore(score, offsets[1]),
          love: getDimScore(score, offsets[2]),
          health: getDimScore(score, offsets[3]),
        },
      };
    });
  }, [klineData, transitDetails, currentYear]);

  const bestYear = yearPlans.reduce((a, b) => a.score > b.score ? a : b);

  return (
    <div className="mx-auto mt-16 w-full max-w-4xl space-y-10 px-4">
      <div className="text-center">
        <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
          Pro Exclusive
        </p>
        <Heading level={2} className="mb-3 font-serif text-2xl text-white/90 md:text-3xl">
          {profileName ? `${profileName}'s` : 'Your'} 5-Year Strategic Plan
        </Heading>
        <p className="mx-auto max-w-xl text-sm text-white/50">
          A year-by-year roadmap of energy shifts, key transits, and strategic timing across Career, Wealth, Love & Health.
        </p>
      </div>

      {/* Best Year Highlight */}
      <div className="flex items-center gap-4 border border-emerald-500/20 bg-emerald-500/5 p-5">
        <Star className="h-6 w-6 shrink-0 text-emerald-400" />
        <div>
          <p className="text-sm font-bold text-emerald-400">
            Peak Year: {bestYear.year}
          </p>
          <p className="text-xs text-white/50">
            Score {bestYear.score} — your strongest energy window in the next 5 years.
            {bestYear.transits[0] ? ` Key transit: ${bestYear.transits[0].title}.` : ''}
          </p>
        </div>
      </div>

      {/* Year Cards */}
      <div className="space-y-6">
        {yearPlans.map((yp) => {
          const VerdictIcon = yp.verdict.icon;
          return (
            <div key={yp.year} className="border border-white/[0.06] bg-[#0A0A0F]/80 overflow-hidden">
              {/* Year Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-3xl font-bold text-white">{yp.year}</span>
                  <div className="flex items-center gap-2">
                    <VerdictIcon className={`h-4 w-4 ${yp.verdict.color}`} />
                    <span className={`text-sm font-bold ${yp.verdict.color}`}>{yp.verdict.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#D4AF37]">{yp.score}</span>
                  <span className={`font-mono text-xs font-bold ${yp.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {yp.change >= 0 ? '▲' : '▼'} {yp.change >= 0 ? '+' : ''}{yp.change.toFixed(1)}
                  </span>
                </div>
              </div>

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
                      <div className={`h-full ${dim.color} transition-all`} style={{ width: `${dim.value}%`, opacity: 0.6 }} />
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
                          <span className="ml-2 text-[11px] text-white/40">{t.description?.slice(0, 120)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Label */}
              <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase">Life Stage</span>
                <span className="font-mono text-[10px] font-bold tracking-wider text-white/50 uppercase">{yp.stage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
