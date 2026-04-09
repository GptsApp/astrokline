import assert from 'node:assert/strict';
import test from 'node:test';

import { publicSettingNames } from './settings';

test('publicSettingNames exposes email verification flag to auth pages', () => {
  assert.equal(publicSettingNames.includes('email_verification_enabled'), true);
});