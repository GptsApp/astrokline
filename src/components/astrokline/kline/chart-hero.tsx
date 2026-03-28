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
          className="relative overflow-hidden border border-white/[0.04] bg-[#0A0A0F]/80 backdrop-blur-sm"
        >
          {/* Background glows - unified single muted gold source */}
          <div className="pointer-events-none absolute top-0 right-1/4 h-[250px] w-[250px] bg-[#D4AF37]/[0.05] blur-[80px]" />

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
              <div className="border border-white/[0.02] bg-white/[0.01] p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Orbit className="text-[#D4AF37]/60 h-3.5 w-3.5" />
                  <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">
                    Personal Positions
                  </span>
                </div>
                <div className="space-y-0">
                  {personal.map((planet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-white/[0.02] py-2.5 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white/30 font-mono text-[9px] w-6">
                          {(planet.name || '').slice(0, 3).toUpperCase()}
                        </span>
                        <span className="text-[13px] font-medium text-white/80">
                          {planet.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-4 font-mono">
                        <span className="text-[#D4AF37]/90 w-10 text-right text-xs font-semibold">
                          {planet.sign.substring(0, 3).toUpperCase()}
                        </span>
                        <span className="w-12 text-right text-[11px] text-white/40">
                          {planet.degree}°
                          {planet.minute.toString().padStart(2, '0')}'
                        </span>
                        <span className="w-6 text-right text-[9px] text-white/20">
                          H{planet.house}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outer Planets */}
              <div className="border border-white/[0.02] bg-white/[0.01] p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
                    Outer & Generational
                  </span>
                </div>
                <div className="space-y-0">
                  {outer.map((planet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-white/[0.02] py-2.5 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-white/30 w-6">
                          {(planet.name || '').slice(0, 3).toUpperCase()}
                        </span>
                        <span className="text-[13px] font-medium text-white/80">
                          {planet.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-4 font-mono">
                        <span className="w-10 text-right text-xs font-semibold text-white/60">
                          {planet.sign.substring(0, 3).toUpperCase()}
                        </span>
                        <span className="w-12 text-right text-[11px] text-white/40">
                          {planet.degree}°
                          {planet.minute.toString().padStart(2, '0')}'
                        </span>
                        <span className="w-6 text-right text-[9px] text-white/20">
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
          <div className="relative z-20 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-center gap-2 py-4 text-[9px] font-bold tracking-widest text-white/30 uppercase transition-colors hover:text-white/50"
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
