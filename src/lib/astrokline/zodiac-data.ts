export interface ZodiacSign {
  slug: string;
  name: string;
  symbol: string;
  element: string;
  dateRange: string;
  ruler: string;
  modality: string;
  description: string;
  klineInsight: string;
  strengths: string[];
  challenges: string[];
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    slug: 'aries',
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    dateRange: 'March 21 – April 19',
    ruler: 'Mars',
    modality: 'Cardinal',
    description:
      'Aries is the first sign of the zodiac, ruled by Mars. Known for bold initiative, leadership energy, and a drive to start new chapters.',
    klineInsight:
      'Aries K-Lines often show sharp peaks during Mars return cycles. Career momentum tends to spike in spring, with major turning points when Mars aspects natal Sun or Midheaven.',
    strengths: ['Leadership', 'Courage', 'Initiative', 'Determination'],
    challenges: ['Impatience', 'Impulsivity', 'Short temper'],
  },
  {
    slug: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    dateRange: 'April 20 – May 20',
    ruler: 'Venus',
    modality: 'Fixed',
    description:
      'Taurus is an earth sign ruled by Venus, focused on stability, material comfort, and long-term value building.',
    klineInsight:
      'Taurus K-Lines tend to show slow, steady growth curves. Major wealth windows often align with Venus-Jupiter conjunctions, and Uranus transits through Taurus bring unexpected breakthroughs.',
    strengths: ['Persistence', 'Reliability', 'Financial sense', 'Patience'],
    challenges: ['Stubbornness', 'Resistance to change', 'Possessiveness'],
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    dateRange: 'May 21 – June 20',
    ruler: 'Mercury',
    modality: 'Mutable',
    description:
      'Gemini is an air sign ruled by Mercury, known for intellectual curiosity, adaptability, and communication skills.',
    klineInsight:
      'Gemini K-Lines show frequent oscillations reflecting their dual nature. Mercury retrograde periods are especially significant, often marking communication breakthroughs or pivots.',
    strengths: ['Communication', 'Versatility', 'Wit', 'Curiosity'],
    challenges: ['Inconsistency', 'Restlessness', 'Overthinking'],
  },
  {
    slug: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    dateRange: 'June 21 – July 22',
    ruler: 'Moon',
    modality: 'Cardinal',
    description:
      'Cancer is a water sign ruled by the Moon, deeply connected to emotion, family, and inner security.',
    klineInsight:
      'Cancer K-Lines correlate strongly with lunar cycles. Eclipse seasons hitting the Cancer-Capricorn axis often trigger major life restructuring around home, family, and career foundations.',
    strengths: ['Emotional intelligence', 'Nurturing', 'Intuition', 'Loyalty'],
    challenges: ['Over-sensitivity', 'Mood swings', 'Clinginess'],
  },
  {
    slug: 'leo',
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    dateRange: 'July 23 – August 22',
    ruler: 'Sun',
    modality: 'Fixed',
    description:
      'Leo is a fire sign ruled by the Sun, radiating confidence, creativity, and a natural magnetism that draws others in.',
    klineInsight:
      'Leo K-Lines peak during solar return seasons and when Jupiter transits fire signs. Recognition cycles align with Sun-Jupiter aspects, making these key windows for career visibility.',
    strengths: ['Charisma', 'Creativity', 'Generosity', 'Confidence'],
    challenges: ['Pride', 'Need for validation', 'Dramatic tendencies'],
  },
  {
    slug: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    dateRange: 'August 23 – September 22',
    ruler: 'Mercury',
    modality: 'Mutable',
    description:
      'Virgo is an earth sign ruled by Mercury, excelling in analysis, service, and systematic improvement.',
    klineInsight:
      'Virgo K-Lines show gradual refinement patterns. Health and work transits peak during Mercury-Saturn aspects. The most productive windows come during organized, low-drama periods.',
    strengths: ['Analytical mind', 'Dedication', 'Precision', 'Service'],
    challenges: ['Perfectionism', 'Over-criticism', 'Worry'],
  },
  {
    slug: 'libra',
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    dateRange: 'September 23 – October 22',
    ruler: 'Venus',
    modality: 'Cardinal',
    description:
      'Libra is an air sign ruled by Venus, seeking balance, partnership, and aesthetic harmony in all things.',
    klineInsight:
      'Libra K-Lines show relationship-driven peaks. Venus return cycles and Jupiter transits through air signs mark key windows for partnerships, legal outcomes, and creative collaboration.',
    strengths: ['Diplomacy', 'Fairness', 'Charm', 'Aesthetic sense'],
    challenges: ['Indecision', 'People-pleasing', 'Avoidance of conflict'],
  },
  {
    slug: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    dateRange: 'October 23 – November 21',
    ruler: 'Pluto',
    modality: 'Fixed',
    description:
      'Scorpio is a water sign ruled by Pluto, known for depth, transformation, and psychological intensity.',
    klineInsight:
      'Scorpio K-Lines feature dramatic dips and equally powerful rebounds. Pluto transits trigger deep transformation periods lasting years, while Mars aspects create shorter bursts of decisive action.',
    strengths: ['Depth', 'Resilience', 'Strategic mind', 'Passion'],
    challenges: ['Control issues', 'Jealousy', 'Secretiveness'],
  },
  {
    slug: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    dateRange: 'November 22 – December 21',
    ruler: 'Jupiter',
    modality: 'Mutable',
    description:
      'Sagittarius is a fire sign ruled by Jupiter, driven by expansion, adventure, philosophy, and the pursuit of truth.',
    klineInsight:
      'Sagittarius K-Lines expand during Jupiter return cycles (every 12 years). International opportunities, education milestones, and belief system shifts align with Jupiter-Sun transits.',
    strengths: ['Optimism', 'Vision', 'Adventure', 'Honesty'],
    challenges: ['Overcommitment', 'Restlessness', 'Bluntness'],
  },
  {
    slug: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    dateRange: 'December 22 – January 19',
    ruler: 'Saturn',
    modality: 'Cardinal',
    description:
      'Capricorn is an earth sign ruled by Saturn, focused on ambition, structure, long-term achievement, and discipline.',
    klineInsight:
      'Capricorn K-Lines show classic climb patterns with Saturn return cycles (ages ~29 and ~58) as defining peaks. Career breakthroughs align with Saturn-Jupiter conjunctions and Pluto transits.',
    strengths: ['Discipline', 'Ambition', 'Responsibility', 'Endurance'],
    challenges: ['Rigidity', 'Workaholism', 'Emotional guardedness'],
  },
  {
    slug: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    dateRange: 'January 20 – February 18',
    ruler: 'Uranus',
    modality: 'Fixed',
    description:
      'Aquarius is an air sign ruled by Uranus, driven by innovation, independence, humanitarian ideals, and unconventional thinking.',
    klineInsight:
      'Aquarius K-Lines show sudden breakouts and unconventional trajectories. Uranus transits create unexpected life pivots, while Saturn aspects bring structure to visionary ideas.',
    strengths: ['Innovation', 'Independence', 'Humanitarianism', 'Originality'],
    challenges: ['Detachment', 'Stubbornness', 'Unpredictability'],
  },
  {
    slug: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    dateRange: 'February 19 – March 20',
    ruler: 'Neptune',
    modality: 'Mutable',
    description:
      'Pisces is a water sign ruled by Neptune, embodying intuition, compassion, artistic sensitivity, and spiritual depth.',
    klineInsight:
      'Pisces K-Lines show fluid, wave-like patterns. Neptune transits create long periods of spiritual growth, while Jupiter aspects open creative and healing windows. Eclipse seasons in Pisces bring pivotal revelations.',
    strengths: ['Intuition', 'Compassion', 'Creativity', 'Spiritual depth'],
    challenges: ['Escapism', 'Boundary issues', 'Over-idealism'],
  },
];
