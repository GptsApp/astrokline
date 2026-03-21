'use client';

import type {
  DestinyScorePoint,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';
import {
  Compass,
  Droplets,
  Flame,
  Minus,
  Moon,
  Mountain,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface Props {
  profile: UserProfile;
  currentYearData?: DestinyScorePoint;
  klineData?: DestinyScorePoint[];
  onShare?: () => void;
}

const ELEMENT_CONFIG: Record<
  string,
  { icon: typeof Flame; color: string; bg: string; border: string }
> = {
  fire: {
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  earth: {
    icon: Mountain,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  air: {
    icon: Wind,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  water: {
    icon: Droplets,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
};

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

  // Dominant element
  const elements = profile.elements;
  const dominantElement = Object.entries(elements).sort(
    ([, a], [, b]) => b - a
  )[0];
  const elConf = ELEMENT_CONFIG[dominantElement[0]] || ELEMENT_CONFIG.fire;
  const ElIcon = elConf.icon;

  // Birth info
  const birthYear = profile.birthDate?.split('-')[0] || '--';

  // Trend
  const prevYearData = klineData?.find((d) => d.year === currentYear - 1);
  const scoreDiff = prevYearData ? score - prevYearData.score : 0;
  const TrendIcon =
    scoreDiff > 3 ? TrendingUp : scoreDiff < -3 ? TrendingDown : Minus;
  const trendLabel =
    scoreDiff > 3 ? 'Rising' : scoreDiff < -3 ? 'Falling' : 'Stable';
  const trendColor =
    scoreDiff > 3
      ? 'text-emerald-400'
      : scoreDiff < -3
        ? 'text-rose-400'
        : 'text-white/50';

  // Big three zodiac
  const bigThree = [
    {
      label: 'Sun',
      sign: profile.sun.sign,
      icon: Sun,
      gradient: 'from-amber-500/20 to-orange-500/10',
    },
    {
      label: 'Moon',
      sign: profile.moon.sign,
      icon: Moon,
      gradient: 'from-indigo-500/20 to-purple-500/10',
    },
    {
      label: 'Rising',
      sign: profile.rising.sign,
      icon: Compass,
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#111015]/80 shadow-2xl backdrop-blur-md"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-0 left-0 h-[200px] w-[200px] rounded-full bg-[#D4AF37]/5 blur-[80px]" />
      <div className="pointer-events-none absolute right-1/2 bottom-0 h-[200px] w-[200px] rounded-full bg-purple-500/5 blur-[80px]" />

      {/* Top section: Name + Score */}
      <div className="relative z-10 flex flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row md:px-8 md:py-6">
        {/* Name & birth year */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
            Destiny Profile
          </span>
          <h2 className="mb-1 font-serif text-2xl text-white/90 md:text-3xl">
            {profile.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/40">Born {birthYear}</span>
            <span className="text-white/10">|</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                elConf.color,
                elConf.bg,
                'border',
                elConf.border
              )}
            >
              <ElIcon className="h-3 w-3" />
              {dominantElement[0].charAt(0).toUpperCase() +
                dominantElement[0].slice(1)}{' '}
              Dominant
            </span>
          </div>
        </div>

        {/* Score Arc */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
            <span className="mb-1 font-mono text-[10px] tracking-widest text-white/30 uppercase">
              {currentYear} Score
            </span>
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-bold',
                trendColor
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {trendLabel}
            </div>
          </div>
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center md:h-24 md:w-24">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                pathLength="100"
                style={{
                  strokeDasharray: '100',
                  strokeDashoffset: 100 - score,
                }}
                className={cn(
                  'transition-all duration-1000',
                  score >= 85
                    ? 'text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : score >= 60
                      ? 'text-primary/70'
                      : 'text-rose-400'
                )}
                strokeLinecap="round"
              />
            </svg>
            <span
              className={cn(
                'z-10 font-mono text-3xl leading-none font-bold tracking-tighter md:text-4xl',
                score >= 85
                  ? 'text-primary'
                  : score >= 60
                    ? 'text-white/90'
                    : 'text-rose-400'
              )}
            >
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-white/5 md:mx-8" />

      {/* Big Three: Sun / Moon / Rising — the info users care about most */}
      <div className="relative z-10 grid grid-cols-3 gap-3 px-6 py-5 md:px-8 md:py-6">
        {bigThree.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-gradient-to-b px-2 py-4',
                item.gradient
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Icon className="h-4.5 w-4.5 text-white/60" />
              </div>
              <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
                {item.label}
              </span>
              <span className="text-base font-bold text-white/90 md:text-lg">
                {item.sign}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Element Distribution Bar */}
      <div className="relative z-10 px-6 pb-5 md:px-8 md:pb-6">
        <div className="flex h-2 items-center gap-1 overflow-hidden rounded-full bg-white/5">
          {Object.entries(elements).map(([el, pct]) => {
            const conf = ELEMENT_CONFIG[el] || ELEMENT_CONFIG.fire;
            const colors: Record<string, string> = {
              fire: 'bg-orange-400',
              earth: 'bg-emerald-400',
              air: 'bg-sky-400',
              water: 'bg-blue-400',
            };
            return (
              <div
                key={el}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  colors[el]
                )}
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  opacity: pct > 0 ? 1 : 0.3,
                }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between">
          {Object.entries(elements).map(([el, pct]) => {
            const conf = ELEMENT_CONFIG[el];
            const ElI = conf?.icon || Flame;
            const elName = el.charAt(0).toUpperCase() + el.slice(1);
            return (
              <div key={el} className="flex items-center gap-1.5">
                <ElI
                  className={cn('h-3 w-3', conf?.color || 'text-white/40')}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    conf?.color || 'text-white/40'
                  )}
                >
                  {elName}
                </span>
                <span className="font-mono text-[10px] text-white/30">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
