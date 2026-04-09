import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildVerifyEmailCallbackPath,
  sanitizeInternalCallbackPath,
} from './auth-callback';

test('buildVerifyEmailCallbackPath triple-encodes nested next query for better-auth runtime decoding', () => {
  const target = '/dashboard/ask-chart?tab=career&page=2&pageSize=50';
  const callbackPath = buildVerifyEmailCallbackPath(target, 'en');

  assert.equal(
    callbackPath,
    '/verify-email/callback?next=%25252Fdashboard%25252Fask-chart%25253Ftab%25253Dcareer%252526page%25253D2%252526pageSize%25253D50'
  );

  const encodedNext = new URLSearchParams(callbackPath.split('?')[1]).get('next');

  assert.equal(
    encodedNext,
    '%252Fdashboard%252Fask-chart%253Ftab%253Dcareer%2526page%253D2%2526pageSize%253D50'
  );
  assert.equal(
    sanitizeInternalCallbackPath(encodedNext || ''),
    '/dashboard/ask-chart?tab=career&page=2&pageSize=50'
  );
});

test('buildVerifyEmailCallbackPath preserves locale prefix on the callback bridge', () => {
  const callbackPath = buildVerifyEmailCallbackPath('/dashboard/ask-chart', 'ja');

  assert.equal(
    callbackPath,
    '/ja/verify-email/callback?next=%25252Fdashboard%25252Fask-chart'
  );
});