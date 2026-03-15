import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/core/i18n/navigation';
import { getUserInfo } from '@/shared/models/user';
import { ConsoleLayout } from '@/shared/blocks/console/layout';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import { Header, Footer } from '@/shared/types/blocks/landing';
import { getThemeLayout } from '@/core/theme';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUserInfo();

  if (!user) {
    redirect({ href: '/sign-in', locale: 'en' });
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
          className="py-16 md:py-20 bg-background astro-starfield min-h-screen"
        >
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
