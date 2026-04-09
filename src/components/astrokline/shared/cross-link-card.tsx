'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Lock, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/lib/utils';

interface CrossLinkCardProps {
  target: 'kline';
  className?: string;
}

export function CrossLinkCard({ target, className }: CrossLinkCardProps) {
  void target;
  const tc = useTranslations('common.crossLinkCard');

  return (
    <motion.a
      href="/kline"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'group hover:border-primary/20 block w-full  border border-white/5 bg-[#111015] p-5 transition-all duration-300',
        className
      )}
    >
      <div className="relative flex items-center gap-4 z-10">
        <div className="bg-primary/10 border-primary/20 group-hover:bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center border transition-colors">
          <TrendingUp className="text-primary h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white/80 transition-colors group-hover:text-white">
            Want the full 10-year picture?
          </h4>
          <p className="mt-0.5 text-xs text-white/40">
            Map your peaks, valleys, and turning points with your Life Curve.
          </p>
        </div>
        <ArrowRight className="text-primary/50 group-hover:text-primary h-4 w-4 shrink-0 transition-all group-hover:translate-x-1" />
      </div>

      {/* Blurred "Locked Graph" Visual (Growth Funnel Tactic) */}
      <div className="mt-4 relative h-16 w-full overflow-hidden  border border-white/5 bg-black/50">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full opacity-30 blur-sm"
        >
          <path
            d="M0 90 Q 25 20, 50 60 T 100 30 L100 100 L0 100 Z"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
          <div className="flex items-center gap-1.5 border border-white/10 bg-black/60 px-3 py-1 font-mono text-[10px] text-white/70">
            <Lock className="h-3 w-3 text-amber-400" /> {tc('lockedText')}
          </div>
        </div>
      </div>
    </motion.a>
  );
}
