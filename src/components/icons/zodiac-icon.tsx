'use client';

import { cn } from '@/shared/lib/utils';
import { type ZodiacIconProps, ZODIAC_ELEMENT_COLORS } from './astro-types';

const paths: Record<string, string> = {
  aries:
    'M20 44 C20 28 32 12 32 12 C32 12 44 28 44 44 M32 12 C32 12 20 28 20 44',
  taurus:
    'M16 20 C16 12 24 8 32 8 C40 8 48 12 48 20 M24 20 C24 20 24 28 24 36 C24 44 28 48 32 48 C36 48 40 44 40 36 C40 28 40 20 40 20',
  gemini:
    'M20 12 L20 52 M44 12 L44 52 M20 12 L44 12 M20 52 L44 52 M20 32 L44 32',
  cancer:
    'M16 28 C16 20 24 16 32 16 C40 16 44 22 44 28 M48 36 C48 44 40 48 32 48 C24 48 20 42 20 36 M16 28 A4 4 0 1 1 16 28.01 M48 36 A4 4 0 1 1 48 36.01',
  leo:
    'M20 20 A8 8 0 1 1 36 20 C36 20 36 32 28 36 C20 40 16 48 24 52 M36 20 C44 20 48 28 48 36 C48 44 44 48 40 48',
  virgo:
    'M12 16 L12 40 C12 40 12 48 20 48 M20 16 L20 40 C20 40 20 48 28 48 M28 16 L28 36 C28 36 36 36 40 40 C44 44 48 44 48 36 L48 28 M48 36 C48 44 44 52 40 52',
  libra:
    'M16 44 L48 44 M32 44 L32 28 M20 28 C20 20 26 14 32 14 C38 14 44 20 44 28 M12 28 L52 28',
  scorpio:
    'M12 16 L12 40 C12 40 12 48 20 48 M20 16 L20 40 C20 40 20 48 28 48 M28 16 L28 36 C28 36 36 36 40 40 C44 44 48 40 48 36 L48 28 M48 36 L52 40 M48 40 L52 36',
  sagittarius:
    'M16 48 L48 16 M48 16 L32 16 M48 16 L48 32 M22 36 L36 22',
  capricorn:
    'M12 16 L12 32 C12 40 20 44 28 40 C36 36 36 28 36 24 M36 24 C36 24 44 28 48 36 C52 44 48 52 40 52 C32 52 28 48 28 40',
  aquarius:
    'M12 24 L20 16 L28 24 L36 16 L44 24 L52 16 M12 40 L20 32 L28 40 L36 32 L44 40 L52 32',
  pisces:
    'M20 12 C20 12 12 24 12 32 C12 40 20 52 20 52 M44 12 C44 12 52 24 52 32 C52 40 44 52 44 52 M8 32 L56 32',
};

export function ZodiacIcon({
  sign,
  size = 32,
  color,
  glow = false,
  animated = false,
  className,
}: ZodiacIconProps) {
  const c = color ?? ZODIAC_ELEMENT_COLORS[sign];

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
      className={cn(
        animated && 'animate-pulse',
        className,
      )}
      style={glow ? { filter: `drop-shadow(0 0 6px ${c}80)` } : undefined}
      aria-label={sign}
    >
      <path d={paths[sign]} />
    </svg>
  );
}
