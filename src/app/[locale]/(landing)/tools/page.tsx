import { ContentHubShell } from '@/components/astrocurve/content/content-hub-shell';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'Astrology Tools Hub for Timing, Energy, and Compatibility',
  description:
    'Use AstroCurve tools to generate your Life Curve, check monthly energy, compare compatibility, and move into dashboard tools when you want ongoing use.',
  keywords:
    'astrology tools, timing map, life curve, compatibility tool, energy forecast, birth chart tools',
  canonicalUrl: '/tools',
});

const TOOL_CARDS = [
  {
    href: '/kline',
    eyebrow: 'Core Product',
    title: 'Life Curve Generator',
    description:
      'Generate your chart, yearly timing map, and result-page reading from one birth-data flow.',
    meta: 'Public entry point',
  },
  {
    href: '/tools/energy',
    eyebrow: 'Public Trial',
    title: 'Energy Forecast',
    description:
      'Preview how timing tools work, then continue into the dashboard for full-use scenarios.',
    meta: 'Public tool -> dashboard upgrade',
  },
  {
    href: '/tools/compatibility',
    eyebrow: 'Relationship Tool',
    title: 'Compatibility Check',
    description:
      'Compare two birth profiles and use synastry as an entry into the broader chart ecosystem.',
    meta: 'Public tool -> dashboard upgrade',
  },
  {
    href: '/houses',
    eyebrow: 'SEO Support',
    title: 'Houses Hub',
    description:
      'House calculators answer narrow search intent and feed users into chart generation once interest becomes personal.',
    meta: 'Support content',
  },
  {
    href: '/zodiac',
    eyebrow: 'SEO Support',
    title: 'Zodiac Hub',
    description:
      'Sign pages catch broad top-of-funnel interest and hand off to birth-chart precision when needed.',
    meta: 'Support content',
  },
  {
    href: '/pricing',
    eyebrow: 'Upgrade Layer',
    title: 'Pricing',
    description:
      'See how public trial, result reading, and dashboard usage map into Lite and Pro plans.',
    meta: 'Conversion path',
  },
];

export default function ToolsHubPage() {
  return (
    <ContentHubShell
      eyebrow="Tools Hub"
      title="One Public Tool Layer, One Dashboard Layer, One Clear Upgrade Path"
      description="AstroCurve should feel like a single product with increasing depth, not a pile of separate utilities. This hub makes the public-to-dashboard gradient explicit."
      primaryCta={{ href: '/kline', label: 'Start With My Life Curve' }}
      secondaryCta={{ href: '/pricing', label: 'Compare Plans' }}
      stats={[
        { label: 'Public tools', value: 'Trial and discovery' },
        { label: 'Result page', value: 'Immediate interpretation layer' },
        { label: 'Dashboard', value: 'Persistent ongoing use' },
      ]}
      cardsTitle="Core Product Surfaces"
      cardsDescription="Users should understand where each tool belongs and why the dashboard is the long-term home, not guess whether there are two separate products."
      cards={TOOL_CARDS}
      pathTitle="Recommended Product Gradient"
      pathSteps={[
        'Public trial',
        'Generate chart',
        'Read the result page',
        'Continue in dashboard',
      ]}
      faqTitle={<>Tools Hub Questions</>}
      faqDescription="These answers make the public and dashboard information architecture legible."
      faqs={[
        {
          question: 'Why are there both public tools and dashboard tools?',
          answer:
            'Public tools are for discovery and low-friction trial. Dashboard tools are for saving charts, revisiting readings, and getting more persistent value from the product.',
        },
        {
          question: 'What should happen after a user finishes a public tool?',
          answer:
            'They should land in a clear result-reading layer, then see why saving the chart in the dashboard gives them more ongoing utility.',
        },
        {
          question: 'Which page is the real product center?',
          answer:
            'The Life Curve generator and the dashboard together define the core product. Public SEO and utility pages should feed that center, not compete with it.',
        },
      ]}
    />
  );
}