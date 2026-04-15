import {
  calculateTransitPositionsForDate,
  type NatalChartResult,
  type PlanetPosition,
} from '@/lib/astrology/engine';

import {
  getTransitTitle,
  getTransitDescription,
  getTransitAdvice,
} from './transit-templates';

import type {
  DestinyReading,
  DestinyScorePoint,
  Next30DaysGuidance,
  RadarData,
  TransitEvent,
  UserProfile,
} from './mock-astrology-data';

type Theme = TransitEvent['theme'];

interface TargetPoint {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house: number;
}

interface ScoredTransitEvent extends TransitEvent {
  contribution: number;
}

export interface CurrentEnergyData {
  monthLabel: string;
  monthBadge: string;
  monthTitle: string;
  monthDescription: string;
  monthAdvice: string;
  yearLabel: string;
  yearBadge: string;
  yearTitle: string;
  yearDescription: string;
  yearAdvice: string;
}

export interface KlineTimelineData {
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  overallAverageScore: number;
}

export interface StrategicReadingData {
  radarData: RadarData[];
  destinyReading: DestinyReading & {
    advice: DestinyReading['advice'] & {
      health: string;
      timing: string;
    };
    hiddenTalent: {
      title: string;
      description: string;
      activationAdvice: string;
    };
    coreInsights: Array<{
      tag: string;
      text: string;
      match: number;
    }>;
    cosmicQuote: string;
  };
  next30Days: Next30DaysGuidance;
  currentEnergy: CurrentEnergyData;
}

const SIGN_INDEX: Record<string, number> = {
  Aries: 0,
  Taurus: 1,
  Gemini: 2,
  Cancer: 3,
  Leo: 4,
  Virgo: 5,
  Libra: 6,
  Scorpio: 7,
  Sagittarius: 8,
  Capricorn: 9,
  Aquarius: 10,
  Pisces: 11,
};

// ─── Vedic: Vimshottari Dasha System ───
const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'] as const;
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // total = 120 years
const DASHA_SCORE_MODIFIER: Record<string, number> = {
  // Calibrated against AstroSage/IndAstro/Astroyogi consensus
  Ketu: -8,     // "Dark night of the soul" — spiritual upheaval, material loss
  Venus: 8,     // "Golden period" — love, prosperity, luxury
  Sun: 3,       // Moderate positive — ego awakening, authority
  Moon: 5,      // Emotional stability, nurturing
  Mars: -4,     // Conflict, accidents, aggression
  Rahu: -7,     // Material obsession, deception, sudden shocks
  Jupiter: 9,   // Best benefic — wisdom, expansion, prosperity
  Saturn: -8,   // "Strictest teacher" — delays, discipline, isolation
  Mercury: 4,   // Communication, learning, adaptability
};
const MALEFIC_DASHAS = new Set(['Ketu', 'Rahu', 'Saturn', 'Mars']);

function getMoonNakshatra(moonLongitude: number): number {
  // 27 Nakshatras, each spanning 13°20' (13.333°)
  return Math.floor(moonLongitude / (360 / 27)) % 27;
}

function getDashaStartIndex(nakshatra: number): number {
  // Each Nakshatra is ruled by one of 9 Dasha lords in cyclic order
  return nakshatra % 9;
}

function getDashaModifier(age: number, moonLongitude: number): { modifier: number; lord: string; isTransition: boolean } {
  const nakshatra = getMoonNakshatra(moonLongitude);
  const startIdx = getDashaStartIndex(nakshatra);

  // Calculate remaining portion of first Dasha based on Moon position within Nakshatra
  const nakshatraSpan = 360 / 27;
  const posInNakshatra = moonLongitude % nakshatraSpan;
  const fractionElapsed = posInNakshatra / nakshatraSpan;
  const firstDashaRemaining = DASHA_YEARS[startIdx] * (1 - fractionElapsed);

  let elapsed = 0;
  let currentIdx = startIdx;
  let isFirst = true;

  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < 9; i++) {
      const idx = (startIdx + i) % 9;
      const duration = isFirst ? firstDashaRemaining : DASHA_YEARS[idx];
      isFirst = false;

      if (age >= elapsed && age < elapsed + duration) {
        const yearsIntoDasha = age - elapsed;
        const isTransition = yearsIntoDasha < 1 || (elapsed + duration - age) < 1;
        return {
          modifier: DASHA_SCORE_MODIFIER[DASHA_LORDS[idx]],
          lord: DASHA_LORDS[idx],
          isTransition,
        };
      }
      elapsed += duration;
      currentIdx = idx;
    }
  }

  return { modifier: 0, lord: 'Mercury', isTransition: false };
}

