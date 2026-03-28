'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe, Orbit } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import { AdvancedAstrologyData } from './advanced-astrology-data';
import { AstrologyChartWheel } from './astrology-chart-wheel';
import { Heading } from "@/components/astrokline/ui/heading";

interface Props {
  profile: UserProfile;
}

// Categorize planets into personal / social / transpersonal
const PERSONAL = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];

export function ChartHero({ profile }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const personal =
    profile.planets?.filter((p) => PERSONAL.includes(p.name || '')) || [];
  const outer =
    profile.planets?.filter((p) => !PERSONAL.includes(p.name || '')) || [];

  return (
    <section className="relative w-full overflow-hidden pt-3 pb-2">
      <div className="relative z-10 mx-auto max-w-7xl px-3 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden  border border-white/5 bg-[#111015]/80 shadow-2xl backdrop-blur-md"
        >
          {/* Background glows */}
          <div className="pointer-events-none absolute top-0 right-1/4 h-[200px] w-[200px] bg-purple-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[150px] w-[150px] bg-[#D4AF37]/5 blur-[60px]" />

          {/* Header */}
          <div className="relative z-20 flex justify-center pt-6 pb-2">
            <Heading level={3} className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase">
              Natal Chart
            </Heading>
          </div>

          {/* ── Main Grid: Wheel + Planetary Positions ── */}
          <div className="relative z-20 grid grid-cols-1 gap-6 p-5 md:p-8 lg:grid-cols-[1fr_380px]">
            {/* Left: Chart Wheel */}
            <div className="flex justify-center lg:justify-center">
              <div className="h-[340px] w-[340px] md:h-[400px] md:w-[400px]">
                <AstrologyChartWheel
                  planets={profile.planets || []}
                  rising={profile.rising}
                  size={500}
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Right: Planetary Positions — two groups */}
            <div className="flex flex-col gap-4">
              {/* Personal Planets */}
              <div className=" border border-white/5 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Orbit className="text-primary/60 h-3.5 w-3.5" />
                  <span className="text-primary/50 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Personal Planets
                  </span>
                </div>
                <div className="space-y-0">
                  {personal.map((planet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-b-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="bg-primary/10 text-primary/80 flex h-5 w-7 items-center justify-center  font-mono text-[9px] font-bold">
                          {(planet.name || '').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-white/80">
                          {planet.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-primary w-[80px] text-sm font-medium">
                          {planet.sign}
                        </span>
                        <span className="w-[50px] text-right font-mono text-xs text-white/50">
                          {planet.degree}°
                          {planet.minute.toString().padStart(2, '0')}'
                        </span>
                        <span className="w-6 text-right font-mono text-[10px] text-white/25">
                          H{planet.house}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outer Planets */}
              <div className=" border border-white/5 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-indigo-400/60" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-400/50 uppercase">
                    Outer Planets
                  </span>
                </div>
                <div className="space-y-0">
                  {outer.map((planet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-b-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-7 items-center justify-center  bg-indigo-500/10 font-mono text-[9px] font-bold text-indigo-400/80">
                          {(planet.name || '').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-white/80">
                          {planet.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-[80px] text-sm font-medium text-indigo-300/80">
                          {planet.sign}
                        </span>
                        <span className="w-[50px] text-right font-mono text-xs text-white/50">
                          {planet.degree}°
                          {planet.minute.toString().padStart(2, '0')}'
                        </span>
                        <span className="w-6 text-right font-mono text-[10px] text-white/25">
                          H{planet.house}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Advanced Analysis Toggle ── */}
          <div className="relative z-20 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-[0.2em] text-white/30 uppercase transition-colors hover:text-white/50"
            >
              Advanced Analysis
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-300',
                  showAdvanced && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <AdvancedAstrologyData profile={profile} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
