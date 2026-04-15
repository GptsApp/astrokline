'use client';

import { useMemo, useState } from 'react';
import {
  PlanetPlacement,
  UserProfile,
} from '@/lib/astrocurve/mock-astrology-data';

import { cn } from '@/shared/lib/utils';

interface Props {
  profile: UserProfile;
}

// ── Zodiac & Planet Mappings ──

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

// ── House Rulers by Sign ──
const SIGN_RULERS: Record<string, string[]> = {
  Aries: ['Mars'],
  Taurus: ['Venus'],
  Gemini: ['Mercury'],
  Cancer: ['Moon'],
  Leo: ['Sun'],
  Virgo: ['Mercury'],
  Libra: ['Venus'],
  Scorpio: ['Mars', 'Pluto'],
  Sagittarius: ['Jupiter'],
  Capricorn: ['Saturn'],
  Aquarius: ['Saturn', 'Uranus'],
  Pisces: ['Jupiter', 'Neptune'],
};

const SIGN_DEGREES: Record<string, number> = {
  Aries: 0,
  Taurus: 30,
  Gemini: 60,
  Cancer: 90,
  Leo: 120,
  Virgo: 150,
  Libra: 180,
  Scorpio: 210,
  Sagittarius: 240,
  Capricorn: 270,
  Aquarius: 300,
  Pisces: 330,
};

// ── Aspect Definitions ──
const ASPECT_TYPES = [
  { name: 'Conjunction', abbr: 'CNJ', angle: 0, orb: 8 },
  { name: 'Sextile', abbr: 'SXT', angle: 60, orb: 6 },
  { name: 'Square', abbr: 'SQR', angle: 90, orb: 7 },
  { name: 'Trine', abbr: 'TRI', angle: 120, orb: 8 },
  { name: 'Opposition', abbr: 'OPP', angle: 180, orb: 8 },
];

function getLongitude(p: PlanetPlacement): number {
  return (SIGN_DEGREES[p.sign] || 0) + p.degree + p.minute / 60;
}

function getShortestAngle(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return Math.min(diff, 360 - diff);
}

// ── Dynamic Computations ──

function computeHouses(planets: PlanetPlacement[], rising: PlanetPlacement) {
  const risingSignIdx = SIGN_ORDER.indexOf(rising.sign);
  return Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIdx = (risingSignIdx + i) % 12;
    const sign = SIGN_ORDER[signIdx];

    const rulers = SIGN_RULERS[sign] || [];
    const rulerInfo = rulers
      .map((rulerName) => {
        const rulerPlanet = planets.find((p) => p.name === rulerName);
        if (rulerPlanet) {
          return `${rulerName} in H${rulerPlanet.house}`;
        }
        return rulerName;
      })
      .join(', ');

    return { house: `H${houseNum}`, sign, ruler: rulerInfo };
  });
}

function computeAspects(planets: PlanetPlacement[]) {
  const aspects: {
    p1: string;
    p2: string;
    aspect: string;
    details: string;
    isHard: boolean;
  }[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      if (!p1.name || !p2.name) continue;

      const lon1 = getLongitude(p1);
      const lon2 = getLongitude(p2);
      const angle = getShortestAngle(lon1, lon2);

      for (const asp of ASPECT_TYPES) {
        if (asp.abbr === 'CNJ' && angle > asp.orb) continue;
        if (asp.abbr !== 'CNJ' && Math.abs(angle - asp.angle) > asp.orb)
          continue;

        const orbDeg = asp.abbr === 'CNJ' ? angle : Math.abs(angle - asp.angle);
        const orbWhole = Math.floor(orbDeg);
        const orbMin = Math.round((orbDeg - orbWhole) * 60);

        // Determine applying vs separating
        const SPEED_ORDER: Record<string, number> = {
          Moon: 0,
          Mercury: 1,
          Venus: 2,
          Sun: 3,
          Mars: 4,
          Jupiter: 5,
          Saturn: 6,
          Uranus: 7,
          Neptune: 8,
          Pluto: 9,
        };
        const speed1 = SPEED_ORDER[p1.name || ''] ?? 5;
        const speed2 = SPEED_ORDER[p2.name || ''] ?? 5;
        const fasterLon = speed1 < speed2 ? lon1 : lon2;
        const slowerLon = speed1 < speed2 ? lon2 : lon1;
        const exactPoint = (slowerLon + asp.angle) % 360;
        const distToExact = getShortestAngle(fasterLon, exactPoint);
        const phase = distToExact < orbDeg + 2 ? 'Applying' : 'Sep.';

        const isHard = asp.name === 'Square' || asp.name === 'Opposition';

        aspects.push({
          p1: p1.name,
          p2: p2.name,
          aspect: asp.name,
          details: `${phase} ${orbWhole}°${orbMin.toString().padStart(2, '0')}'`,
          isHard,
        });
        break;
      }
    }
  }
  return aspects;
}

