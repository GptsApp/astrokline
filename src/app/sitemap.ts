import type { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const now = new Date();

  return [
    {
      url: `${appUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${appUrl}/kline`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/daily`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${appUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
