'use client';

import { motion } from 'framer-motion';
import { Activity, LockOpen, Sparkles } from 'lucide-react';

export function InteractiveKLineFake() {
  const years = ['2021', '2022', '2023', '2024', '2025', '2026'];
  const scores = ['100', '75', '50', '25', '0'];

  return (
    <section className="relative border-y border-white/5 bg-[#050505] py-24">
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6">
        <div className="mb-12 text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Interactive K-Line Preview</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            Your chart, visualized as a K-Line.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            See your long-term timing curve in a format that is easy to read,
            compare, and act on.
          </p>
        </div>

        {/* Faked Canvas Area: Professional Chart Simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="group relative h-[500px] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] pr-4 pb-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] md:h-[600px] md:rounded-3xl"
        >
          {/* Top Info Bar */}
          <div className="absolute top-0 right-0 left-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-white/[0.02] px-6">
            <div className="flex w-full items-center justify-between gap-4 md:w-auto">
              <span className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
                <Activity className="text-primary h-3 w-3" /> PLANETARY ENERGY:
                UPLIFTING
              </span>
              <span className="text-primary bg-primary/10 border-primary/20 rounded border px-3 py-1 text-xs font-bold">
                ASTRO K-LINE SCORE: 88
              </span>
            </div>
          </div>

          {/* Professional Chart Grid */}
          <div className="absolute inset-0 pt-14 pr-6 pb-10 pl-16">
            {/* Y-Axis Scores */}
            <div className="text-muted-foreground/60 absolute top-14 bottom-10 left-0 flex w-16 flex-col items-end justify-between pr-4 font-mono text-[10px]">
              {scores.map((score, i) => (
                <span key={i} className="relative -top-2">
                  {score}
                </span>
              ))}
            </div>

            {/* Grid Lines */}
            <div
              className="relative h-full w-full"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20% 25%', // 5 cols (6 points), 4 rows (5 points)
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
                  fill="#0A0A0A"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 transition-opacity delay-75 duration-300 group-hover:opacity-100"
                />
                <circle
                  cx="400"
                  cy="240"
                  r="4"
                  fill="#0A0A0A"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100"
                />
                <circle
                  cx="600"
                  cy="80"
                  r="4"
                  fill="#0A0A0A"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100"
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
                  fill="#0A0A0A"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  className="opacity-0 transition-opacity delay-300 duration-300 group-hover:opacity-100"
                />
              </svg>

              {/* Aha Moment Tooltip (Positioned over the lowest dip at x=400) */}
              <div className="absolute top-[50%] left-[40%] hidden -translate-x-1/2 -translate-y-[120%] flex-col items-center opacity-0 transition-opacity delay-300 duration-500 group-hover:opacity-100 md:flex">
                <div className="pointer-events-none relative z-10 w-48 rounded-xl border border-white/10 bg-[#111] px-4 py-3 shadow-2xl backdrop-blur-xl">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/50">
                      2023 Q3
                    </span>
                    <span className="rounded bg-red-400/10 px-1 py-0.5 text-[10px] font-bold text-red-400">
                      CROSSROADS
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-white">
                    A challenging planetary transit period. Your natal chart
                    shows transformation and cosmic growth.
                  </p>
                </div>
                {/* Pointer arrow */}
                <div className="relative z-0 -mt-1.5 h-3 w-3 rotate-45 border-r border-b border-white/10 bg-[#111]" />
              </div>

              {/* Current Peak Tooltip (Positioned over the highest peak at x=800) */}
              <div className="absolute top-[8%] left-[80%] -translate-x-1/2 -translate-y-full flex-col items-center md:flex">
                <div className="bg-primary/10 border-primary/30 relative z-10 rounded-xl border px-4 py-2 whitespace-nowrap shadow-[0_0_30px_rgba(212,175,55,0.2)] backdrop-blur-xl">
                  <span className="text-primary inline-flex items-center gap-1 text-xs font-bold">
                    <Sparkles className="h-3 w-3" /> You are here: Cosmic peak
                    energy
                  </span>
                </div>
                <div className="bg-primary/50 relative z-0 -mt-1 h-1.5 w-1.5 rotate-45" />
              </div>
            </div>

            {/* X-Axis Years */}
            <div className="text-muted-foreground/60 absolute right-6 bottom-0 left-16 flex h-10 items-center justify-between border-t border-white/5 px-1 font-mono text-[11px]">
              {years.map((year, i) => (
                <span key={i}>{year}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA below the preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <a
            href="/sign-in"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-14 items-center gap-2 rounded-2xl px-8 text-lg font-bold shadow-[0_0_30px_-5px_var(--primary)] transition-all hover:scale-105 hover:shadow-[0_0_50px_-5px_var(--primary)]"
          >
            <LockOpen className="h-5 w-5" />
            Unlock Your Full K-Line — Free
          </a>
          <p className="font-mono text-xs text-white/30">
            No credit card required · Takes 30 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}
