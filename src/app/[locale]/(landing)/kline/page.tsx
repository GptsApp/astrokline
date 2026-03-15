import { getUserInfo } from '@/shared/models/user';
import { getCurrentSubscription, SubscriptionStatus } from '@/shared/models/subscription';
import { KlineClient } from './page-client';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'Destiny K-Line Finder — Analyze Your Astrological Trajectory',
  description: 'Transform your birth chart into a financial-style K-Line graph. Uncover cosmic highs, lows, and turning points in romance, career, and wealth.',
  keywords: 'astrology tracker, destiny k-line, birth chart map, natal chart reading, life turning points, astrology AI',
  canonicalUrl: '/kline',
});

export default async function KlineServerPage() {
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

  return (
    <BirthInfoWrapper>
      <KlineClient userTier={userTier} isLoggedIn={!!user} />
    </BirthInfoWrapper>
  );
}
