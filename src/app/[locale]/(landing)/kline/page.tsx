import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { KlineClient } from './page-client';

export const generateMetadata = getMetadata({
  title: '2026 Astrology Predictions & Transit Chart | Your Personal K-Line', // ' | AstroKline' will be auto-appended by seo.ts
  description:
    'Generate your personalized astrology predictions for 2026. Astrokline maps your planetary transits, Dashas, and Sade Sati into an interactive, readable K-Line chart.',
  keywords:
    'astrology predictions for 2026, astrology transit calculator, financial astrology, vedic astrology predictions, predictive astrology, transit chart',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <KlineClient userTier={userTier} isLoggedIn={!!user} />;
}
