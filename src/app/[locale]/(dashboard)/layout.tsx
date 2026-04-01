import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { ReferralClaim } from '@/components/astrokline/shared/referral-claim';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';
import { CheckoutWrapper } from '@/components/astrokline/checkout/checkout-wrapper';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/core/i18n/navigation';
import { defaultLocale } from '@/config/locale';
import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import { ConsoleLayout } from '@/shared/blocks/console/layout';
import { getUserInfo } from '@/shared/models/user';
import { Footer, Header } from '@/shared/types/blocks/landing';

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
        callbackUrl = `${url.pathname}${url.search}`;
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
  const bottomNav = tDashboard.raw('bottom_nav');

  const tLanding = await getTranslations('landing');
  const header: Header = tLanding.raw('header');
  const footer: Footer = tLanding.raw('footer');

  const Layout = await getThemeLayout('landing');

  return (
    <CheckoutWrapper>
      <BirthInfoWrapper>
        <Layout header={header} footer={footer}>
          <ConsoleLayout
            title={tDashboard('title')}
            nav={nav}
            bottomNav={bottomNav}
            className="bg-background astro-starfield min-h-screen py-16 md:py-20"
          >
            <ReferralClaim />
            <LocaleDetector />
            {header.topbanner && header.topbanner.text && (
              <TopBanner
                id="topbanner"
                text={header.topbanner?.text}
                buttonText={header.topbanner?.buttonText}
                href={header.topbanner?.href}
                target={header.topbanner?.target}
                closable
                rememberDismiss
                dismissedExpiryDays={header.topbanner?.dismissedExpiryDays ?? 1}
              />
            )}
            {children}
          </ConsoleLayout>
        </Layout>
      </BirthInfoWrapper>
    </CheckoutWrapper>
  );
}
