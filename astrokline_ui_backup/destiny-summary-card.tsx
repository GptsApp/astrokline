'use client';

import type {
  DestinyScorePoint,
  UserProfile,
} from '@/lib/astrocurve/mock-astrology-data';
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
import { Heading } from "@/components/astrocurve/ui/heading";

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
    scoreDiff > 3 ? 'RISING' : scoreDiff < -3 ? 'FALLING' : 'STABLE';

  // Big three
  const sunSign = profile.sun.sign;
  const moonSign = profile.moon.sign;
  const risingSign = profile.rising.sign;

  // Split name for stacking
  const nameParts = profile.name.split(' ');
  const stackedName = nameParts.length > 1 
    ? `${nameParts[0]}\n${nameParts.slice(1).join(' ')}`
    : profile.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full border border-white/5 bg-[#060608]"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 md:divide-x md:divide-white/5">
        
        {/* Col 1: Name & Meta */}
        <div className="flex flex-col justify-start p-8 md:p-10">
          <div>
            <span className="mb-8 block text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
              Subject
            </span>
            <Heading level={1} className="whitespace-pre-line break-words w-full font-serif text-4xl leading-tight tracking-tight text-white/95 md:text-[2.75rem] md:leading-[1.1] lg:text-5xl">
              {stackedName}
            </Heading>
          </div>
        </div>

        {/* Col 2: Vitality Index */}
        <div className="flex flex-col items-center justify-start border-t border-white/5 p-8 md:border-t-0 md:p-10">
           <span className="mb-8 block text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase text-center w-full">
              Vitality Index
           </span>
           <div className="relative flex h-28 w-28 items-center justify-center mt-2">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                <circle
                  cx="50%" cy="50%" r="46%" fill="none"
                  strokeWidth="3.5" pathLength="100"
                  style={{ strokeDasharray: '100', strokeDashoffset: 100 - score }}
                  className="transition-all duration-700 stroke-white/40"
                  strokeLinecap="round"
                />
              </svg>
              <span className="z-10 font-bold text-4xl tracking-tighter text-white">
                {score}
              </span>
           </div>
        </div>

        {/* Col 3: Primary Trine */}
        <div className="flex flex-col justify-start border-t border-white/5 p-8 md:border-t-0 md:p-10">
           <span className="mb-8 block text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
              Primary Trine
           </span>
           <div className="flex flex-col gap-5 font-mono text-[11px] text-white/40 uppercase tracking-widest w-full">
            {[
              { label: 'SUN', sign: sunSign },
              { label: 'MOON', sign: moonSign },
              { label: 'ASC', sign: risingSign },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-white/[0.03] pb-3.5 last:border-b-0 last:pb-0">
                <span className="opacity-70">{item.label}</span>
                <span className="font-bold text-[14px] tracking-widest text-white">{item.sign.substring(0, 3)}</span>
              </div>
            ))}
           </div>
        </div>

        {/* Col 4: Analysis Year */}
        <div className="flex flex-col justify-start border-t border-white/5 p-8 md:border-t-0 md:p-10">
          <span className="mb-8 block text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
             Analysis Year
          </span>
          <div className="flex flex-col gap-5 font-mono text-[11px] tracking-widest text-white/40 uppercase w-full">
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3.5">
              <span className="opacity-70">TARGET</span>
              <span className="font-bold text-[14px] tracking-widest text-white">{currentYear}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3.5 mt-1">
              <span className="opacity-70">TREND</span>
              <span className="flex items-center gap-2 font-bold text-[13px] tracking-widest text-white/80">
                <TrendIcon className="h-4 w-4 opacity-80" />
                {trendLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust micro-line */}
      <div className="border-t border-white/5 bg-white/[0.01] px-5 py-3 md:px-8 md:py-3.5">
        <p className="text-center font-mono text-[8px] sm:text-[9px] font-medium tracking-[0.15em] text-white/20 uppercase break-words w-full">
          NASA JPL Ephemeris · Western Tropical System
          {profile.birthDate && ` · ${profile.birthDate}`}
          {profile.birthLocation ? ` · ${profile.birthLocation}` : ' · Global'}
        </p>
      </div>
    </motion.div>
  );
}
