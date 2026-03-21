'use client';

import { TransitEvent } from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, Target, Zap } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface Props {
  transits: TransitEvent[];
}

const getAspectColor = (aspect: string) => {
  switch (aspect.toLowerCase()) {
    case 'trine':
    case 'sextile':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'square':
    case 'opposition':
      return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    case 'conjunction':
      return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20';
    default:
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  }
};

const getThemeIcon = (theme: string) => {
  switch (theme.toLowerCase()) {
    case 'career':
      return <Target className="h-5 w-5 text-blue-400" />;
    case 'wealth':
      return <Zap className="h-5 w-5 text-yellow-500" />;
    case 'growth':
      return <Sparkles className="h-5 w-5 text-purple-400" />;
    case 'love':
      return <Shield className="h-5 w-5 text-rose-400" />;
    default:
      return <Zap className="h-5 w-5 text-white/50" />;
  }
};

export function TransitAspects({ transits }: Props) {
  if (!transits || transits.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-serif text-xl text-white/90">Current Transits</h3>
        <span className="font-mono text-xs tracking-widest text-white/40 uppercase">
          Orb &lt; 2°
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {transits.map((transit, index) => (
          <motion.div
            key={transit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#111015]/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/10"
          >
            {/* Top row: Theme & Aspect Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-white/5 p-2 shadow-inner">
                  {getThemeIcon(transit.theme)}
                </div>
                <span className="text-sm font-semibold text-white/80">
                  {transit.theme}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {transit.phase && (
                  <span
                    className={cn(
                      'font-mono text-[10px] font-bold tracking-widest uppercase',
                      transit.phase === 'Applying'
                        ? 'text-primary'
                        : transit.phase === 'Exact'
                          ? 'text-white/90'
                          : 'text-white/40'
                    )}
                  >
                    {transit.phase === 'Applying'
                      ? 'Applying ↗'
                      : transit.phase === 'Exact'
                        ? 'Exact ●'
                        : 'Separating ↘'}
                  </span>
                )}
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase',
                    getAspectColor(transit.aspect)
                  )}
                >
                  {transit.aspect}
                </span>
              </div>
            </div>

            {/* The Actual Transit Formula */}
            <div className="my-1 flex items-center justify-between border-y border-white/5 py-2">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg text-white/90">
                  Transit {transit.planet}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/50">
                  Natal Object
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <h4 className="mb-2 text-base font-bold text-white/90">
                {transit.title}
              </h4>
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-white/60 transition-all group-hover:line-clamp-none">
                {transit.description}
              </p>

              {/* Strategic Advice */}
              <div className="mt-auto border-t border-white/5 pt-4">
                <p className="text-xs leading-relaxed font-medium text-[#D4AF37]/90">
                  <span className="mr-2 text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                    Strategy
                  </span>
                  {transit.advice}
                </p>
              </div>
            </div>

            {/* Intensity Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-2xl bg-black/40">
              <div
                className={cn(
                  'h-full transition-all duration-1000',
                  transit.impactScore >= 8
                    ? 'bg-rose-500'
                    : transit.impactScore >= 5
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                )}
                style={{ width: `${(transit.impactScore / 10) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
