import { getUserInfo } from '@/shared/models/user';
import { getCurrentSubscription, SubscriptionStatus } from '@/shared/models/subscription';
import { DashboardKlineClient } from './page-client';
import { BirthInfoWrapper } from '@/components/astrokline/ui/birth-info-wrapper';

export default async function DashboardKlineServerPage() {
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
      <DashboardKlineClient userTier={userTier} />
    </BirthInfoWrapper>
  );
}
