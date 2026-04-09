import type { House } from './houses-data';

type HouseCuspInput = {
  house: number;
  sign: string;
  degree: number;
};

type HousePlanetInput = {
  name: string;
  sign: string;
  signDegree: number;
  house: number;
  retrograde: boolean;
};

type SignTone = {
  style: string;
  gift: string;
  lesson: string;
};

type PlanetTone = {
  focus: string;
  gift: string;
  caution: string;
};

export type DerivedHouseReading = {
  houseNumber: number;
  houseName: string;
  cuspSign: string;
  cuspDegree: number;
  rulingPlanet: string;
  planetsInHouse: Array<{
    name: string;
    sign: string;
    degree: number;
    retrograde: boolean;
  }>;
  headline: string;
  summary: string;
  placementNote: string;
  activationNote: string;
  opportunities: string[];
  cautions: string[];
};

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

const SIGN_TONES: Record<string, SignTone> = {
  Aries: {
    style: 'direct, fast, and self-starting action',
    gift: 'courageous initiative',
    lesson: 'rushing before your body and relationships are ready',
  },
  Taurus: {
    style: 'steady, grounded, and sensory decision-making',
    gift: 'lasting stability',
    lesson: 'holding on too long when life wants movement',
  },
  Gemini: {
    style: 'curious, verbal, and flexible thinking',
    gift: 'quick pattern recognition',
    lesson: 'splitting attention until nothing lands deeply',
  },
  Cancer: {
    style: 'protective, intuitive, and emotionally led responses',
    gift: 'deep emotional intelligence',
    lesson: 'retreating into mood or defensiveness',
  },
  Leo: {
    style: 'expressive, warm, and dramatic self-expression',
    gift: 'magnetic confidence',
    lesson: 'performing strength instead of showing the truth',
  },
  Virgo: {
    style: 'precise, useful, and improvement-oriented attention',
    gift: 'refined discernment',
    lesson: 'over-correcting until joy disappears',
  },
  Libra: {
    style: 'relational, balanced, and aesthetically tuned choices',
    gift: 'social grace',
    lesson: 'over-weighting harmony and under-weighting desire',
  },
  Scorpio: {
    style: 'intense, private, and all-or-nothing focus',
    gift: 'psychological depth',
    lesson: 'control battles or emotional secrecy',
  },
  Sagittarius: {
    style: 'expansive, future-facing, and belief-driven exploration',
    gift: 'vision and optimism',
    lesson: 'promising more than daily reality can hold',
  },
  Capricorn: {
    style: 'strategic, disciplined, and long-horizon commitment',
    gift: 'earned authority',
    lesson: 'treating every area of life like a performance review',
  },
  Aquarius: {
    style: 'independent, inventive, and systems-level thinking',
    gift: 'original insight',
    lesson: 'staying detached when intimacy is required',
  },
  Pisces: {
    style: 'imaginative, empathic, and spiritually porous awareness',
    gift: 'compassion and intuition',
    lesson: 'confusion, escape, or weak boundaries',
  },
};

const PLANET_TONES: Record<string, PlanetTone> = {
  Sun: {
    focus: 'identity and confidence',
    gift: 'clear self-expression',
    caution: 'ego pressure or over-identification',
  },
  Moon: {
    focus: 'emotional needs and instinctive reactions',
    gift: 'emotional attunement',
    caution: 'mood reactivity',
  },
  Mercury: {
    focus: 'thinking, language, and interpretation',
    gift: 'sharp mental mapping',
    caution: 'over-analysis or nervous loops',
  },
  Venus: {
    focus: 'attraction, values, and relationship style',
    gift: 'ease, charm, and aesthetics',
    caution: 'people-pleasing or indulgence',
  },
  Mars: {
    focus: 'drive, anger, and decisive action',
    gift: 'courage under pressure',
    caution: 'conflict or impulsive force',
  },
  Jupiter: {
    focus: 'growth, opportunity, and belief',
    gift: 'confidence and expansion',
    caution: 'excess or inflated expectations',
  },
  Saturn: {
    focus: 'limits, mastery, and responsibility',
    gift: 'discipline and maturity',
    caution: 'fear, delay, or self-criticism',
  },
  Uranus: {
    focus: 'change, freedom, and disruption',
    gift: 'innovation and awakening',
    caution: 'instability or rebellion for its own sake',
  },
  Neptune: {
    focus: 'imagination, faith, and surrender',
    gift: 'vision and spiritual sensitivity',
    caution: 'fog, projection, or escapism',
  },
  Pluto: {
    focus: 'power, transformation, and deep truth',
    gift: 'regeneration and intensity',
    caution: 'obsession, control, or power struggles',
  },
};

