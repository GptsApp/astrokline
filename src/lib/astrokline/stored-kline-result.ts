import type { NatalChartResult } from '@/lib/astrology/engine';

import {
  buildFullPersonalizedReport,
  buildPersonalizedKlineTimeline,
  type CurrentEnergyData,
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
}

export interface StoredKlineResult {
  profile?: UserProfile | null;
  birthData?: StoredBirthContext | null;
  rawApiData?: NatalChartResult | null;
  klineData?: DestinyScorePoint[] | null;
  transitDetails?: Record<number, TransitEvent[]> | null;
  radarData?: RadarData[] | null;
  destinyReading?: DestinyReading | null;
  next30Days?: Next30DaysGuidance | null;
  currentEnergy?: CurrentEnergyData | null;
}

function hasTimelineData(result: StoredKlineResult | null | undefined) {
  return Array.isArray(result?.klineData) && result.klineData.length > 0;
}

function hasPremiumDashboardData(result: StoredKlineResult | null | undefined) {
  return Boolean(
    result?.radarData &&
      result?.destinyReading &&
      result?.next30Days &&
      result?.currentEnergy
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

  const profile = result?.profile
    ? result.profile
    : apiToProfile(chart, {
        name: birthData.name,
        date: birthData.date,
        timeSlot: birthData.timeSlot,
        location: birthData.location,
      });

  if (userTier === 'PREMIUM') {
    const fullReport = buildFullPersonalizedReport(chart, birthData.date, profile);

    return {
      ...result,
      birthData: result?.birthData ?? birthData,
      rawApiData: chart,
      profile: {
        ...profile,
        overallAverageScore: fullReport.overallAverageScore,
      },
      ...fullReport,
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
    radarData: hasPremiumDashboardData(result) ? result?.radarData ?? null : undefined,
    destinyReading: hasPremiumDashboardData(result)
      ? result?.destinyReading ?? null
      : undefined,
    next30Days: hasPremiumDashboardData(result)
      ? result?.next30Days ?? null
      : undefined,
    currentEnergy: hasPremiumDashboardData(result)
      ? result?.currentEnergy ?? null
      : undefined,
  };
}
