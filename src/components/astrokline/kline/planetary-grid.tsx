'use client';

import React from 'react';
import { PlanetPlacement } from '@/lib/astrokline/mock-astrology-data';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface Props {
  planets: PlanetPlacement[];
  className?: string;
  compact?: boolean;
}

// Planet abbreviations (replaces Unicode symbols to avoid emoji rendering)
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'SUN',
  Moon: 'MOO',
  Mercury: 'MER',
  Venus: 'VEN',
  Mars: 'MAR',
  Jupiter: 'JUP',
  Saturn: 'SAT',
  Uranus: 'URA',
  Neptune: 'NEP',
  Pluto: 'PLU',
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: 'ARI',
  Taurus: 'TAU',
  Gemini: 'GEM',
  Cancer: 'CAN',
  Leo: 'LEO',
  Virgo: 'VIR',
  Libra: 'LIB',
  Scorpio: 'SCO',
  Sagittarius: 'SAG',
  Capricorn: 'CAP',
  Aquarius: 'AQU',
  Pisces: 'PIS',
};

const DIGNITIES: Record<
  string,
  Record<string, 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine'>
> = {
  Sun: {
    Leo: 'domicile',
    Aries: 'exaltation',
    Aquarius: 'detriment',
    Libra: 'fall',
  },
  Moon: {
    Cancer: 'domicile',
    Taurus: 'exaltation',
    Capricorn: 'detriment',
    Scorpio: 'fall',
  },
  Mercury: {
    Gemini: 'domicile',
    Virgo: 'domicile',
    Sagittarius: 'detriment',
    Pisces: 'detriment',
  },
  Venus: {
    Taurus: 'domicile',
    Libra: 'domicile',
    Pisces: 'exaltation',
    Scorpio: 'detriment',
    Aries: 'detriment',
    Virgo: 'fall',
  },
  Mars: {
    Aries: 'domicile',
    Scorpio: 'domicile',
    Capricorn: 'exaltation',
    Taurus: 'detriment',
    Libra: 'detriment',
    Cancer: 'fall',
  },
  Jupiter: {
    Sagittarius: 'domicile',
    Pisces: 'domicile',
    Cancer: 'exaltation',
    Gemini: 'detriment',
    Virgo: 'detriment',
    Capricorn: 'fall',
  },
  Saturn: {
    Capricorn: 'domicile',
    Aquarius: 'domicile',
    Libra: 'exaltation',
    Cancer: 'detriment',
    Leo: 'detriment',
    Aries: 'fall',
  },
};

export function PlanetaryGrid({ planets, className, compact = false }: Props) {
  // Simple mock function to give some planets a retrograde marking for professional feel
  const isRetrograde = (name: string) => ['Uranus', 'Neptune'].includes(name);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 shadow-2xl backdrop-blur-md',
        className
      )}
    >
      <div className="via-primary/50 absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent" />

      <div
        className={cn(
          'flex items-center justify-between border-b border-white/5 bg-white/5',
          compact ? 'px-4 py-2' : 'p-4'
        )}
      >
        <h3
          className={cn(
            'flex items-center gap-2 font-mono font-bold tracking-widest text-white/90 uppercase',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          Natal Coordinates
        </h3>
        <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">
          Geocentric / Tropical
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className={cn(
                'border-b border-white/5 bg-black/40 font-mono tracking-widest text-white/40 uppercase',
                compact ? 'text-[9px]' : 'text-[10px]'
              )}
            >
              <th
                className={cn(
                  'pl-4 font-medium',
                  compact ? 'px-2 py-1.5' : 'p-3'
                )}
              >
                Planet
              </th>
              <th
                className={cn('font-medium', compact ? 'px-2 py-1.5' : 'p-3')}
              >
                Longitude
              </th>
              <th
                className={cn('font-medium', compact ? 'px-2 py-1.5' : 'p-3')}
              >
                Sign
              </th>
              <th
                className={cn('font-medium', compact ? 'px-2 py-1.5' : 'p-3')}
              >
                House
              </th>
              <th
                className={cn(
                  'pr-4 text-right font-medium',
                  compact ? 'px-2 py-1.5' : 'p-3'
                )}
              >
                Dignity
              </th>
            </tr>
          </thead>
          <tbody
            className={cn(
              'font-mono text-white/80',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {planets.map((p, idx) => {
              if (!p.name) return null;

              const isRx = isRetrograde(p.name);
              const symbol = PLANET_SYMBOLS[p.name] || '•';
              const signSymbol = ZODIAC_SYMBOLS[p.sign] || '';
              const dignityMap = DIGNITIES[p.name] || {};
              const dignity = dignityMap[p.sign] || 'peregrine';

              const dignityColor = {
                domicile: 'text-emerald-400',
                exaltation: 'text-blue-400',
                detriment: 'text-red-400',
                fall: 'text-orange-400',
                peregrine: 'text-white/30',
              }[dignity];

              const DignityIcon = {
                domicile: ArrowUpRight,
                exaltation: ArrowUpRight,
                detriment: ArrowDownRight,
                fall: ArrowDownRight,
                peregrine: Minus,
              }[dignity];

              const cellPad = compact ? 'py-1 px-2' : 'p-3';

              return (
                <tr
                  key={idx}
                  className="group border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className={cn(cellPad, 'pl-4')}>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-primary text-center font-mono leading-none font-bold tracking-tight',
                          compact ? 'w-6 text-[10px]' : 'w-8 text-xs'
                        )}
                      >
                        {symbol}
                      </span>
                      <span className="font-sans font-medium">
                        {p.name}{' '}
                        {isRx && (
                          <span className="ml-0.5 text-[9px] text-red-400/80">
                            Rx
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className={cellPad}>
                    <span className="text-white/60">
                      {p.degree.toString().padStart(2, '0')}°
                      {p.minute.toString().padStart(2, '0')}'
                    </span>
                  </td>
                  <td className={cellPad}>
                    <span className="text-white/50">{signSymbol}</span>
                  </td>
                  <td className={cellPad}>
                    <span
                      className={cn(
                        'inline-flex items-center justify-center rounded border border-white/10 bg-white/5 font-bold text-white/70',
                        compact ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs'
                      )}
                    >
                      {p.house}
                    </span>
                  </td>
                  <td className={cn(cellPad, 'pr-4 text-right')}>
                    <div
                      className={cn(
                        'inline-flex items-center justify-end gap-1 font-bold tracking-widest uppercase',
                        compact ? 'text-[10px]' : 'text-xs',
                        dignityColor
                      )}
                    >
                      <DignityIcon
                        className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}
                      />
                      {dignity.substring(0, 3)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
