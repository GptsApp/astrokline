import assert from 'node:assert/strict';
import test from 'node:test';

import { repairTruncatedJsonText } from './json-repair';

test('repairTruncatedJsonText closes a dangling escape before the closing quote', () => {
  const truncated = '{\n  "spirituality": "There\'s a quiet knowing within you, a deep current that seeks meaning beyond the everyday, even if it sometimes feels elusive. Your spiritual path is not about rigid dogma, but a profound, personal quest for truth that integrates with your very sense of self-worth and what you value.\\n' + '\\';

  const repaired = repairTruncatedJsonText(truncated);

  assert.deepEqual(JSON.parse(repaired), {
    spirituality:
      'There\'s a quiet knowing within you, a deep current that seeks meaning beyond the everyday, even if it sometimes feels elusive. Your spiritual path is not about rigid dogma, but a profound, personal quest for truth that integrates with your very sense of self-worth and what you value.\n',
  });
});

test('repairTruncatedJsonText drops an incomplete trailing property', () => {
  const truncated = '{"summary":"One","relationships":"Two","career"';

  const repaired = repairTruncatedJsonText(truncated);

  assert.deepEqual(JSON.parse(repaired), {
    summary: 'One',
    relationships: 'Two',
  });
});

test('repairTruncatedJsonText keeps a partially truncated last array item when it can be balanced', () => {
  const truncated = '[{"year":2026,"aiSummary":"A","aiAdvice":"B"},{"year":2027,"aiSummary":"C","aiAdvice":"D';

  const repaired = repairTruncatedJsonText(truncated);

  assert.deepEqual(JSON.parse(repaired), [
    { year: 2026, aiSummary: 'A', aiAdvice: 'B' },
    { year: 2027, aiSummary: 'C', aiAdvice: 'D' },
  ]);
});

test('repairTruncatedJsonText drops an incomplete trailing array item start', () => {
  const truncated = '[{"year":2026,"aiSummary":"A","aiAdvice":"B"},{';

  const repaired = repairTruncatedJsonText(truncated);

  assert.deepEqual(JSON.parse(repaired), [
    { year: 2026, aiSummary: 'A', aiAdvice: 'B' },
  ]);
});

test('repairTruncatedJsonText drops a truncated key-year object before mismatched array closure', () => {
  const truncated = `[
  {
    "year": 2026,
    "aiSummary": "Saturn trines your natal Sun in Leo, bringing structural maturity and career rewards.",
    "aiAdvice": "Embrace disciplined effort; long-term career stability and recognition are within reach."
  },
  {
    "year": 2027,
    "aiSummary": "Neptune squares your natal Leo placements, blurring the path to financial clarity.",
    "aiAdvice": "Avoid impulsive financial decisions; seek expert advice to navigate potential confusion."
  },
  {
    "year": 2028,
    "aiSummary": "Saturn trines your natal Leo placements, rewarding disciplined approaches to wealth.",
    "aiAdvice": "Solidify your financial plans; consistent effort now builds lasting security."
  },
  {
    "year": 2029,
    "aiSummary": "Jupiter trines your natal Leo placements, opening a golden corridor for wealth expansion.",
    "aiAdvice": "Seize growth opportunities; optimism and generosity enhance your financial well-being."
  },
  {
    "year": 2030,
    "aiSummary": "Pluto squares your natal Leo placements, exposing deep-seated growth dynamics and power.",
    "aiAdvice": "Confront hidden patterns; personal transformation leads to profound self-discovery."
  },
  {
    "year": 2031,
    "aiSummary": "Neptune trines your natal Sun"]}`;

  const repaired = repairTruncatedJsonText(truncated);

  assert.deepEqual(JSON.parse(repaired), [
    {
      year: 2026,
      aiSummary:
        'Saturn trines your natal Sun in Leo, bringing structural maturity and career rewards.',
      aiAdvice:
        'Embrace disciplined effort; long-term career stability and recognition are within reach.',
    },
    {
      year: 2027,
      aiSummary:
        'Neptune squares your natal Leo placements, blurring the path to financial clarity.',
      aiAdvice:
        'Avoid impulsive financial decisions; seek expert advice to navigate potential confusion.',
    },
    {
      year: 2028,
      aiSummary:
        'Saturn trines your natal Leo placements, rewarding disciplined approaches to wealth.',
      aiAdvice:
        'Solidify your financial plans; consistent effort now builds lasting security.',
    },
    {
      year: 2029,
      aiSummary:
        'Jupiter trines your natal Leo placements, opening a golden corridor for wealth expansion.',
      aiAdvice:
        'Seize growth opportunities; optimism and generosity enhance your financial well-being.',
    },
    {
      year: 2030,
      aiSummary:
        'Pluto squares your natal Leo placements, exposing deep-seated growth dynamics and power.',
      aiAdvice:
        'Confront hidden patterns; personal transformation leads to profound self-discovery.',
    },
  ]);
});