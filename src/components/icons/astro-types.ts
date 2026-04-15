export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type Planet =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export interface ZodiacIconProps {
  sign: ZodiacSign;
  size?: 16 | 24 | 32 | 48 | 64;
  color?: string;
  glow?: boolean;
  animated?: boolean;
  className?: string;
}

export interface PlanetIconProps {
  planet: Planet;
  size?: 16 | 24 | 32 | 48;
  color?: string;
  className?: string;
}

export const ZODIAC_ELEMENT_COLORS: Record<ZodiacSign, string> = {
  aries: '#E74C3C',
  taurus: '#8B7355',
  gemini: '#F1C40F',
  cancer: '#3498DB',
  leo: '#D4AF37',
  virgo: '#27AE60',
  libra: '#E91E8A',
  scorpio: '#8E44AD',
  sagittarius: '#E67E22',
  capricorn: '#2C3E50',
  aquarius: '#1ABC9C',
  pisces: '#2E86AB',
};

export const ZODIAC_LABELS: Record<ZodiacSign, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
};

export const PLANET_LABELS: Record<Planet, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
};
