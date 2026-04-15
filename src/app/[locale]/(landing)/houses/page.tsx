import { ContentHubShell } from '@/components/astrocurve/content/content-hub-shell';
import { getMetadata } from '@/shared/lib/seo';
import { ASTROLOGY_HOUSES } from '@/lib/astrokline/houses-data';

export const generateMetadata = getMetadata({
  title: 'Astrology Houses Guide and Free House Calculators',
  description:
    'Explore all 12 astrology houses, understand what each house rules, and use AstroCurve house calculators to find your own placements.',
  keywords:
    'astrology houses, 12 houses astrology, house meanings, house calculator, birth chart houses',
  canonicalUrl: '/houses',
});

export default function HousesHubPage() {
  return (
    <ContentHubShell
      eyebrow="Astrology Houses Hub"
      title="Explore All 12 Houses Before You Read Your Chart"
      description="This is the master index for AstroCurve's house content. Move from plain-English house meaning to your own placement, then into a full Life Curve reading when you want deeper timing context."
      primaryCta={{ href: '/kline', label: 'Generate My Life Curve' }}
      secondaryCta={{ href: '/zodiac', label: 'Browse Zodiac Signs' }}
      stats={[
        { label: 'Coverage', value: '12 house landing pages' },
        { label: 'Use case', value: 'Meaning + placement lookup + next step' },
        { label: 'Upgrade path', value: 'House page -> full chart -> dashboard' },
      ]}
      cardsTitle="All 12 Houses"
      cardsDescription="Each house page answers search intent first, then gives users a lightweight calculator before introducing the full product."
      cards={ASTROLOGY_HOUSES.map((house) => ({
        href: `/houses/${house.slug}`,
        eyebrow: house.ruler,
        title: house.name,
        description: house.description,
        meta: house.keyword,
      }))}
      pathTitle="How This Hub Fits The Funnel"
      pathSteps={[
        'Search a specific house meaning',
        'Calculate the matching house placement',
        'Open the full Life Curve result',
        'Save and revisit in the dashboard',
      ]}
      faqTitle={<>House Questions Before You Calculate</>}
      faqDescription="These FAQs make the hub useful as an SEO landing page, not just a link directory."
      faqs={[
        {
          question: 'What is an astrology houses hub for?',
          answer:
            'It gives users one place to understand the 1st through 12th houses, compare meanings, and navigate into the exact house page they need.',
        },
        {
          question: 'Do I need my birth time for house calculations?',
          answer:
            'Yes for accuracy. House cusps move with time, so the closer your birth time is, the more reliable your houses and ascendant become.',
        },
        {
          question: 'What happens after I use a house calculator?',
          answer:
            'You can continue into the full AstroCurve Life Curve flow, where the same birth data powers timing, yearly momentum, and dashboard tools.',
        },
      ]}
    />
  );
}