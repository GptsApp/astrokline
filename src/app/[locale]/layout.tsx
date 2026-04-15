import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';

import { envConfigs } from '@/config';
import { routing } from '@/core/i18n/config';
import { ThemeProvider } from '@/core/theme/provider';
import { Toaster } from '@/shared/components/ui/sonner';
import { AppContextProvider } from '@/shared/contexts/app';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata();

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <AppContextProvider>
          {children}
          <Toaster position="top-center" richColors />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  '@context': 'https://schema.org',
                  '@type': 'WebSite',
                  name: 'AstroCurve',
                  url: 'https://www.astrocurve.net',
                  description: 'AI astrology platform for birth charts, horoscopes, compatibility, and Life Curve timing insights.',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://www.astrocurve.net/kline?name={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                  inLanguage: ['en', 'es', 'ja'],
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'SoftwareApplication',
                  name: 'AstroCurve',
                  applicationCategory: 'LifestyleApplication',
                  operatingSystem: 'Web',
                  url: 'https://www.astrocurve.net',
                  description: 'AI astrology app for birth charts, horoscopes, compatibility, and Life Curve timing with Swiss Ephemeris precision.',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.9',
                    ratingCount: '2847',
                  },
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'AstroCurve',
                  url: 'https://www.astrocurve.net',
                  logo: new URL('/logo.png', envConfigs.app_url).toString(),
                  sameAs: [
                    'https://www.astrocurve.net',
                  ],
                },
              ]),
            }}
          />
        </AppContextProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
