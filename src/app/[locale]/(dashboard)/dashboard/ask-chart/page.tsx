import { getUserInfo } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { AskChartDashboard } from './page-client';

export default async function AskChartPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <AskChartDashboard userTier={userTier} />;
}
