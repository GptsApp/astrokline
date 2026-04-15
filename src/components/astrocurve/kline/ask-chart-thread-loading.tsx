'use client';

import { motion } from 'framer-motion';
import { Crown, Moon, Sparkles, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AskChartThreadLoadingProps {
  threadTitle?: string | null;
  questionPreview?: string | null;
  className?: string;
  compact?: boolean;
}

const ORBITING_ICONS = [
  { Icon: Crown, className: 'left-0 top-2 text-[#D4AF37]', delay: 0 },
  { Icon: Moon, className: 'right-2 top-0 text-sky-300', delay: 0.25 },
  { Icon: Sun, className: 'right-0 bottom-3 text-amber-300', delay: 0.5 },
  { Icon: Sparkles, className: 'left-3 bottom-0 text-violet-300', delay: 0.75 },
];

export function AskChartThreadLoading({
  threadTitle,
  questionPreview,
  className,
  compact = false,
}: AskChartThreadLoadingProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-md rounded-2xl border border-[#D4AF37]/15 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_48%),linear-gradient(180deg,_rgba(18,16,33,0.96),_rgba(10,10,20,0.98))] px-5 py-6 text-center shadow-[0_24px_80px_rgba(10,10,20,0.45)]',
        compact ? 'max-w-sm px-4 py-5' : 'px-6 py-7',
        className
      )}
    >
      <div className={cn('relative mx-auto mb-5', compact ? 'h-20 w-20' : 'h-24 w-24')}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          {ORBITING_ICONS.map(({ Icon, className: iconClassName, delay }) => (
            <motion.div
              key={iconClassName}
              animate={{ y: [0, -6, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, delay, ease: 'easeInOut' }}
              className={cn('absolute flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm', compact ? 'h-8 w-8' : 'h-9 w-9', iconClassName)}
            >
              <Icon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[18px] flex items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.18)]"
        >
          <Sparkles className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        </motion.div>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#D4AF37]/80">
        Reopening your thread
      </p>
      <h3 className={cn('mt-3 font-semibold text-white/90', compact ? 'text-base' : 'text-lg')}>
        {threadTitle || 'Pulling this conversation back into orbit'}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/65">
        We are reconnecting the chart context, timing clues, and emotional thread so this conversation returns exactly where you left it.
      </p>

      {questionPreview ? (
        <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Last question</p>
          <p className="mt-2 text-sm leading-6 text-white/72">{questionPreview}</p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
        <span>Powered by AstroCurve</span>
      </div>
    </div>
  );
}