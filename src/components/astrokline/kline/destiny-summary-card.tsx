"use client";

import { motion } from "framer-motion";
import { Sun, Moon, ArrowUp, Share2, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { UserProfile, DestinyScorePoint } from "@/lib/astrokline/mock-astrology-data";

interface Props {
  profile: UserProfile;
  currentYearData?: DestinyScorePoint;
  klineData?: DestinyScorePoint[];
  onShare?: () => void;
}

/** Mini sparkline rendered as an SVG polyline */
function MiniSparkline({ data, className }: { data: DestinyScorePoint[]; className?: string }) {
  if (!data || data.length < 2) return null;
  const w = 200, h = 40, pad = 4;
  const min = Math.min(...data.map(d => d.score));
  const max = Math.max(...data.map(d => d.score));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.score - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full h-10", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.1)" />
          <stop offset="50%" stopColor="rgba(212,175,55,0.6)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.1)" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#spark-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function DestinySummaryCard({ profile, currentYearData, klineData, onShare }: Props) {
  const currentYear = new Date().getFullYear();
  const yearData = currentYearData || klineData?.find(d => d.year === currentYear);
  const score = yearData?.score ?? 0;
  const stage = yearData?.stage ?? "Calculating...";
  const isPeak = yearData?.isPeak ?? false;

  // Determine dominant element
  const elements = profile.elements;
  const dominantElement = Object.entries(elements).sort(([,a], [,b]) => b - a)[0];
  const dominantModality = Object.entries(profile.modalities).sort(([,a], [,b]) => b - a)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full rounded-2xl bg-[#111015] border border-white/5 overflow-hidden relative group"
    >
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Top row: Big Three */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500/70" />
            <span className="text-sm font-mono text-white/80">{profile.sun.sign} {profile.sun.degree}°{String(profile.sun.minute).padStart(2, '0')}&apos;</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-400/70" />
            <span className="text-sm font-mono text-white/80">{profile.moon.sign} {profile.moon.degree}°{String(profile.moon.minute).padStart(2, '0')}&apos;</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-purple-400/70" />
            <span className="text-sm font-mono text-white/80">{profile.rising.sign} {profile.rising.degree}°{String(profile.rising.minute).padStart(2, '0')}&apos;</span>
          </div>

          {/* Element & Modality chips */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 capitalize">
              {dominantElement[0]} {dominantElement[1]}%
            </span>
            <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 capitalize">
              {dominantModality[0]} {dominantModality[1]}%
            </span>
          </div>
        </div>

        {/* Center: Current Phase + Score */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
              {currentYear} · Current Phase
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white/90 leading-tight">
              {stage}
            </h2>
          </div>
          <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className={cn(
              "text-3xl font-bold font-mono",
              score >= 85 ? "text-primary" : score >= 60 ? "text-white/80" : "text-rose-400"
            )}>
              {score}
            </span>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Score</span>
            {isPeak && (
              <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                ★ Peak Year
              </span>
            )}
          </div>
        </div>

        {/* Mini Sparkline */}
        {klineData && klineData.length > 0 && (
          <div className="mb-6">
            <MiniSparkline data={klineData} />
          </div>
        )}

        {/* Bottom: CTA row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white/80 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share My Card
            </button>
          )}
          <a
            href="#kline-hero"
            className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors font-medium"
          >
            See Full K-Line
            <ChevronDown className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
