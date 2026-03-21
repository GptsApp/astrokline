import { createHash } from 'crypto';
import { and, sql as drizzleSql, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { userKlineQuota, userReferrals } from '@/config/db/schema';

type UserReferral = typeof userReferrals.$inferSelect;

/**
 * Generate a unique referral code for a user (6 chars, uppercase)
 */
export function generateReferralCode(userId: string): string {
  return createHash('sha256')
    .update(`ref-${userId}-${Date.now()}`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
}

/**
 * Get or create user's referral code
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Check if user already has a referral entry
  const [existing] = await db()
    .select()
    .from(userReferrals)
    .where(
      and(
        eq(userReferrals.referrerId, userId),
        eq(userReferrals.status, 'pending')
      )
    )
    .limit(1);

  if (existing) return existing.referralCode;

  // Create new referral code
  const code = generateReferralCode(userId);
  await db().insert(userReferrals).values({
    referrerId: userId,
    referralCode: code,
    status: 'pending',
  });

  return code;
}

/**
 * Process a referral when a new user signs up with a referral code
 */
export async function processReferral(
  referralCode: string,
  newUserId: string
): Promise<boolean> {
  // Find the referral
  const [referral] = await db()
    .select()
    .from(userReferrals)
    .where(
      and(
        eq(userReferrals.referralCode, referralCode),
        eq(userReferrals.status, 'pending')
      )
    )
    .limit(1);

  if (!referral) return false;
  if (referral.referrerId === newUserId) return false; // Can't refer yourself

  // Mark as completed
  await db()
    .update(userReferrals)
    .set({ status: 'completed', referredId: newUserId, rewardGranted: true })
    .where(eq(userReferrals.id, referral.id));

  // Grant reward: +1 to referrer's quota
  await db()
    .update(userKlineQuota)
    .set({ totalLimit: drizzleSql`${userKlineQuota.totalLimit} + 1` })
    .where(eq(userKlineQuota.userId, referral.referrerId));

  // Create a new pending referral for the referrer (so they can keep sharing)
  const newCode = generateReferralCode(referral.referrerId);
  await db().insert(userReferrals).values({
    referrerId: referral.referrerId,
    referralCode: newCode,
    status: 'pending',
  });

  return true;
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string) {
  const all = await db()
    .select()
    .from(userReferrals)
    .where(eq(userReferrals.referrerId, userId));

  const completed = all.filter(
    (r: UserReferral) => r.status === 'completed'
  ).length;
  const pending = all.find((r: UserReferral) => r.status === 'pending');

  return {
    totalReferred: completed,
    bonusQuota: completed, // +1 per referral
    referralCode: pending?.referralCode || null,
  };
}
