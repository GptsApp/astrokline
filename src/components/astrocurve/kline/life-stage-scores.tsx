'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';
import { Minus, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface Props {
  data: DestinyScorePoint[];
  birthYear: number;
}

import { useTranslations } from 'next-intl';

interface StageInfo {
  key: string;
  ageRange: string;
  startAge: number;
  endAge: number;
}

const STAGES: StageInfo[] = [
  { key: 'childhood', ageRange: '0-12', startAge: 0, endAge: 12 },
  { key: 'youth', ageRange: '13-30', startAge: 13, endAge: 30 },
  { key: 'prime', ageRange: '31-50', startAge: 31, endAge: 50 },
  { key: 'middle', ageRange: '51-65', startAge: 51, endAge: 65 },
  { key: 'elder', ageRange: '66+', startAge: 66, endAge: 100 },
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
  if (score >= 35) return 'Below Average';
  return 'Challenging';
}

function getTrendIcon(trend: number) {
  if (trend > 3) return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend < -3) return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-white/40" />;
}

function getTrendLabel(trend: number, t: any): string {
  if (trend > 10) return t('trends.rising_fast');
  if (trend > 3) return t('trends.rising');
  if (trend > -3) return t('trends.stable');
  if (trend > -10) return t('trends.declining');
  return t('trends.falling');
}

export function LifeStageScores({ data, birthYear }: Props) {
  const t = useTranslations('pages.index.page.sections.kline_result.scores');

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
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <div className="border border-white/[0.04] bg-[#0A0A0F]/80 p-6 backdrop-blur-sm md:p-10">
        <div className="mb-10 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-sm bg-[#D4AF37]/10 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase"
          >
            <Sparkles className="h-3 w-3" />
            {t("engine")}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl text-white/90 leading-[1.15]"
          >
            {t("title")}
          </motion.h2>
        </div>

        {/* Stage Scores */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
          {stats.stageScores.map((stage, i) => {
            const isCurrentStage =
              stats.currentAge >= stage.startAge &&
              stats.currentAge <= stage.endAge;
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  'group relative flex flex-col items-center justify-center overflow-hidden border p-6 transition-colors duration-500',
                  isCurrentStage
                    ? 'border-[#D4AF37]/20 bg-[#D4AF37]/[0.05]'
                    : 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.03]'
                )}
              >
                {isCurrentStage ? (
                  <div className="absolute -right-8 -top-8 z-0 h-28 w-28 bg-[#D4AF37]/10 blur-[40px] transition-opacity duration-700 group-hover:opacity-100" />
                ) : (
                  <div className={"absolute -right-8 -top-8 z-0 h-28 w-28 bg-white/10 opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-10"} />
                )}
                
                <div className={cn("relative z-10 mb-2 mt-1 text-[10px] font-bold tracking-[0.2em] uppercase", isCurrentStage ? "text-[#D4AF37]" : "text-white/40")}>
                  {/* @ts-ignore - dynamic key */}
                  {t(`stages.${stage.key}`)}
                </div>
                <div className={cn("relative z-10 font-mono text-3xl font-medium tracking-tighter md:text-4xl", getScoreColor(stage.score).split(' ')[0])}>
                  {stage.score}
                </div>
                {isCurrentStage && <div className="mt-3 relative z-10 rounded-sm bg-[#D4AF37]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">{t('current')}</div>}
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-t border-white/[0.04] pt-8 pb-2"
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{t("stats.historical_avg")}</span>
            <span className="font-mono text-xl text-white/90">{stats.historicalAvg}</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{t("stats.future_avg")}</span>
            <span className="font-mono text-xl text-white/90">{stats.futureAvg}</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{t("stats.peak_age")}</span>
            <span className="font-mono text-xl text-[#D4AF37]">{stats.peakAge}</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{t("stats.trend")}</span>
            <span
              className={cn(
                'font-mono text-xl',
                stats.trend > 3
                  ? 'text-emerald-400'
                  : stats.trend < -3
                    ? 'text-rose-400'
                    : 'text-white/60'
              )}
            >
              {getTrendLabel(stats.trend, t)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
