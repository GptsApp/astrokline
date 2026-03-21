import { getMetadata } from '@/shared/lib/seo';
import { getKlineByShareToken } from '@/shared/models/kline';

import { SharedKlineClient } from './page-client';

type PageProps = { params: Promise<{ token: string; locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const kline = await getKlineByShareToken(token);
  const label = kline?.label || 'Someone';
  const result = kline?.klineResult as any;
  const sunSign = result?.profile?.sun?.sign || 'Unknown';

  return (
    await getMetadata({
      title: `${label}'s Cosmic Blueprint — ${sunSign} ☉`,
      description: `Explore ${label}'s personalized K-Line astrology chart. Discover their unique cosmic DNA, planetary positions, and life trajectory.`,
      keywords: 'shared astrology chart, natal chart, K-Line, cosmic blueprint',
      canonicalUrl: `/share/${token}`,
    })
  )({} as any);
}

export default async function SharedKlinePage({ params }: PageProps) {
  const { token } = await params;
  const kline = await getKlineByShareToken(token);

  if (!kline) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="px-6 text-center">
          <div className="bg-primary/10 border-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-foreground mb-2 text-2xl font-bold">
            Chart Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This chart has been removed or is no longer shared.
          </p>
          <a
            href="/kline"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2.5 text-sm font-bold transition-all"
          >
            Create Your Own K-Line
          </a>
        </div>
      </div>
    );
  }

  return <SharedKlineClient kline={kline} />;
}
