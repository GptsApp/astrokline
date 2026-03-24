'use client';

import React, { useMemo } from 'react';
import { PlanetPlacement } from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';

interface Props {
  planets: PlanetPlacement[];
  rising: PlanetPlacement;
  className?: string;
  size?: number;
}

// Zodiac Sign standard absolute longitudes (0 to 360)
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

// Zodiac abbreviations & element colors
const ZODIAC_ABBR: Record<string, { abbr: string; color: string; bg: string }> =
  {
    Aries: { abbr: 'ARI', color: '#fff', bg: 'rgba(249,115,22,0.7)' },
    Taurus: { abbr: 'TAU', color: '#fff', bg: 'rgba(16,185,129,0.7)' },
    Gemini: { abbr: 'GEM', color: '#fff', bg: 'rgba(56,189,248,0.7)' },
    Cancer: { abbr: 'CAN', color: '#fff', bg: 'rgba(99,102,241,0.7)' },
    Leo: { abbr: 'LEO', color: '#fff', bg: 'rgba(249,115,22,0.7)' },
    Virgo: { abbr: 'VIR', color: '#fff', bg: 'rgba(16,185,129,0.7)' },
    Libra: { abbr: 'LIB', color: '#fff', bg: 'rgba(56,189,248,0.7)' },
    Scorpio: { abbr: 'SCO', color: '#fff', bg: 'rgba(99,102,241,0.7)' },
    Sagittarius: { abbr: 'SAG', color: '#fff', bg: 'rgba(249,115,22,0.7)' },
    Capricorn: { abbr: 'CAP', color: '#fff', bg: 'rgba(16,185,129,0.7)' },
    Aquarius: { abbr: 'AQU', color: '#fff', bg: 'rgba(56,189,248,0.7)' },
    Pisces: { abbr: 'PIS', color: '#fff', bg: 'rgba(99,102,241,0.7)' },
  };

// Planet abbreviations
const PLANET_ABBR: Record<string, string> = {
  Sun: 'SU',
  Moon: 'MO',
  Mercury: 'ME',
  Venus: 'VE',
  Mars: 'MA',
  Jupiter: 'JU',
  Saturn: 'SA',
  Uranus: 'UR',
  Neptune: 'NE',
  Pluto: 'PL',
  Ascendant: 'AC',
};

// Function to convert sign + degree + minute to absolute longitude (0-360)
export function getAbsoluteLongitude(
  sign: string,
  degree: number,
  minute: number
): number {
  const base = SIGN_DEGREES[sign] || 0;
  return base + degree + minute / 60;
}

