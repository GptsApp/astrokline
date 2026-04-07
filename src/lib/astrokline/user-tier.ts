import { getCurrentSubscription } from '@/shared/models/subscription';
import type { User } from '@/shared/models/user';

export type AstroUserTier = 'FREE' | 'STANDARD' | 'PREMIUM';

const PREMIUM_PRODUCT_IDS = new Set([
  'premium',
  'premium-monthly',
  'premium-yearly',
  'ultimate',
  'ultimate-monthly-78',
  'ultimate-yearly-39',
]);

export function normalizeAstroUserTier(value?: string | null): AstroUserTier {
  const normalized = String(value || '')
    .trim()
    .toUpperCase();

  if (normalized === 'PREMIUM' || normalized === 'PRO') {
    return 'PREMIUM';
  }

  if (
    normalized === 'STANDARD' ||
    normalized === 'LITE' ||
    normalized === 'COMPASS' ||
    normalized === 'STARTER'
  ) {
    return 'STANDARD';
  }

  return 'FREE';
}

// ── Admin Override: these users always get PREMIUM regardless of subscription ──
const ADMIN_PREMIUM_EMAILS = new Set([
  'payeezoo@gmail.com',
]);

export async function getAstroUserTier(
  user?: (Pick<User, 'id'> & { plan?: string | null; email?: string | null }) | null
): Promise<AstroUserTier> {
  // ── DEV ONLY: tier override for local testing ──
  // Set NEXT_PUBLIC_DEV_TIER_OVERRIDE=FREE|STANDARD|PREMIUM in .env.local
  if (process.env.NODE_ENV === 'development' && process.env.DEV_TIER_OVERRIDE) {
    const override = process.env.DEV_TIER_OVERRIDE.toUpperCase();
    if (['FREE', 'STANDARD', 'PREMIUM'].includes(override)) {
      console.log(`[DEV] Tier override active: ${override}`);
      return override as AstroUserTier;
    }
  }

  if (!user?.id) {
    return 'FREE';
  }

  // Admin override — no DB mutation, completely safe
  if (user.email && ADMIN_PREMIUM_EMAILS.has(user.email.toLowerCase())) {
    return 'PREMIUM';
  }

  const subscription = await getCurrentSubscription(user.id);

  if (subscription?.productId) {
    return PREMIUM_PRODUCT_IDS.has(subscription.productId)
      ? 'PREMIUM'
      : 'STANDARD';
  }

  return normalizeAstroUserTier(user.plan);
}
