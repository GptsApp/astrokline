import { getUserInfo } from '@/shared/models/user';
import { getCurrentSubscription, SubscriptionStatus } from '@/shared/models/subscription';
import { DashboardDailyClient } from './page-client';

export default async function DashboardDailyServerPage() {
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

  return <DashboardDailyClient userTier={userTier} />;
}
