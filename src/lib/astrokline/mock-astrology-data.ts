export interface PlanetPlacement {
  sign: string;
  degree: number;
  minute: number;
  house: number;
  name?: string;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  sun: PlanetPlacement;
  moon: PlanetPlacement;
  rising: PlanetPlacement;
  planets: PlanetPlacement[]; // Added for full chart
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  lifePathNumber: number;
  overallAverageScore: number;
}

export const MOCK_USER_PROFILE: UserProfile = {
  name: "Alexander",
  birthDate: "1993-10-24",
  birthTime: "14:30",
  birthLocation: "Los Angeles, CA",
  sun: { sign: "Scorpio", degree: 1, minute: 22, house: 8 },
  moon: { sign: "Pisces", degree: 14, minute: 5, house: 1 },
  rising: { sign: "Capricorn", degree: 28, minute: 40, house: 1 },
  planets: [
    { sign: "Scorpio", degree: 1, minute: 22, house: 8, name: "Sun" },
    { sign: "Pisces", degree: 14, minute: 5, house: 1, name: "Moon" },
    { sign: "Scorpio", degree: 15, minute: 10, house: 8, name: "Mercury" },
    { sign: "Libra", degree: 29, minute: 1, house: 8, name: "Venus" },
    { sign: "Scorpio", degree: 6, minute: 40, house: 8, name: "Mars" },
    { sign: "Libra", degree: 24, minute: 30, house: 8, name: "Jupiter" },
    { sign: "Aquarius", degree: 23, minute: 15, house: 2, name: "Saturn" },
    { sign: "Capricorn", degree: 18, minute: 5, house: 1, name: "Uranus" },
    { sign: "Capricorn", degree: 18, minute: 55, house: 1, name: "Neptune" },
    { sign: "Scorpio", degree: 24, minute: 20, house: 8, name: "Pluto" },
  ],
  elements: { fire: 15, earth: 45, air: 5, water: 35 },
  modalities: { cardinal: 50, fixed: 30, mutable: 20 },
  lifePathNumber: 7,
  overallAverageScore: 84,
};

export interface RadarData {
  dimension: string; // The UI label (e.g. Wealth, Love)
  score: number;     // 1 to 100
  fullMark: number;  // 100
  house: string;     // Astrological mapping (e.g. 2nd House / Jupiter)
  description: string;
}

export const MOCK_RADAR_DATA: RadarData[] = [
  { dimension: "Personality", score: 85, fullMark: 100, house: "1st House / Sun", description: "Magnetic, driven, and highly independent. Your core ego is a powerhouse of ambition." },
  { dimension: "Career", score: 92, fullMark: 100, house: "10th House / Midheaven", description: "Born for leadership. Public recognition and authority come naturally when you align with your purpose." },
  { dimension: "Wealth", score: 88, fullMark: 100, house: "2nd House / Jupiter", description: "Strong potential for asset generation. Your relationship with sudden gains requires disciplined structuring." },
  { dimension: "Relationships", score: 65, fullMark: 100, house: "7th House / Venus", description: "Karmic lessons in partnerships. Growth comes through vulnerability and breaking repeating relationship cycles." },
  { dimension: "Family", score: 78, fullMark: 100, house: "4th House / Moon", description: "Deeply rooted ancestral connections. Your home environment acts as a profound sanctuary for regeneration." },
  { dimension: "Health", score: 82, fullMark: 100, house: "6th House / Mars", description: "Robust constitutional vitality, but susceptible to stress-induced burnout. Requires strict daily rituals." },
  { dimension: "Lucky Elements", score: 95, fullMark: 100, house: "Jupiter / 9th House", description: "Sudden expansion when traveling or learning. Your fortunate colors lean towards deep obsidians and golds." },
];

export interface DestinyScorePoint {
  year: number;
  score: number;
  stage: string;       // e.g. "Grounding", "Expansion"
  energyLevel: "Low" | "Medium" | "High" | "Very High";
  isCrossroads?: boolean;
  isPeak?: boolean;
  explanation?: string; // Rich astrological analysis for hover
}

