import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/core/i18n/config';
import {
  getCanonicalHostRedirectTarget,
  getPreferredRequestHostname,
} from '@/shared/lib/canonical-host';

const intlMiddleware = createIntlMiddleware(routing);

function getRequestHostname(request: NextRequest) {
  return getPreferredRequestHostname({
    urlHostname: request.nextUrl.hostname,
    hostHeader: request.headers.get('host'),
    forwardedHost: request.headers.get('x-forwarded-host'),
  });
}

export async function middleware(request: NextRequest) {
  const hostname = getRequestHostname(request);
  const { pathname } = request.nextUrl;
  const canonicalHostname = getCanonicalHostRedirectTarget(hostname);

  // Permanently consolidate apex and legacy domains onto the canonical host.
  if (canonicalHostname) {
    const redirectUrl = new URL(request.url);
    redirectUrl.protocol = 'https:';
    redirectUrl.hostname = canonicalHostname;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(locale as any);
  const pathWithoutLocale = isValidLocale
    ? pathname.slice(locale.length + 1)
    : pathname;

  // Redirect logged-in users from homepage to dashboard
  if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) {
      const dashboardUrl = new URL(
        isValidLocale ? `/${locale}/dashboard` : '/dashboard',
        request.url
      );
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Only check authentication for admin routes
  if (
    pathWithoutLocale.startsWith('/admin') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale.startsWith('/dashboard')
  ) {
    // Check if session cookie exists
    const sessionCookie = getSessionCookie(request);

    // If no session token found, redirect to sign-in
    if (!sessionCookie) {
      const signInUrl = new URL(
        isValidLocale ? `/${locale}/sign-in` : '/sign-in',
        request.url
      );
      // Validate callback path to prevent open redirect
      const callbackPath = pathWithoutLocale + request.nextUrl.search;
      // Only allow relative paths that start with /
      if (callbackPath.startsWith('/') && !callbackPath.startsWith('//')) {
        signInUrl.searchParams.set('callbackUrl', callbackPath);
      }
      return NextResponse.redirect(signInUrl);
    }

    // For admin routes, we need to check RBAC permissions
    // Note: Full permission check happens in the page/API route level
    // This is a lightweight session check to prevent unauthorized access
    // The detailed permission check (admin.access and specific permissions)
    // will be done in the layout or individual pages using requirePermission()
  }

  intlResponse.headers.set('x-pathname', request.nextUrl.pathname);
  intlResponse.headers.set('x-url', request.url);

  // For all other routes (including /, /sign-in, /sign-up, /sign-out), just return the intl response
  return intlResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
