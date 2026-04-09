import { ContentHubShell } from '@/components/astrokline/content/content-hub-shell';
import { getMetadata } from '@/shared/lib/seo';
import { ZODIAC_SIGNS } from '@/lib/astrokline/zodiac-data';

export const generateMetadata = getMetadata({
  title: 'Zodiac Sign Meanings and Timing Guides',
  description:
    'Browse all 12 zodiac signs, learn the personality and timing patterns behind each sign, and continue into your full AstroKline Life Curve.',
  keywords:
    'zodiac signs, zodiac meanings, astrology signs, natal chart signs, sign meanings',
  canonicalUrl: '/zodiac',
});

export default function ZodiacHubPage() {
  return (
    <ContentHubShell
      eyebrow="Zodiac Hub"
      title="Move From Sun Sign Curiosity To Full Birth Chart Context"
      description="The zodiac hub is where sign-level curiosity starts. Each sign page explains the core archetype, then points users toward the fuller birth-chart and Life Curve experience when sun-sign astrology stops being enough."
      primaryCta={{ href: '/kline', label: 'Create My Timing Map' }}
      secondaryCta={{ href: '/houses', label: 'Open Houses Hub' }}
      stats={[
        { label: 'Coverage', value: '12 zodiac sign pages' },
        { label: 'Positioning', value: 'Sun sign entry -> full chart upgrade' },
        { label: 'Internal links', value: 'Signs connect into tools and houses' },
      ]}
      cardsTitle="All Zodiac Signs"
      cardsDescription="These pages should catch broad zodiac intent, then route serious users into personalized timing and chart interpretation."
      cards={ZODIAC_SIGNS.map((sign) => ({
        href: `/zodiac/${sign.slug}`,
        eyebrow: `${sign.symbol} ${sign.element}`,
        title: sign.name,
        description: sign.description,
        meta: `${sign.dateRange} · ${sign.ruler}`,
      }))}
      faqTitle={<>Zodiac Hub Questions</>}
      faqDescription="These FAQs keep the hub useful for both navigation and search."
      faqs={[
        {
          question: 'Is this just a sun sign directory?',
          answer:
            'No. The hub starts with zodiac intent, but every sign page is designed to lead users toward a more complete birth-chart reading when they want accuracy.',
        },
        {
          question: 'Why link zodiac pages to the Life Curve product?',
          answer:
            'Because most users outgrow generic sign content quickly. The best next step is showing how their full birth chart affects timing, not only personality.',
        },
        {
          question: 'What should I open after reading my sign page?',
          answer:
            'If you want personalized timing, open the full chart flow. If you want structural chart understanding first, continue into the houses hub.',
        },
      ]}
    />
  );
}