import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getUserInfo } from '@/shared/models/user';

import { DashboardDailyClient } from './page-client';

export default async function DashboardDailyServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <DashboardDailyClient userTier={userTier} />;
}
