import type { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const now = new Date();

  // Core pages with their priorities and change frequencies
  const pages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/kline', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/daily', changeFrequency: 'daily', priority: 0.9 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Zodiac sign pages for programmatic SEO
  const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ];

  const zodiacPages = zodiacSigns.map((sign) => ({
    path: `/zodiac/${sign}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const allPages = [...pages, ...zodiacPages];

  // Generate entries for all locales
  const entries: MetadataRoute.Sitemap = [];

  for (const page of allPages) {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      const url = `${appUrl}${prefix}${page.path === '/' ? '' : page.path}` || `${appUrl}/`;

      // Build alternates for hreflang
      const languages: Record<string, string> = {};
      for (const l of locales) {
        const lPrefix = l === defaultLocale ? '' : `/${l}`;
        languages[l] = `${appUrl}${lPrefix}${page.path === '/' ? '' : page.path}` || `${appUrl}/`;
      }
      // x-default points to default locale
      languages['x-default'] = `${appUrl}${page.path === '/' ? '' : page.path}` || `${appUrl}/`;

      entries.push({
        url: url || `${appUrl}/`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}
