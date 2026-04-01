/**
 * Daily Transit Engine — deterministic daily cosmic insights.
 * Same user + same day = same result. No randomness, no API calls.
 */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// --- Data pools ---

const PLANETS = [
  { name: 'Moon', symbol: '☽', element: 'Water' },
  { name: 'Mercury', symbol: '☿', element: 'Air' },
  { name: 'Venus', symbol: '♀', element: 'Earth' },
  { name: 'Mars', symbol: '♂', element: 'Fire' },
  { name: 'Jupiter', symbol: '♃', element: 'Fire' },
  { name: 'Saturn', symbol: '♄', element: 'Earth' },
  { name: 'Sun', symbol: '☉', element: 'Fire' },
];

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const TRANSIT_PARAGRAPHS = [
  '{planet} in {sign} activates your intuitive channels today. Trust quiet hunches over loud opinions — your subconscious is processing faster than your rational mind.',
  '{planet} trines your natal chart, boosting emotional intelligence. Conversations carry extra weight; choose words that build bridges rather than walls.',
  'A {element} day amplified by {planet}. Creative energy surges — channel it into concrete output rather than scattered brainstorming.',
  '{planet} squares your natal position, creating productive tension. Use the friction to sharpen your focus, not to start arguments.',
  'With {planet} in {sign}, professional magnetism peaks. Pitch ideas, schedule interviews, or negotiate terms — the cosmic wind is at your back.',
  '{planet} brings reflective energy today. Journal, meditate, or take a long walk. Insights that arrive now will prove valuable next week.',
  'A dynamic {element} influence from {planet}. Physical activity clears mental fog — even 20 minutes of movement shifts your entire perspective.',
  '{planet} in {sign} highlights relationships. Reach out to someone you have been meaning to connect with. Small gestures create lasting impressions.',
];

const DO_POOL = [
  'Trust your intuition in negotiations',
  'Start creative projects you have been postponing',
  'Schedule important conversations',
  'Focus on deep work during morning hours',
  'Reach out to a mentor or advisor',
  'Document ideas that come during reflection',
  'Invest time in skill development',
  'Express appreciation to someone close',
  'Take decisive action on pending decisions',
  'Set clear boundaries with your time',
  'Review and adjust your monthly goals',
  'Connect with someone in your network',
  'Tackle a challenging task head-on',
  'Practice active listening in meetings',
  'Organize your workspace for clarity',
];

const DONT_POOL = [
  'Make impulsive financial decisions',
  'Overcommit to social obligations',
  'Ignore physical fatigue signals',
  'Start confrontations over minor issues',
  'Sign contracts without careful review',
  'Skip meals or rest for productivity',
  'React emotionally to criticism',
  'Take on others\' responsibilities',
  'Make permanent decisions from temporary emotions',
  'Neglect your personal boundaries',
  'Rush through important documents',
  'Compare your progress to others',
  'Avoid difficult but necessary conversations',
  'Sacrifice sleep for extra work hours',
  'Dismiss your gut feelings about people',
];

const HOUR_ACTIVITIES = {
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
    'financial decisions, difficult conversations',
    'major commitments, confrontations',
    'high-stakes negotiations, signing contracts',
  ],
};

// --- Export types ---

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
}

export function getDailyTransit(
  yearScore: number,
  birthDate: string,
  targetDate: Date = new Date()
): DailyTransit {
  const dateKey = targetDate.toISOString().slice(0, 10);
  const seed = hashCode(birthDate + dateKey);

  // Score (same logic as daily-energy)
  const variation = (seed % 25) - 12;
  const score = Math.max(15, Math.min(95, yearScore + variation));
  const label: DailyTransit['label'] =
    score >= 70 ? 'High' : score >= 45 ? 'Neutral' : 'Low';
  const labelColor =
    score >= 70 ? 'text-emerald-400' :
    score >= 45 ? 'text-amber-400' : 'text-rose-400';

  // Ruling planet & sign
  const planet = PLANETS[seed % PLANETS.length];
  const sign = ZODIAC_SIGNS[(seed >> 3) % ZODIAC_SIGNS.length];

  // Narrative (2 paragraphs)
  const p1 = TRANSIT_PARAGRAPHS[seed % TRANSIT_PARAGRAPHS.length]
    .replace('{planet}', planet.name)
    .replace('{sign}', sign)
    .replace('{element}', planet.element);
  const p2 = TRANSIT_PARAGRAPHS[(seed >> 4) % TRANSIT_PARAGRAPHS.length]
    .replace('{planet}', planet.name)
    .replace('{sign}', sign)
    .replace('{element}', planet.element);
  const narrative = p1 + '\n\n' + p2;

  // DO list (3 unique items)
  const doList: string[] = [];
  for (let i = 0; doList.length < 3 && i < 10; i++) {
    const item = DO_POOL[(seed + i * 7) % DO_POOL.length];
    if (!doList.includes(item)) doList.push(item);
  }

  // DON'T list (3 unique items)
  const dontList: string[] = [];
  for (let i = 0; dontList.length < 3 && i < 10; i++) {
    const item = DONT_POOL[(seed + i * 5) % DONT_POOL.length];
    if (!dontList.includes(item)) dontList.push(item);
  }

  // Best Hours (deterministic based on seed)
  const peakStart = 5 + (seed % 4);       // 5-8 AM
  const neutralStart = 11 + (seed % 3);   // 11-13
  const lowStart = 17 + (seed % 3);       // 17-19
  const bestHours = {
    peak: {
      range: `${peakStart}:00 – ${peakStart + 3}:00 AM`,
      activity: HOUR_ACTIVITIES.peak[seed % 3],
    },
    neutral: {
      range: `${neutralStart}:00 – ${neutralStart + 3}:00 PM`,
      activity: HOUR_ACTIVITIES.neutral[(seed >> 2) % 3],
    },
    low: {
      range: `${lowStart > 12 ? lowStart - 12 : lowStart}:00 – ${(lowStart + 3) > 12 ? (lowStart + 3) - 12 : lowStart + 3}:00 PM`,
      activity: HOUR_ACTIVITIES.low[(seed >> 1) % 3],
    },
  };

  return {
    rulingPlanet: { name: planet.name, symbol: planet.symbol },
    element: planet.element,
    transitSign: sign,
    narrative,
    doList,
    dontList,
    bestHours,
    score,
    label,
    labelColor,
  };
}

/**
 * Generate a week of transits for the week navigator.
 */
export function getWeekTransits(
  yearScore: number,
  birthDate: string,
  centerDate: Date = new Date()
): { date: Date; dateStr: string; transit: DailyTransit }[] {
  // Find Monday of the week containing centerDate
  const day = centerDate.getDay();
  const monday = new Date(centerDate);
  monday.setDate(centerDate.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      dateStr: d.toISOString().slice(0, 10),
      transit: getDailyTransit(yearScore, birthDate, d),
    };
  });
}
