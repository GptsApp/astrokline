import { Section } from '@/shared/types/blocks/landing';

export const IDEAL_PARTNER_SEO_CONTENT = {
  features: {
    id: 'features',
    title: 'Stop Swiping Blindly.',
    description:
      "Your ideal partner isn't a random collection of traits. Astrology maps the specific psychological profiles that complement your weaknesses and amplify your strengths.",
    features: [
      {
        title: 'Synastry-Based AI Profiling',
        description:
          'Instead of relying on superficial preferences, our AI analyzes your 7th House (Partnership), Venus placement, and Mars sign to construct a highly accurate psychological blueprint of your true soulmate.',
        icon: 'Heart',
        image: {
          src: '/images/partner-synastry.png',
          alt: 'Synastry Based Artificial Intelligence',
        },
        items: [
          {
            title: 'Psychological Accuracy',
            description:
              'Discover the specific personality traits that you genuinely need for long-term emotional security.',
          },
          {
            title: 'Red Flag Detection',
            description:
              'Learn which commonly attractive traits are actually toxic matches for your specific chart.',
          },
        ],
      },
      {
        title: 'Photorealistic Avatar Generation',
        description:
          'What does your soulmate look like? By analyzing the element (Fire, Earth, Air, Water) and modality of your relationship houses, our AI generates a photorealistic avatar representing their core essence.',
        icon: 'Image',
        image: {
          src: '/images/partner-avatar.png',
          alt: 'Photorealistic Partner Generation',
        },
        items: [
          {
            title: 'Elemental Expression',
            description:
              'Visualizes the physical manifestations of their dominant astrological elements.',
          },
          {
            title: 'Archetypal Aesthetics',
            description:
              'Translates abstract planetary influences into concrete human features and style.',
          },
        ],
      },
    ],
  } as Section,

  audience: {
    id: 'audience',
    title: 'Who needs the',
    highlight_text: 'Ideal Partner Blueprint?',
    description:
      'Perfect for those exhausted by modern dating who want to navigate romance with cosmic precision.',
    tabs: [
      {
        title: 'Active Daters',
        icon: 'Search',
        headline: 'Filter Matches with Cosmic Precision',
        description:
          'Stop wasting time on people who look good on paper but clash with your soul. Know exactly what traits, energy, and communication styles to look for on your next date.',
        benefits: [
          'Identify soulmate material instantly',
          'Understand why past relationships failed',
          'Save time by filtering out incompatible matches',
        ],
        image: {
          src: '/images/partner-dater.png',
          alt: 'Active Daters Filtering',
        },
      },
      {
        title: 'Self-Discoverers',
        icon: 'User',
        headline: 'Understand Your Own Relationship Needs',
        description:
          'Often, the partner we *think* we want is completely different from the partner our chart shows we *need*. Uncover your hidden relationship blockages.',
        benefits: [
          'Gain deep insight into your 7th House dynamics',
          'Heal attachment issues through awareness',
          'Attract healthier dynamics',
        ],
        image: {
          src: '/images/partner-self.png',
          alt: 'Self Discovery Journey',
        },
      },
    ],
  } as Section,

  howItWorks: {
    id: 'how-it-works',
    title: 'Generate your soulmate',
    highlight_text: 'in 60 seconds',
    description:
      'Let our engine cross-reference thousands of astrological data points instantly.',
    steps: [
      {
        title: '1. Upload Your Data',
        description:
          'Input your birth details to unlock your relational blueprint (Venus, Mars, 7th House).',
        icon: 'Database',
      },
      {
        title: '2. AI Synthesizes Profile',
        description:
          'The engine translates the astrological geometry into human psychological traits.',
        icon: 'Cpu',
      },
      {
        title: '3. Meet Your Match',
        description:
          'Receive a detailed psychological profile and a photorealistic generated image of your ideal partner.',
        icon: 'Heart',
      },
    ],
  } as Section,

  faq: {
    id: 'faq',
  } as Section,
};
