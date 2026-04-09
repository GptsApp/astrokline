import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { KlineClient } from './page-client';

export const generateMetadata = getMetadata({
  title: '2026 Astrology Predictions and Your Personal Life Curve',
  description:
    'Generate your personalized astrology predictions for 2026. AstroKline maps your planetary transits, Dashas, and Sade Sati into an interactive Life Curve and timing map.',
  keywords:
    'astrology predictions for 2026, astrology transit calculator, financial astrology, vedic astrology predictions, predictive astrology, transit chart',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <KlineClient userTier={userTier} isLoggedIn={!!user} />;
}
