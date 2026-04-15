import type { NatalChartResult } from '@/lib/astrology/engine';

import type { AiInsightData } from './ai-insight-cache';

import {
  buildStrategicReading,
  buildPersonalizedKlineTimeline,
  type CurrentEnergyData,
  type StrategicReadingData,
} from './personalized-report';
import { apiToProfile, type BirthProfileInput } from './profile-transform';
import type { AstroUserTier } from './user-tier';
import type {
  DestinyReading,
  DestinyScorePoint,
  Next30DaysGuidance,
  RadarData,
  TransitEvent,
  UserProfile,
} from './mock-astrology-data';

export interface StoredBirthContext extends BirthProfileInput {
  lat?: number | string | null;
  lon?: number | string | null;
  timezoneValue?: number | null;
  timeZoneId?: string | null;
}

export interface StoredKlineResult {
  klineId?: string | null;
  profile?: UserProfile | null;
  birthData?: StoredBirthContext | null;
  rawApiData?: NatalChartResult | null;
  klineData?: DestinyScorePoint[] | null;
  transitDetails?: Record<number, TransitEvent[]> | null;
  radarData?: RadarData[] | null;
  destinyReading?: DestinyReading | null;
  aiInsight?: AiInsightData | null;
  next30Days?: Next30DaysGuidance | null;
  currentEnergy?: CurrentEnergyData | null;
}

type StoredStrategicReadingData = Pick<
  StrategicReadingData,
  'radarData' | 'destinyReading' | 'next30Days' | 'currentEnergy'
>;

function hasTimelineData(result: StoredKlineResult | null | undefined) {
  return Array.isArray(result?.klineData) && result.klineData.length > 0;
}

function hasPremiumDashboardData(
  result: StoredKlineResult | null | undefined
): result is StoredKlineResult & StoredStrategicReadingData {
  if (
    !Array.isArray(result?.radarData) ||
    !result?.destinyReading ||
    !result?.next30Days ||
    !result?.currentEnergy
  ) {
    return false;
  }

  const destinyReading = result.destinyReading as StrategicReadingData['destinyReading'];

  return Boolean(
    typeof destinyReading.advice?.health === 'string' &&
      typeof destinyReading.advice?.timing === 'string' &&
      typeof destinyReading.hiddenTalent?.title === 'string' &&
      typeof destinyReading.hiddenTalent?.description === 'string' &&
      typeof destinyReading.hiddenTalent?.activationAdvice === 'string' &&
      Array.isArray(destinyReading.coreInsights) &&
      typeof destinyReading.cosmicQuote === 'string'
  );
}

export function enrichStoredKlineResult(
  result: StoredKlineResult | null | undefined,
  birthData: StoredBirthContext,
  userTier: AstroUserTier
): StoredKlineResult | null {
  const chart = result?.rawApiData;

  if (!chart || !birthData.date) {
    return result ?? null;
  }

  const baseProfile = result?.profile
    ? result.profile
    : apiToProfile(chart, {
        name: birthData.name,
        date: birthData.date,
        timeSlot: birthData.timeSlot,
        location: birthData.location,
      });

  // Always use birthData.name (from kline.label) as the authoritative name
  const profile = {
    ...baseProfile,
    name: birthData.name || baseProfile.name,
  };

  if (userTier === 'PREMIUM' || userTier === 'STANDARD') {
    const timeline = hasTimelineData(result)
      ? {
          klineData: result!.klineData!,
          transitDetails: result!.transitDetails ?? {},
          overallAverageScore:
            result?.profile?.overallAverageScore ?? profile.overallAverageScore,
        }
      : buildPersonalizedKlineTimeline(chart, birthData.date);

    const premiumDashboard: StrategicReadingData = hasPremiumDashboardData(result)
      ? {
          radarData: result.radarData,
          destinyReading: result.destinyReading,
          next30Days: result.next30Days,
          currentEnergy: result.currentEnergy,
        }
      : buildStrategicReading(profile, chart, timeline);

    return {
      ...result,
      birthData: result?.birthData ?? birthData,
      rawApiData: chart,
      profile: {
        ...profile,
        overallAverageScore: timeline.overallAverageScore,
      },
      klineData: timeline.klineData,
      transitDetails: timeline.transitDetails,
      destinyReading: premiumDashboard.destinyReading,
      next30Days: premiumDashboard.next30Days,
      currentEnergy: premiumDashboard.currentEnergy,
      // Life Radar is PREMIUM-only
      radarData: userTier === 'PREMIUM' ? premiumDashboard.radarData : undefined,
    };
  }

  const timeline = hasTimelineData(result)
    ? {
        klineData: result!.klineData!,
        transitDetails: result!.transitDetails ?? {},
        overallAverageScore:
          result?.profile?.overallAverageScore ?? profile.overallAverageScore,
      }
    : buildPersonalizedKlineTimeline(chart, birthData.date);

  return {
    ...result,
    birthData: result?.birthData ?? birthData,
    rawApiData: chart,
    profile: {
      ...profile,
      overallAverageScore: timeline.overallAverageScore,
    },
    klineData: timeline.klineData,
    transitDetails: timeline.transitDetails,
    radarData: undefined,
    destinyReading: undefined,
    next30Days: undefined,
    currentEnergy: undefined,
  };
}
