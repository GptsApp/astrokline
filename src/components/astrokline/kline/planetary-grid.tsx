"use client";

import React from 'react';
import { PlanetPlacement } from '@/lib/astrokline/mock-astrology-data';
import { cn } from '@/shared/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Props {
  planets: PlanetPlacement[];
  className?: string;
  compact?: boolean;
}

// Planet abbreviations (replaces Unicode symbols to avoid emoji rendering)
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'SUN', Moon: 'MOO', Mercury: 'MER', Venus: 'VEN', Mars: 'MAR',
  Jupiter: 'JUP', Saturn: 'SAT', Uranus: 'URA', Neptune: 'NEP', Pluto: 'PLU'
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: 'ARI', Taurus: 'TAU', Gemini: 'GEM', Cancer: 'CAN',
  Leo: 'LEO', Virgo: 'VIR', Libra: 'LIB', Scorpio: 'SCO',
  Sagittarius: 'SAG', Capricorn: 'CAP', Aquarius: 'AQU', Pisces: 'PIS'
};

const DIGNITIES: Record<string, Record<string, 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine'>> = {
  Sun: { Leo: 'domicile', Aries: 'exaltation', Aquarius: 'detriment', Libra: 'fall' },
  Moon: { Cancer: 'domicile', Taurus: 'exaltation', Capricorn: 'detriment', Scorpio: 'fall' },
  Mercury: { Gemini: 'domicile', Virgo: 'domicile', Sagittarius: 'detriment', Pisces: 'detriment' },
  Venus: { Taurus: 'domicile', Libra: 'domicile', Pisces: 'exaltation', Scorpio: 'detriment', Aries: 'detriment', Virgo: 'fall' },
  Mars: { Aries: 'domicile', Scorpio: 'domicile', Capricorn: 'exaltation', Taurus: 'detriment', Libra: 'detriment', Cancer: 'fall' },
  Jupiter: { Sagittarius: 'domicile', Pisces: 'domicile', Cancer: 'exaltation', Gemini: 'detriment', Virgo: 'detriment', Capricorn: 'fall' },
  Saturn: { Capricorn: 'domicile', Aquarius: 'domicile', Libra: 'exaltation', Cancer: 'detriment', Leo: 'detriment', Aries: 'fall' }
};

export function PlanetaryGrid({ planets, className, compact = false }: Props) {
  // Simple mock function to give some planets a retrograde marking for professional feel
  const isRetrograde = (name: string) => ['Uranus', 'Neptune'].includes(name);

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md shadow-2xl relative", className)}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className={cn("border-b border-white/5 bg-white/5 flex items-center justify-between", compact ? 'px-4 py-2' : 'p-4')}>
        <h3 className={cn("font-bold tracking-widest text-white/90 uppercase font-mono flex items-center gap-2", compact ? 'text-xs' : 'text-sm')}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Natal Coordinates
        </h3>
        <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Geocentric / Tropical</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn("border-b border-white/5 bg-black/40 uppercase font-mono tracking-widest text-white/40", compact ? 'text-[9px]' : 'text-[10px]')}>
              <th className={cn("pl-4 font-medium", compact ? 'py-1.5 px-2' : 'p-3')}>Planet</th>
              <th className={cn("font-medium", compact ? 'py-1.5 px-2' : 'p-3')}>Longitude</th>
              <th className={cn("font-medium", compact ? 'py-1.5 px-2' : 'p-3')}>Sign</th>
              <th className={cn("font-medium", compact ? 'py-1.5 px-2' : 'p-3')}>House</th>
              <th className={cn("pr-4 font-medium text-right", compact ? 'py-1.5 px-2' : 'p-3')}>Dignity</th>
            </tr>
          </thead>
          <tbody className={cn("font-mono text-white/80", compact ? 'text-xs' : 'text-sm')}>
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
                peregrine: 'text-white/30'
              }[dignity];

              const DignityIcon = {
                domicile: ArrowUpRight,
                exaltation: ArrowUpRight,
                detriment: ArrowDownRight,
                fall: ArrowDownRight,
                peregrine: Minus
              }[dignity];

              const cellPad = compact ? 'py-1 px-2' : 'p-3';

              return (
                <tr 
                  key={idx} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className={cn(cellPad, 'pl-4')}>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold font-mono text-primary text-center leading-none tracking-tight", compact ? 'text-[10px] w-6' : 'text-xs w-8')}>{symbol}</span>
                      <span className="font-sans font-medium">{p.name} {isRx && <span className="text-[9px] text-red-400/80 ml-0.5">Rx</span>}</span>
                    </div>
                  </td>
                  <td className={cellPad}>
                    <span className="text-white/60">{p.degree.toString().padStart(2, '0')}°{p.minute.toString().padStart(2, '0')}'</span>
                  </td>
                  <td className={cellPad}>
                    <span className="text-white/50">{signSymbol}</span>
                  </td>
                  <td className={cellPad}>
                    <span className={cn("inline-flex items-center justify-center rounded bg-white/5 border border-white/10 font-bold text-white/70", compact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs')}>
                      {p.house}
                    </span>
                  </td>
                  <td className={cn(cellPad, 'pr-4 text-right')}>
                    <div className={cn("inline-flex items-center justify-end gap-1 font-bold uppercase tracking-widest", compact ? 'text-[10px]' : 'text-xs', dignityColor)}>
                      <DignityIcon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                      {dignity.substring(0, 3)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
