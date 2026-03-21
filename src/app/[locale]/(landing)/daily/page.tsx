import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { DailyClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'Daily Astrology Forecast — Real-Time Transit Energy Map',
  description:
    'Stop reading vague horoscopes. Discover your personalized daily planetary transits influencing your Love, Career, Wealth, and Health dimensions.',
  keywords:
    'daily horoscope, astrology forecast, daily astrology, real-time transits, planetary aspects today, astrology AI reading',
  canonicalUrl: '/daily',
});

export default async function DailyServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <DailyClient userTier={userTier} />;
}
