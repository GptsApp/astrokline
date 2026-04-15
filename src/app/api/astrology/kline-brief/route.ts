import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateHeroInsight, generateKeyYearInsights, generatePersonalityInsight, type KeyYearInput } from '@/lib/astrokline/gemini';
import {
  buildKlineBundleCacheKey,
  ensureKlineBundleCacheTable,
  getKlineBundleD1,
  readKlineBundleCache,
  runKlineBundleRequest,
  writeKlineBundleCache,
} from '@/lib/astrokline/kline-bundle-cache';
import { normalizePersonalityInsight } from '@/lib/astrokline/personality-insight-normalizer';
import { getSectionsForLane, getSectionsForTier } from '@/lib/astrokline/section-prompts';
import { buildKlineAIBundle, type KlineBundlePhase, type KlineBundleTier } from '@/lib/astrokline/kline-ai-bundle';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { getSignUser } from '@/shared/models/user';

const planetPlacementSchema = z.object({
  sign: z.string().min(1),
  degree: z.number(),
  minute: z.number(),
  house: z.number().int(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  navamsa: z.object({
    sign: z.string().min(1),
    degree: z.number(),
  }).optional(),
});

const profileSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string().min(1),
  birthTime: z.string().min(1),
  birthLocation: z.string().min(1),
  sun: planetPlacementSchema,
  moon: planetPlacementSchema,
  rising: planetPlacementSchema,
  planets: z.array(planetPlacementSchema),
  elements: z.object({
    fire: z.number(),
    earth: z.number(),
    air: z.number(),
    water: z.number(),
  }),
  modalities: z.object({
    cardinal: z.number(),
    fixed: z.number(),
    mutable: z.number(),
  }),
  lifePathNumber: z.number(),
  overallAverageScore: z.number(),
  yogas: z.array(z.object({
    name: z.string().min(1),
    planets: z.array(z.string()),
    description: z.string().min(1),
  })).optional(),
});

const keyYearInputSchema = z.object({
  year: z.number().int(),
  score: z.number(),
  stage: z.string().min(1),
  transitTitle: z.string().min(1),
  transitPlanet: z.string().min(1),
  transitAspect: z.string().min(1),
  transitTheme: z.string().min(1),
  targetSign: z.string().min(1),
  targetHouse: z.number().int(),
});

const phaseSchema = z.enum(['hero', 'core', 'deep', 'full']);

const requestSchema = z.object({
  profile: profileSchema,
  tier: z.enum(['HERO', 'LITE', 'PRO']).optional().default('PRO'),
  phase: phaseSchema.optional(),
  mode: phaseSchema.optional(),
  locale: z.string().min(2).max(8).optional().default('en'),
  keyYears: z.array(keyYearInputSchema).max(10).optional().default([]),
  includeDiagnosis: z.boolean().optional(),
  includeAction: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  phase: data.phase ?? data.mode ?? 'full',
}));

function resolveEffectiveTier(requestedTier: KlineBundleTier, astroUserTier: 'FREE' | 'STANDARD' | 'PREMIUM'): KlineBundleTier | null {
  if (astroUserTier === 'PREMIUM') {
    return requestedTier;
  }

  if (astroUserTier === 'STANDARD') {
    if (requestedTier === 'PRO') {
      return 'LITE';
    }

    return requestedTier;
  }

  return requestedTier === 'HERO' ? 'HERO' : null;
}

function resolveSectionsForPhase(
  phase: KlineBundlePhase,
  effectiveTier: KlineBundleTier,
  shouldGenerateDiagnosis: boolean,
): string[] {
  if (!shouldGenerateDiagnosis || effectiveTier === 'HERO') {
    return [];
  }

  if (phase === 'hero') {
    return getSectionsForLane('hero');
  }

  if (phase === 'core') {
    return getSectionsForLane('core');
  }

  if (phase === 'deep') {
    return effectiveTier === 'PRO' ? getSectionsForLane('deep') : [];
  }

  return getSectionsForTier(effectiveTier);
}

function withBundleTier(bundle: ReturnType<typeof buildKlineAIBundle>, tier: KlineBundleTier) {
  if (bundle.meta.tier === tier) {
    return bundle;
  }

  return {
    ...bundle,
    meta: {
      ...bundle.meta,
      tier,
    },
  };
}

