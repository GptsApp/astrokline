import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { KlineClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'Free AI Natal Tool: Timing Map & K-Line Reading', // ' | AstroKline' will be auto-appended by seo.ts
  description:
    'Get a free personalized AI birth chart K-Line reading based on precise Swiss Ephemeris data. Discover exact career, relationship, and life turning points.',
  keywords:
    'birth chart reading, natal chart analysis, astrology K-Line, AI astrology reading, free birth chart, astrology timing chart, destiny chart, life turning points, career astrology, relationship timing',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <KlineClient userTier={userTier} isLoggedIn={!!user} />;
}
