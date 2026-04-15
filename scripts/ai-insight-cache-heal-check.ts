import { MOCK_USER_PROFILE } from '@/lib/astrokline/mock-astrology-data';
import { normalizePersonalityInsight } from '@/lib/astrokline/personality-insight-normalizer';

const legacyCachedPayload = {
  nickname: 'Legacy User',
  summary: 'short legacy summary',
  relationships: '<b>bad</b>',
  career: 'tiny',
};

const { insight, usedFallbackCount } = normalizePersonalityInsight(
  MOCK_USER_PROFILE,
  legacyCachedPayload,
);

if (usedFallbackCount < 3) {
  throw new Error(`Expected cache heal to use fallback for legacy payload, got ${usedFallbackCount}`);
}

if (!/###\s*Next\s*Steps/i.test(insight.summary)) {
  throw new Error('Healed cache summary is missing Next Steps');
}

if (!/(Sun|Moon|Rising|House)/i.test(insight.relationships)) {
  throw new Error('Healed cache relationships is missing evidence anchor');
}

console.log(`PASS cache-heal-check (fallback sections: ${usedFallbackCount})`);
