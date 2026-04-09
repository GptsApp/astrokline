import { createHash, randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { userKlines } from '@/config/db/schema';
import { resolveUpdatedKlineIsSelf } from '@/shared/lib/kline-ownership';

export type UserKline = typeof userKlines.$inferSelect;
export type NewUserKline = typeof userKlines.$inferInsert;

/**
 * Generate birth hash for deduplication
 */
function generateBirthHash(
  birthDate: string,
  birthTime: string | null,
  birthPlace: string
): string {
  const raw = `${birthDate}|${birthTime || ''}|${birthPlace}`
    .toLowerCase()
    .trim();
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Save or update a KLine (upsert by birthHash)
 */
export async function saveKline(
  userId: string,
  data: {
    isSelf?: boolean;
    label: string;
    birthDate: string;
    birthTime?: string;
    birthPlace: string;
    birthLat?: string;
    birthLng?: string;
    klineResult?: unknown;
  }
): Promise<UserKline> {
  const birthHash = generateBirthHash(
    data.birthDate,
    data.birthTime || null,
    data.birthPlace
  );

  // Check if exists
  const [existing] = await db()
    .select()
    .from(userKlines)
    .where(
      and(eq(userKlines.userId, userId), eq(userKlines.birthHash, birthHash))
    )
    .limit(1);

  if (existing) {
    if (data.isSelf) {
      await db()
        .update(userKlines)
        .set({ isSelf: false })
        .where(
          and(
            eq(userKlines.userId, userId),
            eq(userKlines.isSelf, true)
          )
        );
    }

    // Update existing
    const [updated] = await db()
      .update(userKlines)
      .set({
        label: data.label,
        klineResult: data.klineResult,
        isSelf: resolveUpdatedKlineIsSelf(existing.isSelf, data.isSelf),
      })
      .where(eq(userKlines.id, existing.id))
      .returning();
    return updated;
  }

  // If isSelf, unset any existing isSelf for this user
  if (data.isSelf) {
    await db()
      .update(userKlines)
      .set({ isSelf: false })
      .where(and(eq(userKlines.userId, userId), eq(userKlines.isSelf, true)));
  }

  // Insert new
  const [inserted] = await db()
    .insert(userKlines)
    .values({
      userId,
      isSelf: data.isSelf ?? false,
      label: data.label,
      birthDate: data.birthDate,
      birthTime: data.birthTime || null,
      birthPlace: data.birthPlace,
      birthLat: data.birthLat || null,
      birthLng: data.birthLng || null,
      birthHash,
      klineResult: data.klineResult,
    })
    .returning();

  return inserted;
}

/**
 * Get all KLines for a user (self first, then by date)
 */
export async function getUserKlines(userId: string): Promise<UserKline[]> {
  return db()
    .select()
    .from(userKlines)
    .where(eq(userKlines.userId, userId))
    .orderBy(desc(userKlines.isSelf), desc(userKlines.createdAt));
}

/**
 * Get user's own KLine (isSelf = true)
 */
export async function getMyKline(userId: string): Promise<UserKline | null> {
  const [result] = await db()
    .select()
    .from(userKlines)
    .where(and(eq(userKlines.userId, userId), eq(userKlines.isSelf, true)))
    .limit(1);
  return result || null;
}

export async function getUserKlineById(
  userId: string,
  klineId: string
): Promise<UserKline | null> {
  const [result] = await db()
    .select()
    .from(userKlines)
    .where(and(eq(userKlines.userId, userId), eq(userKlines.id, klineId)))
    .limit(1);

  return result || null;
}

export async function updateKlineResult(
  userId: string,
  klineId: string,
  klineResult: unknown
): Promise<UserKline | null> {
  const [updated] = await db()
    .update(userKlines)
    .set({ klineResult })
    .where(and(eq(userKlines.userId, userId), eq(userKlines.id, klineId)))
    .returning();

  return updated || null;
}

/**
 * Delete a KLine (cannot delete isSelf)
 */
export async function deleteKline(
  userId: string,
  klineId: string
): Promise<boolean> {
  const [kline] = await db()
    .select()
    .from(userKlines)
    .where(and(eq(userKlines.id, klineId), eq(userKlines.userId, userId)))
    .limit(1);

  if (!kline) return false;
  if (kline.isSelf) return false; // Cannot delete own KLine

  await db().delete(userKlines).where(eq(userKlines.id, klineId));

  return true;
}

/**
 * Update KLine label
 */
export async function updateKlineLabel(
  userId: string,
  klineId: string,
  label: string
): Promise<UserKline | null> {
  const [updated] = await db()
    .update(userKlines)
    .set({ label })
    .where(and(eq(userKlines.id, klineId), eq(userKlines.userId, userId)))
    .returning();
  return updated || null;
}

/**
 * Count user's KLines (excluding self)
 */
export async function countUserKlines(userId: string): Promise<number> {
  const results = await db()
    .select()
    .from(userKlines)
    .where(and(eq(userKlines.userId, userId), eq(userKlines.isSelf, false)));
  return results.length;
}

/**
 * Check if a birthHash already exists for a user
 */
export async function klineExists(
  userId: string,
  birthDate: string,
  birthTime: string | null,
  birthPlace: string
): Promise<boolean> {
  const birthHash = generateBirthHash(birthDate, birthTime, birthPlace);
  const [existing] = await db()
    .select()
    .from(userKlines)
    .where(
      and(eq(userKlines.userId, userId), eq(userKlines.birthHash, birthHash))
    )
    .limit(1);
  return !!existing;
}

// ── Share Functions ──

/**
 * Generate share token and set public
 */
export async function generateShareToken(
  userId: string,
  klineId: string
): Promise<string | null> {
  const [kline] = await db()
    .select()
    .from(userKlines)
    .where(and(eq(userKlines.id, klineId), eq(userKlines.userId, userId)))
    .limit(1);

  if (!kline) return null;

  // If already has a token, return it
  if (kline.shareToken) {
    if (!kline.isPublic) {
      await db()
        .update(userKlines)
        .set({ isPublic: true })
        .where(eq(userKlines.id, klineId));
    }
    return kline.shareToken;
  }

  const token = randomUUID().replace(/-/g, '');

  await db()
    .update(userKlines)
    .set({ shareToken: token, isPublic: true })
    .where(eq(userKlines.id, klineId));

  return token;
}

/**
 * Get KLine by share token (public access, no auth required)
 */
export async function getKlineByShareToken(
  token: string
): Promise<UserKline | null> {
  const [result] = await db()
    .select()
    .from(userKlines)
    .where(and(eq(userKlines.shareToken, token), eq(userKlines.isPublic, true)))
    .limit(1);
  return result || null;
}

/**
 * Toggle public visibility
 */
export async function toggleKlinePublic(
  userId: string,
  klineId: string,
  isPublic: boolean
): Promise<boolean> {
  const [result] = await db()
    .update(userKlines)
    .set({ isPublic })
    .where(and(eq(userKlines.id, klineId), eq(userKlines.userId, userId)))
    .returning();
  return !!result;
}
