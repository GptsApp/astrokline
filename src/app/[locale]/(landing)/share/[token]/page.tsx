import { getKlineByShareToken } from '@/shared/models/kline';
import { SharedKlineClient } from './page-client';
import { getMetadata } from '@/shared/lib/seo';

type PageProps = { params: Promise<{ token: string; locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const kline = await getKlineByShareToken(token);
  const label = kline?.label || 'Someone';
  const result = kline?.klineResult as any;
  const sunSign = result?.profile?.sun?.sign || 'Unknown';

  return (await getMetadata({
    title: `${label}'s Cosmic Blueprint — ${sunSign} ☉`,
    description: `Explore ${label}'s personalized K-Line astrology chart. Discover their unique cosmic DNA, planetary positions, and life trajectory.`,
    keywords: 'shared astrology chart, natal chart, K-Line, cosmic blueprint',
    canonicalUrl: `/share/${token}`,
  }))({} as any);
}

export default async function SharedKlinePage({ params }: PageProps) {
  const { token } = await params;
  const kline = await getKlineByShareToken(token);

  if (!kline) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Chart Not Found</h1>
          <p className="text-muted-foreground mb-6">This chart has been removed or is no longer shared.</p>
          <a
            href="/kline"
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
          >
            Create Your Own K-Line
          </a>
        </div>
      </div>
    );
  }

  return <SharedKlineClient kline={kline} />;
}
