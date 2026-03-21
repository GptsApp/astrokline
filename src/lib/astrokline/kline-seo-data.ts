import { Section } from '@/shared/types/blocks/landing';

export const KLINE_SEO_CONTENT = {
  features: {
    id: 'features',
    title: 'The Chart That Turns Timing Into A Curve.',
    description:
      'Go beyond generic horoscope copy. We use Swiss Ephemeris data to calculate how planetary movement interacts with your natal chart.',
    features: [
      {
        title: 'Real-Time Planetary Transits',
        description:
          'Your Destiny K-Line is calculated by analyzing the current position of all major planets (from moving fast like the Moon, to painfully slow like Pluto) against the static positions of planets at your exact moment of birth.',
        icon: 'Globe',
        image: {
          src: '/images/kline-preview.png',
          alt: 'Planetary Transits Interface',
        },
        items: [
          {
            title: 'Hard Angles = Crossroads',
            description:
              'Squares and Oppositions create necessary friction for growth. We map these as dips on your K-Line.',
          },
          {
            title: 'Soft Angles = Flow',
            description:
              'Trines and Sextiles bring ease and opportunity. We map these as peaks on your trajectory.',
          },
        ],
      },
      {
        title: 'Swiss Ephemeris Precision',
        description:
          'Our core engine runs on the Swiss Ephemeris (DE431), the same astronomical database used by NASA and professional astrologers worldwide, ensuring orbital accuracy to the exact second of arc.',
        icon: 'Orbit',
        image: {
          src: '/images/kline-radar.png',
          alt: 'Astrology Precision Radar',
        },
        items: [
          {
            title: 'House Systems',
            description:
              'Calculates exactly which area of life (Career, Wealth, Love) a transit will affect.',
          },
          {
            title: 'Retrogrades',
            description:
              'Automatically factors in apparent backward planetary motion for deeper psychological insights.',
          },
        ],
      },
    ],
  } as Section,

  audience: {
    id: 'audience',
    title: 'Who is the',
    highlight_text: 'Destiny K-Line',
    description:
      'Designed for those who want actionable foresight, not vague generalizations. Connect with your cosmic timing.',
    tabs: [
      {
        title: 'Life Planners',
        icon: 'Compass',
        headline: 'Navigate Major Life Transitions with Clarity',
        description:
          'Should you change careers now or wait six months? Is this relationship undergoing a temporary stress test or a fundamental breaking point? Your K-Line shows you the weather forecast for your life so you can pack an umbrella or set sail.',
        benefits: [
          'Identify peak periods for career leaps',
          "Prepare for unavoidable 'Crossroads' periods",
          "Understand the 'why' behind current life friction",
        ],
        image: {
          src: '/images/kline-preview.png',
          alt: 'Life Planning Dashboard',
        },
      },
      {
        title: 'Astrology Enthusiasts',
        icon: 'Star',
        headline: 'A Professional Transit Tool in Your Pocket',
        description:
          'Skip the complex ephemeris tables and manual transit calculations. The K-Line instantly visualizes heavy outer-planet transits (Saturn, Uranus, Pluto) to your personal inner planets visually.',
        benefits: [
          'Instant visual mapping of complex aspects',
          'Tracks long-term Pluto/Neptune generations',
          'Swiss Ephemeris accuracy guaranteed',
        ],
        image: {
          src: '/images/kline-radar.png',
          alt: 'Astrology Professional View',
        },
      },
    ],
  } as Section,

  howItWorks: {
    id: 'how-it-works',
    title: 'Read your destiny',
    highlight_text: 'in 3 steps',
    description:
      'No astrology degree required. Our AI translates complex planetary geometry into a simple, scannable chart.',
    steps: [
      {
        title: '1. Enter Birth Data',
        description:
          'Provide your exact date, time, and city of birth to cast your precise natal chart blueprint.',
        icon: 'Calendar',
      },
      {
        title: '2. AI Calculates Transits',
        description:
          'Our engine cross-references your chart with decades of real-time planetary movement data.',
        icon: 'Cpu',
      },
      {
        title: '3. Read Your K-Line',
        description:
          "Instantly see your life's peaks and valleys, with tailored advice for navigating each phase.",
        icon: 'LineChart',
      },
    ],
  } as Section,

  faq: {
    id: 'faq',
  } as Section,
};
