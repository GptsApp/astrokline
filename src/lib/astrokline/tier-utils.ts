/**
 * Map backend subscription tiers to user-facing app tiers.
 * Backend uses: FREE | STANDARD | PREMIUM
 * Frontend uses: GUEST | FREE | LITE | PRO
 */

export type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';
export type BackendTier = 'FREE' | 'STANDARD' | 'PREMIUM';

const BACKEND_TO_APP: Record<string, AppTier> = {
  PREMIUM: 'PRO',
  STANDARD: 'LITE',
  FREE: 'FREE',
};

const TIER_DISPLAY: Record<AppTier, string> = {
  GUEST: 'Guest',
  FREE: 'Free',
  LITE: 'Lite',
  PRO: 'Pro',
};

/**
 * Convert backend tier name to frontend AppTier.
 * Falls back to 'FREE' for unknown values.
 */
export function toAppTier(backendTier: string, isLoggedIn = true): AppTier {
  if (!isLoggedIn) return 'GUEST';
  return BACKEND_TO_APP[backendTier.toUpperCase()] ?? 'FREE';
}

/**
 * Get human-readable display name for a tier.
 */
export function tierDisplayName(tier: AppTier): string {
  return TIER_DISPLAY[tier] ?? 'Free';
}

/**
 * Check if user tier meets a minimum requirement.
 */
const TIER_RANK: Record<AppTier, number> = { GUEST: 0, FREE: 1, LITE: 2, PRO: 3 };
export function tierAtLeast(current: AppTier, minimum: AppTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[minimum];
}
