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

export async function getAstroUserTier(
  user?: (Pick<User, 'id'> & { plan?: string | null }) | null
): Promise<AstroUserTier> {
  if (!user?.id) {
    return 'FREE';
  }

  const subscription = await getCurrentSubscription(user.id);

  if (subscription?.productId) {
    return PREMIUM_PRODUCT_IDS.has(subscription.productId)
      ? 'PREMIUM'
      : 'STANDARD';
  }

  return normalizeAstroUserTier(user.plan);
}
