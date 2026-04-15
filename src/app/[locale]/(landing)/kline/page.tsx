import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { KlineClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'Life Curve Astrology Timing for 2026 and Beyond | AstroCurve',
  description:
    'Explore your Life Curve for 2026 and beyond. AstroCurve maps your birth chart and transits into timing, compatibility, and major turning points.',
  keywords:
    'life curve, astrology timing, birth chart timing, astrology transits, compatibility timing, turning points, transit chart, 2026 astrology',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <KlineClient userTier={userTier} isLoggedIn={!!user} />;
}
