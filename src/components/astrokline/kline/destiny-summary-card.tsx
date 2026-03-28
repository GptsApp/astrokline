'use client';

import type {
  DestinyScorePoint,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Heading } from "@/components/astrokline/ui/heading";

interface Props {
  profile: UserProfile;
  currentYearData?: DestinyScorePoint;
  klineData?: DestinyScorePoint[];
  onShare?: () => void;
}

export function DestinySummaryCard({
  profile,
  currentYearData,
  klineData,
  onShare,
}: Props) {
  const currentYear = new Date().getFullYear();
  const yearData =
    currentYearData || klineData?.find((d) => d.year === currentYear);
  const score = yearData?.score ?? 0;

  // Trend
  const prevYearData = klineData?.find((d) => d.year === currentYear - 1);
  const scoreDiff = prevYearData ? score - prevYearData.score : 0;
  const TrendIcon =
    scoreDiff > 3 ? TrendingUp : scoreDiff < -3 ? TrendingDown : Minus;
  const trendLabel =
    scoreDiff > 3 ? 'Rising' : scoreDiff < -3 ? 'Falling' : 'Stable';

  // Big three
  const sunSign = profile.sun.sign;
  const moonSign = profile.moon.sign;
  const risingSign = profile.rising.sign;

  // Score color
  const scoreColor = score >= 85 ? 'text-[#D4AF37]' : score >= 60 ? 'text-white/90' : 'text-rose-400';
  const scoreRingColor = score >= 85 ? 'stroke-[#D4AF37]' : score >= 60 ? 'stroke-white/40' : 'stroke-rose-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full border border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-6 md:px-8 md:py-5">
        
        {/* ── Left: Name + Meta ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-baseline gap-3">
            <Heading level={2} className="truncate font-serif text-xl text-white/90 md:text-2xl">
              {profile.name}
            </Heading>
            <span className="shrink-0 text-[10px] font-medium tracking-widest text-white/20 uppercase">
              Your Reading
            </span>
          </div>
          
          {/* Birth details — inline, muted */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/30">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {profile.birthDate}
            </span>
            {profile.birthTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {profile.birthTime}
              </span>
            )}
            {profile.birthLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.birthLocation}
              </span>
            )}
          </div>
        </div>

        {/* ── Center: Big Three — the star info ── */}
        <div className="flex items-center gap-1 md:gap-2">
          {[
            { glyph: '☉', label: 'Sun', sign: sunSign },
            { glyph: '☽', label: 'Moon', sign: moonSign },
            { glyph: '↑', label: 'Asc', sign: risingSign },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-1 md:gap-1.5">
              {i > 0 && <span className="text-white/10 mx-0.5 md:mx-1">·</span>}
              <span className="text-sm text-white/40 md:text-base">{item.glyph}</span>
              <span className="text-sm font-semibold text-white/80 md:text-base">{item.sign}</span>
            </div>
          ))}
        </div>

        {/* ── Right: Score ── */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase">
              {currentYear}
            </span>
            <div className={cn('flex items-center gap-0.5 text-xs font-medium', 
              scoreDiff > 3 ? 'text-emerald-400/70' : scoreDiff < -3 ? 'text-rose-400/70' : 'text-white/30'
            )}>
              <TrendIcon className="h-3 w-3" />
              {trendLabel}
            </div>
          </div>
          <div className="relative flex h-12 w-12 items-center justify-center md:h-14 md:w-14">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
              <circle
                cx="50%" cy="50%" r="42%" fill="none"
                strokeWidth="3" pathLength="100"
                style={{ strokeDasharray: '100', strokeDashoffset: 100 - score }}
                className={cn('transition-all duration-700', scoreRingColor)}
                strokeLinecap="round"
              />
            </svg>
            <span className={cn('z-10 font-mono text-lg font-bold leading-none tracking-tight md:text-xl', scoreColor)}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Trust micro-line */}
      <div className="border-t border-white/[0.04] px-5 py-2 md:px-8">
        <p className="text-center font-mono text-[9px] tracking-wider text-white/15">
          NASA JPL Ephemeris · Western Tropical System · {profile.birthLocation || 'Global'}
        </p>
      </div>
    </motion.div>
  );
}
