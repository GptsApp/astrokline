'use client';

import { useMemo } from 'react';
import type { DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface Props {
  data: DestinyScorePoint[];
  birthYear: number;
}

interface StageInfo {
  label: string;
  ageRange: string;
  startAge: number;
  endAge: number;
}

const STAGES: StageInfo[] = [
  { label: 'Childhood', ageRange: '0-12', startAge: 0, endAge: 12 },
  { label: 'Youth', ageRange: '13-30', startAge: 13, endAge: 30 },
  { label: 'Prime', ageRange: '31-50', startAge: 31, endAge: 50 },
  { label: 'Middle', ageRange: '51-65', startAge: 51, endAge: 65 },
  { label: 'Elder', ageRange: '66+', startAge: 66, endAge: 100 },
];

function getScoreColor(score: number): string {
  if (score >= 75)
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 60) return 'text-green-400 border-green-500/20 bg-green-500/5';
  if (score >= 45) return 'text-white/70 border-white/10 bg-white/5';
  if (score >= 30)
    return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
  return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Weak';
  return 'Poor';
}

function getTrendIcon(trend: number) {
  if (trend > 3) return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend < -3) return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-white/40" />;
}

function getTrendLabel(trend: number): string {
  if (trend > 10) return 'Rising Fast';
  if (trend > 3) return 'Rising';
  if (trend > -3) return 'Stable';
  if (trend > -10) return 'Declining';
  return 'Falling';
}

export function LifeStageScores({ data, birthYear }: Props) {
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;

    // Calculate stage averages
    const stageScores = STAGES.map((stage) => {
      const stageData = data.filter(
        (_, i) => i >= stage.startAge && i <= stage.endAge
      );
      const avg =
        stageData.length > 0
          ? Math.round(
              stageData.reduce((a, b) => a + b.score, 0) / stageData.length
            )
          : 0;
      return { ...stage, score: avg };
    });

    // Historical & future averages
    const pastData = data.filter((_, i) => i <= currentAge);
    const futureData = data.filter((_, i) => i > currentAge);
    const historicalAvg =
      pastData.length > 0
        ? (pastData.reduce((a, b) => a + b.score, 0) / pastData.length).toFixed(
            1
          )
        : '0';
    const futureAvg =
      futureData.length > 0
        ? (
            futureData.reduce((a, b) => a + b.score, 0) / futureData.length
          ).toFixed(1)
        : '0';

    // Peak & valley ages
    let peakAge = 0,
      peakScore = -1,
      valleyAge = 0,
      valleyScore = 101;
    data.forEach((d, i) => {
      if (d.score > peakScore) {
        peakScore = d.score;
        peakAge = i;
      }
      if (d.score < valleyScore) {
        valleyScore = d.score;
        valleyAge = i;
      }
    });

    // Current trend (compare current year vs 3 years ago)
    const currentScore =
      data[Math.min(currentAge, data.length - 1)]?.score || 50;
    const prevScore =
      data[Math.max(0, Math.min(currentAge - 3, data.length - 1))]?.score || 50;
    const trend = currentScore - prevScore;

    return {
      stageScores,
      historicalAvg,
      futureAvg,
      peakAge,
      valleyAge,
      trend,
      currentAge,
    };
  }, [data, birthYear]);

  return (
    <div className="w-full space-y-6">
      {/* Stage Scores */}
      <div>
        <h3 className="mb-3 text-center text-[10px] font-bold tracking-widest text-white/40 uppercase">
          Life Stage Scores
        </h3>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {stats.stageScores.map((stage) => {
            const isCurrentStage =
              stats.currentAge >= stage.startAge &&
              stats.currentAge <= stage.endAge;
            return (
              <div
                key={stage.label}
                className={`relative rounded-xl border p-2 text-center transition-all ${getScoreColor(stage.score)} ${
                  isCurrentStage
                    ? 'shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/40'
                    : ''
                }`}
              >
                <p className="font-mono text-[10px] opacity-80">
                  {stage.label}
                </p>
                <p className="mt-1 font-mono text-xl leading-none font-bold sm:text-2xl">
                  {stage.score}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div>
        <h3 className="mb-3 text-center text-[10px] font-bold tracking-widest text-white/40 uppercase">
          Summary Stats
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-white/5 bg-[#1A1820]/80 px-4 py-3 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span>Historical Avg</span>
            <span className="font-mono text-white/90">
              {stats.historicalAvg}
            </span>
          </div>
          <div className="hidden h-3 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-2">
            <span>Future Avg</span>
            <span className="font-mono text-white/90">{stats.futureAvg}</span>
          </div>
          <div className="hidden h-3 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-2">
            <span>Peak Age</span>
            <span className="font-mono text-white/90">{stats.peakAge}</span>
          </div>
          <div className="hidden h-3 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-2">
            <span>Trend</span>
            <span
              className={cn(
                'font-mono font-medium',
                stats.trend > 3
                  ? 'text-emerald-400'
                  : stats.trend < -3
                    ? 'text-rose-400'
                    : 'text-white/50'
              )}
            >
              {getTrendLabel(stats.trend)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
