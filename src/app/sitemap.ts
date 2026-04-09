import type { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    { path: '/houses', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/zodiac', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/tools', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/learn-astrology', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/tools/energy', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/tools/calendar', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/tools/compatibility', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Dynamic blog post pages
  try {
    const { getPosts } = await import('@/shared/models/post');
    const posts = await getPosts({});
    if (posts?.length) {
      for (const post of posts) {
        const slug = post.slug || post.url?.split('/').pop();
        if (slug) {
          pages.push({
            path: `/blog/${slug}`,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Blog posts unavailable — skip silently
  }

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

  const houseSlugs = [
    '1st-house',
    '2nd-house',
    '3rd-house',
    '4th-house',
    '5th-house',
    '6th-house',
    '7th-house',
    '8th-house',
    '9th-house',
    '10th-house',
    '11th-house',
    '12th-house',
  ];

  const housePages = houseSlugs.map((slug) => ({
    path: `/houses/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.72,
  }));

  const allPages = [...pages, ...zodiacPages, ...housePages];

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
