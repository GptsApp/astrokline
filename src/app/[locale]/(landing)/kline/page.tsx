import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { KlineClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'Free Birth Chart K-Line Reading | AI Natal Chart Timing Map — AstroKline',
  description:
    'Get your free personalized birth chart K-Line reading powered by AI and Swiss Ephemeris. Discover career turning points, relationship timing, and life cycle analysis from your natal chart.',
  keywords:
    'birth chart reading, natal chart analysis, astrology K-Line, AI astrology reading, free birth chart, astrology timing chart, destiny chart, life turning points, career astrology, relationship timing',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <KlineClient userTier={userTier} isLoggedIn={!!user} />;
}
