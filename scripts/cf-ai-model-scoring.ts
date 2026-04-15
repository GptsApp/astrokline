/**
 * Cloudflare Workers AI Model Scoring Script
 *
 * Tests 3 candidate models on the same astrology prompt,
 * scores each on 6 dimensions, picks top 2 for production fallback.
 *
 * Usage: CF_ACCOUNT_ID=xxx CF_API_TOKEN=xxx npx tsx scripts/cf-ai-model-scoring.ts
 */

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '7fcf090b47fd9cbb0a4334b32b23468f';
const CF_API_TOKEN = process.env.CF_API_TOKEN;

if (!CF_API_TOKEN) {
  console.error('Set CF_API_TOKEN env var (Cloudflare API token with Workers AI permission)');
  process.exit(1);
}

const MODELS = [
  '@cf/qwen/qwen3-30b-a3b-fp8',
  '@cf/google/gemma-4-26b-a4b-it',
  '@cf/zai-org/glm-4.7-flash',
] as const;

const SECTION_KEYS = [
  'summary', 'career', 'relationships', 'wealth', 'health',
  'strengths', 'warnings', 'dashaTimeline', 'marriage', 'karma',
  'family', 'children', 'spirituality', 'education', 'authority',
  'lifestyle', 'hiddenDangers',
] as const;

const TEST_PROMPT = `You are a world-renowned Evolutionary Astrologer. Generate a deeply personal astrological analysis in pure JSON format.

## Birth Chart Data
Sun: Capricorn 15° (House 8)
Moon: Pisces 22° (House 1)
Rising: Capricorn 3° (House 1)
Venus: Aquarius 8° (House 2)
Mars: Scorpio 19° (House 11)
Saturn: Capricorn 25° (House 1)
Elements: Fire 15%, Earth 40%, Air 20%, Water 25%

## Rules
1. Use second person ("You", "Your").
2. Every section must cite specific Planet + Sign + House as evidence.
3. Include "### Next Steps" with 3 bullet items at the end of each section.
4. No corporate jargon (leverage, optimize, synergy, bandwidth, KPI).
5. Relationships section: 220-300 words. Other sections: 140-220 words.
6. Warm counselor tone, emotionally resonant.
7. Output ONLY valid JSON (no markdown, no code fences).

## JSON Schema
{
  "nickname": "3-6 word soul title",
  "coreQuote": "15-30 word piercing quote",
  "summary": "Core personality 180-240 words ... ### Next Steps ...",
  "relationships": "Love 220-300 words ... ### Next Steps ...",
  "career": "Career 160-220 words ... ### Next Steps ...",
  "wealth": "Wealth 160-220 words ... ### Next Steps ...",
  "health": "Health 160-220 words ... ### Next Steps ...",
  "strengths": "Strengths 140-200 words ... ### Next Steps ...",
  "warnings": "Shadow 140-200 words ... ### Next Steps ...",
  "dashaTimeline": "Timing 160-220 words ... ### Next Steps ...",
  "marriage": "Marriage 160-220 words ... ### Next Steps ...",
  "karma": "Karma 160-220 words ... ### Next Steps ...",
  "family": "Family 140-200 words ... ### Next Steps ...",
  "children": "Children 140-200 words ... ### Next Steps ...",
  "spirituality": "Spiritual 140-200 words ... ### Next Steps ...",
  "education": "Education 140-200 words ... ### Next Steps ...",
  "authority": "Authority 140-200 words ... ### Next Steps ...",
  "lifestyle": "Lifestyle 140-200 words ... ### Next Steps ...",
  "hiddenDangers": "Caution 140-200 words ... ### Next Steps ..."
}`;

interface ScoreResult {
  model: string;
  jsonValid: boolean;
  parseTime: number;
  scores: {
    jsonCompleteness: number;
    evidenceDensity: number;
    toneQuality: number;
    wordCountAccuracy: number;
    nextStepsCoverage: number;
    emotionalResonance: number;
  };
  total: number;
  sectionsPresent: number;
  rawResponse: string;
  error?: string;
}

