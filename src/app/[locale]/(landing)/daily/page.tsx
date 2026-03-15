import { getUserInfo } from '@/shared/models/user';
import { getCurrentSubscription, SubscriptionStatus } from '@/shared/models/subscription';
import { DailyClient } from './page-client';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'Daily Astrology Forecast — Real-Time Transit Energy Map',
  description: 'Stop reading vague horoscopes. Discover your personalized daily planetary transits influencing your Love, Career, Wealth, and Health dimensions.',
  keywords: 'daily horoscope, astrology forecast, daily astrology, real-time transits, planetary aspects today, astrology AI reading',
  canonicalUrl: '/daily',
});

export default async function DailyServerPage() {
  const user = await getUserInfo();
  let userTier = "FREE";
  
  if (user) {
    const sub = await getCurrentSubscription(user.id);
    if (sub && (sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIALING)) {
      if (sub.productId === 'premium' || sub.productId === 'premium-monthly' || sub.productId === 'premium-yearly') {
        userTier = "PREMIUM";
      } else {
        userTier = "STANDARD";
      }
    }
  }

  return <DailyClient userTier={userTier} />;
}
