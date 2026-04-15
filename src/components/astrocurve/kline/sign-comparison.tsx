'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import type { UserProfile, DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';

const COMP_COPY = {
  en: {
    vsAvg: (sign: string) => `You vs Average ${sign}`,
    peakWindow: (peak: string) => `Peak window: ${peak}`,
    currentScore: 'Current Score',
    volatility: 'Volatility',
    you: 'You',
    avgSign: (sign: string) => `Avg. ${sign}`,
    pts: 'pts',
  },
  ja: {
    vsAvg: (sign: string) => `あなた vs ${sign}の平均`,
    peakWindow: (peak: string) => `ピーク期: ${peak}`,
    currentScore: '現在のスコア',
    volatility: '変動性',
    you: 'あなた',
    avgSign: (sign: string) => `${sign}平均`,
    pts: 'pt',
  },
  es: {
    vsAvg: (sign: string) => `Tú vs Promedio ${sign}`,
    peakWindow: (peak: string) => `Ventana pico: ${peak}`,
    currentScore: 'Puntuación Actual',
    volatility: 'Volatilidad',
    you: 'Tú',
    avgSign: (sign: string) => `Prom. ${sign}`,
    pts: 'pts',
  },
} as const;

/**
 * Average life-curve score by sun sign (simulated population data).
 * These represent "typical" scores — the user compares against their sign.
 */
const SIGN_AVERAGES: Record<string, { score: number; volatility: number; peak: string }> = {
  Aries:       { score: 62, volatility: 18, peak: 'late 20s' },
  Taurus:      { score: 66, volatility: 10, peak: 'mid 30s' },
  Gemini:      { score: 59, volatility: 22, peak: 'early 30s' },
  Cancer:      { score: 64, volatility: 14, peak: 'late 30s' },
  Leo:         { score: 68, volatility: 16, peak: 'early 30s' },
  Virgo:       { score: 63, volatility: 12, peak: 'mid 30s' },
  Libra:       { score: 65, volatility: 13, peak: 'late 20s' },
  Scorpio:     { score: 61, volatility: 20, peak: 'mid 30s' },
  Sagittarius: { score: 67, volatility: 19, peak: 'early 30s' },
  Capricorn:   { score: 64, volatility: 11, peak: 'late 30s' },
  Aquarius:    { score: 60, volatility: 21, peak: 'early 30s' },
  Pisces:      { score: 63, volatility: 15, peak: 'late 20s' },
};

interface SignComparisonProps {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
}

export function SignComparison({ profile, klineData }: SignComparisonProps) {
  const locale = useLocale();
  const copy = COMP_COPY[locale as keyof typeof COMP_COPY] ?? COMP_COPY.en;
  const sign = profile.sun.sign;
  const avg = SIGN_AVERAGES[sign] ?? SIGN_AVERAGES.Aries;

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentPoint = klineData.find((p) => p.year === currentYear);
    const userScore = currentPoint?.score ?? profile.overallAverageScore ?? 65;

    // Calculate user volatility (std dev of recent 10 years)
    const recentScores = klineData
      .filter((p) => p.year >= currentYear - 5 && p.year <= currentYear + 5)
      .map((p) => p.score);
    const mean = recentScores.reduce((a, b) => a + b, 0) / (recentScores.length || 1);
    const variance = recentScores.reduce((a, b) => a + (b - mean) ** 2, 0) / (recentScores.length || 1);
    const userVolatility = Math.round(Math.sqrt(variance));

    const delta = userScore - avg.score;
    const deltaLabel = delta > 0 ? `+${delta}` : String(delta);

    return { userScore, userVolatility, delta, deltaLabel };
  }, [klineData, avg.score, profile.overallAverageScore]);

  const rows = [
    {
      label: copy.currentScore,
      user: stats.userScore,
      avg: avg.score,
      suffix: '',
    },
    {
      label: copy.volatility,
      user: stats.userVolatility,
      avg: avg.volatility,
      suffix: '',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border border-white/[0.06] bg-white/[0.02] p-5 md:p-6"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">
          {copy.vsAvg(sign)}
        </p>
        <span className="font-mono text-[10px] text-white/25">
          {copy.peakWindow(avg.peak)}
        </span>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const userPct = Math.min(row.user, 100);
          const avgPct = Math.min(row.avg, 100);
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] text-white/40">{row.label}</span>
                <span className="font-mono text-[11px] tabular-nums text-white/60">
                  {row.user}{row.suffix}
                  <span className="text-white/25"> / </span>
                  {row.avg}{row.suffix}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden bg-white/[0.04]">
                {/* Average bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white/10"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${avgPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
                {/* User bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#D4AF37]/60"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${userPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] pt-3">
        <div className="h-2 w-2 bg-[#D4AF37]/60" />
        <span className="text-[10px] text-white/30">{copy.you}</span>
        <div className="ml-3 h-2 w-2 bg-white/10" />
        <span className="text-[10px] text-white/30">{copy.avgSign(sign)}</span>
        {stats.delta !== 0 && (
          <span className={`ml-auto font-mono text-[11px] font-bold ${stats.delta > 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
            {stats.deltaLabel} {copy.pts}
          </span>
        )}
      </div>
    </motion.div>
  );
}
