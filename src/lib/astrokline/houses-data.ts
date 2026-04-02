export type House = {
  slug: string;
  name: string;
  keyword: string;
  ruler: string;
  description: string;
  klineInsight: string;
  strengths: string[];
  challenges: string[];
};

export const ASTROLOGY_HOUSES: House[] = [
  {
    slug: '1st-house',
    name: '1st House',
    keyword: 'Identity',
    ruler: 'Aries',
    description: "The 1st House, or the Ascendant, represents your physical self, outward appearance, and how you initiate action. It's the mask you wear and your first impression on the world.",
    klineInsight: "When major planetary transits hit your 1st House, your K-Line often spikes with extreme personal growth. This is a period of reinvention, where changes to your identity or physical self heavily influence your overall momentum score.",
    strengths: ['Self-awareness', 'Direct action', 'Strong first impressions', 'Independence'],
    challenges: ['Impulsive behavior', 'Overly self-focused', 'Struggles with physical energy'],
  },
  {
    slug: '2nd-house',
    name: '2nd House',
    keyword: 'Value & Wealth',
    ruler: 'Taurus',
    description: "The 2nd House governs personal finances, material possessions, and self-worth. It shows how you earn, manage resources, and what you deeply value.",
    klineInsight: "Activity in the 2nd House directly impacts your Financial K-Line. Beneficial transits here indicate high momentum for wealth accumulation and salary bumps, while challenging transits warn of resource friction where you must protect capital.",
    strengths: ['Financial stability', 'Strong sense of self-worth', 'Practical asset management'],
    challenges: ['Material attachment', 'Fear of financial loss', 'Stubbornness over resources'],
  },
  {
    slug: '3rd-house',
    name: '3rd House',
    keyword: 'Communication',
    ruler: 'Gemini',
    description: "The 3rd House rules communication, short trips, siblings, and the immediate environment. It dictates your thinking patterns and how you process information.",
    klineInsight: "When your 3rd House is active, your K-Line reflects an influx of ideas, negotiations, and learning. It's a high-friction period for communication, meaning important contract signings or learning curves are critical to your timeline.",
    strengths: ['Quick intellect', 'Effective communication', 'Adaptability', 'Networking'],
    challenges: ['Scattered focus', 'Gossip', 'Nervous energy', 'Information overload'],
  },
  {
    slug: '4th-house',
    name: '4th House',
    keyword: 'Home & Roots',
    ruler: 'Cancer',
    description: "The 4th House sits at the base of the chart (IC) representing home, family, ancestry, and deep emotional foundations.",
    klineInsight: "Transits through the 4th House often represent a 'recharging' phase on your K-Line. Momentum shifts from external career goals to internal, domestic matters. It's a key timing indicator for buying real estate or starting a family.",
    strengths: ['Emotional depth', 'Strong family ties', 'Nurturing environment', 'Psychological security'],
    challenges: ['Clinging to the past', 'Emotional instability', 'Family friction'],
  },
  {
    slug: '5th-house',
    name: '5th House',
    keyword: 'Creativity & Romance',
    ruler: 'Leo',
    description: "The 5th House governs self-expression, romance, creativity, children, and risk-taking. It is the joy and playfulness of the chart.",
    klineInsight: "Your synastry and romance K-Line algorithms heavily monitor the 5th House. Major transits here predict high-momentum phases for new relationships, creative breakthroughs, and speculative investments.",
    strengths: ['Creative brilliance', 'Romantic passion', 'Joyful expression', 'Courage'],
    challenges: ['Ego conflicts', 'Reckless risk-taking', 'Drama in relationships'],
  },
  {
    slug: '6th-house',
    name: '6th House',
    keyword: 'Daily Routines',
    ruler: 'Virgo',
    description: "The 6th House is about daily labor, health routines, pets, and service. It shows how you manage your day-to-day responsibilities.",
    klineInsight: "The 6th House is the engine of the K-Line. When transits hit, it signals a period of high friction where hard work, health optimization, and skill-building lay the groundwork for future peaks.",
    strengths: ['Excellent organization', 'Health-conscious', 'Service-oriented', 'Attention to detail'],
    challenges: ['Burnout', 'Workplace stress', 'Health anxieties', 'Perfectionism'],
  },
  {
    slug: '7th-house',
    name: '7th House',
    keyword: 'Partnerships',
    ruler: 'Libra',
    description: "The 7th House (the Descendant) rules committed partnerships, marriage, and open enemies. It's about how you relate to the 'other'.",
    klineInsight: "This is the ultimate house for Astrology Synastry. A peak K-Line score during 7th House transits flags the perfect timing for engagements, major business contracts, or resolving deep relationship friction.",
    strengths: ['Diplomacy', 'Strong marriages', 'Fairness', 'Collaborative success'],
    challenges: ['Codependency', 'Legal disputes', 'Losing oneself in partners'],
  },
  {
    slug: '8th-house',
    name: '8th House',
    keyword: 'Transformation',
    ruler: 'Scorpio',
    description: "The 8th House deals with shared resources, intimacy, death, and rebirth. It is the deepest, most psychological sector of the chart.",
    klineInsight: "8th House transits often create dramatic 'V-shaped' recoveries on the K-Line. It signifies deep transformation—periods where old structures break down to release massive hidden potential or shared wealth.",
    strengths: ['Psychological resilience', 'Financial inheritance', 'Deep intimacy'],
    challenges: ['Power struggles', 'Financial debt', 'Obsessive behaviors'],
  },
  {
    slug: '9th-house',
    name: '9th House',
    keyword: 'Higher Purpose',
    ruler: 'Sagittarius',
    description: "The 9th House covers higher education, philosophy, long-distance travel, and belief systems.",
    klineInsight: "When your K-Line spikes due to 9th House transits, expect expansion. This indicates prime timing for global travel, advanced education, or publishing. It's a macro-trend indicator for broadening horizons.",
    strengths: ['Optimism', 'Broad perspective', 'Academic success', 'Cultural adaptability'],
    challenges: ['Dogmatism', 'Restlessness', 'Preaching without acting'],
  },
  {
    slug: '10th-house',
    name: '10th House',
    keyword: 'Career & Status',
    ruler: 'Capricorn',
    description: "The 10th House, or Midheaven (MC), is the pinnacle of the chart. It rules your career, public image, and ultimate reputation.",
    klineInsight: "10th House transits are the most critical events for your Career K-Line. Powerful aspects here correlate with the highest momentum peaks in your life—timing promotions, public recognition, and status shifts.",
    strengths: ['Professional ambition', 'Public authority', 'Strategic success'],
    challenges: ['Workaholism', 'Public scandals', 'Authoritarian tendencies'],
  },
  {
    slug: '11th-house',
    name: '11th House',
    keyword: 'Community',
    ruler: 'Aquarius',
    description: "The 11th House governs friendships, large networks, hopes, and dreams. It is the collective energy and your role within groups.",
    klineInsight: "An active 11th House signifies a peak in social capital. Your K-Line algorithm sees this as a high-leverage period where networking, community building, and internet-based projects yield massive ROI.",
    strengths: ['Vast network', 'Innovative ideas', 'Humanitarian focus'],
    challenges: ['Feeling alienated', 'Groupthink', 'Unreliable associates'],
  },
  {
    slug: '12th-house',
    name: '12th House',
    keyword: 'Subconscious',
    ruler: 'Pisces',
    description: "The 12th House rules the hidden world: the subconscious, spirituality, secrets, and institutional isolation.",
    klineInsight: "The 12th House often represents the lowest 'friction' points on the K-Line. Major transits here dictate highly introspective, resting periods. The K-Line algorithm advises against launching projects here; instead, it's a protective phase for inner work.",
    strengths: ['Deep intuition', 'Spiritual wisdom', 'Compassion', 'Hidden talents'],
    challenges: ['Self-sabotage', 'Escapism', 'Hidden enemies', 'Isolation'],
  }
];
