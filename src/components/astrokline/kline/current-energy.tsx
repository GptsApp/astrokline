'use client';

import type { CurrentEnergyData } from '@/lib/astrokline/personalized-report';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Sparkles, Target } from 'lucide-react';

function buildFallbackCurrentEnergy(): CurrentEnergyData {
  const currentYear = new Date().getFullYear();

  return {
    monthLabel: new Date().toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    monthBadge: 'Steady Signal',
    monthTitle: 'Measured Execution Window',
    monthDescription:
      'This month is better for precise execution than emotional overreach. Small, repeatable actions compound faster than dramatic pivots.',
    monthAdvice:
      'Choose one high-leverage priority, remove one distraction, and let consistency do the heavy work.',
    yearLabel: `Theme of ${currentYear}`,
    yearBadge: 'Growth',
    yearTitle: 'Structural Growth Year',
    yearDescription:
      'The annual cycle favors cleaner systems, stronger boundaries, and decisions that remain useful after the initial excitement fades.',
    yearAdvice:
      'Build leverage you can keep. The best move this year is durable positioning, not short-lived intensity.',
  };
}

export function CurrentEnergy({ data }: { data?: CurrentEnergyData | null }) {
  const energy = data ?? buildFallbackCurrentEnergy();

  return (
    <div className="w-full space-y-8 py-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight">
          Current Time Guide
        </h2>
        <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        {/* THIS MONTH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#15131A] to-[#111015] p-6 shadow-2xl md:p-8"
        >
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl transition-colors group-hover:bg-emerald-500/20" />

          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <span className="block text-sm font-semibold tracking-wider text-white/50 uppercase">
                    This Month
                  </span>
                  <span className="text-lg font-bold text-white">{energy.monthLabel}</span>
                </div>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                {energy.monthBadge}
              </div>
            </div>

            <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">
              {energy.monthTitle}
            </h3>
            <p className="text-muted-foreground mb-6 text-[15px] leading-relaxed">
              {energy.monthDescription}
            </p>

            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-medium text-white/90">{energy.monthAdvice}</p>
            </div>
          </div>
        </motion.div>

        {/* THIS YEAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#15131A] to-[#111015] p-6 shadow-2xl md:p-8"
        >
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#D4AF37]/10 blur-3xl transition-colors group-hover:bg-[#D4AF37]/20" />

          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <Target className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <span className="block text-sm font-semibold tracking-wider text-white/50 uppercase">
                    This Year
                  </span>
                  <span className="text-lg font-bold text-white">{energy.yearLabel}</span>
                </div>
              </div>
              <div className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                {energy.yearBadge}
              </div>
            </div>

            <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">
              {energy.yearTitle}
            </h3>
            <p className="text-muted-foreground mb-6 text-[15px] leading-relaxed">
              {energy.yearDescription}
            </p>

            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
              <p className="text-sm font-medium text-white/90">{energy.yearAdvice}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