function computePatterns(planets: PlanetPlacement[]) {
  const patterns: { type: string; planets: string }[] = [];

  // Detect Stelliums (3+ planets in the same house)
  const byHouse: Record<number, string[]> = {};
  planets.forEach((p) => {
    if (!p.name) return;
    if (!byHouse[p.house]) byHouse[p.house] = [];
    byHouse[p.house].push(p.name);
  });

  for (const [houseNum, names] of Object.entries(byHouse)) {
    if (names.length >= 3) {
      patterns.push({
        type: `Stellium (H${houseNum})`,
        planets: names.join(' - '),
      });
    }
  }

  // Detect T-Square
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const angle_ij = getShortestAngle(
        getLongitude(planets[i]),
        getLongitude(planets[j])
      );
      if (Math.abs(angle_ij - 180) > 10) continue;

      for (let k = 0; k < planets.length; k++) {
        if (k === i || k === j) continue;
        const angle_ik = getShortestAngle(
          getLongitude(planets[i]),
          getLongitude(planets[k])
        );
        const angle_jk = getShortestAngle(
          getLongitude(planets[j]),
          getLongitude(planets[k])
        );
        if (Math.abs(angle_ik - 90) < 10 && Math.abs(angle_jk - 90) < 10) {
          const n = [planets[i], planets[j], planets[k]]
            .map((p) => p.name)
            .join(' - ');
          patterns.push({ type: 'T-Square', planets: n });
        }
      }
    }
  }

  // Detect Grand Trine
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const a = getShortestAngle(
          getLongitude(planets[i]),
          getLongitude(planets[j])
        );
        const b = getShortestAngle(
          getLongitude(planets[j]),
          getLongitude(planets[k])
        );
        const c = getShortestAngle(
          getLongitude(planets[i]),
          getLongitude(planets[k])
        );
        if (
          Math.abs(a - 120) < 10 &&
          Math.abs(b - 120) < 10 &&
          Math.abs(c - 120) < 10
        ) {
          const n = [planets[i], planets[j], planets[k]]
            .map((p) => p.name)
            .join(' - ');
          patterns.push({ type: 'Grand Trine', planets: n });
        }
      }
    }
  }

  return patterns;
}

// ── Component ──

type TabType = 'houses' | 'aspects' | 'patterns';

export function AdvancedAstrologyData({ profile }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('houses');

  const houseData = useMemo(
    () => computeHouses(profile.planets || [], profile.rising),
    [profile.planets, profile.rising]
  );
  const aspectData = useMemo(
    () => computeAspects(profile.planets || []),
    [profile.planets]
  );
  const patternData = useMemo(
    () => computePatterns(profile.planets || []),
    [profile.planets]
  );

  return (
    <div className="w-full bg-[#0a0a0d] pb-4">
      {/* Tabs Header */}
      <div className="flex items-center justify-center gap-1 border-b border-white/5 bg-black/40 p-2">
        {[
          { id: 'houses', label: 'Houses' },
          { id: 'aspects', label: 'Aspects', count: aspectData.length },
          { id: 'patterns', label: 'Patterns', count: patternData.length },
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              ' px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-all',
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:bg-white/5 hover:text-white/70'
            )}
          >
            {tab.label}{' '}
            {tab.count !== undefined && (
              <span className="ml-1 opacity-50">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area - Scrollable to constrain height */}
      <div className="scrollbar-none custom-scrollbar max-h-[300px] overflow-y-auto p-4 md:p-6">
        {/* HOUSES */}
        {activeTab === 'houses' && (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
            {houseData.map((house, idx) => (
              <div
                key={idx}
                className="flex flex-col  border border-white/[0.04] bg-white/[0.02] p-2.5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/50">
                    {house.house}
                  </span>
                  <span className="text-[11px] font-medium text-[#D4AF37]">
                    {house.sign}
                  </span>
                </div>
                <span
                  className="truncate font-mono text-[9px] text-white/30"
                  title={house.ruler || 'Empty'}
                >
                  {house.ruler || 'Empty House'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ASPECTS */}
        {activeTab === 'aspects' && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
            {aspectData.length > 0 ? (
              aspectData.map((asp, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between  border border-transparent p-2 transition-colors hover:border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-[60px] text-xs font-medium text-white/80">
                      {asp.p1}
                    </span>
                    <span
                      className={cn(
                        ' px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase',
                        asp.isHard
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-blue-500/10 text-blue-400',
                        asp.aspect === 'Conjunction' &&
                          'bg-primary/10 text-primary'
                      )}
                    >
                      {asp.aspect}
                    </span>
                    <span className="text-xs font-medium text-white/80">
                      {asp.p2}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/30 transition-colors group-hover:text-white/60">
                    {asp.details}
                  </span>
                </div>
              ))
            ) : (
              <p className="col-span-2 py-8 text-center text-xs text-white/30">
                No significant aspects detected
              </p>
            )}
          </div>
        )}

        {/* PATTERNS */}
        {activeTab === 'patterns' && (
          <div className="space-y-2">
            {patternData.length > 0 ? (
              patternData.map((pat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1  border border-white/[0.04] bg-white/[0.02] p-3"
                >
                  <span className="text-primary text-[10px] font-bold tracking-widest uppercase">
                    {pat.type}
                  </span>
                  <span className="text-sm font-medium text-white/80">
                    {pat.planets}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-white/30">
                No significant planetary patterns detected.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
