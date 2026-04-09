import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getMetadata } from '@/shared/lib/seo';
import { getUserInfo } from '@/shared/models/user';

import { ResultClient } from './page-client';

export const generateMetadata = getMetadata({
  title: 'Your Life Curve Reading',
  description: 'Your personalized Life Curve and timing-map reading.',
  noIndex: true,
});

export default async function ResultServerPage() {
  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return <ResultClient userTier={userTier} isLoggedIn={!!user} />;
}
