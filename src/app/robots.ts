import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/*?*q=',
          '/privacy-policy',
          '/terms-of-service',
          '/settings/*',
          '/activity/*',
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/chat/*',
          '/sign-in',
          '/sign-up',
          '/verify-email',
          '/no-permission',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/kline',
          '/blog/',
          '/about',
          '/pricing',
          '/zodiac/',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
