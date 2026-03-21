'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles, TrendingUp } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface CrossLinkCardProps {
  /** "daily" or "kline" */
  target: 'daily' | 'kline';
  className?: string;
}

export function CrossLinkCard({ target, className }: CrossLinkCardProps) {
  const isDaily = target === 'daily';

  return (
    <motion.a
      href={isDaily ? '/daily' : '/kline'}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'group hover:border-primary/20 block w-full rounded-2xl border border-white/5 bg-[#111015] p-5 transition-all duration-300',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 border-primary/20 group-hover:bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors">
          {isDaily ? (
            <Calendar className="text-primary h-4 w-4" />
          ) : (
            <TrendingUp className="text-primary h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white/80 transition-colors group-hover:text-white">
            {isDaily
              ? 'Your daily cosmic weather is ready'
              : 'Want the full 10-year picture?'}
          </h4>
          <p className="mt-0.5 text-xs text-white/40">
            {isDaily
              ? "See today's energy alignment for Love, Career, Wealth & Health."
              : 'Map your destiny peaks, valleys, and turning points with your K-Line.'}
          </p>
        </div>
        <ArrowRight className="text-primary/50 group-hover:text-primary h-4 w-4 shrink-0 transition-all group-hover:translate-x-1" />
      </div>
    </motion.a>
  );
}