export function getHouseNumberFromSlug(slug: string): number {
  const match = slug.match(/^(\d+)/);

  if (!match) {
    throw new Error(`Invalid house slug: ${slug}`);
  }

  return Number(match[1]);
}

export function deriveHouseReading(
  house: House,
  chart: {
    houses: HouseCuspInput[];
    planets: HousePlanetInput[];
  }
): DerivedHouseReading {
  const houseNumber = getHouseNumberFromSlug(house.slug);
  const cusp = chart.houses.find((entry) => entry.house === houseNumber);

  if (!cusp) {
    throw new Error(`Missing cusp data for house ${houseNumber}`);
  }

  const tone = SIGN_TONES[cusp.sign] ?? SIGN_TONES.Aries;
  const rulingPlanet = SIGN_RULERS[cusp.sign] ?? 'Mars';
  const planetsInHouse = chart.planets
    .filter((planet) => planet.house === houseNumber)
    .map((planet) => ({
      name: planet.name,
      sign: planet.sign,
      degree: planet.signDegree,
      retrograde: planet.retrograde,
    }));

  const firstPlanetTone = planetsInHouse[0]
    ? PLANET_TONES[planetsInHouse[0].name] ?? null
    : null;

  const placementNote = planetsInHouse.length
    ? `${planetsInHouse
        .map(
          (planet) =>
            `${planet.name} in ${planet.sign}${planet.retrograde ? ' Rx' : ''}`
        )
        .join(', ')} give this house extra weight in your chart.`
    : `You do not have natal planets in this house, so the sign on the cusp and its ruler ${rulingPlanet} tell most of the story.`;

  const headline = `Your ${house.name} starts in ${cusp.sign}`;
  const summary = `Your ${house.name} is filtered through ${cusp.sign}, so ${house.keyword.toLowerCase()} tends to move through ${tone.style}. ${placementNote}`;
  const activationNote = planetsInHouse.length
    ? `${planetsInHouse[0].name} becomes the loudest amplifier here, bringing ${firstPlanetTone?.focus ?? 'strong emphasis'} into ${house.keyword.toLowerCase()} matters.`
    : `Watch ${rulingPlanet} transits and placements if you want to understand when ${house.keyword.toLowerCase()} themes become more active.`;

  const opportunities = Array.from(
    new Set([
      `Lean into ${tone.gift} when making decisions about ${house.keyword.toLowerCase()}.`,
      ...house.strengths.slice(0, 2).map((item) => `${house.name}: ${item}`),
      firstPlanetTone ? `${planetsInHouse[0].name}: ${firstPlanetTone.gift}` : '',
    ].filter(Boolean))
  ).slice(0, 4);

  const cautions = Array.from(
    new Set([
      `The shadow here often looks like ${tone.lesson}.`,
      ...house.challenges.slice(0, 2).map((item) => `${house.name}: ${item}`),
      firstPlanetTone ? `${planetsInHouse[0].name}: ${firstPlanetTone.caution}` : '',
    ].filter(Boolean))
  ).slice(0, 4);

  return {
    houseNumber,
    houseName: house.name,
    cuspSign: cusp.sign,
    cuspDegree: cusp.degree,
    rulingPlanet,
    planetsInHouse,
    headline,
    summary,
    placementNote,
    activationNote,
    opportunities,
    cautions,
  };
}