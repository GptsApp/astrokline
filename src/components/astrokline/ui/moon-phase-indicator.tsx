'use client';

import { useState, useEffect } from 'react';

/**
 * Calculate the current moon phase and zodiac sign.
 * Uses a simplified astronomical algorithm:
 * - Moon phase: based on lunation cycle (29.53059 days)
 * - Moon sign: based on the moon's ~27.32 day transit through the zodiac
 */

const MOON_PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
] as const;

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** SVG moon phase icon — illumination percentage determines the visual */
function MoonIcon({ phaseIndex }: { phaseIndex: number }) {
  // 0=new, 1=waxing crescent, 2=first quarter, 3=waxing gibbous,
  // 4=full, 5=waning gibbous, 6=last quarter, 7=waning crescent
  const illumination = [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25][phaseIndex];
  const isWaning = phaseIndex >= 5;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {illumination > 0 && (
        <ellipse
          cx="12"
          cy="12"
          rx={10 * illumination}
          ry="10"
          fill="rgba(212,175,55,0.6)"
          transform={isWaning ? 'translate(0,0)' : 'translate(0,0)'}
        />
      )}
    </svg>
  );
}

interface MoonData {
  phase: string;
  phaseIndex: number;
  sign: string;
}

function calculateMoonData(date: Date): MoonData {
  // Reference new moon: Jan 6, 2000 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const synodicMonth = 29.53059; // days
  const siderealMonth = 27.321661; // days

  const daysSinceNewMoon = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);

  // Moon phase (synodic)
  const lunarAge = ((daysSinceNewMoon % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseIndex = Math.floor((lunarAge / synodicMonth) * 8) % 8;

  // Moon sign (sidereal, simplified)
  const moonCycles = daysSinceNewMoon / siderealMonth;
  const moonPosition = ((moonCycles % 1) + 1) % 1;
  const signIndex = Math.floor(moonPosition * 12) % 12;

  return {
    phase: MOON_PHASE_NAMES[phaseIndex],
    phaseIndex,
    sign: ZODIAC_SIGNS[signIndex],
  };
}

export function MoonPhaseIndicator() {
  const [moonData, setMoonData] = useState<MoonData | null>(null);

  useEffect(() => {
    setMoonData(calculateMoonData(new Date()));
  }, []);

  if (!moonData) return null;

  return (
    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50 select-none">
      <MoonIcon phaseIndex={moonData.phaseIndex} />
      <span className="tracking-wide">{moonData.phase} in {moonData.sign}</span>
    </div>
  );
}
