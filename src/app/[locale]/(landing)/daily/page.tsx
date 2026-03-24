import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { DailyClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'Free Daily Horoscope & Personalized Astrology Forecast — AstroKline',
  description:
    'Your personalized daily astrology forecast based on real-time planetary transits. Get AI-powered insights on Love, Career, Wealth, and Health from your exact birth chart — not generic sun sign horoscopes.',
  keywords:
    'daily horoscope, personalized daily astrology, free horoscope today, daily planetary transits, astrology forecast, AI horoscope reading, birth chart daily forecast, today astrology',
  canonicalUrl: '/daily',
});

export default async function DailyServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <DailyClient userTier={userTier} />;
}
