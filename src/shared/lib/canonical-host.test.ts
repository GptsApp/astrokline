import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getCanonicalHostRedirectTarget,
  getCanonicalOrigin,
  getPreferredRequestHostname,
} from './canonical-host';

test('redirects the apex astrocurve host to the canonical www host', () => {
  assert.equal(
    getCanonicalHostRedirectTarget('astrocurve.net'),
    'www.astrocurve.net'
  );
});

test('redirects legacy astrokline hosts to the canonical www host', () => {
  assert.equal(
    getCanonicalHostRedirectTarget('astrokline.com'),
    'www.astrocurve.net'
  );

  assert.equal(
    getCanonicalHostRedirectTarget('www.astrokline.com'),
    'www.astrocurve.net'
  );
});

test('does not redirect the canonical host', () => {
  assert.equal(getCanonicalHostRedirectTarget('www.astrocurve.net'), null);
});

test('canonicalizes public origins to the www host', () => {
  assert.equal(
    getCanonicalOrigin('https://astrocurve.net/sign-in?foo=bar'),
    'https://www.astrocurve.net'
  );

  assert.equal(
    getCanonicalOrigin('https://www.astrocurve.net/sign-in?foo=bar'),
    'https://www.astrocurve.net'
  );
});

test('prefers the request URL hostname over forwarded host headers', () => {
  assert.equal(
    getPreferredRequestHostname({
      urlHostname: 'astrocurve.net',
      hostHeader: 'astrocurve.net',
      forwardedHost: 'www.astrocurve.net',
    }),
    'astrocurve.net'
  );
});