import { redirect } from '@/core/i18n/navigation';

import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'AstroKline K-Line Forecast — AstroKline',
  description:
    'Generate your AstroKline timing map from your exact birth chart and explore long-cycle timing, turning points, and AI interpretation.',
  canonicalUrl: '/kline',
});

export default async function DailyServerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect({ href: '/kline', locale });
}
