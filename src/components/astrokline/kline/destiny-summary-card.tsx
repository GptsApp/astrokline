'use client';

import type { DestinyScorePoint, UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';

interface Props {
  profile: UserProfile;
  currentYearData?: DestinyScorePoint;
  klineData?: DestinyScorePoint[];
  onShare?: () => void;
}

export function DestinySummaryCard({ profile }: Props) {
  const sunSign = profile.sun.sign.substring(0, 3).toUpperCase();
  const moonSign = profile.moon.sign.substring(0, 3).toUpperCase();
  const risingSign = profile.rising.sign.substring(0, 3).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // Sleek, minimal, algorithmic layout (fused into kline background)
      className="w-full bg-transparent py-2 pb-6 text-[10px] sm:text-[11px] font-mono tracking-[0.15em] text-white/40 uppercase"
    >
      <div className="mx-auto flex w-full flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
        {/* Identity */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-bold text-white/90">{profile.name}</span>
          <span className="hidden text-white/20 sm:inline-block">|</span>
          <span>{profile.birthDate}</span>
          {profile.birthLocation && (
            <>
              <span className="hidden text-white/20 sm:inline-block">|</span>
              <span className="hidden md:inline-block">{profile.birthLocation}</span>
            </>
          )}
        </div>

        {/* Planetary Signature */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
          <span>SUN:{sunSign}</span>
          <span>MOON:{moonSign}</span>
          <span>ASC:{risingSign}</span>
        </div>

        {/* Engine Log */}
        <div className="hidden flex-wrap items-center justify-center gap-3 text-[9px] text-white/20 xl:flex">
          <span>[SWISSEPH_DE431]</span>
          <span>[NASA_JPL_EPHEM]</span>
        </div>
      </div>
    </motion.div>
  );
}
