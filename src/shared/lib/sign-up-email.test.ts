import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSignUpEmailPayload } from './sign-up-email';

test('buildSignUpEmailPayload includes callbackURL when verification is enabled', () => {
  const result = buildSignUpEmailPayload({
    email: 'user@example.com',
    password: 'password123',
    name: 'User',
    emailVerificationEnabled: true,
    verificationCallbackUrl: '/verify-email/callback?next=%2Fdashboard%2Fask-chart',
  });

  assert.deepEqual(result, {
    email: 'user@example.com',
    password: 'password123',
    name: 'User',
    callbackURL: '/verify-email/callback?next=%2Fdashboard%2Fask-chart',
  });
});

test('buildSignUpEmailPayload omits callbackURL when verification is disabled', () => {
  const result = buildSignUpEmailPayload({
    email: 'user@example.com',
    password: 'password123',
    name: 'User',
    emailVerificationEnabled: false,
    verificationCallbackUrl: '/verify-email/callback?next=%2Fdashboard%2Fask-chart',
  });

  assert.deepEqual(result, {
    email: 'user@example.com',
    password: 'password123',
    name: 'User',
  });
});