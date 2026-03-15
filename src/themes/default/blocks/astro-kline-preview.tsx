'use client';

import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroKlinePreview({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const years = ['2021', '2022', '2023', '2024', '2025', '2026'];
  const scores = ['100', '75', '50', '25', '0'];

  return (
    <section
      id={section.id || 'kline-preview'}
      className={cn(
        'py-24 relative border-y border-foreground/5',
        section.className,
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>{section.label || 'Interactive Destiny Tracker'}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {section.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {section.description}
          </p>
        </div>

        {/* Professional Chart Simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl h-[500px] md:h-[600px] bg-background border border-foreground/10 rounded-2xl md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden group pb-8 pr-4"
        >
          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 right-0 h-14 border-b border-foreground/10 bg-foreground/[0.02] flex items-center justify-between px-6 z-20">
            <div className="flex items-center justify-between gap-4 w-full md:w-auto">
              <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <Activity className="w-3 h-3 text-primary" /> CURRENT ENERGY:
                UPLIFTING
              </span>
              <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded border border-primary/20">
                DESTINY SCORE: 88
              </span>
            </div>
          </div>

          {/* Professional Chart Grid */}
          <div className="absolute inset-0 pt-14 pb-10 pl-16 pr-6">
            {/* Y-Axis Scores */}
            <div className="absolute left-0 top-14 bottom-10 w-16 flex flex-col justify-between items-end pr-4 text-[10px] font-mono text-muted-foreground/60">
              {scores.map((score, i) => (
                <span key={i} className="relative -top-2">
                  {score}
                </span>
              ))}
            </div>

            {/* Grid Lines */}
            <div
              className="w-full h-full relative"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20% 25%',
              }}
            >
              {/* SVG Graph Layer */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 400"
                preserveAspectRatio="none"
                className="absolute inset-0 overflow-visible drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                <defs>
                  <linearGradient
                    id="goldLineGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#8B7321" />
                    <stop offset="20%" stopColor="#D4AF37" />
                    <stop offset="80%" stopColor="#F5EBBA" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                  <linearGradient
                    id="areaFill"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(212,175,55,0.2)" />
                    <stop offset="100%" stopColor="rgba(212,175,55,0)" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <motion.path
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  d="M 0 200 C 100 200, 100 160, 200 160 C 300 160, 300 240, 400 240 C 500 240, 500 80, 600 80 C 700 80, 700 48, 800 48 C 900 48, 900 120, 1000 120 L 1000 400 L 0 400 Z"
                  fill="url(#areaFill)"
                />

                {/* Main Data Line */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  d="M 0 200 C 100 200, 100 160, 200 160 C 300 160, 300 240, 400 240 C 500 240, 500 80, 600 80 C 700 80, 700 48, 800 48 C 900 48, 900 120, 1000 120"
                  fill="none"
                  stroke="url(#goldLineGrad)"
                  strokeWidth="4"
                />

                {/* Data Point Nodes */}
                <circle
                  cx="200"
                  cy="160"
                  r="4"
                  fill="var(--background)"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75"
                />
                <circle
                  cx="400"
                  cy="240"
                  r="4"
                  fill="var(--background)"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                />
                <circle
                  cx="600"
                  cy="80"
                  r="4"
                  fill="var(--background)"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150"
                />
                <circle
                  cx="800"
                  cy="48"
                  r="6"
                  fill="#F5EBBA"
                  className="animate-pulse shadow-[0_0_20px_#F5EBBA]"
                />
                <circle
                  cx="1000"
                  cy="120"
                  r="4"
                  fill="var(--background)"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"
                />
              </svg>

              {/* Aha Moment Tooltip */}
              <div className="absolute top-[50%] left-[40%] -translate-x-1/2 -translate-y-[120%] hidden md:flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                <div className="px-4 py-3 bg-card backdrop-blur-xl rounded-xl border border-foreground/10 shadow-2xl relative z-10 w-48 pointer-events-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground/50 font-mono">
                      2023 Q3
                    </span>
                    <span className="text-[10px] text-red-400 font-bold bg-red-400/10 px-1 py-0.5 rounded">
                      CROSSROADS
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    A challenging period for growth. You let go of what no
                    longer served you.
                  </p>
                </div>
                <div className="w-3 h-3 bg-card border-b border-r border-foreground/10 rotate-45 -mt-1.5 relative z-0" />
              </div>

              {/* Current Peak Tooltip */}
              <div className="absolute top-[8%] left-[80%] -translate-x-1/2 -translate-y-full md:flex flex-col items-center">
                <div className="px-4 py-2 bg-primary/10 backdrop-blur-xl rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] relative z-10 whitespace-nowrap">
                  <span className="text-xs text-primary font-bold">
                    You are here: Ready to shine
                  </span>
                </div>
                <div className="w-1.5 h-1.5 bg-primary/50 rotate-45 -mt-1 relative z-0" />
              </div>
            </div>

            {/* X-Axis Years */}
            <div className="absolute left-16 right-6 bottom-0 h-10 flex justify-between items-center text-[11px] font-mono text-muted-foreground/60 px-1 border-t border-foreground/5">
              {years.map((year, i) => (
                <span key={i}>{year}</span>
              ))}
            </div>
          </div>

          {/* Blurred Future Zone Overlay */}
          <div className="absolute top-14 bottom-10 right-0 w-[25%] z-30 pointer-events-none">
            <div className="absolute inset-0 backdrop-blur-[6px] bg-gradient-to-l from-background/80 via-background/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <a
                href="#pricing"
                className="px-4 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-primary/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all whitespace-nowrap"
              >
                Unlock Future
              </a>
            </div>
          </div>
        </motion.div>

        {/* Below-chart CTA */}
        <p className="text-center text-sm text-muted-foreground/50 font-mono mt-6">
          Your past is validated. <a href="#pricing" className="text-primary font-semibold hover:underline">Unlock your future K-Line →</a>
        </p>
      </div>
    </section>
  );
}
