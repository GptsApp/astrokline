/**
 * Deterministic daily energy algorithm.
 * Same user + same day = same score. No randomness.
 */

const MONTHLY_MESSAGES = [
  'A month for planting seeds quietly.',
  'Build steadily — momentum is growing.',
  'Movement is coming. Stay alert.',
  'A window for bold decisions.',
  'Consolidate recent gains carefully.',
  'Creative energy peaks this month.',
  'Relationships take center stage.',
  'Deep reflection brings clarity.',
  'Your efforts start compounding.',
  'New opportunities emerge naturally.',
  'A time for strategic patience.',
  'Close the year with intention.',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface DailyEnergy {
  score: number;
  label: 'Strong' | 'Steady' | 'Rebuilding';
  labelColor: string;
  message: string;
  greeting: string;
}

export function getDailyEnergy(
  yearScore: number,
  birthDateStr: string,
  targetDate: Date = new Date()
): DailyEnergy {
  // Deterministic seed = birthDate + today's date
  const dateKey = targetDate.toISOString().slice(0, 10);
  const seed = hashCode(birthDateStr + dateKey);

  // Base year score ± variation (max ±8 points)
  const variation = (seed % 17) - 8;
  const score = Math.max(20, Math.min(95, yearScore + variation));

  // Label based on score
  const label: DailyEnergy['label'] =
    score >= 70 ? 'Strong' :
    score >= 45 ? 'Steady' :
    'Rebuilding';

  const labelColor =
    score >= 70 ? 'text-emerald-400' :
    score >= 45 ? 'text-amber-400' :
    'text-rose-400';

  // Monthly message (deterministic)
  const message = MONTHLY_MESSAGES[targetDate.getMonth()];

  // Time-based greeting
  const hour = targetDate.getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return { score, label, labelColor, message, greeting };
}

/**
 * Extract current year score from Life Curve data.
 */
export function extractCurrentYearScore(
  klineResult: any,
  targetYear: number = new Date().getFullYear()
): number | null {
  if (!klineResult) return null;

  // klineResult may be stored as JSON string
  const data = typeof klineResult === 'string'
    ? JSON.parse(klineResult)
    : klineResult;

  const klineData = data?.klineData || data;

  if (!Array.isArray(klineData)) return null;

  const currentPoint = klineData.find(
    (p: any) => p.year === targetYear
  );

  return currentPoint?.score ?? null;
}

/**
 * Extract sun sign from Life Curve result profile.
 */
export function extractSunSign(klineResult: any): string | null {
  if (!klineResult) return null;

  const data = typeof klineResult === 'string'
    ? JSON.parse(klineResult)
    : klineResult;

  return data?.profile?.sun?.sign || null;
}

/**
 * Extract moon sign from Life Curve result profile.
 */
export function extractMoonSign(klineResult: any): string | null {
  if (!klineResult) return null;

  const data = typeof klineResult === 'string'
    ? JSON.parse(klineResult)
    : klineResult;

  return data?.profile?.moon?.sign || null;
}
