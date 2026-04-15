import '@/config/style/global.css';

import { ReactNode } from 'react';
import {
  JetBrains_Mono,
  Playfair_Display,
  Jost,
} from 'next/font/google';
import { getLocale, setRequestLocale } from 'next-intl/server';

import { UtmCapture } from '@/shared/blocks/common/utm-capture';
import { getAllConfigs } from '@/shared/models/config';
import { getAdsService } from '@/shared/services/ads';
import { getAffiliateService } from '@/shared/services/affiliate';
import { getAnalyticsService } from '@/shared/services/analytics';
import { getCustomerService } from '@/shared/services/customer_service';

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

type IntegrationAssets = {
  adsMetaTags: ReactNode;
  adsHeadScripts: ReactNode;
  adsBodyScripts: ReactNode;
  analyticsMetaTags: ReactNode;
  analyticsHeadScripts: ReactNode;
  analyticsBodyScripts: ReactNode;
  affiliateMetaTags: ReactNode;
  affiliateHeadScripts: ReactNode;
  affiliateBodyScripts: ReactNode;
  customerServiceMetaTags: ReactNode;
  customerServiceHeadScripts: ReactNode;
  customerServiceBodyScripts: ReactNode;
};

const emptyIntegrationAssets: IntegrationAssets = {
  adsMetaTags: null,
  adsHeadScripts: null,
  adsBodyScripts: null,
  analyticsMetaTags: null,
  analyticsHeadScripts: null,
  analyticsBodyScripts: null,
  affiliateMetaTags: null,
  affiliateHeadScripts: null,
  affiliateBodyScripts: null,
  customerServiceMetaTags: null,
  customerServiceHeadScripts: null,
  customerServiceBodyScripts: null,
};

function hasThirdPartyIntegrations(configs: Record<string, string>) {
  return Boolean(
    configs.adsense_code ||
      configs.google_analytics_id ||
      configs.clarity_id ||
      (configs.plausible_domain && configs.plausible_src) ||
      configs.openpanel_client_id ||
      configs.vercel_analytics_enabled === 'true' ||
      (configs.affonso_enabled === 'true' && configs.affonso_id) ||
      (configs.promotekit_enabled === 'true' && configs.promotekit_id) ||
      (configs.crisp_enabled === 'true' && configs.crisp_website_id) ||
      (configs.tawk_enabled === 'true' &&
        configs.tawk_property_id &&
        configs.tawk_widget_id)
  );
}

let integrationAssetsPromise: Promise<IntegrationAssets> | null = null;

async function getIntegrationAssets(): Promise<IntegrationAssets> {
  if (!integrationAssetsPromise) {
    integrationAssetsPromise = (async () => {
      const configs = await getAllConfigs();
      if (!hasThirdPartyIntegrations(configs)) {
        return emptyIntegrationAssets;
      }

      const [adsService, analyticsService, affiliateService, customerService] =
        await Promise.all([
          getAdsService(configs),
          getAnalyticsService(configs),
          getAffiliateService(configs),
          getCustomerService(configs),
        ]);

      return {
        adsMetaTags: adsService.getMetaTags(),
        adsHeadScripts: adsService.getHeadScripts(),
        adsBodyScripts: adsService.getBodyScripts(),
        analyticsMetaTags: analyticsService.getMetaTags(),
        analyticsHeadScripts: analyticsService.getHeadScripts(),
        analyticsBodyScripts: analyticsService.getBodyScripts(),
        affiliateMetaTags: affiliateService.getMetaTags(),
        affiliateHeadScripts: affiliateService.getHeadScripts(),
        affiliateBodyScripts: affiliateService.getBodyScripts(),
        customerServiceMetaTags: customerService.getMetaTags(),
        customerServiceHeadScripts: customerService.getHeadScripts(),
        customerServiceBodyScripts: customerService.getBodyScripts(),
      };
    })().catch((error) => {
      console.log('loading integration assets failed:', error);
      integrationAssetsPromise = null;
      return emptyIntegrationAssets;
    });
  }

  return integrationAssetsPromise;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  setRequestLocale(locale);

  const isProduction = process.env.NODE_ENV === 'production';
  const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';

  let integrationAssets = emptyIntegrationAssets;

  if (isProduction || isDebug) {
    integrationAssets = await getIntegrationAssets();
  }

  return (
    <html
      lang={locale}
      className={`dark ${jost.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
      style={{ colorScheme: 'dark' }}
    >
      <head>
        {/* inject ads meta tags */}
        {integrationAssets.adsMetaTags}
        {/* inject ads head scripts */}
        {integrationAssets.adsHeadScripts}

        {/* inject analytics meta tags */}
        {integrationAssets.analyticsMetaTags}
        {/* inject analytics head scripts */}
        {integrationAssets.analyticsHeadScripts}

        {/* inject affiliate meta tags */}
        {integrationAssets.affiliateMetaTags}
        {/* inject affiliate head scripts */}
        {integrationAssets.affiliateHeadScripts}

        {/* inject customer service meta tags */}
        {integrationAssets.customerServiceMetaTags}
        {/* inject customer service head scripts */}
        {integrationAssets.customerServiceHeadScripts}
      </head>
      <body
        suppressHydrationWarning
        className="overflow-x-hidden bg-background text-foreground font-sans"
      >
        <UtmCapture />

        {children}

        {/* inject ads body scripts */}
        {integrationAssets.adsBodyScripts}

        {/* inject analytics body scripts */}
        {integrationAssets.analyticsBodyScripts}

        {/* inject affiliate body scripts */}
        {integrationAssets.affiliateBodyScripts}

        {/* inject customer service body scripts */}
        {integrationAssets.customerServiceBodyScripts}
      </body>
    </html>
  );
}
