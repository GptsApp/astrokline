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
  const scoreColor = score >= 85 ? 'text-[#D4AF37]' : score >= 60 ? 'text-white/90' : 'text-white/50';
  const scoreRingColor = score >= 85 ? 'stroke-[#D4AF37]' : score >= 60 ? 'stroke-white/40' : 'stroke-white/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full border border-white/[0.04] bg-[#0A0A0F]/80 backdrop-blur-sm"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 px-6 py-6 md:grid-cols-4 md:px-8 md:py-8 lg:gap-x-12">
        
        {/* Col 1: Name & Meta */}
        <div className="col-span-2 flex flex-col justify-center space-y-3 border-b border-white/[0.04] pb-6 md:col-span-1 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">
              Subject
            </span>
            <Heading level={2} className="truncate font-serif text-3xl text-white/90">
              {profile.name}
            </Heading>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] font-mono text-white/30">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 opacity-50" />
              {profile.birthDate}
            </span>
            {profile.birthTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 opacity-50" />
                {profile.birthTime}
              </span>
            )}
            {profile.birthLocation && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 opacity-50" />
                <span className="truncate">{profile.birthLocation}</span>
              </span>
            )}
          </div>
        </div>

        {/* Col 2: Big Three */}
        <div className="flex flex-col justify-center gap-3">
           <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">
              Primary Trine
           </span>
           <div className="flex flex-col gap-2 font-mono text-[11px] tracking-widest text-white/40 uppercase">
            {[
              { label: 'SUN', sign: sunSign },
              { label: 'MOON', sign: moonSign },
              { label: 'ASC', sign: risingSign },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 border-b border-white/[0.02] pb-1.5 last:border-b-0 last:pb-0">
                <span className="opacity-60">{item.label}</span>
                <span className="text-white/80 font-medium">{item.sign.substring(0, 3)}</span>
              </div>
            ))}
           </div>
        </div>

        {/* Col 3: Snapshot Year */}
        <div className="flex flex-col justify-center gap-3 md:pl-6 md:border-l md:border-white/[0.04]">
          <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">
             Analysis Year
          </span>
          <div className="flex flex-col gap-2 text-white/40 font-mono text-[11px] uppercase tracking-widest">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.02] pb-1.5 mt-[2px]">
              <span className="opacity-60">TARGET</span>
              <span className="text-white/80 font-medium">{currentYear}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.02] pb-1.5 mt-[2px]">
              <span className="opacity-60">TREND</span>
              <span className={cn('flex items-center gap-1 font-medium', 
                scoreDiff > 3 ? 'text-white/80' : scoreDiff < -3 ? 'text-white/40' : 'text-white/60'
              )}>
                <TrendIcon className="h-3 w-3" />
                {trendLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Col 4: Score Circle */}
        <div className="flex flex-col items-center justify-center gap-3 border-t border-white/[0.04] pt-6 md:border-t-0 md:pt-0 md:pl-6 md:border-l">
           <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">
              Vitality Index
           </span>
           <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
                <circle
                  cx="50%" cy="50%" r="42%" fill="none"
                  strokeWidth="2" pathLength="100"
                  style={{ strokeDasharray: '100', strokeDashoffset: 100 - score }}
                  className={cn('transition-all duration-700', scoreRingColor)}
                  strokeLinecap="round"
                />
              </svg>
              <span className={cn('z-10 font-mono text-2xl font-bold leading-none tracking-tight', scoreColor)}>
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
