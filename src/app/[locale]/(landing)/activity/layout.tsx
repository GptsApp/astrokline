import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { ConsoleLayout } from '@/shared/blocks/console/layout';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import { Header } from '@/shared/types/blocks/landing';

export default async function ActivityLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('activity.sidebar');
  const tDashboard = await getTranslations('dashboard.sidebar');
  const tLanding = await getTranslations('landing');

  const title = t('title');
  const nav = t.raw('nav');
  const topNav = tDashboard.raw('top_nav');
  const header: Header = tLanding.raw('header');

  return (
    <ConsoleLayout
      title={title}
      nav={nav}
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
  );
}
