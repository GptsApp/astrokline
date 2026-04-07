import { and, eq, lt, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import { userKlineQuota } from '@/config/db/schema';

export type UserKlineQuota = typeof userKlineQuota.$inferSelect;

// Quota limits per user tier
const QUOTA_LIMITS: Record<string, { total: number; isLifetime: boolean }> = {
  FREE: { total: 1, isLifetime: true },
  STANDARD: { total: 5, isLifetime: false },
  PREMIUM: { total: 999, isLifetime: false },
};

/**
 * Get or initialize quota for a user
 */
export async function getOrInitQuota(
  userId: string,
  userTier: string = 'FREE'
): Promise<UserKlineQuota> {
  const [existing] = await db()
    .select()
    .from(userKlineQuota)
    .where(eq(userKlineQuota.userId, userId))
    .limit(1);

  if (existing) {
    // Check if period needs reset (monthly users)
    const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.FREE;
    if (
      !limits.isLifetime &&
      existing.periodEnd &&
      new Date() > existing.periodEnd
    ) {
      // Reset for new month
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const [updated] = await db()
        .update(userKlineQuota)
        .set({
          usedCount: 0,
          totalLimit: limits.total,
          periodStart,
          periodEnd,
        })
        .where(eq(userKlineQuota.userId, userId))
        .returning();
      return updated;
    }

    // Update total_limit if tier changed
    if (existing.totalLimit !== limits.total) {
      const [updated] = await db()
        .update(userKlineQuota)
        .set({ totalLimit: limits.total })
        .where(eq(userKlineQuota.userId, userId))
        .returning();
      return updated;
    }

    return existing;
  }

  // Initialize new quota
  return initQuota(userId, userTier);
}

/**
 * Initialize quota for a new user
 */
export async function initQuota(
  userId: string,
  userTier: string = 'FREE'
): Promise<UserKlineQuota> {
  const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.FREE;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = limits.isLifetime
    ? null
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [inserted] = await db()
    .insert(userKlineQuota)
    .values({
      userId,
      usedCount: 0,
      totalLimit: limits.total,
      periodStart,
      periodEnd,
      lifetimeUsed: 0,
    })
    .onConflictDoNothing()
    .returning();

  // If conflict (already exists), fetch it
  if (!inserted) {
    return getOrInitQuota(userId, userTier);
  }

  return inserted;
}

/**
 * Check if user has remaining quota
 */
export async function checkQuota(
  userId: string,
  userTier: string = 'FREE'
): Promise<{
  hasQuota: boolean;
  used: number;
  total: number;
  remaining: number;
  isLifetime: boolean;
}> {
  const quota = await getOrInitQuota(userId, userTier);
  const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.FREE;

  const used = limits.isLifetime ? quota.lifetimeUsed : quota.usedCount;
  const total = quota.totalLimit;
  const remaining = Math.max(0, total - used);

  return {
    hasQuota: remaining > 0,
    used,
    total,
    remaining,
    isLifetime: limits.isLifetime,
  };
}

/**
 * Consume one quota unit atomically
 */
export async function consumeQuota(
  userId: string,
  userTier: string = 'FREE'
): Promise<boolean> {
  const quota = await getOrInitQuota(userId, userTier);
  const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.FREE;

  if (limits.isLifetime) {
    const [updated] = await db()
      .update(userKlineQuota)
      .set({ lifetimeUsed: sql`${userKlineQuota.lifetimeUsed} + 1` })
      .where(
        and(
          eq(userKlineQuota.userId, userId),
          lt(userKlineQuota.lifetimeUsed, quota.totalLimit)
        )
      )
      .returning();
    return !!updated;
  } else {
    const [updated] = await db()
      .update(userKlineQuota)
      .set({ usedCount: sql`${userKlineQuota.usedCount} + 1` })
      .where(
        and(
          eq(userKlineQuota.userId, userId),
          lt(userKlineQuota.usedCount, quota.totalLimit)
        )
      )
      .returning();
    return !!updated;
  }
}

/**
 * Get quota status for display
 */
export async function getQuotaStatus(
  userId: string,
  userTier: string = 'FREE'
) {
  return checkQuota(userId, userTier);
}
