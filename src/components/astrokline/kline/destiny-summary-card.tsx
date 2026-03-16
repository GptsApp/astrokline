"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { UserProfile, DestinyScorePoint } from "@/lib/astrokline/mock-astrology-data";

interface Props {
  profile: UserProfile;
  currentYearData?: DestinyScorePoint;
  klineData?: DestinyScorePoint[];
  onShare?: () => void;
}

export function DestinySummaryCard({ profile, currentYearData, klineData, onShare }: Props) {
  const currentYear = new Date().getFullYear();
  const yearData = currentYearData || klineData?.find(d => d.year === currentYear);
  const score = yearData?.score ?? 0;
  const stage = yearData?.stage ?? "Calculating...";

  // Determine dominant element
  const elements = profile.elements;
  const dominantElement = Object.entries(elements).sort(([,a], [,b]) => b - a)[0];
  const elementEmoji: Record<string, string> = { fire: "🔥", earth: "🌿", air: "💨", water: "💧" };

  // Birth year
  const birthYear = profile.birthDate?.split('-')[0] || '—';

  // Trend calculation
  const prevYearData = klineData?.find(d => d.year === currentYear - 1);
  const scoreDiff = prevYearData ? score - prevYearData.score : 0;
  const trendLabel = scoreDiff > 3 ? "↗ Rising" : scoreDiff < -3 ? "↘ Falling" : "→ Stable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full rounded-2xl bg-[#111015] border border-white/5 overflow-hidden relative"
    >
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 px-6 py-8 md:px-10 md:py-10 flex flex-col items-center text-center">
        {/* Score Circle */}
        <div className="relative mb-4">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-primary/30 flex flex-col items-center justify-center bg-[#0A0A0F]/80 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
            <span className={cn(
              "text-4xl md:text-5xl font-bold font-mono leading-none",
              score >= 85 ? "text-primary" : score >= 60 ? "text-white/90" : "text-rose-400"
            )}>
              {score}
            </span>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
              {currentYear} Score
            </span>
          </div>
        </div>

        {/* Trend */}
        <span className={cn(
          "text-xs font-mono px-3 py-1 rounded-full border mb-3",
          scoreDiff > 3 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
          scoreDiff < -3 ? "text-rose-400 border-rose-500/20 bg-rose-500/10" :
                           "text-white/50 border-white/10 bg-white/5"
        )}>
          {trendLabel}
        </span>

        {/* Name & Birth */}
        <p className="text-sm text-white/70 mb-2">
          {profile.name} · Born {birthYear}
        </p>

        {/* Dominant Element */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 px-3 py-1 rounded-full bg-white/5 border border-white/5 capitalize">
          {elementEmoji[dominantElement[0]] || "✦"} {dominantElement[0]} Dominant
        </span>
      </div>
    </motion.div>
  );
}
