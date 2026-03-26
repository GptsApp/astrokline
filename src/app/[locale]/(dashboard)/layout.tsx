import { ReactNode } from 'react';
import { ReferralClaim } from '@/components/astrokline/shared/referral-claim';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/core/i18n/navigation';
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
    redirect({ href: '/sign-in', locale });
  }

  const tDashboard = await getTranslations('dashboard.sidebar');
  const nav = tDashboard.raw('nav');
  const bottomNav = tDashboard.raw('bottom_nav');

  const tLanding = await getTranslations('landing');
  const header: Header = tLanding.raw('header');
  const footer: Footer = tLanding.raw('footer');

  const Layout = await getThemeLayout('landing');

  return (
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
  );
}
