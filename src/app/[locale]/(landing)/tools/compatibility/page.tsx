import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getUserInfo } from '@/shared/models/user';
import { ToolPageShell } from '@/components/astrocurve/tools/tool-page-shell';
import { redirect } from '@/core/i18n/navigation';
import { getMetadata } from '@/shared/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const generatePageMetadata = getMetadata({
    title: 'Free Astrology Compatibility by Date of Birth | Synastry Timing Map',
    description:
      'Discover deep astrology compatibility by date of birth. Our synastry timing map shows relationship friction, romantic peaks, and long-term synergy with far more nuance than sun-sign matching.',
    keywords: [
      'astrology compatibility',
      'astrology compatibility by date of birth',
      'astrology synastry',
      'synastry timing map',
      'birth chart compatibility',
    ].join(', '),
    canonicalUrl: '/tools/compatibility',
  });

  return generatePageMetadata({ params: Promise.resolve({ locale }) });
}

export default async function CompatibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUserInfo();
  if (user) {
    redirect({ href: '/dashboard/tools/compatibility', locale });
  }

  const tier = 'GUEST';
  const myKline: any = null;

  return (
    <ToolPageShell
      toolId="compatibility"
      toolTitle="Compatibility Check"
      toolDescription="Chemistry analysis with anyone — based on real birth chart data, not just Sun signs."
      tier={tier}
      hasKlineData={!!myKline?.klineResult}
      klineResult={myKline?.klineResult}
      seoHeadline="Real Compatibility Analysis"
      seoSubline="Sun sign matching is entertainment. Real synastry compares full birth charts — Moon, Venus, Mars, and rising sign connections that actually predict chemistry."
      features={[
        { title: 'Full Synastry Report', description: 'Cross-analysis of both birth charts across all major planetary positions and house overlays.' },
        { title: 'Chemistry Score', description: 'Overall compatibility score with detailed breakdown across romance, communication, and values.' },
        { title: 'Tension Points', description: 'Honest assessment of potential friction areas and how to navigate them.' },
      ]}
      faqs={[
        { q: 'What is synastry?', a: 'Synastry is the astrological technique of comparing two birth charts to understand the dynamics between two people — attraction, tension, communication styles, and long-term potential.' },
        { q: 'Do I need the other person\'s birth time?', a: 'Birth time improves accuracy but is not required. Birth date and location provide a solid foundation for compatibility analysis.' },
        { q: 'Is this just about romance?', a: 'Not at all. Synastry works for business partners, friends, family members — any relationship where understanding interpersonal dynamics matters.' },
        { q: 'How is the compatibility score calculated?', a: 'We analyze planetary aspects between both charts: conjunctions, trines, squares, and oppositions across Venus, Mars, Moon, and Sun positions to compute attraction and friction.' },
        { q: 'Can a low score mean the relationship is doomed?', a: 'No. Low scores indicate areas requiring conscious effort. Many strong relationships have challenging synastry — awareness of tension points actually helps couples navigate them.' },
        { q: 'What does the Tension Points dimension mean?', a: 'Tension Points measure potential friction — squares and oppositions between key planets. Some tension creates passion and growth; too much creates exhaustion. Context matters.' },
        { q: 'Can I check compatibility with more than one person?', a: 'Yes. You can run unlimited compatibility checks. Many users compare multiple potential partners or analyze dynamics with colleagues and family.' },
        { q: 'How does this compare to Sun sign compatibility?', a: 'Sun sign matching uses 1 data point. Our analysis uses 10+ planetary positions, house overlays, and aspect patterns — making it roughly 10x more accurate and nuanced.' },
      ]}
    />
  );
}
