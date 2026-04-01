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
 * Process a referral when a new user signs up with a referral code.
 * Includes anti-abuse: lifetime cap (10), daily cap (3), self-referral block.
 */

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com','guerrillamail.com','throwaway.email','mailinator.com',
  'yopmail.com','10minutemail.com','trashmail.com','disposablemail.com',
  'fakeinbox.com','sharklasers.com','guerrillamailblock.com','grr.la',
  'dispostable.com','maildrop.cc','harakirimail.com',
]);

const LIFETIME_CAP = 10;
const DAILY_CAP = 3;

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain || '');
}

export async function processReferral(
  referralCode: string,
  newUserId: string,
  newUserEmail?: string
): Promise<boolean> {
  // Block disposable emails
  if (newUserEmail && isDisposableEmail(newUserEmail)) return false;

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

  // Lifetime cap: check total completed referrals for this referrer
  const allCompleted = await db()
    .select()
    .from(userReferrals)
    .where(
      and(
        eq(userReferrals.referrerId, referral.referrerId),
        eq(userReferrals.status, 'completed')
      )
    );

  if (allCompleted.length >= LIFETIME_CAP) return false;

  // Daily cap: check referrals completed today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCompleted = allCompleted.filter(
    (r: typeof allCompleted[number]) => r.createdAt && new Date(r.createdAt) >= todayStart
  );
  if (todayCompleted.length >= DAILY_CAP) return false;

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