export const MOCK_KLINE_DATA: DestinyScorePoint[] = [
  { year: 2021, score: 65, stage: "Grounding", energyLevel: "Low", isCrossroads: false, isPeak: false, explanation: "Saturn transits the 4th house. A time of inner restructuring and building foundational security. External progress feels slow." },
  { year: 2022, score: 72, stage: "Emergence", energyLevel: "Medium", isCrossroads: false, isPeak: false, explanation: "Jupiter enters the 5th house. Creative energies awaken. A steady period of self-expression and new romantic potentials." },
  { year: 2023, score: 61, stage: "Friction", energyLevel: "Low", isCrossroads: true, isPeak: false, explanation: "Uranus squares the Midheaven. Sudden disruptions in career path forcing a necessary pivot. Highly unstable but necessary." },
  { year: 2024, score: 85, stage: "Expansion", energyLevel: "High", isCrossroads: false, isPeak: false, explanation: "Pluto trine Sun. Deep personal empowerment. Strategic moves made now will have long-lasting, profound returns." },
  { year: 2025, score: 94, stage: "The Zenith", energyLevel: "Very High", isCrossroads: false, isPeak: true, explanation: "Jupiter conjunct Midheaven. The Golden Era. Unprecedented public visibility, career triumphs, and material manifestation." },
  { year: 2026, score: 88, stage: "Harvest", energyLevel: "High", isCrossroads: false, isPeak: false, explanation: "Maintaining altitude. Focusing on consolidating wealth and stabilizing the rapid growth from the previous year." },
  { year: 2027, score: 75, stage: "Restructuring", energyLevel: "Medium", isCrossroads: true, isPeak: false, explanation: "Nodes axis shifts to 1st/7th house. A critical juncture for partnerships and relationship dynamics. Ending outgrown contracts." },
  { year: 2028, score: 79, stage: "Steady Growth", energyLevel: "Medium", isCrossroads: false, isPeak: false, explanation: "Saturn in harmonious aspect. Slow, disciplined, and highly rewarding progress. Building lasting structures." },
  { year: 2029, score: 91, stage: "Second Peak", energyLevel: "High", isCrossroads: false, isPeak: true, explanation: "Return of Jupiter. A second wave of massive expansion, particularly in foreign affairs, higher learning, or publishing." },
  { year: 2030, score: 84, stage: "Integration", energyLevel: "High", isCrossroads: false, isPeak: false, explanation: "Integrating the lessons of the decade. A philosophical and deeply spiritually rewarding period." },
];

export interface TransitEvent {
  id: string;
  year: number;
  title: string;
  theme: "Career" | "Love" | "Wealth" | "Growth";
  description: string;
  impactScore: number;
  planet: string;
  aspect: string;
  advice: string;
  phase?: "Applying" | "Exact" | "Separating";
}

