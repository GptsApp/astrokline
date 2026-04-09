import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { setRequestLocale } from 'next-intl/server';
import { getUserInfo } from '@/shared/models/user';
import { getMyKline, getUserKlines } from '@/shared/models/kline';
import { DashboardClient } from './dashboard-client';

export const revalidate = 0;

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  // Get user's own chart (isSelf = true)
  const myKline = user ? await getMyKline(user.id) : null;

  // Get count of saved charts
  const allKlines = user ? await getUserKlines(user.id) : [];
  const chartCount = allKlines.length;

  return (
    <DashboardClient
      userName={user?.name || undefined}
      userTier={userTier}
      hasKline={!!myKline?.klineResult}
      klineResult={myKline?.klineResult}
      birthDate={myKline?.birthDate || undefined}
      chartCount={chartCount}
    />
  );
}
