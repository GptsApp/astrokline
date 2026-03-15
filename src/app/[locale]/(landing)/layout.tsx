import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';
import { MobileStickyCta } from '@/components/astrokline/ui/mobile-sticky-cta';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // load page data
  const t = await getTranslations('landing');

  // load layout component
  const Layout = await getThemeLayout('landing');

  // header and footer to display
  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');

  return (
    <BirthInfoWrapper>
      <Layout header={header} footer={footer}>
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
        <MobileStickyCta />
      </Layout>
    </BirthInfoWrapper>
  );
}
