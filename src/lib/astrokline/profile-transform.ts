import type { UserProfile } from './mock-astrology-data';

export interface BirthProfileInput {
  name: string;
  date: string;
  timeSlot: string;
  location: string;
}

/**
 * Convert natal chart API response to the UI-facing UserProfile model.
 * This is shared by generation and result recovery flows so they cannot drift.
 */
export function apiToProfile(
  apiData: any,
  birthData: BirthProfileInput
): UserProfile {
  const planets = apiData.planets || [];
  const findPlanet = (name: string) => {
    const planet = planets.find((pl: any) => pl.name === name);
    if (!planet) {
      return { sign: 'Unknown', degree: 0, minute: 0, house: 1 };
    }

    const degree = Math.floor(planet.signDegree);
    const minute = Math.round((planet.signDegree - degree) * 60);

    return {
      sign: planet.sign,
      degree,
      minute,
      house: planet.house || 1,
    };
  };

  const asc = apiData.ascendant || { sign: 'Unknown', degree: 0 };
  const ascDegree = Math.floor(asc.degree);
  const ascMinute = Math.round((asc.degree - ascDegree) * 60);

  const elementMap: Record<string, string> = {
    Aries: 'fire',
    Taurus: 'earth',
    Gemini: 'air',
    Cancer: 'water',
    Leo: 'fire',
    Virgo: 'earth',
    Libra: 'air',
    Scorpio: 'water',
    Sagittarius: 'fire',
    Capricorn: 'earth',
    Aquarius: 'air',
    Pisces: 'water',
  };
  const modalityMap: Record<string, string> = {
    Aries: 'cardinal',
    Taurus: 'fixed',
    Gemini: 'mutable',
    Cancer: 'cardinal',
    Leo: 'fixed',
    Virgo: 'mutable',
    Libra: 'cardinal',
    Scorpio: 'fixed',
    Sagittarius: 'mutable',
    Capricorn: 'cardinal',
    Aquarius: 'fixed',
    Pisces: 'mutable',
  };

  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  const total = planets.length || 1;

  planets.forEach((planet: any) => {
    const element = elementMap[planet.sign];
    const modality = modalityMap[planet.sign];

    if (element) {
      (elementCounts as any)[element] += 1;
    }
    if (modality) {
      (modalityCounts as any)[modality] += 1;
    }
  });

  const elements = {
    fire: Math.round((elementCounts.fire / total) * 100),
    earth: Math.round((elementCounts.earth / total) * 100),
    air: Math.round((elementCounts.air / total) * 100),
    water: Math.round((elementCounts.water / total) * 100),
  };
  const modalities = {
    cardinal: Math.round((modalityCounts.cardinal / total) * 100),
    fixed: Math.round((modalityCounts.fixed / total) * 100),
    mutable: Math.round((modalityCounts.mutable / total) * 100),
  };

  let lifePathNumber = birthData.date
    .replace(/-/g, '')
    .split('')
    .map(Number)
    .reduce((sum, digit) => sum + digit, 0);
  while (
    lifePathNumber > 9 &&
    lifePathNumber !== 11 &&
    lifePathNumber !== 22
  ) {
    lifePathNumber = String(lifePathNumber)
      .split('')
      .map(Number)
      .reduce((sum, digit) => sum + digit, 0);
  }

  const time =
    birthData.timeSlot === 'unknown'
      ? '12:00'
      : birthData.timeSlot.split('-')[0];

  const PLANET_SYMBOLS: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
  };

  return {
    name: birthData.name,
    birthDate: birthData.date,
    birthTime: time,
    birthLocation: birthData.location,
    sun: findPlanet('Sun'),
    moon: findPlanet('Moon'),
    rising: {
      sign: asc.sign,
      degree: ascDegree,
      minute: ascMinute,
      house: 1,
      name: 'Ascendant',
    },
    planets: planets.map((planet: any) => ({
      sign: planet.sign,
      degree: Math.floor(planet.signDegree),
      minute: Math.round((planet.signDegree - Math.floor(planet.signDegree)) * 60),
      house: planet.house || 1,
      name: planet.name,
      symbol: PLANET_SYMBOLS[planet.name] || '✦',
    })),
    elements,
    modalities,
    lifePathNumber,
    overallAverageScore: 82,
  };
}
