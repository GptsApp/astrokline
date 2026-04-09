import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasUsableKlineData,
  resolveUpdatedKlineIsSelf,
  shouldSaveChartAsSelf,
} from './kline-ownership';

test('hasUsableKlineData ignores saved birth info without a stored profile', () => {
  assert.equal(
    hasUsableKlineData({
      hasServerKline: false,
      savedResult: null,
    }),
    false
  );
});

test('hasUsableKlineData accepts a locally cached chart result', () => {
  assert.equal(
    hasUsableKlineData({
      hasServerKline: false,
      savedResult: { profile: { name: 'Ada' } },
    }),
    true
  );
});

test('shouldSaveChartAsSelf uses the first chart as the self chart', () => {
  assert.equal(shouldSaveChartAsSelf([]), true);
  assert.equal(
    shouldSaveChartAsSelf([
      { isSelf: false },
      { isSelf: false },
    ]),
    true
  );
  assert.equal(
    shouldSaveChartAsSelf([
      { isSelf: true },
      { isSelf: false },
    ]),
    false
  );
});

test('resolveUpdatedKlineIsSelf preserves an existing self chart on duplicate saves', () => {
  assert.equal(resolveUpdatedKlineIsSelf(true, false), true);
  assert.equal(resolveUpdatedKlineIsSelf(false, true), true);
  assert.equal(resolveUpdatedKlineIsSelf(false, false), false);
});