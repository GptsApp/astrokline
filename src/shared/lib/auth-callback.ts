import { defaultLocale } from '@/config/locale';

function decodeLeadingSeparators(value: string) {
  let candidate = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const lowerValue = candidate.toLowerCase();

    if (
      lowerValue.startsWith('%2f') ||
      lowerValue.startsWith('%5c') ||
      lowerValue.startsWith('%25')
    ) {
      try {
        candidate = decodeURIComponent(candidate);
        continue;
      } catch {
        return '/';
      }
    }

    break;
  }

  return candidate;
}

export function sanitizeInternalCallbackPath(raw?: string) {
  if (!raw) return '/';

  const candidate = decodeLeadingSeparators(raw.trim());

  if (!candidate.startsWith('/')) return '/';
  if (candidate.startsWith('//')) return '/';
  if (candidate.startsWith('/\\')) return '/';
  if (candidate.includes('\\')) return '/';

  return candidate;
}

export function stripLocalePrefix(path: string, locale: string) {
  const candidate = sanitizeInternalCallbackPath(path);

  if (locale === defaultLocale) return candidate;
  if (candidate === `/${locale}`) return '/';
  if (candidate.startsWith(`/${locale}/`)) {
    return candidate.slice(locale.length + 1) || '/';
  }

  return candidate;
}

export function addLocalePrefix(path: string, locale: string) {
  const candidate = sanitizeInternalCallbackPath(path);

  if (locale === defaultLocale) return candidate;
  if (candidate === `/${locale}` || candidate.startsWith(`/${locale}/`)) {
    return candidate;
  }

  return `/${locale}${candidate}`;
}

export function buildVerifyEmailCallbackPath(path: string, locale: string) {
  const query = new URLSearchParams();
  query.set(
    'next',
    encodeURIComponent(encodeURIComponent(stripLocalePrefix(path, locale)))
  );

  return `${addLocalePrefix('/verify-email/callback', locale)}?${query.toString()}`;
}