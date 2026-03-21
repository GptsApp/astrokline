// test-gemini-prompt.ts
import dotenv from 'dotenv';

import { MOCK_USER_PROFILE } from './src/lib/astrokline/mock-astrology-data';

dotenv.config({ path: '.env.development' });

async function run() {
  const { generatePersonalityInsight } = require('./src/lib/astrokline/gemini');
  console.log(
    '🔄 Calling Gemini AI via generatePersonalityInsight() with new prompt...'
  );
  const start = Date.now();

  try {
    const result = await generatePersonalityInsight(MOCK_USER_PROFILE);
    console.log('--- RAW RESPONSE START ---');
    console.log(JSON.stringify(result, null, 2));
    console.log('--- RAW RESPONSE END ---');
    const duration = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`\\n✅ Success! Generation took ${duration}s`);
    console.log('='.repeat(50));
    console.log(`NICKNAME: ${result.nickname}`);
    console.log(`CORE QUOTE: ${result.coreQuote}`);
    console.log('='.repeat(50));
    console.log(`SUMMARY length: ${(result.summary || '').length} chars`);
    console.log(`CAREER length: ${(result.career || '').length} chars`);
    console.log(
      `RELATIONSHIPS length: ${(result.relationships || '').length} chars`
    );
    console.log(`WEALTH length: ${(result.wealth || '').length} chars`);
    console.log(`HEALTH length: ${(result.health || '').length} chars`);
    console.log(`STRENGTHS length: ${(result.strengths || '').length} chars`);
    console.log(`WARNINGS length: ${(result.warnings || '').length} chars`);

    const totalLength =
      result.summary.length +
      result.career.length +
      result.relationships.length +
      result.wealth.length +
      result.health.length +
      result.strengths.length +
      result.warnings.length;

    console.log('='.repeat(50));
    console.log(`🏆 TOTAL ESTIMATED CHINESE CHARACTERS: ${totalLength}`);
    console.log('\\n[Sneak Peek - CAREER Section]');
    console.log(result.career.substring(0, 300) + '...');
  } catch (err) {
    console.error('❌ Failed:', err);
  }
}

run();
