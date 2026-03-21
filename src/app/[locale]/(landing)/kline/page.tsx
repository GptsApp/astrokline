import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { KlineClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'K-Line Generator — Personal Timing Map',
  description:
    'Generate a personal K-Line from your birth chart and see stronger years, weaker years, and turning points.',
  keywords:
    'astrology tracker, destiny k-line, birth chart map, natal chart reading, life turning points, astrology AI',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <KlineClient userTier={userTier} isLoggedIn={!!user} />;
}
