import assert from 'node:assert/strict';
import test from 'node:test';

import { buildVerifyEmailPath } from './unverified-sign-in';

test('buildVerifyEmailPath preserves email and callback redirect', () => {
  assert.equal(
    buildVerifyEmailPath('user@example.com', '/dashboard/ask-chart', {
      sent: true,
    }),
    '/verify-email?sent=1&email=user%40example.com&callbackUrl=%2Fdashboard%2Fask-chart'
  );
});

test('buildVerifyEmailPath can request an automatic resend on the verify page', () => {
  assert.equal(
    buildVerifyEmailPath('user@example.com', '/dashboard', {
      resend: true,
    }),
    '/verify-email?resend=1&email=user%40example.com&callbackUrl=%2Fdashboard'
  );
});