function getSadeSatiModifier(transitSaturnLongitude: number, natalMoonLongitude: number): number {
  const saturnSign = Math.floor(transitSaturnLongitude / 30);
  const moonSign = Math.floor(natalMoonLongitude / 30);
  const signDiff = ((saturnSign - moonSign) % 12 + 12) % 12;

  // Sade Sati: 7.5-year Saturn transit. Calibrated to Vedic consensus.
  if (signDiff === 0) return -15;  // Peak phase — Saturn conjunct Moon sign (most intense)
  if (signDiff === 11) return -8;  // Rising phase — Saturn in 12th from Moon
  if (signDiff === 1) return -5;   // Setting phase — Saturn in 2nd from Moon
  return 0;
}

const OUTER_PLANETS = new Set([
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
]);

const TRANSIT_WEIGHTS: Record<string, number> = {
  Jupiter: 1.1,
  Saturn: 1.15,
  Uranus: 1.25,
  Neptune: 1.05,
  Pluto: 1.3,
};

const TARGET_WEIGHTS: Record<string, number> = {
  Sun: 1.2,
  Moon: 1.15,
  Mercury: 0.85,
  Venus: 0.95,
  Mars: 1,
  Jupiter: 0.8,
  Saturn: 0.9,
  Uranus: 0.8,
  Neptune: 0.8,
  Pluto: 0.85,
  Ascendant: 1.05,
  Midheaven: 1.1,
};

const ASPECT_DEFS = [
  { aspect: 'Conjunction', angle: 0, orb: 6 },
  { aspect: 'Sextile', angle: 60, orb: 4.5 },
  { aspect: 'Square', angle: 90, orb: 5 },
  { aspect: 'Trine', angle: 120, orb: 5 },
  { aspect: 'Opposition', angle: 180, orb: 5.5 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits: number = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function signDegreeToLongitude(sign: string, degree: number) {
  return (SIGN_INDEX[sign] ?? 0) * 30 + degree;
}

function angularDistance(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function getElement(sign: string) {
  if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) return 'Fire';
  if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) return 'Earth';
  if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) return 'Air';
  return 'Water';
}

