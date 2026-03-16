'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, ChevronDown } from 'lucide-react';
import type { DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';

interface Props {
  data: DestinyScorePoint[];
  birthYear: number;
}

interface StageInfo {
  label: string;
  labelCn: string;
  ageRange: string;
  startAge: number;
  endAge: number;
}

const STAGES: StageInfo[] = [
  { label: 'Childhood', labelCn: '童年', ageRange: '0-12', startAge: 0, endAge: 12 },
  { label: 'Youth',     labelCn: '青年', ageRange: '13-30', startAge: 13, endAge: 30 },
  { label: 'Prime',     labelCn: '壮年', ageRange: '31-50', startAge: 31, endAge: 50 },
  { label: 'Middle',    labelCn: '中年', ageRange: '51-65', startAge: 51, endAge: 65 },
  { label: 'Elder',     labelCn: '晚年', ageRange: '66+',   startAge: 66, endAge: 100 },
];

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 60) return 'text-green-400 border-green-500/20 bg-green-500/5';
  if (score >= 45) return 'text-white/70 border-white/10 bg-white/5';
  if (score >= 30) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
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
  if (trend > 3) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend < -3) return <TrendingDown className="w-3.5 h-3.5 text-rose-400" />;
  return <Minus className="w-3.5 h-3.5 text-white/40" />;
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
    const stageScores = STAGES.map(stage => {
      const stageData = data.filter((_, i) => i >= stage.startAge && i <= stage.endAge);
      const avg = stageData.length > 0
        ? Math.round(stageData.reduce((a, b) => a + b.score, 0) / stageData.length)
        : 0;
      return { ...stage, score: avg };
    });

    // Historical & future averages
    const pastData = data.filter((_, i) => i <= currentAge);
    const futureData = data.filter((_, i) => i > currentAge);
    const historicalAvg = pastData.length > 0
      ? (pastData.reduce((a, b) => a + b.score, 0) / pastData.length).toFixed(1)
      : '0';
    const futureAvg = futureData.length > 0
      ? (futureData.reduce((a, b) => a + b.score, 0) / futureData.length).toFixed(1)
      : '0';

    // Peak & valley ages
    let peakAge = 0, peakScore = -1, valleyAge = 0, valleyScore = 101;
    data.forEach((d, i) => {
      if (d.score > peakScore) { peakScore = d.score; peakAge = i; }
      if (d.score < valleyScore) { valleyScore = d.score; valleyAge = i; }
    });

    // Current trend (compare current year vs 3 years ago)
    const currentScore = data[Math.min(currentAge, data.length - 1)]?.score || 50;
    const prevScore = data[Math.max(0, Math.min(currentAge - 3, data.length - 1))]?.score || 50;
    const trend = currentScore - prevScore;

    return { stageScores, historicalAvg, futureAvg, peakAge, valleyAge, trend, currentAge };
  }, [data, birthYear]);

  return (
    <div className="w-full space-y-4">
      {/* Stage Scores Row - responsive grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {stats.stageScores.map((stage) => {
          const isCurrentStage = stats.currentAge >= stage.startAge && stats.currentAge <= stage.endAge;
          return (
            <div
              key={stage.label}
              className={`relative rounded-xl border p-2 sm:p-3 text-center transition-all ${getScoreColor(stage.score)} ${
                isCurrentStage ? 'ring-1 ring-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]' : ''
              }`}
            >
              {isCurrentStage && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#D4AF37] text-[7px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                  Now
                </div>
              )}
              <p className="text-[9px] sm:text-[10px] font-mono opacity-60 mb-0.5">{stage.label}</p>
              <p className="text-[8px] text-white/30 mb-1 hidden sm:block">{stage.ageRange}</p>
              <p className="text-lg sm:text-2xl font-bold font-mono leading-none">{stage.score}</p>
              <p className="text-[8px] font-medium opacity-50 mt-1 hidden sm:block">{getScoreLabel(stage.score)}</p>
            </div>
          );
        })}
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Historical', value: stats.historicalAvg },
          { label: 'Future', value: stats.futureAvg },
          { label: 'Peak Age', value: `${stats.peakAge}` },
          { label: 'Valley Age', value: `${stats.valleyAge}` },
          { label: 'Trend', value: getTrendLabel(stats.trend), icon: getTrendIcon(stats.trend) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-center"
          >
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {stat.icon}
              <p className="text-sm font-bold font-mono text-white/80">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