export const MOCK_TRANSIT_DETAILS: Record<number, TransitEvent[]> = {
  2023: [
    {
      id: "t-2023-1",
      year: 2023,
      title: "The Crucible of Ambition",
      theme: "Career",
      description: "Uranus strongly squares your Midheaven, creating sudden friction with authority figures. The structures you relied on are shaken, forcing you to reconsider your true professional calling.",
      impactScore: 9,
      planet: "Uranus",
      aspect: "Square",
      advice: "Do not resist the structural changes occurring in your workplace. The friction is a signal to pivot towards independence rather than climbing a broken ladder.",
      phase: "Applying",
    }
  ],
  2024: [
    {
      id: "t-2024-1",
      year: 2024,
      title: "Plutonic Empowerment",
      theme: "Growth",
      description: "As Pluto forms a supportive trine to your Sun, you step into a profound sense of personal power. The trials of the previous year have hardened your resolve, allowing you to manipulate circumstances to your advantage.",
      impactScore: 8,
      planet: "Pluto",
      aspect: "Trine",
      advice: "Now is the time for strategic moves. People in power are receptive to your ideas. Consolidate your influence quietly.",
      phase: "Exact",
    }
  ],
  2025: [
    {
      id: "t-2025-1",
      year: 2025,
      title: "The Golden Era",
      theme: "Wealth",
      description: "Jupiter, the planet of expansion, makes a perfect trine to your career sector. Years of unseen hard work finally culminate in public recognition and material growth.",
      impactScore: 10,
      planet: "Jupiter",
      aspect: "Trine",
      advice: "Do not play small. Ask for the promotion, raise your rates, and launch publicly. The cosmic wind is entirely at your back.",
      phase: "Separating",
    }
  ],
  2026: [
    {
      id: "t-2026-1",
      year: 2026,
      title: "Consolidation & Wealth Structuring",
      theme: "Wealth",
      description: "After the massive expansion of the previous year, Saturn helps you structure your gains. It's time to build a long-lasting financial fortress rather than chasing the next big hit.",
      impactScore: 8,
      planet: "Saturn",
      aspect: "Sextile",
      advice: "Invest in solid assets. Lock in your profits from last year and establish rigid boundaries around your time and capital.",
      phase: "Applying",
    }
  ]
};

export interface DestinyReading {
  structure: {
    title: string;
    element: string;
    description: string;
    coreChallenge: string;
  };
  phase: {
    title: string;
    whyStuck: string;
    turningPoint: string;
    momentum: number;
  };
  advice: {
    career: string;
    wealth: string;
    relationships: string;
  };
}

export const MOCK_DESTINY_READING: DestinyReading = {
  structure: {
    title: "Deep Earth Pattern with Hidden Fire",
    element: "Earth Dominant / Weak Air",
    description: "Your chart is heavily anchored in Earth, giving you immense capacity for long-term endurance and material creation. You are a 'builder' archetype. However, you lack Air (wind), meaning you often struggle to communicate your value or pivot quickly. You wait for things to come to you rather than initiating the right conversations.",
    coreChallenge: "Over-preparation leading to missed timing. You need to launch before you feel 100% ready.",
  },
  phase: {
    title: "The Pressure Cooker (Pre-Breakthrough)",
    whyStuck: "For the past 18 months, Saturn has been grinding over your natal Moon. This forced an internal restructuring. You felt 'stuck' because the universe was demanding emotional maturity, not external action. Pushing outward during this time only caused exhaustion.",
    turningPoint: "October 14th, 2024. Jupiter crosses your Midheaven. The waiting period officially ends.",
    momentum: 85,
  },
  advice: {
    career: "Do not switch industries right now. You are inches away from a breakthrough in your current field. Focus on consolidating your existing achievements and making your unique value highly visible to decision-makers.",
    wealth: "Avoid speculative or high-risk investments this quarter. Cash flow is stabilizing. A significant, unexpected partnership opportunity in late Q3 will offer a substantial wealth multiplier. Wait for it.",
    relationships: "Friction at home is a reflection of your own internal pressure. Stop trying to 'fix' your partner. Give them space, and focus that relentless energy on your upcoming professional launch."
  }
};

export interface Next30DaysGuidance {
  theme: string;
  moonPhase: string;
  dos: string[];
  donts: string[];
}

export const MOCK_NEXT_30_DAYS: Next30DaysGuidance = {
  theme: "Radical Decluttering & Preparation",
  moonPhase: "Waning Crescent to New Moon in Scorpio",
  dos: [
    "Pitch your boldest idea to leadership on the 14th.",
    "Sign long-term contracts related to real estate or tech.",
    "Declutter your workspace to unblock stagnant Earth energy."
  ],
  donts: [
    "Do not react to emotional provocations from older family members.",
    "Avoid launching new consumer-facing products before the 22nd.",
    "Lend money to friends—it will sever the karmic tie permanently."
  ]
};
