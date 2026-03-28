import { getMetadata } from '@/shared/lib/seo';
import { getKlineByShareToken } from '@/shared/models/kline';
import { Link } from '@/core/i18n/navigation';

import { SharedKlineClient } from './page-client';
import { Heading } from "@/components/astrokline/ui/heading";

type PageProps = { params: Promise<{ token: string; locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const kline = await getKlineByShareToken(token);
  const label = kline?.label || 'Someone';
  const result = kline?.klineResult as {
    profile?: { sun?: { sign?: string } };
  };
  const sunSign = result?.profile?.sun?.sign || 'Unknown';

  return (
    await getMetadata({
      title: `${label}'s Cosmic Blueprint — ${sunSign} ☉`,
      description: `Explore ${label}'s personalized K-Line astrology chart. Discover their unique cosmic DNA, planetary positions, and life trajectory.`,
      keywords: 'shared astrology chart, natal chart, K-Line, cosmic blueprint',
      canonicalUrl: `/share/${token}`,
    })
  )({ params });
}

export default async function SharedKlinePage({ params }: PageProps) {
  const { token } = await params;
  const kline = await getKlineByShareToken(token);

  if (!kline) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="px-6 text-center">
          <div className="bg-primary/10 border-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center border">
            <span className="text-2xl">🔒</span>
          </div>
          <Heading level={1} className="text-foreground mb-2 text-2xl font-bold">
            Chart Not Found
          </Heading>
          <p className="text-muted-foreground mb-6">
            This chart has been removed or is no longer shared.
          </p>
          <Link
            href="/kline"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm font-bold transition-all"
          >
            Create Your Own K-Line
          </Link>
        </div>
      </div>
    );
  }

  return <SharedKlineClient kline={kline} />;
}