function stripCodeFences(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

async function callCfModel(model: string): Promise<{ text: string; timeMs: number }> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`;
  const start = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000); // 120s timeout

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: TEST_PROMPT },
        ],
        max_tokens: 8192,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    const elapsed = Date.now() - start;

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`${model} HTTP ${resp.status}: ${err}`);
    }

    const data = await resp.json() as any;
    // Chat completion format: result.choices[0].message.content
    // Text generation format: result.response
    const text = data?.result?.choices?.[0]?.message?.content
      || data?.result?.response
      || '';
    return { text, timeMs: elapsed };
  } finally {
    clearTimeout(timeout);
  }
}

const EVIDENCE_RE = /\b(sun|moon|rising|venus|mars|saturn|jupiter|pluto|neptune|uranus|mercury|house\s*\d+|\d+(st|nd|rd|th)\s+house)\b/gi;
const CORPORATE_RE = /\b(leverage|optimi[sz]e|strategic positioning|synergy|bandwidth|stakeholders|deliverables|KPI)\b/i;
const EMOTIONAL_RE = /\b(feel|heart|soul|deeply|intimat|vulnerab|safe|trust|wound|fear|love|nurtur|tender|protect)\b/gi;

function scoreResponse(model: string, rawText: string, timeMs: number): ScoreResult {
  const cleaned = stripCodeFences(rawText);
  let parsed: Record<string, any> = {};
  let jsonValid = false;

  try {
    parsed = JSON.parse(cleaned);
    jsonValid = true;
  } catch {
    // Try salvage
    try {
      let salvaged = cleaned;
      if ((salvaged.match(/"/g) || []).length % 2 !== 0) salvaged += '"';
      salvaged = salvaged.replace(/,\s*$/, '');
      const ob = salvaged.split('{').length - 1;
      const cb = salvaged.split('}').length - 1;
      if (ob > cb) salvaged += '}'.repeat(ob - cb);
      parsed = JSON.parse(salvaged);
      jsonValid = true;
    } catch {
      // total failure
    }
  }

  const scores = {
    jsonCompleteness: 0,
    evidenceDensity: 0,
    toneQuality: 0,
    wordCountAccuracy: 0,
    nextStepsCoverage: 0,
    emotionalResonance: 0,
  };

  if (!jsonValid) {
    return { model, jsonValid, parseTime: timeMs, scores, total: 0, sectionsPresent: 0, rawResponse: rawText.slice(0, 500) };
  }

  // 1. JSON Completeness (0-20): how many of 17 sections + nickname + coreQuote are present with content
  let sectionsPresent = 0;
  for (const key of SECTION_KEYS) {
    if (typeof parsed[key] === 'string' && parsed[key].length > 50) sectionsPresent++;
  }
  if (typeof parsed.nickname === 'string' && parsed.nickname.length > 3) sectionsPresent++;
  if (typeof parsed.coreQuote === 'string' && parsed.coreQuote.length > 10) sectionsPresent++;
  scores.jsonCompleteness = Math.round((sectionsPresent / 19) * 20);

  // 2. Evidence Density (0-20): average evidence references per section
  let totalEvidence = 0;
  let sectionCount = 0;
  for (const key of SECTION_KEYS) {
    const text = parsed[key];
    if (typeof text !== 'string') continue;
    sectionCount++;
    const matches = text.match(EVIDENCE_RE);
    totalEvidence += matches ? matches.length : 0;
  }
  const avgEvidence = sectionCount > 0 ? totalEvidence / sectionCount : 0;
  scores.evidenceDensity = Math.min(20, Math.round(avgEvidence * 4));

  // 3. Tone Quality (0-20): no corporate jargon + warm language
  let toneScore = 20;
  for (const key of SECTION_KEYS) {
    const text = parsed[key];
    if (typeof text !== 'string') continue;
    if (CORPORATE_RE.test(text)) toneScore -= 3;
  }
  scores.toneQuality = Math.max(0, toneScore);

  // 4. Word Count Accuracy (0-15): how close to target ranges
  let wcScore = 0;
  let wcCount = 0;
  for (const key of SECTION_KEYS) {
    const text = parsed[key];
    if (typeof text !== 'string') continue;
    const [main] = text.split(/### Next Steps/i);
    const wc = (main || '').trim().split(/\s+/).filter(Boolean).length;
    wcCount++;
    const target = key === 'relationships' ? [220, 300] : key === 'summary' ? [180, 240] : [140, 220];
    if (wc >= target[0] && wc <= target[1]) wcScore += 1;
    else if (wc >= target[0] * 0.7 && wc <= target[1] * 1.3) wcScore += 0.5;
  }
  scores.wordCountAccuracy = wcCount > 0 ? Math.round((wcScore / wcCount) * 15) : 0;

  // 5. Next Steps Coverage (0-10): how many sections have ### Next Steps
  let nsCount = 0;
  for (const key of SECTION_KEYS) {
    const text = parsed[key];
    if (typeof text === 'string' && /###\s*Next\s*Steps/i.test(text)) nsCount++;
  }
  scores.nextStepsCoverage = Math.round((nsCount / 17) * 10);

  // 6. Emotional Resonance (0-15): emotional vocabulary density
  let totalEmotional = 0;
  for (const key of SECTION_KEYS) {
    const text = parsed[key];
    if (typeof text !== 'string') continue;
    const matches = text.match(EMOTIONAL_RE);
    totalEmotional += matches ? matches.length : 0;
  }
  const avgEmotional = sectionCount > 0 ? totalEmotional / sectionCount : 0;
  scores.emotionalResonance = Math.min(15, Math.round(avgEmotional * 2.5));

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return { model, jsonValid, parseTime: timeMs, scores, total, sectionsPresent, rawResponse: rawText.slice(0, 300) };
}

async function main() {
  console.log('=== Cloudflare Workers AI Model Scoring ===\n');
  console.log('Models under test:');
  MODELS.forEach(m => console.log(`  - ${m}`));
  console.log(`\nScoring dimensions: JSON Completeness (20) | Evidence (20) | Tone (20) | Word Count (15) | Next Steps (10) | Emotion (15) = 100\n`);

  const results: ScoreResult[] = [];

  for (const model of MODELS) {
    console.log(`\n--- Testing: ${model} ---`);
    try {
      const { text, timeMs } = await callCfModel(model);
      console.log(`  Response received in ${timeMs}ms (${text.length} chars)`);
      const result = scoreResponse(model, text, timeMs);
      results.push(result);

      if (!result.jsonValid) {
        console.log(`  ❌ JSON INVALID: ${result.rawResponse.slice(0, 200)}`);
      } else {
        console.log(`  ✅ JSON valid, ${result.sectionsPresent}/19 sections present`);
        console.log(`  Scores: JSON=${result.scores.jsonCompleteness} Evidence=${result.scores.evidenceDensity} Tone=${result.scores.toneQuality} WC=${result.scores.wordCountAccuracy} NS=${result.scores.nextStepsCoverage} Emotion=${result.scores.emotionalResonance}`);
        console.log(`  TOTAL: ${result.total}/100`);
      }
    } catch (err: any) {
      console.log(`  ❌ ERROR: ${err.message}`);
      results.push({
        model,
        jsonValid: false,
        parseTime: 0,
        scores: { jsonCompleteness: 0, evidenceDensity: 0, toneQuality: 0, wordCountAccuracy: 0, nextStepsCoverage: 0, emotionalResonance: 0 },
        total: 0,
        sectionsPresent: 0,
        rawResponse: '',
        error: err.message,
      });
    }
  }

  console.log('\n\n=== FINAL RANKING ===');
  const sorted = [...results].sort((a, b) => b.total - a.total);
  sorted.forEach((r, i) => {
    const badge = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    console.log(`${badge} ${r.model}: ${r.total}/100 (${r.parseTime}ms) ${r.jsonValid ? '✅' : '❌'}`);
  });

  const top2 = sorted.filter(r => r.jsonValid).slice(0, 2);
  if (top2.length >= 2) {
    console.log(`\n✅ Recommended fallback chain: Gemini → ${top2[0].model} → ${top2[1].model}`);
  } else if (top2.length === 1) {
    console.log(`\n⚠️ Only 1 valid model: Gemini → ${top2[0].model} → static fallback`);
  } else {
    console.log(`\n❌ No CF models produced valid JSON. Using static fallback only.`);
  }
}

main().catch(console.error);
