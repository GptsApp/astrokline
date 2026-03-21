'use client';

import React from 'react';

/**
 * SVG-based zodiac sign icons — replaces Unicode emoji characters.
 * Each icon is a simple SVG path rendered at the given size.
 */

const ZODIAC_PATHS: Record<string, string> = {
  // Aries ♈
  Aries: 'M12 2c-3 5-5 8-5 12s2 6 5 6m0-18c3 5 5 8 5 12s-2 6-5 6',
  // Taurus ♉
  Taurus: 'M6 6a6 6 0 0012 0M12 6v16M8 14a4 4 0 108 0 4 4 0 00-8 0',
  // Gemini ♊
  Gemini: 'M6 4h12M6 20h12M8 4v16M16 4v16',
  // Cancer ♋
  Cancer: 'M4 10a4 4 0 118 0M12 14a4 4 0 11-8 0M4 12h16',
  // Leo ♌
  Leo: 'M8 8a4 4 0 108 0 4 4 0 00-8 0M12 12v6M12 18a3 3 0 006 0',
  // Virgo ♍
  Virgo: 'M4 4v16M8 4v16M12 4v10a4 4 0 004 4M16 4v10',
  // Libra ♎
  Libra: 'M4 18h16M12 18v-4M6 10a6 6 0 0112 0',
  // Scorpio ♏
  Scorpio: 'M4 4v16M8 4v16M12 4v16M16 4v12l4 4',
  // Sagittarius ♐
  Sagittarius: 'M4 20L20 4M20 4h-8M20 4v8M8 12l4 4',
  // Capricorn ♑
  Capricorn: 'M4 4v12a4 4 0 008 0v-8a4 4 0 018 0v8',
  // Aquarius ♒
  Aquarius: 'M4 8l4 4 4-4 4 4 4-4M4 14l4 4 4-4 4 4 4-4',
  // Pisces ♓
  Pisces: 'M8 2v20M16 2v20M4 12h16',
};

const SIGN_NAMES = [
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
] as const;

type ZodiacSign = (typeof SIGN_NAMES)[number];

interface ZodiacIconProps {
  sign: ZodiacSign;
  size?: number;
  className?: string;
}

export function ZodiacIcon({
  sign,
  size = 16,
  className = '',
}: ZodiacIconProps) {
  const d = ZODIAC_PATHS[sign];
  if (!d) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={sign}
    >
      <path d={d} />
    </svg>
  );
}

/** Ordered array of zodiac sign names for loading rings etc. */
export const ZODIAC_SIGN_NAMES = SIGN_NAMES;

/** Get sign name by index (0-11) */
export function getZodiacSignByIndex(index: number): ZodiacSign {
  return SIGN_NAMES[index % 12];
}