function logKlineServerEvent(event: string, payload: Record<string, unknown>) {
  console.log(JSON.stringify({
    type: 'kline_phase_event',
    event,
    at: new Date().toISOString(),
    ...payload,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const startedAt = Date.now();
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid kline brief request' }, { status: 400 });
    }

    const astroUserTier = await getAstroUserTier(user);
    const effectiveTier = resolveEffectiveTier(parsed.data.tier, astroUserTier);

    if (!effectiveTier) {
      return NextResponse.json({ error: 'Tier does not support kline brief generation' }, { status: 403 });
    }

    const profile = parsed.data.profile as UserProfile;
    const phase = parsed.data.phase as KlineBundlePhase;
    const locale = parsed.data.locale;
    const keyYears = parsed.data.keyYears as KeyYearInput[];
    const shouldGenerateDiagnosis = phase === 'hero'
      ? false
      : (parsed.data.includeDiagnosis ?? effectiveTier !== 'HERO');
    const sections = resolveSectionsForPhase(phase, effectiveTier, shouldGenerateDiagnosis);
    const shouldGenerateAction = (parsed.data.includeAction ?? keyYears.length > 0) && phase === 'full';
    const bundleKeyYears = shouldGenerateAction ? keyYears : [];

    if ((phase === 'core' || phase === 'deep') && sections.length === 0) {
      return NextResponse.json({ error: 'Phase does not support generation for current tier' }, { status: 403 });
    }

    const db = await getKlineBundleD1();
    const cacheKey = await buildKlineBundleCacheKey({
      profile,
      tier: effectiveTier,
      phase,
      locale,
      keyYears: bundleKeyYears,
      includeDiagnosis: shouldGenerateDiagnosis,
      includeAction: shouldGenerateAction,
    });
    const sharedCacheKey = phase === 'hero'
      ? await buildKlineBundleCacheKey({
          profile,
          tier: 'HERO',
          phase,
          locale,
          keyYears: [],
          includeDiagnosis: false,
          includeAction: false,
        })
      : (phase === 'core' && effectiveTier === 'PRO')
        ? await buildKlineBundleCacheKey({
            profile,
            tier: 'LITE',
            phase,
            locale,
            keyYears: [],
            includeDiagnosis: true,
            includeAction: false,
          })
        : null;

    if (db) {
      await ensureKlineBundleCacheTable(db);
    }

    logKlineServerEvent(`kline_${phase}_request_started`, {
      tier: effectiveTier,
      locale,
      userId: user.id,
      cacheKey,
    });

    let cached = await readKlineBundleCache(db, cacheKey);
    let cacheScope: 'primary' | 'shared' | null = cached ? 'primary' : null;

    if (!cached && sharedCacheKey && sharedCacheKey !== cacheKey) {
      cached = await readKlineBundleCache(db, sharedCacheKey);
      cacheScope = cached ? 'shared' : null;
    }

    if (cached) {
      const responseBundle = cacheScope === 'shared'
        ? withBundleTier(cached, effectiveTier)
        : cached;

      logKlineServerEvent('kline_cache_hit', {
        phase,
        tier: effectiveTier,
        locale,
        userId: user.id,
        cacheKey,
        cacheScope,
      });
      return NextResponse.json({ bundle: responseBundle, _cached: true });
    }

    logKlineServerEvent('kline_cache_miss', {
      phase,
      tier: effectiveTier,
      locale,
      userId: user.id,
      cacheKey,
    });

    const bundle = await runKlineBundleRequest(cacheKey, async () => {
      const bundleInsight = phase === 'hero'
        ? (() => {
            const heroInsight = generateHeroInsight(profile);
            return heroInsight.then((hero) => ({
              nickname: hero.nickname,
              coreQuote: hero.coreQuote,
              summary: hero.title,
              relationships: hero.supportLine,
              dashaTimeline: hero.proofLine,
              _fallback: hero._fallback,
            }));
          })()
        : (() => {
            const rawInsight = generatePersonalityInsight(profile, {
              sections,
              skipNickname: phase === 'core' || phase === 'deep',
            });

            return rawInsight.then((insight) => {
              const { insight: normalizedInsight } = normalizePersonalityInsight(profile, insight);
              return phase === 'core' || phase === 'deep'
                ? (({ nickname: _nickname, coreQuote: _coreQuote, ...rest }) => rest)(normalizedInsight)
                : normalizedInsight;
            });
          })();

      const resolvedBundleInsight = await bundleInsight;
      const keyYearInsights = effectiveTier === 'HERO' || !shouldGenerateAction || keyYears.length === 0
        ? []
        : await generateKeyYearInsights(profile, keyYears);

      const nextBundle = buildKlineAIBundle({
        tier: effectiveTier,
        phase,
        aiInsight: resolvedBundleInsight,
        keyYears: bundleKeyYears,
        keyYearInsights,
        includedSections: sections,
      });

      if (!nextBundle.meta.fallbackUsed) {
        writeKlineBundleCache(db, cacheKey, nextBundle).catch(() => {});

        if (sharedCacheKey && sharedCacheKey !== cacheKey) {
          const sharedTier = phase === 'hero' ? 'HERO' : 'LITE';
          writeKlineBundleCache(db, sharedCacheKey, withBundleTier(nextBundle, sharedTier)).catch(() => {});
        }
      }

      return nextBundle;
    });

    logKlineServerEvent(`kline_${phase}_request_completed`, {
      tier: effectiveTier,
      locale,
      userId: user.id,
      cacheKey,
      latencyMs: Date.now() - startedAt,
      includedSections: bundle.meta.includedSections,
      fallbackUsed: bundle.meta.fallbackUsed,
    });

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error('Kline brief generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate kline brief' }, { status: 500 });
  }
}