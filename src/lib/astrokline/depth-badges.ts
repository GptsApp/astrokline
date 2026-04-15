import type { AskChartContextPrompt } from '@/lib/astrokline/ask-chart-client';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';

export interface DepthBadge {
  id: 'd9' | 'timing' | 'yoga' | 'pro';
  label: string;
}

function hasNavamsa(profile: UserProfile): boolean {
  return profile.planets.some((planet) => Boolean(planet.navamsa));
}

function dedupeBadges(badges: DepthBadge[]): DepthBadge[] {
  const seen = new Set<DepthBadge['id']>();

  return badges.filter((badge) => {
    if (seen.has(badge.id)) {
      return false;
    }

    seen.add(badge.id);
    return true;
  });
}

export function getModuleDepthBadges(moduleId: string, profile: UserProfile): DepthBadge[] {
  const badges: DepthBadge[] = [];

  if (moduleId === 'dashaTimeline') {
    badges.push({ id: 'timing', label: 'Advanced timing layer' });
  }

  if ((moduleId === 'marriage' || moduleId === 'karma') && hasNavamsa(profile)) {
    badges.push({ id: 'd9', label: moduleId === 'marriage' ? 'D9 relationship layer' : 'D9 soul-purpose layer' });
  }

  if (moduleId === 'karma' && profile.yogas?.length) {
    badges.push({ id: 'yoga', label: 'Named Yoga active' });
  }

  if (moduleId === 'karma') {
    badges.push({ id: 'pro', label: 'Pro interpretation layer' });
  }

  return dedupeBadges(badges);
}

export function getAskChartDepthBadges(
  question: string,
  sourcePrompt: AskChartContextPrompt | null | undefined,
  profile: UserProfile
): DepthBadge[] {
  const combinedText = `${question} ${sourcePrompt?.sourceKey ?? ''}`.toLowerCase();
  const badges: DepthBadge[] = [];

  if (sourcePrompt?.sourceType === 'year' || /(year|timing|chapter|window|dasha)/.test(combinedText)) {
    badges.push({ id: 'timing', label: 'Advanced timing layer' });
  }

  if ((sourcePrompt?.sourceKey === 'marriage' || /(love|relationship|marriage|partner)/.test(combinedText)) && hasNavamsa(profile)) {
    badges.push({ id: 'd9', label: 'D9 relationship layer' });
  }

  if (profile.yogas?.length && /(karma|purpose|career|wealth|pattern)/.test(combinedText)) {
    badges.push({ id: 'yoga', label: 'Named Yoga active' });
  }

  return dedupeBadges(badges);
}