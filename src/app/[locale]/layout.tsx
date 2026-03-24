import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';

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
                  name: 'AstroKline',
                  url: 'https://astrokline.com',
                  description: 'AI-powered astrology timing tool that turns birth chart data into a visual K-Line forecast for career, relationships, and life decisions.',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://astrokline.com/kline?name={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                  inLanguage: ['en', 'es', 'ja'],
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'SoftwareApplication',
                  name: 'AstroKline',
                  applicationCategory: 'LifestyleApplication',
                  operatingSystem: 'Web',
                  url: 'https://astrokline.com',
                  description: 'Free AI birth chart reading and astrology K-Line timing map. Discover your career, love, and wealth turning points with Swiss Ephemeris precision.',
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
                  name: 'AstroKline',
                  url: 'https://astrokline.com',
                  logo: 'https://astrokline.com/imgs/logo.png',
                  sameAs: [
                    'https://astrokline.com',
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
