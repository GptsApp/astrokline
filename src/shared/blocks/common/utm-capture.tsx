'use client';

import { useEffect } from 'react';

import { getCookie, setCookie } from '@/shared/lib/cookie';

const COOKIE_DAYS = 30;
const COOKIE_KEYS = {
  utm_source: 'utm_source',
  utm_medium: 'utm_medium',
  utm_campaign: 'utm_campaign',
  utm_content: 'utm_content',
  utm_term: 'utm_term',
  ref: 'ak_ref',
} as const;

function sanitizeUtmSource(value: string) {
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();

  return decoded
    .trim()
    .replace(/[^\w\-.:]/g, '') // allow a-zA-Z0-9_ - . :
    .slice(0, 100);
}

/**
 * Capture utm_source from landing URL and persist in cookie.
 * This enables server-side signup to save it into the user table.
 */
export function UtmCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(COOKIE_KEYS).forEach(([paramName, cookieName]) => {
      if (getCookie(cookieName)) return;

      const value = params.get(paramName);
      if (!value) return;

      const sanitized = sanitizeUtmSource(value);
      if (!sanitized) return;

      setCookie(cookieName, encodeURIComponent(sanitized), COOKIE_DAYS);
    });
  }, []);

  return null;
}
