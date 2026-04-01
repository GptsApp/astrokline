/**
 * Daily Transit Engine — Vedic Panchang (Jyotish First Principles)
 * =================================================================
 * Computes daily cosmic fitness using REAL astronomical positions
 * via astronomy-engine (VSOP87/ELP) and classical Vedic scoring:
 *
 *   Tara Bala           (Star Strength)    — 40%
 *   Chandrabala         (Moon Strength)     — 25%
 *   Tithi               (Lunar Day)         — 20%
 *   Vara-Nakshatra Yoga (Day-Star Combo)   — 15%
 *
 * All positions use sidereal zodiac (Lahiri Ayanamsa).
 * Deterministic: same natal moon + same date = same result.
 */

// @ts-ignore — astronomy-engine has no TS declarations
import * as Astronomy from '../astrology/astronomy-engine.js';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface NatalMoonInput {
  sign: string;       // Tropical sign from engine.ts e.g. 'Pisces'
  degree: number;     // Degree within sign (0-29)
  minute: number;     // Arc-minutes (0-59)
  birthYear: number;  // For birth-epoch Ayanamsa
}

export interface DailyTransit {
  rulingPlanet: { name: string; symbol: string };
  element: string;
  transitSign: string;
  narrative: string;
  doList: string[];
  dontList: string[];
  bestHours: {
    peak: { range: string; activity: string };
    neutral: { range: string; activity: string };
    low: { range: string; activity: string };
  };
  score: number;
  label: 'High' | 'Neutral' | 'Low';
  labelColor: string;
  vedic?: {
    taraBala: { tara: number; name: string; score: number };
    chandrabala: { house: number; score: number };
    tithi: { number: number; name: string; group: string; score: number };
    yoga: { vara: string; nakshatra: string; isSiddha: boolean; isAmrita: boolean; score: number };
    transitNakshatra: string;
    transitRashi: string;
  };
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const ZODIAC = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const SIGN_ELEMENTS: Record<string, string> = {
  Aries:'Fire', Taurus:'Earth', Gemini:'Air', Cancer:'Water',
  Leo:'Fire', Virgo:'Earth', Libra:'Air', Scorpio:'Water',
  Sagittarius:'Fire', Capricorn:'Earth', Aquarius:'Air', Pisces:'Water',
};

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha',
  'Ardra','Punarvasu','Pushya','Ashlesha','Magha',
  'Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati',
  'Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishta','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const NAK_SPAN = 360 / 27; // 13.3333°

/** Vara lords: Sunday=0 … Saturday=6 */
const VARA_LORDS = [
  { name: 'Sun',     symbol: '☉', element: 'Fire'  },
  { name: 'Moon',    symbol: '☽', element: 'Water' },
  { name: 'Mars',    symbol: '♂', element: 'Fire'  },
  { name: 'Mercury', symbol: '☿', element: 'Air'   },
  { name: 'Jupiter', symbol: '♃', element: 'Ether' },
  { name: 'Venus',   symbol: '♀', element: 'Water' },
  { name: 'Saturn',  symbol: '♄', element: 'Earth' },
];

// ═══════════════════════════════════════════════════════
// Astronomy helpers
// ═══════════════════════════════════════════════════════

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/**
 * Lahiri (Chitrapaksha) Ayanamsa.
 * Epoch: 23°51'11" at J2000.0, precession ≈ 50.29″/year.
 */
function lahiriAyanamsa(year: number): number {
  return 23 + 51 / 60 + 11 / 3600 + (year - 2000) * (50.29 / 3600);
}

function toSidereal(tropLon: number, year: number): number {
  return mod360(tropLon - lahiriAyanamsa(year));
}

function getMoonLon(d: Date): number {
  const t = Astronomy.MakeTime(d);
  return mod360(Astronomy.EclipticGeoMoon(t).lon);
}

function getSunLon(d: Date): number {
  const t = Astronomy.MakeTime(d);
  return mod360(Astronomy.SunPosition(t).elon);
}

function nakIndex(sidLon: number): number {
  return Math.floor(sidLon / NAK_SPAN) % 27;
}

function rashiIndex(sidLon: number): number {
  return Math.floor(sidLon / 30) % 12;
}

function signIdx(name: string): number {
  const i = ZODIAC.indexOf(name);
  return i >= 0 ? i : 0;
}

function birthMoonTropLon(m: NatalMoonInput): number {
  return signIdx(m.sign) * 30 + m.degree + m.minute / 60;
}

// ═══════════════════════════════════════════════════════
// 1. TARA BALA — 40% weight
// ═══════════════════════════════════════════════════════
// 9-fold Nakshatra cycle from birth star.
// position = (transitNak − birthNak + 27) % 27   → 0-26
// tara     = (position % 9) + 1                   → 1-9

const TARA_NAMES = [
  '', 'Janma','Sampat','Vipat','Kshema','Pratyak',
  'Sadhana','Naidhana','Mitra','Param Mitra',
];
const TARA_SCORES = [0, 40, 90, 20, 85, 30, 75, 10, 80, 95];

function taraBala(birthNak: number, transitNak: number) {
  const pos = ((transitNak - birthNak) % 27 + 27) % 27;
  const count = pos + 1; // 1-27 (birth star = 1)
  let tara = count % 9;
  if (tara === 0) tara = 9;
  return { tara, name: TARA_NAMES[tara], score: TARA_SCORES[tara] };
}

// ═══════════════════════════════════════════════════════
// 2. CHANDRABALA — 25% weight
// ═══════════════════════════════════════════════════════
// Transit Moon's house from birth Moon rashi.
// Auspicious: 1,3,6,7,10,11  Inauspicious: 2,4,5,8,9,12

const CB_SCORES: Record<number, number> = {
  1:60, 2:30, 3:85, 4:25, 5:35, 6:80,
  7:75, 8:20, 9:40, 10:85, 11:90, 12:25,
};

function chandrabala(birthRashi: number, transitRashi: number) {
  const house = ((transitRashi - birthRashi + 12) % 12) + 1;
  return { house, score: CB_SCORES[house] ?? 50 };
}

// ═══════════════════════════════════════════════════════
// 3. TITHI — 20% weight
// ═══════════════════════════════════════════════════════
// angle = (moonLon − sunLon + 360) % 360
// tithi = ⌊angle / 12⌋ + 1  → 1-30
// Group rotation: Nanda(1), Bhadra(2), Jaya(3), Rikta(4), Poorna(5)

const TITHI_NAMES = [
  '','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
];
const TITHI_GROUPS = ['','Nanda','Bhadra','Jaya','Rikta','Poorna'];
const TG_SCORES: Record<string, number> = {
  Nanda:80, Bhadra:70, Jaya:75, Rikta:30, Poorna:90,
};

function tithiScore(moonLon: number, sunLon: number) {
  const angle = mod360(moonLon - sunLon);
  const num = Math.floor(angle / 12) + 1; // 1-30
  const gIdx = ((num - 1) % 5) + 1;
  const group = TITHI_GROUPS[gIdx];
  return {
    number: num,
    name: TITHI_NAMES[num] || `Tithi ${num}`,
    group,
    score: TG_SCORES[group] ?? 50,
  };
}

// ═══════════════════════════════════════════════════════
// 4. VARA-NAKSHATRA YOGA — 15% weight
// ═══════════════════════════════════════════════════════
// Siddha Yoga: specific weekday + nakshatra = auspicious

const SIDDHA: Record<number, Set<number>> = {
  0: new Set([0,7,12,18,11,20,25]),  // Sun
  1: new Set([3,4,7,16,12,21]),      // Mon
  2: new Set([0,2,4,13,14,16,18]),   // Tue
  3: new Set([3,16,12,0,15]),        // Wed
  4: new Set([0,7,14,6,26]),         // Thu
  5: new Set([0,1,6,7,12,16,26,21]),// Fri
  6: new Set([3,7,14,21]),           // Sat
};

function varaYoga(vara: number, transitNak: number, tithiNum?: number) {
  const isSiddha = SIDDHA[vara]?.has(transitNak) ?? false;

  // Amrita Siddhi Yoga: specific vara + tithi combos (authoritative list)
  // Sunday+Dwitiya, Monday+Ekadashi, Tuesday+Shashthi,
  // Wednesday+Dwitiya, Thursday+Dwadashi, Friday+Dashami, Saturday+Saptami
  const AMRITA_TITHI: Record<number, number[]> = {
    0: [2, 17], 1: [11, 26], 2: [6, 21],
    3: [2, 17], 4: [12, 27], 5: [10, 25], 6: [7, 22],
  };
  const isAmrita = tithiNum != null && (AMRITA_TITHI[vara]?.includes(tithiNum) ?? false);

  const score = isAmrita && isSiddha ? 95 : isAmrita ? 88 : isSiddha ? 90 : 50;

  return {
    vara: VARA_LORDS[vara].name,
    nakshatra: NAKSHATRAS[transitNak],
    isSiddha,
    isAmrita,
    score,
  };
}

// ═══════════════════════════════════════════════════════
// Narrative & action pools (keyed by Vedic quality)
// ═══════════════════════════════════════════════════════

const NARRATIVES: Record<string, string[]> = {
  great: [
    '{nak} fills the sky with expansive energy. {vara} amplifies your natural rhythm — trust the momentum and act decisively on opportunities.',
    'The Moon transits {sign}, forming {tara} alignment with your birth star. Creative channels open wide — channel this surge into concrete output.',
    'A rare harmony between {vara} energy and {nak} accelerates progress. Conversations carry extra weight today; use them to build bridges.',
  ],
  good: [
    '{nak} steadies the cosmic current. {vara} supports methodical progress — focus on consolidation rather than new launches.',
    'Moon in {sign} forms a supportive angle to your natal position. Professional magnetism peaks — pitch ideas or negotiate terms.',
    'The {tara} cycle brings quiet confidence. Invest time in skill development and strategic planning.',
  ],
  neutral: [
    '{nak} brings reflective energy under {vara} influence. Journal, meditate, or take a long walk — insights now prove valuable later.',
    'Moon transiting {sign} creates a balanced but uneventful day. Routine tasks and maintenance work flow smoothly.',
    'A transitional phase as {nak} shifts energy patterns. Stay flexible and avoid forcing outcomes.',
  ],
  bad: [
    '{nak} under {vara} creates friction with your birth star. Use the tension to sharpen focus rather than start confrontations.',
    'Moon in {sign} forms a challenging angle — {tara} period demands caution. Avoid impulsive decisions and double-check details.',
    'Cosmic headwinds from the {tara} cycle slow progress. Retreat into planning mode and preserve your energy reserves.',
  ],
};

const DO_POOL: Record<string, string[]> = {
  great: [
    'Launch projects you have been postponing', 'Schedule important negotiations',
    'Take decisive action on pending decisions', 'Express bold ideas to leadership',
    'Invest in long-term commitments',
  ],
  good: [
    'Focus on deep work during morning hours', 'Document ideas during reflection',
    'Reach out to a mentor or advisor', 'Connect with someone in your network',
    'Review and adjust your monthly goals',
  ],
  neutral: [
    'Organize your workspace for clarity', 'Practice active listening in meetings',
    'Invest time in skill development', 'Tackle administrative tasks head-on',
    'Set clear boundaries with your time',
  ],
  bad: [
    'Protect your energy with strict boundaries', 'Review contracts and documents carefully',
    'Meditate or journal to process emotions', 'Postpone major decisions to a better day',
    'Focus on rest and recovery',
  ],
};

const DONT_POOL: Record<string, string[]> = {
  great: [
    'Hesitate on opportunities out of perfectionism',
    'Overcommit to social obligations', 'Ignore your intuitive hits',
  ],
  good: [
    'Make impulsive financial decisions', 'Start confrontations over minor issues',
    'Rush through important documents',
  ],
  neutral: [
    'Compare your progress to others', 'Take on others\' responsibilities',
    'Sacrifice sleep for extra work hours',
  ],
  bad: [
    'Sign contracts without careful review', 'React emotionally to criticism',
    'Make permanent decisions from temporary emotions',
    'Ignore physical fatigue signals', 'Start new ventures or partnerships',
  ],
};

const HOUR_ACT = {
  peak: [
    'important emails, big decisions, creative work',
    'strategic planning, presentations, negotiations',
    'deep focus work, writing, problem-solving',
  ],
  neutral: [
    'meetings, routine tasks, exercise',
    'admin work, team check-ins, learning',
    'collaboration, research, brainstorming',
  ],
  low: [
    'avoid financial decisions and confrontations',
    'minimize high-stakes negotiations',
    'no major commitments or contract signing',
  ],
};

// ═══════════════════════════════════════════════════════
// Main Export: getDailyTransit
// ═══════════════════════════════════════════════════════

export function getDailyTransit(
  yearScore: number,
  natalMoon: NatalMoonInput | string,
  targetDate: Date = new Date()
): DailyTransit {
  // ── Backward compat: if string passed, use fallback moon ──
  const moon: NatalMoonInput = typeof natalMoon === 'string'
    ? { sign: 'Aries', degree: 0, minute: 0, birthYear: 2000 }
    : natalMoon;

  // ── Real astronomical positions at user's LOCAL noon ──
  // Using local Date constructor (not Date.UTC) so the browser's timezone
  // determines what "noon" means. Astronomy-engine receives the correct UTC
  // equivalent internally. This ensures a Beijing user gets Moon at their
  // 12:00 (=04:00 UTC), not at 12:00 UTC (=20:00 Beijing).
  const localNoon = new Date(
    targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0
  );
  const transitMoonTrop = getMoonLon(localNoon);
  const transitSunTrop = getSunLon(localNoon);
  const transitYear = targetDate.getFullYear();

  // ── Convert to sidereal (Lahiri) ──
  const transitMoonSid = toSidereal(transitMoonTrop, transitYear);
  const transitSunSid = toSidereal(transitSunTrop, transitYear);
  const birthMoonSid = toSidereal(birthMoonTropLon(moon), moon.birthYear);

  // ── Vedic indices ──
  const birthNak = nakIndex(birthMoonSid);
  const transitNak = nakIndex(transitMoonSid);
  const birthRashi = rashiIndex(birthMoonSid);
  const transitRashi = rashiIndex(transitMoonSid);
  const vara = targetDate.getDay(); // 0=Sun … 6=Sat

  // ── Four pillars ──
  const tb = taraBala(birthNak, transitNak);
  const cb = chandrabala(birthRashi, transitRashi);
  const ti = tithiScore(transitMoonSid, transitSunSid);
  const vy = varaYoga(vara, transitNak, ti.number);

  // ── Weighted score ──
  let raw = tb.score * 0.40 + cb.score * 0.25 + ti.score * 0.20 + vy.score * 0.15;
  // yearScore modulation: ±5 points
  raw += (yearScore - 50) * 0.10;
  const score = Math.max(15, Math.min(95, Math.round(raw)));

  const label: DailyTransit['label'] =
    score >= 68 ? 'High' : score >= 42 ? 'Neutral' : 'Low';
  const labelColor =
    score >= 68 ? 'text-emerald-400' :
    score >= 42 ? 'text-amber-400' : 'text-rose-400';

  // ── Quality bucket for content selection ──
  const q = score >= 75 ? 'great' : score >= 55 ? 'good' : score >= 40 ? 'neutral' : 'bad';
  const dayOfYear = Math.floor(
    (localNoon.getTime() - new Date(transitYear, 0, 1, 12, 0, 0).getTime()) / 86400000
  );

  // ── Ruling planet = Vara lord ──
  const planet = VARA_LORDS[vara];
  const transitSign = ZODIAC[transitRashi];
  const element = SIGN_ELEMENTS[transitSign] || 'Fire';

  // ── Narrative (deterministic via day-of-year index) ──
  const pool = NARRATIVES[q];
  const narr = pool[dayOfYear % pool.length]
    .replace(/{nak}/g, NAKSHATRAS[transitNak])
    .replace(/{vara}/g, planet.name)
    .replace(/{sign}/g, transitSign)
    .replace(/{tara}/g, tb.name);

  const pool2 = NARRATIVES[q === 'great' ? 'good' : q === 'bad' ? 'neutral' : q];
  const narr2 = pool2[(dayOfYear + 1) % pool2.length]
    .replace(/{nak}/g, NAKSHATRAS[transitNak])
    .replace(/{vara}/g, planet.name)
    .replace(/{sign}/g, transitSign)
    .replace(/{tara}/g, tb.name);
  const narrative = narr + '\n\n' + narr2;

  // ── Do / Don't lists ──
  const doPool = DO_POOL[q];
  const dontPool = DONT_POOL[q];
  const doList = [
    doPool[dayOfYear % doPool.length],
    doPool[(dayOfYear + 1) % doPool.length],
    doPool[(dayOfYear + 2) % doPool.length],
  ].filter((v, i, a) => a.indexOf(v) === i);
  const dontList = [
    dontPool[dayOfYear % dontPool.length],
    dontPool[(dayOfYear + 1) % dontPool.length],
    dontPool[(dayOfYear + 2) % dontPool.length],
  ].filter((v, i, a) => a.indexOf(v) === i);

  // ── Best hours (Vara-based) ──
  const peakStart = 5 + (vara % 4);
  const neutralStart = 11 + (vara % 3);
  const lowStart = 17 + (vara % 3);
  const bestHours = {
    peak: {
      range: `${peakStart}:00 – ${peakStart + 3}:00 AM`,
      activity: HOUR_ACT.peak[vara % 3],
    },
    neutral: {
      range: `${neutralStart}:00 – ${neutralStart + 3}:00 PM`,
      activity: HOUR_ACT.neutral[(vara + 1) % 3],
    },
    low: {
      range: `${lowStart > 12 ? lowStart - 12 : lowStart}:00 – ${(lowStart + 3) > 12 ? (lowStart + 3) - 12 : lowStart + 3}:00 PM`,
      activity: HOUR_ACT.low[(vara + 2) % 3],
    },
  };

  return {
    rulingPlanet: { name: planet.name, symbol: planet.symbol },
    element,
    transitSign,
    narrative,
    doList,
    dontList,
    bestHours,
    score,
    label,
    labelColor,
    vedic: {
      taraBala: tb,
      chandrabala: cb,
      tithi: ti,
      yoga: vy,
      transitNakshatra: NAKSHATRAS[transitNak],
      transitRashi: transitSign,
    },
  };
}

/**
 * Generate a week of transits for the week navigator.
 */
export function getWeekTransits(
  yearScore: number,
  natalMoon: NatalMoonInput | string,
  centerDate: Date = new Date()
): { date: Date; dateStr: string; transit: DailyTransit }[] {
  const day = centerDate.getDay();
  const monday = new Date(centerDate);
  monday.setDate(centerDate.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      dateStr: d.toISOString().slice(0, 10),
      transit: getDailyTransit(yearScore, natalMoon, d),
    };
  });
}
