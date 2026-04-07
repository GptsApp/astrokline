import { ReactNode } from 'react';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';
import { DeferredWidgets } from '@/components/astrokline/ui/deferred-widgets';
import { getTranslations } from 'next-intl/server';

import { envConfigs } from '@/config';
import { locales } from '@/config/locale';
import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

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
  const showLocaleDetector =
    envConfigs.locale_detect_enabled === 'true' && locales.length > 1;

  return (
    <BirthInfoWrapper>
      <Layout header={header} footer={footer}>
        {showLocaleDetector ? <LocaleDetector /> : null}
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
        <DeferredWidgets />
      </Layout>
    </BirthInfoWrapper>
  );
}
