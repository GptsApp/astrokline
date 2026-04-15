#!/usr/bin/env node

/**
 * SEO URL Submission Script
 *
 * Submits URLs to search engines:
 * 1. IndexNow (Bing, Yandex) — works immediately
 * 2. Google Indexing API — requires service account setup
 *
 * Usage:
 *   node scripts/submit-urls.mjs                    # Submit all sitemap URLs via IndexNow
 *   node scripts/submit-urls.mjs --google            # Submit via Google Indexing API (needs credentials)
 *   GOOGLE_SA_KEY=./sa-key.json node scripts/submit-urls.mjs --google
 */

const SITE_URL = 'https://www.astrocurve.net';
const INDEXNOW_KEY = 'bcd4eff01f184805978bc1333f881698';

// Core high-priority URLs to submit
const CORE_URLS = [
  '/',
  '/kline',
  '/pricing',
  '/houses',
  '/zodiac',
  '/tools',
  '/tools/energy',
  '/tools/calendar',
  '/tools/compatibility',
  '/learn-astrology',
  '/about',
  '/blog',
];

// Zodiac pages
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

// House pages
const HOUSES = Array.from({ length: 12 }, (_, i) => `${i + 1}${['st', 'nd', 'rd'][i] || 'th'}-house`);

function getAllUrls() {
  const urls = [...CORE_URLS];
  for (const sign of ZODIAC_SIGNS) urls.push(`/zodiac/${sign}`);
  for (const house of HOUSES) urls.push(`/houses/${house}`);
  return urls.map((path) => `${SITE_URL}${path}`);
}

// ─── IndexNow (Bing, Yandex) ───
async function submitIndexNow(urls) {
  console.log(`\n📡 IndexNow: Submitting ${urls.length} URLs...`);

  const payload = {
    host: 'www.astrocurve.net',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (res.ok || res.status === 200 || res.status === 202) {
    console.log(`✅ IndexNow: Accepted (${res.status})`);
  } else {
    const text = await res.text();
    console.error(`❌ IndexNow: ${res.status} — ${text}`);
  }
}

// ─── Google Indexing API ───
async function submitGoogle(urls) {
  const keyPath = process.env.GOOGLE_SA_KEY || './google-sa-key.json';

  let key;
  try {
    const fs = await import('fs');
    key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } catch {
    console.error(`\n❌ Google Indexing API: Service account key not found at ${keyPath}`);
    console.error('  Setup instructions:');
    console.error('  1. Go to https://console.cloud.google.com');
    console.error('  2. Create a service account & download JSON key');
    console.error('  3. Enable "Web Search Indexing API"');
    console.error('  4. Add the service account email to Google Search Console as Owner');
    console.error(`  5. Save the key as "${keyPath}" and re-run with --google`);
    return;
  }

  // Create JWT for Google OAuth2
  const crypto = await import('crypto');

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claim = Buffer.from(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claim}`);
  const signature = sign.sign(key.private_key, 'base64url');
  const jwt = `${header}.${claim}.${signature}`;

  // Get access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    console.error(`❌ Google OAuth failed: ${await tokenRes.text()}`);
    return;
  }

  const { access_token } = await tokenRes.json();
  console.log(`\n🔍 Google Indexing API: Submitting ${urls.length} URLs...`);

  let success = 0;
  let failed = 0;

  for (const url of urls) {
    try {
      const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      });

      if (res.ok) {
        success++;
        process.stdout.write('.');
      } else {
        failed++;
        const err = await res.text();
        console.error(`\n  ❌ ${url}: ${err}`);
      }
    } catch (e) {
      failed++;
      console.error(`\n  ❌ ${url}: ${e.message}`);
    }
  }

  console.log(`\n✅ Google: ${success} submitted, ${failed} failed`);
}

// ─── Main ───
async function main() {
  const args = process.argv.slice(2);
  const urls = getAllUrls();
  console.log(`🌐 Total URLs: ${urls.length}`);

  // Always submit via IndexNow
  await submitIndexNow(urls);

  // Optionally submit via Google
  if (args.includes('--google')) {
    await submitGoogle(urls);
  } else {
    console.log('\n💡 Tip: Run with --google flag to also submit via Google Indexing API');
  }

  console.log('\n✨ Done! Also submit sitemap in Google Search Console:');
  console.log(`   ${SITE_URL}/sitemap.xml`);
}

main().catch(console.error);