function getModality(sign: string) {
  if (['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(sign)) {
    return 'Cardinal';
  }
  if (['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(sign)) {
    return 'Fixed';
  }
  return 'Mutable';
}

function describeElementProfile(profile: UserProfile) {
  const ordered = Object.entries(profile.elements).sort((a, b) => b[1] - a[1]);
  const [dominant] = ordered;
  const [weakest] = [...ordered].reverse();
  return {
    dominant: dominant[0],
    weakest: weakest[0],
  };
}

function getNearestAspect(diff: number) {
  return ASPECT_DEFS.map((def) => ({
    ...def,
    orbDistance: angularDistance(diff, def.angle),
  })).sort((a, b) => a.orbDistance - b.orbDistance)[0];
}

function getAspectEffect(planet: string, aspect: string) {
  if (aspect === 'Trine') return 9;
  if (aspect === 'Sextile') return 6;
  if (aspect === 'Square') return -8;
  if (aspect === 'Opposition') return -6;

  const conjunctionEffects: Record<string, number> = {
    Jupiter: 8,
    Saturn: -3,
    Uranus: 2,
    Neptune: -1,
    Pluto: 3,
  };

  return conjunctionEffects[planet] ?? 1;
}

function inferTheme(target: TargetPoint): Theme {
  if (target.name === 'Midheaven' || [10, 6].includes(target.house)) {
    return 'Career';
  }
  if ([2, 8].includes(target.house) || ['Jupiter', 'Venus'].includes(target.name)) {
    return 'Wealth';
  }
  if ([5, 7].includes(target.house) || ['Moon', 'Venus'].includes(target.name)) {
    return 'Love';
  }
  return 'Growth';
}

function buildTargetPoints(chart: NatalChartResult): TargetPoint[] {
  const planets = chart.planets.map((planet) => ({
    name: planet.name,
    sign: planet.sign,
    degree: planet.signDegree,
    longitude: planet.longitude,
    house: planet.house,
  }));

  return [
    ...planets,
    {
      name: 'Ascendant',
      sign: chart.ascendant.sign,
      degree: chart.ascendant.degree,
      longitude: signDegreeToLongitude(chart.ascendant.sign, chart.ascendant.degree),
      house: 1,
    },
    {
      name: 'Midheaven',
      sign: chart.midheaven.sign,
      degree: chart.midheaven.degree,
      longitude: signDegreeToLongitude(chart.midheaven.sign, chart.midheaven.degree),
      house: 10,
    },
  ];
}

function buildTransitTitle(
  planet: string,
  aspect: string,
  target: TargetPoint,
  theme: Theme,
  year: number = new Date().getFullYear()
) {
  return getTransitTitle(planet, aspect, theme, target, year);
}

function buildTransitDescription(
  year: number,
  transit: PlanetPosition,
  target: TargetPoint,
  aspect: string,
  theme: Theme,
  orbDistance: number
) {
  return getTransitDescription(year, transit.name, transit.sign, aspect, target, orbDistance);
}

function buildTransitAdvice(
  theme: Theme,
  aspect: string,
  target: TargetPoint,
  planet: string = 'Saturn',
  year: number = new Date().getFullYear()
) {
  return getTransitAdvice(planet, aspect, theme, target, year);
}

function pickStage(score: number, previousScore: number, events: TransitEvent[]) {
  const delta = score - previousScore;
  const hasHardTransit = events.some((event) =>
    ['Square', 'Opposition'].includes(event.aspect)
  );
  const hasExpansionTransit = events.some((event) =>
    event.planet === 'Jupiter' && ['Conjunction', 'Trine', 'Sextile'].includes(event.aspect)
  );

  if (score >= 84 && delta >= 0) return hasExpansionTransit ? 'Breakthrough' : 'Zenith';
  if (score >= 72 && delta >= 0) return 'Expansion';
  if (score >= 60 && Math.abs(delta) <= 3) return 'Consolidation';
  if (score >= 55 && delta < 0) return 'Recalibration';
  if (score <= 36 && hasHardTransit) return 'Challenge';
  if (score <= 45) return 'Restructuring';
  return hasHardTransit ? 'Friction' : 'Grounding';
}

function buildYearExplanation(
  age: number,
  score: number,
  stage: string,
  events: TransitEvent[]
) {
  const lead = events[0];
  if (!lead) {
    return `Age ${age} carries a ${stage.toLowerCase()} tone. The pressure is moderate, so the year is more about pacing than dramatic external events.`;
  }

  return `Age ${age} lands in a ${stage.toLowerCase()} zone with score ${score}. The loudest signal is ${lead.title}, which means this year is best read through ${lead.theme.toLowerCase()} decisions and timing.`;
}

function scoreEnergyLevel(score: number): DestinyScorePoint['energyLevel'] {
  if (score >= 82) return 'Very High';
  if (score >= 67) return 'High';
  if (score >= 48) return 'Medium';
  return 'Low';
}

function safeBirthdayDay(year: number, month: number, day: number) {
  return Math.min(day, new Date(year, month, 0).getDate());
}

function getNatalChartBias(chart: NatalChartResult) {
  const supportive = chart.aspects.filter((aspect) =>
    ['Trine', 'Sextile'].includes(aspect.aspect)
  ).length;
  const challenging = chart.aspects.filter((aspect) =>
    ['Square', 'Opposition'].includes(aspect.aspect)
  ).length;
  const angularPlanets = chart.planets.filter((planet) =>
    [1, 4, 7, 10].includes(planet.house)
  ).length;
  const retrogrades = chart.planets.filter((planet) => planet.retrograde).length;

  return supportive * 1.2 - challenging * 1.4 + angularPlanets * 0.8 - retrogrades * 0.35;
}

function buildYearEvents(
  year: number,
  transits: PlanetPosition[],
  targets: TargetPoint[]
): ScoredTransitEvent[] {
  const candidates: ScoredTransitEvent[] = [];

  for (const transit of transits) {
    if (!OUTER_PLANETS.has(transit.name)) {
      continue;
    }

    for (const target of targets) {
      const diff = angularDistance(transit.longitude, target.longitude);
      const nearestAspect = getNearestAspect(diff);
      const closeness = Math.max(
        0,
        1 - nearestAspect.orbDistance / (nearestAspect.orb + 4)
      );

      if (closeness <= 0.24) {
        continue;
      }

      const theme = inferTheme(target);
      const aspectEffect = getAspectEffect(transit.name, nearestAspect.aspect);
      const contribution =
        aspectEffect *
        closeness *
        (TRANSIT_WEIGHTS[transit.name] ?? 1) *
        (TARGET_WEIGHTS[target.name] ?? 0.8);

      candidates.push({
        id: `t-${year}-${candidates.length + 1}`,
        year,
        title: buildTransitTitle(transit.name, nearestAspect.aspect, target, theme, year),
        theme,
        description: buildTransitDescription(
          year,
          transit,
          target,
          nearestAspect.aspect,
          theme,
          nearestAspect.orbDistance
        ),
        impactScore: clamp(
          Math.round(Math.abs(contribution) * 1.8 + closeness * 3),
          1,
          10
        ),
        planet: transit.name,
        aspect: nearestAspect.aspect,
        advice: buildTransitAdvice(theme, nearestAspect.aspect, target, transit.name, year),
        phase:
          nearestAspect.orbDistance < 1
            ? 'Exact'
            : transit.retrograde
              ? 'Separating'
              : 'Applying',
        contribution,
      });
    }
  }

  candidates.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const deduped: ScoredTransitEvent[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const key = `${candidate.planet}-${candidate.aspect}-${candidate.theme}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(candidate);
    if (deduped.length === 3) {
      break;
    }
  }

  if (deduped.length > 0) {
    return deduped;
  }

  return [
    {
      id: `t-${year}-fallback`,
      year,
      title: 'Background Consolidation Window',
      theme: 'Growth',
      description:
        'No single outer-planet aspect dominates this year, so the chart behaves more like a consolidation cycle than a shock cycle. Progress comes from consistency rather than dramatic timing.',
      impactScore: 4,
      planet: 'Saturn',
      aspect: 'Sextile',
      advice:
        'Use the quieter conditions to clean systems, strengthen habits, and prepare for the next visible inflection point.',
      phase: 'Applying',
      contribution: 1,
    },
  ];
}

export function buildPersonalizedKlineTimeline(
  chart: NatalChartResult,
  birthDate: string
): KlineTimelineData {
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const targets = buildTargetPoints(chart);
  const chartBias = getNatalChartBias(chart);
  const jupiter = chart.planets.find((planet) => planet.name === 'Jupiter');
  const saturn = chart.planets.find((planet) => planet.name === 'Saturn');
  const uranus = chart.planets.find((planet) => planet.name === 'Uranus');
  const pluto = chart.planets.find((planet) => planet.name === 'Pluto');

  const phaseA = ((jupiter?.longitude ?? 0) / 360) * Math.PI * 2;
  const phaseB = ((saturn?.longitude ?? 0) / 360) * Math.PI * 2;
  const phaseC = ((uranus?.longitude ?? 0) / 360) * Math.PI * 2;
  const phaseD = ((pluto?.longitude ?? 0) / 360) * Math.PI * 2;

  const moon = chart.planets.find((planet) => planet.name === 'Moon');
  const moonLongitude = moon?.longitude ?? 0;

  const klineData: DestinyScorePoint[] = [];
  const transitDetails: Record<number, TransitEvent[]> = {};

  for (let age = 0; age <= 100; age += 1) {
    const year = birthYear + age;
    const transitPositions = calculateTransitPositionsForDate({
      year,
      month: birthMonth,
      day: safeBirthdayDay(year, birthMonth, birthDay),
      hour: 12,
      minute: 0,
      timezone: 0,
    });
    const yearEvents = buildYearEvents(year, transitPositions, targets);
    const eventContribution = yearEvents.reduce(
      (sum, event) => sum + event.contribution,
      0
    );
    const waveA = Math.sin((age / 11.86) * Math.PI * 2 + phaseA) * 4.5;  // Jupiter cycle (reduced from 6.5)
    const waveB = Math.sin((age / 29.46) * Math.PI * 2 + phaseB) * 6.5;  // Saturn cycle (reduced from 9.5)
    const waveC = Math.sin((age / 19.2) * Math.PI * 2 + phaseC) * 3.0;   // Uranus cycle (reduced from 4.2)
    const waveD = Math.cos((age / 83.75) * Math.PI * 2 + phaseD) * 2.5;  // Pluto cycle (reduced from 3.5)

    let envelope = 0;
    if (age < 12) envelope = -8 + age * 0.9;
    else if (age < 24) envelope = 2 + (age - 12) * 0.6;
    else if (age < 42) envelope = 9;
    else if (age < 60) envelope = 5 - (age - 42) * 0.25;
    else envelope = 1 - (age - 60) * 0.18;

    // Vedic: Dasha period modifier (primary timing mechanism in Jyotish)
    const dasha = getDashaModifier(age, moonLongitude);
    const dashaModifier = dasha.modifier * 2.0; // Dasha is ~50% of timing signal
    const dashaTransitionBonus = dasha.isTransition ? 3 : 0;

    // Vedic: Sade Sati detection (7.5-year Saturn transit)
    const transitSaturn = transitPositions.find((p) => p.name === 'Saturn');
    const sadeSatiPenalty = transitSaturn
      ? getSadeSatiModifier(transitSaturn.longitude, moonLongitude)
      : 0;

    // Vedic: Malefic Dasha × Sade Sati interaction (compounding difficulty)
    const maleficSadeSatiInteraction =
      MALEFIC_DASHAS.has(dasha.lord) && sadeSatiPenalty < 0 ? -5 : 0;

    // ─── Vedic: Dasha-Transit Harmony ───
    // Core Jyotish principle: "Dasha sets the weather, transits trigger rain."
    // During malefic Dasha → positive transits are dampened (good luck can't fully manifest)
    // During benefic Dasha → negative transits are softened (bad luck is cushioned)
    const isMaleficDasha = MALEFIC_DASHAS.has(dasha.lord);
    const isBeneficDasha = ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(dasha.lord);
    let adjustedEventContribution = eventContribution;
    if (isMaleficDasha && eventContribution > 0) {
      adjustedEventContribution = eventContribution * 0.4; // Good transits only 40% effective in bad Dasha
    } else if (isBeneficDasha && eventContribution < 0) {
      adjustedEventContribution = eventContribution * 0.5; // Bad transits softened 50% in good Dasha
    }

    // Sade Sati additionally dampens positive events regardless of Dasha
    // (Saturn's gravity affects everyone — even Venus Dasha can't fully escape Sade Sati)
    if (sadeSatiPenalty < -10 && adjustedEventContribution > 0) {
      adjustedEventContribution *= 0.5; // Peak Sade Sati halves positive events
    } else if (sadeSatiPenalty < -5 && adjustedEventContribution > 0) {
      adjustedEventContribution *= 0.7; // Rising/Setting reduces positive events 30%
    }

    // Vedic: Sade Sati dampens all positive waves (Saturn's gravity suppresses uplift)
    const sadeSatiWaveDampen = sadeSatiPenalty < -10 ? 0.5 : sadeSatiPenalty < -5 ? 0.75 : 1.0;
    const adjustedWaveSum = (waveA + waveB + waveC + waveD) * sadeSatiWaveDampen;

    const rawScore =
      54 + chartBias + adjustedWaveSum + envelope + adjustedEventContribution
      + dashaModifier + sadeSatiPenalty + dashaTransitionBonus + maleficSadeSatiInteraction;
    const score = clamp(Math.round(rawScore), 18, 96);
    const previousScore = klineData[age - 1]?.score ?? score;
    const stage = pickStage(score, previousScore, yearEvents);

    klineData.push({
      year,
      score,
      stage,
      energyLevel: scoreEnergyLevel(score),
      isPeak: age > 0 ? score > previousScore + 5 : score >= 78,
      isCrossroads: dasha.isTransition || Math.abs(score - 55) <= 4 || Math.abs(score - previousScore) <= 2,
      explanation: buildYearExplanation(age, score, stage, yearEvents),
    });

    transitDetails[year] = yearEvents.map(({ contribution, ...event }) => event);
  }

  const averageScore = Math.round(
    klineData.reduce((sum, point) => sum + point.score, 0) / klineData.length
  );

  return {
    klineData,
    transitDetails,
    overallAverageScore: averageScore,
  };
}

function findHouseScore(chart: NatalChartResult, houses: number[], fallback: number) {
  const planetsInHouses = chart.planets.filter((planet) => houses.includes(planet.house));
  if (planetsInHouses.length === 0) {
    return fallback;
  }

  return clamp(
    Math.round(
      fallback +
        planetsInHouses.reduce((sum, planet) => sum + TARGET_WEIGHTS[planet.name] * 6, 0)
    ),
    35,
    95
  );
}

function buildRadarData(
  profile: UserProfile,
  chart: NatalChartResult,
  timeline: KlineTimelineData
): RadarData[] {
  const currentYear = new Date().getFullYear();
  const currentEvents = timeline.transitDetails[currentYear] || [];
  const dominantElement = describeElementProfile(profile).dominant;

  return [
    {
      dimension: 'Personality',
      score: clamp(Math.round(58 + profile.lifePathNumber * 3 + profile.elements.air * 0.12), 40, 95),
      fullMark: 100,
      house: `Sun / Moon / Rising`,
      description: `Your chart identity is driven by ${profile.sun.sign} Sun, processed through ${profile.moon.sign} Moon, and presented through ${profile.rising.sign} Rising. That combination gives you a public style that is more deliberate than your private emotional rhythm, which is why people often notice control before they notice sensitivity. The dominant ${dominantElement} element makes your personality strongest when you trust your natural operating system instead of copying someone else's pace.`,
    },
    {
      dimension: 'Career',
      score: findHouseScore(chart, [10, 6], 62),
      fullMark: 100,
      house: `10th / 6th Houses`,
      description: `Your career signal is shaped by the planets clustered around the work and public reputation axis. The chart favors meaningful execution over shallow visibility, so your best moves come when you build depth first and then make the signal visible. Current timing is reinforced by ${currentEvents[0]?.title ?? 'a quieter career consolidation cycle'}, which means your professional upside is real but wants structure, not scattered effort.`,
    },
    {
      dimension: 'Wealth',
      score: findHouseScore(chart, [2, 8], 59),
      fullMark: 100,
      house: `2nd / 8th Houses`,
      description: `Your money pattern is not only about income; it is about how confidently you price your value and how intelligently you handle leverage, debt, and shared resources. The chart shows that wealth increases faster when you choose repeatable systems over emotional swings. Years with supportive Jupiter or structured Saturn contact tend to reward cleaner asset strategy rather than speculative impulse.`,
    },
    {
      dimension: 'Relationships',
      score: findHouseScore(chart, [5, 7], 57),
      fullMark: 100,
      house: `5th / 7th Houses`,
      description: `Your relationship signature carries both attraction and lesson. You tend to feel safest when emotional loyalty and practical reliability live together, which means chemistry alone is never enough for long-term peace. Relationship quality rises when you communicate expectation early instead of asking intimacy to read your mind for you.`,
    },
    {
      dimension: 'Family',
      score: findHouseScore(chart, [4], 60),
      fullMark: 100,
      house: `4th House`,
      description: `The family axis in your chart suggests that home is not a decorative background. It is a regulatory system for your nervous system and therefore directly tied to your output. When your base environment is settled, your public life becomes cleaner, faster, and more decisive.`,
    },
    {
      dimension: 'Health',
      score: findHouseScore(chart, [1, 6], 61),
      fullMark: 100,
      house: `1st / 6th Houses`,
      description: `Your health pattern is strongly linked to rhythm, recovery, and how quickly emotional pressure gets trapped in the body. The chart rewards boring consistency: sleep, movement, and reduced overstimulation. When you ignore maintenance, productivity drops before motivation does, which is why burnout often looks like confusion first.`,
    },
    {
      dimension: 'Lucky Elements',
      score: clamp(Math.round(60 + profile.elements.fire * 0.08 + profile.elements.earth * 0.05), 40, 95),
      fullMark: 100,
      house: `Jupiter / Elemental Balance`,
      description: `Your luck accelerates when you align environment and behavior with the element mix already dominant in your chart. In practice, that means choosing rooms, work rhythms, and collaborators that strengthen the traits your chart naturally expresses well instead of forcing yourself into alien conditions.`,
    },
  ];
}

function buildHiddenTalent(profile: UserProfile, chart: NatalChartResult) {
  const retrograde = chart.planets.find((planet) => planet.retrograde);
  const twelfthHouse = chart.planets.find((planet) => planet.house === 12);
  const source = retrograde ?? twelfthHouse ?? chart.planets.find((planet) => planet.house === 9) ?? chart.planets[0];

  return {
    title: `${source.name} Pattern Recognition`,
    description: `Your quieter advantage sits inside ${source.name} in ${source.sign}, House ${source.house}. This placement often works behind the scenes first, which is why other people may notice your depth later than they notice your surface style. The gift here is not speed but unusual signal detection: you read structure, motive, and long-range consequence earlier than most people when you slow down enough to hear your own perception.`,
    activationAdvice: `Create one recurring solitude block every week and use it for analysis rather than reaction. ${source.name} becomes more profitable when you give it uninterrupted room to connect patterns before acting.`,
  };
}

function buildCoreInsights(profile: UserProfile, timeline: KlineTimelineData) {
  const currentYear = new Date().getFullYear();
  const currentEvent = timeline.transitDetails[currentYear]?.[0];

  return [
    {
      tag: 'Core Pattern',
      text: `You are strongest when your outer pace matches your inner logic. ${profile.sun.sign} wants identity clarity, ${profile.moon.sign} wants emotional safety, and ${profile.rising.sign} wants a credible posture. Misalignment between those three creates drag; alignment creates authority.`,
      match: 93,
    },
    {
      tag: 'Hidden Gift',
      text: `Your chart carries unusual leverage in reading timing. Even when you doubt yourself, you often sense too early rather than too late. That instinct compounds when you trust your first serious signal and back it with disciplined follow-through.`,
      match: 91,
    },
    {
      tag: 'Shadow Pattern',
      text: `Your main self-sabotage pattern is over-holding tension until it turns into withdrawal, delay, or silent resentment. The chart does not punish honesty; it punishes delayed honesty.`,
      match: 90,
    },
    {
      tag: 'Strategic Edge',
      text: `Your competitive edge is not generic talent. It is the ability to combine emotional reading, structural judgment, and long-horizon patience in the same decision. That is rarer than raw speed.`,
      match: 92,
    },
    {
      tag: 'Body Wisdom',
      text: `Your body usually tells the truth before your mind admits it. When a season is wrong, your energy narrows, your sleep shifts, and your focus fragments. ${currentEvent?.title ?? 'The current transit cycle'} is a reminder to treat physical regulation as strategic infrastructure.`,
      match: 89,
    },
  ];
}

export function buildStrategicReading(
  profile: UserProfile,
  chart: NatalChartResult,
  timeline: KlineTimelineData
): StrategicReadingData {
  const currentYear = new Date().getFullYear();
  const currentEvent = timeline.transitDetails[currentYear]?.[0];
  const nextEvent = timeline.transitDetails[currentYear + 1]?.[0] ?? currentEvent;
  const elementProfile = describeElementProfile(profile);
  const radarData = buildRadarData(profile, chart, timeline);
  const hiddenTalent = buildHiddenTalent(profile, chart);
  const coreInsights = buildCoreInsights(profile, timeline);

  const destinyReading = {
    structure: {
      title: `${getElement(profile.sun.sign)}-${getModality(profile.rising.sign)} Blueprint`,
      element: `${elementProfile.dominant.toUpperCase()} dominant / ${elementProfile.weakest.toUpperCase()} underused`,
      description: `Your chart architecture is defined by a ${getElement(profile.sun.sign).toLowerCase()} core identity, a ${getElement(profile.moon.sign).toLowerCase()} emotional processor, and a ${getElement(profile.rising.sign).toLowerCase()} presentation layer. That makes you most effective in cycles where internal conviction and external structure reinforce each other. When they do not, the chart tends to produce delay, over-analysis, or pressure leakage into relationships. The larger lesson is not to become someone else, but to build containers strong enough for your natural intensity.`,
      coreChallenge:
        'The central challenge is timing your honesty and ambition together. If you reveal too little, opportunities drift. If you push too fast, the chart creates unnecessary resistance. Your edge is disciplined visibility.',
    },
    phase: {
      title: currentEvent?.title ?? 'Measured Expansion Window',
      whyStuck: currentEvent
        ? `The chart feels sticky when ${currentEvent.planet} presses your ${currentEvent.theme.toLowerCase()} axis because the old operating system still wants certainty while the transit is demanding adaptation. What looks like delay is often a restructuring phase that is trying to make the next step durable instead of temporary.`
        : 'This is a slower, more structural phase. The chart is asking for refinement, not panic. Momentum returns faster when you stop forcing clarity from an exhausted state.',
      turningPoint: nextEvent
        ? `${nextEvent.year}: ${nextEvent.title}. That is the next visible shift where external circumstances become easier to convert into concrete movement.`
        : `${currentYear + 1}: a cleaner growth window opens when the current consolidation cycle finishes.`,
      momentum: clamp(
        Math.round(
          (timeline.klineData.find((point) => point.year === currentYear)?.score ?? 60) + 8
        ),
        35,
        95
      ),
    },
    advice: {
      career: `Career progress improves when you commit to one visible priority instead of spreading effort across too many channels. Your chart rewards authority built from repeated signal, not noise. Make the work legible, let the right people see it, and do not confuse invisibility with humility.`,
      wealth: `The most profitable move for your chart is financial structure. Use this cycle to stabilize pricing, cut leakage, and redirect money toward assets, skill, or distribution that compounds. What you keep matters as much as what you earn.`,
      relationships: `Your relational chart asks for directness with warmth. The fastest path to better intimacy is earlier language, clearer boundaries, and less testing through silence. People do better with your truth than with your protected ambiguity.`,
      health: `Your system does not like chronic ambiguity. Sleep, food rhythm, movement, and screen boundaries are strategic tools for you, not optional wellness decorations. Regulate the body and the chart becomes easier to use well.`,
      timing: currentEvent
        ? `The next 90 days are best organized around ${currentEvent.title}. Treat that theme as the lead storyline. Move early on what the chart is opening, and go conservative where the chart is still applying pressure.`
        : 'The next 90 days favor cleanup, simplification, and selective action. Use the quieter cycle to remove friction before the next stronger expansion phase arrives.',
    },
    hiddenTalent,
    coreInsights,
    cosmicQuote:
      'Your chart does not ask you to live faster. It asks you to move at the exact speed that lets your depth become visible and profitable.',
  };

  const next30Days: Next30DaysGuidance = {
    theme: currentEvent?.title ?? 'Strategic Reset & Clean Execution',
    moonPhase: `${new Date().toLocaleString('en-US', { month: 'long' })} focus window`,
    dos: [
      `Push one decision tied to ${currentEvent?.theme.toLowerCase() ?? 'your highest leverage goal'} instead of splitting attention.`,
      'Review your calendar and remove one low-value commitment that drains recovery time.',
      'Capture momentum in writing so the next opportunity window is easier to act on.',
    ],
    donts: [
      'Do not over-negotiate with obvious misalignment.',
      'Avoid spending to soothe pressure that should be solved structurally.',
      'Do not delay a direct conversation that the chart has already made clear.',
    ],
  };

  const currentEnergy: CurrentEnergyData = {
    monthLabel: new Date().toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    monthBadge: currentEvent?.impactScore && currentEvent.impactScore >= 8 ? 'High Signal' : 'Steady Signal',
    monthTitle: currentEvent?.title ?? 'Measured Execution Window',
    monthDescription:
      currentEvent?.description ??
      'This month is less about spectacle and more about disciplined traction. Small, precise actions compound better than emotionally dramatic moves.',
    monthAdvice:
      currentEvent?.advice ??
      'Use the month to simplify, focus, and give your strongest priority cleaner execution space.',
    yearLabel: `Theme of ${currentYear}`,
    yearBadge: currentEvent?.theme ?? 'Growth',
    yearTitle: nextEvent?.title ?? 'Structural Growth Year',
    yearDescription:
      nextEvent?.description ??
      'The current annual cycle is pushing you to build firmer foundations before acceleration. That is frustrating in the short term but powerful over the full curve.',
    yearAdvice:
      nextEvent?.advice ??
      'Choose durable leverage over emotional speed. The chart rewards systems that keep paying after excitement fades.',
  };

  return {
    radarData,
    destinyReading,
    next30Days,
    currentEnergy,
  };
}

export function buildFullPersonalizedReport(
  chart: NatalChartResult,
  birthDate: string,
  profile: UserProfile,
  timelineOverride?: KlineTimelineData
) {
  const timeline = timelineOverride ?? buildPersonalizedKlineTimeline(chart, birthDate);
  const strategic = buildStrategicReading(profile, chart, timeline);

  return {
    ...timeline,
    ...strategic,
  };
}
