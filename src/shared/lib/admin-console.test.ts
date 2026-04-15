import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CONFIGURED_SECRET_MASK,
  getDashboardAccountLinks,
  isConfiguredSecretMask,
  maskSecretSettingValues,
} from './admin-console';

test('maskSecretSettingValues masks configured password fields only', () => {
  const { maskedConfigs, maskedSecretNames } = maskSecretSettingValues(
    {
      google_client_id: 'google-client-id',
      google_client_secret: 'google-client-secret',
      gemini_api_key: '',
    },
    [
      {
        name: 'google_client_id',
        title: 'Google Client ID',
        type: 'text',
      },
      {
        name: 'google_client_secret',
        title: 'Google Client Secret',
        type: 'password',
      },
      {
        name: 'gemini_api_key',
        title: 'Gemini API Key',
        type: 'password',
      },
    ]
  );

  assert.equal(maskedConfigs.google_client_id, 'google-client-id');
  assert.equal(maskedConfigs.google_client_secret, CONFIGURED_SECRET_MASK);
  assert.equal(maskedConfigs.gemini_api_key, '');
  assert.deepEqual(maskedSecretNames, ['google_client_secret']);
});

test('isConfiguredSecretMask matches only the exact placeholder', () => {
  assert.equal(isConfiguredSecretMask(CONFIGURED_SECRET_MASK), true);
  assert.equal(isConfiguredSecretMask('real-secret'), false);
  assert.equal(isConfiguredSecretMask(''), false);
});

test('getDashboardAccountLinks appends the admin link only for admins', () => {
  const regularLinks = getDashboardAccountLinks(false);
  const adminLinks = getDashboardAccountLinks(true);

  assert.equal(regularLinks.some((item) => item.url === '/admin'), false);
  assert.equal(adminLinks.some((item) => item.url === '/admin'), true);
  assert.equal(adminLinks.at(-1)?.title, 'Admin');
});