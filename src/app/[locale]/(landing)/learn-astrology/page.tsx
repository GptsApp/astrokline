import { ContentHubShell } from '@/components/astrocurve/content/content-hub-shell';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'Learn Astrology With Houses, Signs, and Timing Guides',
  description:
    'Use AstroCurve to learn astrology through houses, zodiac signs, tools, and practical timing concepts that connect directly to your own chart.',
  keywords:
    'learn astrology, astrology guide, houses and signs, timing map, birth chart education',
  canonicalUrl: '/learn-astrology',
});

export default function LearnAstrologyHubPage() {
  return (
    <ContentHubShell
      eyebrow="Learn Astrology Hub"
      title="Learn The Parts Of Astrology That Actually Help You Read A Chart"
      description="This hub is the educational layer that ties together signs, houses, practical tools, and the Life Curve product. It gives users a place to learn without leaving the AstroCurve ecosystem."
      primaryCta={{ href: '/houses', label: 'Start With Houses' }}
      secondaryCta={{ href: '/blog', label: 'Read The Blog' }}
      stats={[
        { label: 'Audience', value: 'Curious beginners and practical users' },
        { label: 'Goal', value: 'Education that leads into real chart use' },
        { label: 'Format', value: 'Hubs, tools, and practical examples' },
      ]}
      cardsTitle="Start Learning Here"
      cardsDescription="Each card should move a user from isolated astrology jargon into practical chart reading and timing decisions."
      cards={[
        {
          href: '/houses',
          eyebrow: 'Structure',
          title: 'Learn The 12 Houses',
          description:
            'Understand what each house rules, why birth time matters, and how houses shape real-life interpretation.',
          meta: 'Chart framework',
        },
        {
          href: '/zodiac',
          eyebrow: 'Archetypes',
          title: 'Learn The 12 Signs',
          description:
            'Use sign pages as a lightweight starting point before moving into your complete chart.',
          meta: 'Personality layer',
        },
        {
          href: '/tools',
          eyebrow: 'Practice',
          title: 'Use The Tools Hub',
          description:
            'Apply what you are learning through timing, energy, compatibility, and chart-generation tools.',
          meta: 'Hands-on layer',
        },
        {
          href: '/kline',
          eyebrow: 'Application',
          title: 'Generate Your Life Curve',
          description:
            'The fastest way to connect astrology concepts to something real is seeing your own timing map.',
          meta: 'Core product',
        },
        {
          href: '/blog',
          eyebrow: 'Reading',
          title: 'Browse The Blog',
          description:
            'Use longer-form articles when you want examples, explanations, and broader context.',
          meta: 'Editorial layer',
        },
        {
          href: '/pricing',
          eyebrow: 'Depth',
          title: 'See What Unlocks Next',
          description:
            'Understand what becomes available when you move from free exploration into saved and deeper readings.',
          meta: 'Upgrade layer',
        },
      ]}
      faqTitle={<>Learn Astrology Hub Questions</>}
      faqDescription="The learn hub should make education feel connected to product usage, not like a separate content island."
      faqs={[
        {
          question: 'What should I learn first: houses or zodiac signs?',
          answer:
            'For most users, zodiac signs are easier to enter with, but houses explain chart structure better. That is why this hub links both and lets users choose based on intent.',
        },
        {
          question: 'Why does this hub include product pages?',
          answer:
            'Because the fastest way to learn astrology is by seeing how concepts show up in your own chart. Education and product use should reinforce each other.',
        },
        {
          question: 'Is this meant for experts?',
          answer:
            'No. The hub is designed for motivated beginners who want practical explanations, calculators, and a clear route into deeper interpretation.',
        },
      ]}
    />
  );
}