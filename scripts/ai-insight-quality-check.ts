import { MOCK_USER_PROFILE } from '@/lib/astrokline/mock-astrology-data';
import { normalizePersonalityInsight } from '@/lib/astrokline/personality-insight-normalizer';

const SECTION_KEYS = [
  'summary',
  'career',
  'relationships',
  'wealth',
  'health',
  'strengths',
  'warnings',
  'dashaTimeline',
  'marriage',
  'karma',
  'family',
  'children',
  'spirituality',
  'education',
  'authority',
  'lifestyle',
  'hiddenDangers',
] as const;

const EVIDENCE_PATTERN = /(Sun|Moon|Rising|Venus|Mars|Saturn|House)/i;
const CORPORATE_PATTERN = /(leverage|optimi[sz]e|strategic positioning|synergy|bandwidth|stakeholders|deliverables|KPI)/i;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function runCase(name: string, payload: unknown) {
  const { insight, usedFallbackCount } = normalizePersonalityInsight(
    MOCK_USER_PROFILE,
    payload,
  );

  assert(Boolean(insight.nickname), `${name}: nickname is empty`);
  assert(Boolean(insight.coreQuote), `${name}: coreQuote is empty`);

  for (const key of SECTION_KEYS) {
    const text = insight[key] || '';
    const [mainText = ''] = text.split(/\n\n###\s*Next\s*Steps\n/i);
    assert(text.length > 120, `${name}: ${key} too short after normalization`);
    assert(/###\s*Next\s*Steps/i.test(text), `${name}: ${key} missing Next Steps`);
    assert(EVIDENCE_PATTERN.test(text), `${name}: ${key} missing explainability evidence`);
    assert(!/Evidence anchor:/i.test(text), `${name}: ${key} still has raw "Evidence anchor:" label`);
    assert(!/<[^>]+>/.test(text), `${name}: ${key} still contains HTML tags`);
    assert(!text.includes('\u0000'), `${name}: ${key} contains control char`);
    assert(!CORPORATE_PATTERN.test(text), `${name}: ${key} still contains corporate jargon`);
    if (key === 'relationships') {
      assert(mainText.split(/\s+/).filter(Boolean).length <= 300, `${name}: relationships exceeds 300 words`);
    }
  }

  console.log(`PASS ${name} (fallback sections: ${usedFallbackCount})`);
}

function createBaselinePayload() {
  const base = {
    nickname: 'The Quiet Architect',
    coreQuote: 'You build your life by turning emotional truth into practical structure.',
  } as Record<string, string>;

  for (const key of SECTION_KEYS) {
    base[key] = `${key} analysis: Your Capricorn Sun in House 8 and Pisces Moon in House 1 shape this phase with grounded intensity and emotional precision.\n\n### Next Steps\n- Step 1\n- Step 2\n- Step 3`;
  }

  return base;
}

function main() {
  runCase('baseline-valid', createBaselinePayload());

  runCase('missing-and-short-fields', {
    nickname: 'Q',
    summary: 'short',
  });

  runCase('anomaly-format', {
    nickname: '```json\n"Bad"\n```',
    coreQuote: '<b>unsafe</b>\u0000',
    summary: '<script>alert(1)</script> No evidence and no steps',
    relationships: 'Too short',
  });

  runCase('tone-and-length-normalization', {
    nickname: 'The Planner',
    coreQuote: 'You keep building even when your heart needs rest.',
    summary: 'This section asks you to leverage your strengths and optimize your communication while stakeholders adjust to your bandwidth. Capricorn Sun in House 8 and Pisces Moon in House 1 explain the pressure you carry.\n\n### Next Steps\n- Step 1\n- Step 2\n- Step 3',
    relationships: `${Array.from({ length: 340 }, (_, i) => `word${i}`).join(' ')} Sun in House 8 Moon in House 1.\n\n### Next Steps\n- Step 1\n- Step 2\n- Step 3`,
  });

  // ── Test: emotional lead idempotency (normalize twice — no duplicate openers) ──
  {
    const payload = createBaselinePayload();
    const { insight: first } = normalizePersonalityInsight(MOCK_USER_PROFILE, payload);
    const { insight: second } = normalizePersonalityInsight(MOCK_USER_PROFILE, first);
    for (const key of ['summary', 'career', 'relationships', 'wealth'] as const) {
      assert(
        first[key] === second[key],
        `idempotency: ${key} changed after second normalize (double-opener stacking)`,
      );
    }
    console.log('PASS emotional-lead-idempotency');
  }

  console.log('AI insight quality check passed for stability, consistency, explainability, anomaly samples.');
}

main();