export function AstrologyChartWheel({
  planets,
  rising,
  className,
  size = 500,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.35;
  const coreRadius = size * 0.25;

  const ascLongitude = getAbsoluteLongitude(
    rising.sign,
    rising.degree,
    rising.minute
  );

  // Calculate planetary angles relative to Ascendant
  // Astrological charts usually have Ascendant at 180deg (left), signs go counter-clockwise.
  // In SVG, to go counter-clockwise starting from left:
  // angle = 180 + (Longitude - AscLongitude)
  const calculateSVGPosition = (longitude: number, radius: number) => {
    // 180 degrees base for Ascendant (left side)
    // Positive means counter-clockwise. Since SVG Y is down, we subtract the angle to go up.
    const angleDeg = 180 + (longitude - ascLongitude);
    // Convert to radians for Math trig, note the negative for counter-clockwise in SVG
    const angleRad = (-angleDeg * Math.PI) / 180;

    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
      angleDeg,
    };
  };

  const planetNodes = useMemo(() => {
    return planets.map((p) => {
      const lon = getAbsoluteLongitude(p.sign, p.degree, p.minute);
      const pos = calculateSVGPosition(lon, innerRadius - 20); // placing planets slightly inside the inner ring
      return { ...p, lon, pos };
    });
  }, [planets, ascLongitude, innerRadius]);

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      role="img"
      aria-label="Natal birth chart wheel showing planetary positions across zodiac signs"
      data-testid="astrology-chart-wheel"
    >
      {/* Glow behind the chart */}
      <div className="bg-primary/5 pointer-events-none absolute inset-0 rounded-full blur-[100px]" />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full drop-shadow-[0_0_30px_rgba(212,175,55,0.1)]"
        style={{ maxWidth: size, aspectRatio: '1 / 1' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.8)" />
            <stop offset="50%" stopColor="rgba(212,175,55,0.2)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.8)" />
          </linearGradient>
        </defs>

        {/* Outer Ring (Zodiac Signs) */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill="rgba(10,10,10,0.4)"
          stroke="rgba(212,175,55,0.3)"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={coreRadius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* 12 House Spokes (Simplified Equal House system for visual aesthetics) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angleRad = (i * 30 * Math.PI) / 180;
          const x1 = cx + innerRadius * Math.cos(angleRad);
          const y1 = cy + innerRadius * Math.sin(angleRad);
          const x2 = cx + outerRadius * Math.cos(angleRad);
          const y2 = cy + outerRadius * Math.sin(angleRad);
          return (
            <line
              key={`spoke-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Zodiac Badges in the outer ring */}
        {Object.entries(SIGN_DEGREES).map(([sign, baseLon]) => {
          const pos = calculateSVGPosition(
            baseLon + 15,
            outerRadius - (outerRadius - innerRadius) / 2
          );
          const z = ZODIAC_ABBR[sign] || {
            abbr: '?',
            color: '#fff',
            bg: 'rgba(100,100,100,0.5)',
          };
          const boxW = 28;
          const boxH = 16;
          return (
            <g key={`sign-${sign}`}>
              <rect
                x={pos.x - boxW / 2}
                y={pos.y - boxH / 2}
                width={boxW}
                height={boxH}
                rx="4"
                fill={z.bg}
              />
              <text
                x={pos.x}
                y={pos.y}
                fill={z.color}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                className="select-none"
              >
                {z.abbr}
              </text>
            </g>
          );
        })}

        {/* Ascendant Marker */}
        <line
          x1={cx - outerRadius - 5}
          y1={cy}
          x2={cx - innerRadius + 10}
          y2={cy}
          stroke="#D4AF37"
          strokeWidth="2.5"
          filter="url(#glow)"
        />
        <text
          x={cx - outerRadius - 10}
          y={cy}
          fill="#D4AF37"
          fontSize="15"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
          dominantBaseline="middle"
        >
          ASC
        </text>

        {/* Aspect Lines (Center web) - Dummy lines for aesthetic complexity */}
        <g strokeWidth="1.5">
          {planetNodes.map((p1, i) =>
            planetNodes.map((p2, j) => {
              if (i >= j) return null; // Avoid duplicates
              const diff = Math.abs(p1.lon - p2.lon);
              const shortestDiff = Math.min(diff, 360 - diff);

              // Draw lines for major aspects (trine ~120, square ~90, opposition ~180, sextile ~60)
              const isAspect =
                Math.abs(shortestDiff - 120) < 8 ||
                Math.abs(shortestDiff - 90) < 8 ||
                Math.abs(shortestDiff - 180) < 8 ||
                Math.abs(shortestDiff - 60) < 8;

              if (!isAspect) return null;

              // Color based on aspect type (red for hard, blue/green for soft)
              let strokeColor = 'rgba(255,255,255,0.1)';
              if (
                Math.abs(shortestDiff - 90) < 8 ||
                Math.abs(shortestDiff - 180) < 8
              )
                strokeColor = 'rgba(239,68,68,0.3)'; // Red-ish for Square/Opposition
              if (Math.abs(shortestDiff - 120) < 8)
                strokeColor = 'rgba(59,130,246,0.3)'; // Blue-ish for Trine

              return (
                <line
                  key={`aspect-${i}-${j}`}
                  x1={p1.pos.x}
                  y1={p1.pos.y}
                  x2={p2.pos.x}
                  y2={p2.pos.y}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
              );
            })
          )}
        </g>

        {/* Planets */}
        {planetNodes.map((p, i) => (
          <motion.g
            key={`planet-${p.name || i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.8, type: 'spring' }}
          >
            <circle
              cx={p.pos.x}
              cy={p.pos.y}
              r="16"
              fill="rgba(10,10,10,0.8)"
              stroke="rgba(212,175,55,0.5)"
              strokeWidth="1.5"
            />
            <text
              x={p.pos.x}
              y={p.pos.y}
              fill="white"
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="central"
              className="select-none"
              // Adjust layout slightly to center the weird unicode symbols
              dy="1"
            >
              {PLANET_ABBR[p.name || ''] || '??'}
            </text>
          </motion.g>
        ))}

        {/* Center Iris */}
        <circle
          cx={cx}
          cy={cy}
          r="15"
          fill="rgba(212,175,55,0.1)"
          stroke="rgba(212,175,55,0.3)"
        />
        <circle cx={cx} cy={cy} r="4" fill="#D4AF37" filter="url(#glow)" />
      </svg>
    </div>
  );
}
