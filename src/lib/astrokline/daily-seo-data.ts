import { Section } from '@/shared/types/blocks/landing';

export const DAILY_SEO_CONTENT = {
  features: {
    id: 'features',
    title: 'Why Generic Horoscopes Fail You.',
    description:
      'Most daily horoscopes only look at your Sun sign, dividing humanity into just 12 types. The Daily Energy Map looks at exactly where the planets are today relative to your unique natal chart.',
    features: [
      {
        title: 'Personalized Daily Transits',
        description:
          'Your daily scores are not random. When the transiting Moon hits your natal Venus, your Love score peaks. When transiting Mars squares your natal Sun, your Health score warns of burnout. Real astrology, real math.',
        icon: 'Activity',
        image: {
          src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
          alt: 'Personalized Daily Transits',
        },
        items: [
          {
            title: 'Dynamic Scoring System',
            description:
              'Our algorithm calculates the weight of all current transits to output a simple 1-100 score.',
          },
          {
            title: 'Key Theme Extraction',
            description:
              'Instantly know if today is about building wealth, resolving conflict, or resting.',
          },
        ],
      },
      {
        title: 'Actionable Archetypal Guidance',
        description:
          "We translate complex astrological geometry into the universal language of Tarot archetypes, giving you an intuitive, instantly understandable symbol for the day's dominant energy.",
        icon: 'Sparkles',
        image: {
          src: 'https://images.unsplash.com/photo-1632516643736-2ee87bd686a6?auto=format&fit=crop&q=80&w=800',
          alt: 'Actionable Archetypal Guidance',
        },
        items: [
          {
            title: "The 'Card of the Day'",
            description:
              'A visual anchor that helps you navigate daily challenges.',
          },
          {
            title: 'Strategic Advice',
            description:
              "Don't just know what will happen—know exactly what to *do* about it.",
          },
        ],
      },
    ],
  } as Section,

  audience: {
    id: 'audience',
    title: 'Who needs a',
    highlight_text: 'Daily Energy Map?',
    description:
      'Built for proactive individuals who want to align their daily actions with the cosmic weather.',
    tabs: [
      {
        title: 'High Performers',
        icon: 'Target',
        headline: 'Optimize Your Calendar with Cosmic Timing',
        description:
          'Stop pushing uphill. Use your Daily Energy Map to schedule creative work when your inspiration scores are high, and administrative tasks when your energy is low.',
        benefits: [
          "Schedule important meetings on 'High-Flow' days",
          'Avoid burnout by recognizing forced-rest transits',
          'Maximize wealth-building opportunities',
        ],
        image: {
          src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
          alt: 'High Performers Dashboard',
        },
      },
      {
        title: 'Spiritual Seekers',
        icon: 'Moon',
        headline: 'Deepen Your Daily Mindfulness Practice',
        description:
          "Start each morning by aligning your intentions with the day's dominant archetypal energy. Understand your emotional triggers before they happen.",
        benefits: [
          'Daily archetype for meditation and journaling',
          'Understand the root cause of daily emotional shifts',
          'Live in harmony with lunar cycles',
        ],
        image: {
          src: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
          alt: 'Spiritual Seekers Interface',
        },
      },
    ],
  } as Section,

  howItWorks: {
    id: 'how-it-works',
    title: 'Unlock your daily guidance',
    highlight_text: 'in seconds',
    description:
      'Get hyper-personalized daily insights based on your exact birth blueprint.',
    steps: [
      {
        title: '1. Lock In Your Birth Data',
        description:
          'Your birth time and location create the foundation for accurate daily predictions.',
        icon: 'Database',
      },
      {
        title: '2. Check Your Daily Scores',
        description:
          'Log in every morning to see your calculated scores for Love, Career, Wealth, and Health.',
        icon: 'BarChart',
      },
      {
        title: '3. Read Your Archetype',
        description:
          'Absorb the strategic advice for the day so you can navigate friction and capture opportunities.',
        icon: 'BookOpen',
      },
    ],
  } as Section,

  faq: {
    id: 'faq',
  } as Section,
};
