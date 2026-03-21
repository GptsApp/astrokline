import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getUserInfo } from '@/shared/models/user';

import { DashboardKlineClient } from './page-client';

export default async function DashboardKlineServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <DashboardKlineClient userTier={userTier} />;
}
