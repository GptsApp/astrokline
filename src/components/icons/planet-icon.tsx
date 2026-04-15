'use client';

import { cn } from '@/shared/lib/utils';
import { type PlanetIconProps } from './astro-types';

const PLANET_PATHS: Record<string, string> = {
  sun:
    'M32 20 A12 12 0 1 1 32 44 A12 12 0 1 1 32 20 M32 28 A4 4 0 1 1 32 36 A4 4 0 1 1 32 28',
  moon:
    'M36 12 A20 20 0 1 0 36 52 A14 14 0 0 1 36 12',
  mercury:
    'M32 24 A8 8 0 1 1 32 40 A8 8 0 1 1 32 24 M32 40 L32 52 M24 46 L40 46 M26 12 A6 6 0 1 1 38 12',
  venus:
    'M32 20 A10 10 0 1 1 32 40 A10 10 0 1 1 32 20 M32 40 L32 54 M24 48 L40 48',
  mars:
    'M28 24 A12 12 0 1 1 28 48 A12 12 0 1 1 28 24 M36 28 L48 16 M40 16 L48 16 L48 24',
  jupiter:
    'M20 20 L20 44 M12 32 L32 32 M40 16 C48 16 52 24 48 32 C44 40 36 40 36 40 M36 12 L36 52',
  saturn:
    'M28 12 L40 12 M34 12 L34 28 C34 28 44 28 44 36 C44 44 34 44 34 44 L28 52 M28 52 C20 52 16 48 20 44',
  uranus:
    'M32 28 A8 8 0 1 1 32 44 A8 8 0 1 1 32 28 M32 20 L32 28 M24 20 L40 20 M32 12 L32 20 M32 12 A3 3 0 1 1 32 12.01',
  neptune:
    'M32 24 L32 52 M20 44 L44 44 M32 24 L16 12 M32 24 L48 12 M32 24 L32 12 M16 12 A3 3 0 0 1 16 12.01 M48 12 A3 3 0 0 1 48 12.01',
  pluto:
    'M32 28 L32 52 M24 44 L40 44 M24 14 A8 8 0 1 1 24 28 M24 14 L24 28 M24 22 L40 22',
};

const PLANET_DEFAULT_COLORS: Record<string, string> = {
  sun: '#D4AF37',
  moon: '#C0C0C0',
  mercury: '#B8860B',
  venus: '#27AE60',
  mars: '#E74C3C',
  jupiter: '#D4AF37',
  saturn: '#8B7355',
  uranus: '#1ABC9C',
  neptune: '#3498DB',
  pluto: '#8E44AD',
};

export function PlanetIcon({
  planet,
  size = 24,
  color,
  className,
}: PlanetIconProps) {
  const c = color ?? PLANET_DEFAULT_COLORS[planet];

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke={c}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      aria-label={planet}
    >
      <path d={PLANET_PATHS[planet]} />
    </svg>
  );
}
