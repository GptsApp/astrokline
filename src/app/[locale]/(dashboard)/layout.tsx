import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { ReferralClaim } from '@/components/astrokline/shared/referral-claim';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';
import { CheckoutWrapper } from '@/components/astrokline/checkout/checkout-wrapper';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/core/i18n/navigation';
import { defaultLocale } from '@/config/locale';
import { getThemeLayout } from '@/core/theme';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { LocaleDetector } from '@/shared/blocks/common';
import { ConsoleLayout } from '@/shared/blocks/console/layout';
import { getUserInfo } from '@/shared/models/user';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUserInfo();

  if (!user) {
    const requestHeaders = await headers();
    const requestUrl = requestHeaders.get('x-url');
    const fallbackPath =
      locale === defaultLocale ? '/dashboard' : `/${locale}/dashboard`;
    let callbackUrl = fallbackPath;

    if (requestUrl) {
      try {
        const url = new URL(requestUrl);
        // Only allow same-origin paths to prevent open redirect
        const path = `${url.pathname}${url.search}`;
        if (path.startsWith('/') && !path.startsWith('//')) {
          callbackUrl = path;
        }
      } catch {
        callbackUrl = fallbackPath;
      }
    }

    if (locale !== defaultLocale) {
      if (callbackUrl === `/${locale}`) {
        callbackUrl = '/';
      } else if (callbackUrl.startsWith(`/${locale}/`)) {
        callbackUrl = callbackUrl.slice(locale.length + 1) || '/';
      }
    }

    redirect({
      href: `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      locale,
    });
  }

  const tDashboard = await getTranslations('dashboard.sidebar');
  const nav = tDashboard.raw('nav');

  const userTier = await getAstroUserTier(user);

  const Layout = await getThemeLayout('dashboard');

  return (
    <CheckoutWrapper>
      <BirthInfoWrapper>
        <Layout>
          <ConsoleLayout
            title={tDashboard('title')}
            nav={nav}
            className="bg-background astro-starfield"
            userName={user?.name || undefined}
            userEmail={user?.email || undefined}
            userTier={userTier}
          >
            <ReferralClaim />
            <LocaleDetector />
            {children}
          </ConsoleLayout>
        </Layout>
      </BirthInfoWrapper>
    </CheckoutWrapper>
  );
}
