const CANONICAL_HOST = 'www.astrocurve.net';

const REDIRECT_HOSTS = new Set([
  'astrocurve.net',
  'astrokline.com',
  'www.astrokline.com',
]);

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().split(':')[0] || '';
}

export function getCanonicalHostRedirectTarget(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  if (!REDIRECT_HOSTS.has(normalizedHostname)) {
    return null;
  }

  return CANONICAL_HOST;
}

export function getCanonicalOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const canonicalHostname = getCanonicalHostRedirectTarget(url.hostname);

    if (canonicalHostname) {
      url.hostname = canonicalHostname;
    }

    return url.origin;
  } catch {
    return '';
  }
}

export function getPreferredRequestHostname({
  urlHostname,
  hostHeader,
  forwardedHost,
}: {
  urlHostname?: string;
  hostHeader?: string | null;
  forwardedHost?: string | null;
}) {
  const rawHostname = urlHostname || hostHeader || forwardedHost || '';
  return normalizeHostname(rawHostname);
}