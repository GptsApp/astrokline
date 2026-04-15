import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSocialProviders } from './social-providers';

test('buildSocialProviders forwards an explicit Google redirect URI', () => {
  const providers = buildSocialProviders({
    google_client_id: 'google-client-id',
    google_client_secret: 'google-client-secret',
    google_redirect_uri: 'https://www.astrocurve.net/api/auth/callback/google',
  });

  assert.deepEqual(providers.google, {
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    redirectURI: 'https://www.astrocurve.net/api/auth/callback/google',
  });
});

test('buildSocialProviders keeps Google redirect URI unset when not configured', () => {
  const providers = buildSocialProviders({
    google_client_id: 'google-client-id',
    google_client_secret: 'google-client-secret',
  });

  assert.deepEqual(providers.google, {
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
  });
});