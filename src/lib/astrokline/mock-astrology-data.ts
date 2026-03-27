export interface PlanetPlacement {
  sign: string;
  degree: number;
  minute: number;
  house: number;
  name?: string;
  symbol?: string;
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
  name: 'Alexander',
  birthDate: '1993-10-24',
  birthTime: '14:30',
  birthLocation: 'Los Angeles, CA',
  sun: { sign: 'Scorpio', degree: 1, minute: 22, house: 8 },
  moon: { sign: 'Pisces', degree: 14, minute: 5, house: 1 },
  rising: { sign: 'Capricorn', degree: 28, minute: 40, house: 1 },
  planets: [
    {
      sign: 'Scorpio',
      degree: 1,
      minute: 22,
      house: 8,
      name: 'Sun',
      symbol: '☉',
    },
    {
      sign: 'Pisces',
      degree: 14,
      minute: 5,
      house: 1,
      name: 'Moon',
      symbol: '☽',
    },
    {
      sign: 'Scorpio',
      degree: 15,
      minute: 10,
      house: 8,
      name: 'Mercury',
      symbol: '☿',
    },
    {
      sign: 'Libra',
      degree: 29,
      minute: 1,
      house: 8,
      name: 'Venus',
      symbol: '♀',
    },
    {
      sign: 'Scorpio',
      degree: 6,
      minute: 40,
      house: 8,
      name: 'Mars',
      symbol: '♂',
    },
    {
      sign: 'Libra',
      degree: 24,
      minute: 30,
      house: 8,
      name: 'Jupiter',
      symbol: '♃',
    },
    {
      sign: 'Aquarius',
      degree: 23,
      minute: 15,
      house: 2,
      name: 'Saturn',
      symbol: '♄',
    },
    {
      sign: 'Capricorn',
      degree: 18,
      minute: 5,
      house: 1,
      name: 'Uranus',
      symbol: '♅',
    },
    {
      sign: 'Capricorn',
      degree: 18,
      minute: 55,
      house: 1,
      name: 'Neptune',
      symbol: '♆',
    },
    {
      sign: 'Scorpio',
      degree: 24,
      minute: 20,
      house: 8,
      name: 'Pluto',
      symbol: '♇',
    },
  ],
  elements: { fire: 15, earth: 45, air: 5, water: 35 },
  modalities: { cardinal: 50, fixed: 30, mutable: 20 },
  lifePathNumber: 7,
  overallAverageScore: 84,
};

export interface RadarData {
  dimension: string; // The UI label (e.g. Wealth, Love)
  score: number; // 1 to 100
  fullMark: number; // 100
  house: string; // Astrological mapping (e.g. 2nd House / Jupiter)
  description: string;
}

export const MOCK_RADAR_DATA: RadarData[] = [
  {
    dimension: 'Personality',
    score: 85,
    fullMark: 100,
    house: '1st House / Sun',
    description:
      'Magnetic, driven, and highly independent. Your core ego is a powerhouse of ambition.',
  },
  {
    dimension: 'Career',
    score: 92,
    fullMark: 100,
    house: '10th House / Midheaven',
    description:
      'Born for leadership. Public recognition and authority come naturally when you align with your purpose.',
  },
  {
    dimension: 'Wealth',
    score: 88,
    fullMark: 100,
    house: '2nd House / Jupiter',
    description:
      'Strong potential for asset generation. Your relationship with sudden gains requires disciplined structuring.',
  },
  {
    dimension: 'Relationships',
    score: 65,
    fullMark: 100,
    house: '7th House / Venus',
    description:
      'Karmic lessons in partnerships. Growth comes through vulnerability and breaking repeating relationship cycles.',
  },
  {
    dimension: 'Family',
    score: 78,
    fullMark: 100,
    house: '4th House / Moon',
    description:
      'Deeply rooted ancestral connections. Your home environment acts as a profound sanctuary for regeneration.',
  },
  {
    dimension: 'Health',
    score: 82,
    fullMark: 100,
    house: '6th House / Mars',
    description:
      'Robust constitutional vitality, but susceptible to stress-induced burnout. Requires strict daily rituals.',
  },
  {
    dimension: 'Lucky Elements',
    score: 95,
    fullMark: 100,
    house: 'Jupiter / 9th House',
    description:
      'Sudden expansion when traveling or learning. Your fortunate colors lean towards deep obsidians and golds.',
  },
];

export interface DestinyScorePoint {
  year: number;
  score: number;
  stage: string; // e.g. "Grounding", "Expansion"
  energyLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  isCrossroads?: boolean;
  isPeak?: boolean;
  explanation?: string; // Rich astrological analysis for hover
}

// Generate 100-year K-Line data with clear bull/bear cycles
export function generateKlineData(birthYear: number): DestinyScorePoint[] {
  const data: DestinyScorePoint[] = [];
  const stages = [
    'Foundation',
    'Awakening',
    'Emergence',
    'Expansion',
    'Zenith',
    'Harvest',
    'Descent',
    'Valley',
    'Friction',
    'Grounding',
    'Recalibration',
    'Ascent',
    'Growth',
    'Plateau',
    'Breakthrough',
    'Consolidation',
    'Decline',
    'Restructuring',
    'Recovery',
    'Rebirth',
  ];

  // Base wave: 4-5 major bull/bear cycles across 100 years using sine compositions
  for (let age = 0; age <= 100; age++) {
    const year = birthYear + age;
    // Primary cycle ~25 years (Saturn return)
    const wave1 = Math.sin((age / 25) * Math.PI * 2) * 18;
    // Secondary cycle ~12 years (Jupiter return)
    const wave2 = Math.sin((age / 12) * Math.PI * 2 + 1.2) * 10;
    // Third cycle ~7 years (life stages)
    const wave3 = Math.sin((age / 7) * Math.PI * 2 + 0.5) * 6;
    // Subtle noise
    const noise = Math.sin(age * 3.7 + 2.1) * 4 + Math.cos(age * 2.3) * 3;

    // Age-based envelope: childhood uncertainty, prime peak, elder decline
    let envelope = 0;
    if (age < 5)
      envelope = -10 + age * 2; // shaky start
    else if (age < 20)
      envelope = age * 0.3; // youth rising
    else if (age < 45)
      envelope = 6 + (age - 20) * 0.15; // prime boost
    else if (age < 65)
      envelope = 6 - (age - 45) * 0.2; // middle descent
    else envelope = 2 - (age - 65) * 0.25; // elder decline

    const raw = 55 + wave1 + wave2 + wave3 + noise + envelope;
    const score = Math.max(25, Math.min(98, Math.round(raw)));

    const energyLevel: DestinyScorePoint['energyLevel'] =
      score >= 80
        ? 'Very High'
        : score >= 65
          ? 'High'
          : score >= 50
            ? 'Medium'
            : 'Low';

    const stageIdx = age % stages.length;
    const isPeak =
      score >= 85 && (age === 0 || (data[age - 1]?.score || 0) < score);
    const isCrossroads = Math.abs(score - 55) < 5 && age > 5 && age % 7 < 2;

    data.push({
      year,
      score,
      stage: stages[stageIdx],
      energyLevel,
      isCrossroads,
      isPeak,
      explanation: `Age ${age}: Cosmic forces shape a ${energyLevel.toLowerCase()} energy period. ${isPeak ? 'A major peak in your destiny trajectory.' : isCrossroads ? 'A critical crossroads demanding pivotal decisions.' : 'Navigating the currents of planetary influence.'}`,
    });
  }
  return data;
}

export const MOCK_KLINE_DATA: DestinyScorePoint[] = generateKlineData(1990);

export interface TransitEvent {
  id: string;
  year: number;
  title: string;
  theme: 'Career' | 'Love' | 'Wealth' | 'Growth';
  description: string;
  impactScore: number;
  planet: string;
  aspect: string;
  advice: string;
  phase?: 'Applying' | 'Exact' | 'Separating';
}

function generateAdvancedTransits(): Record<number, TransitEvent[]> {
  const details: Record<number, TransitEvent[]> = {};
  const themes: Array<'Career' | 'Love' | 'Wealth' | 'Growth'> = ['Career', 'Love', 'Wealth', 'Growth'];
  const planets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Mars', 'Venus'];
  const aspects = ['Trine', 'Square', 'Conjunction', 'Opposition', 'Sextile'];
  
  for (let year = 2023; year <= 2045; year++) {
    details[year] = [];
    for (let i = 0; i < 2; i++) {
        const theme = themes[(year + i) % themes.length];
        const planet = planets[(year + i) % planets.length];
        const aspect = aspects[(year + i) % aspects.length];
        const isPositive = ['Trine', 'Sextile', 'Conjunction'].includes(aspect);
        const score = isPositive ? (Math.floor(Math.random() * 4) + 6) : -(Math.floor(Math.random() * 4) + 6);
        
        details[year].push({
          id: `t-${year}-${i}`,
          year: year,
          title: `The ${planet} ${aspect} Phase`,
          theme: theme,
          description: `As ${planet} moves into a ${aspect} geometry with your natal placements, the ${theme} sector undergoes massive restructuring. ${isPositive ? 'This is a period of friction-less expansion. The cosmos is actively removing barriers to entry.' : 'This introduces significant cosmic friction, forcing you to shed dead weight and rebuild your foundations.'}`,
          impactScore: score,
          planet: planet,
          aspect: aspect,
          advice: isPositive ? 'Accelerate all plans. Do not wait for perfection. The universe is actively facilitating your dominance in this sphere.' : 'Consolidate and protect your core assets. Do not initiate uncalculated risks. Fall back to your foundational strengths.'
        });
    }
  }
  return details;
}

export const MOCK_TRANSIT_DETAILS: Record<number, TransitEvent[]> = generateAdvancedTransits();

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
    title: 'Deep Earth Pattern with Hidden Fire',
    element: 'Earth Dominant / Weak Air',
    description:
      "Your chart is heavily anchored in Earth, giving you immense capacity for long-term endurance and material creation. You are a 'builder' archetype. However, you lack Air (wind), meaning you often struggle to communicate your value or pivot quickly. You wait for things to come to you rather than initiating the right conversations.",
    coreChallenge:
      'Over-preparation leading to missed timing. You need to launch before you feel 100% ready.',
  },
  phase: {
    title: 'The Pressure Cooker (Pre-Breakthrough)',
    whyStuck:
      "For the past 18 months, Saturn has been grinding over your natal Moon. This forced an internal restructuring. You felt 'stuck' because the universe was demanding emotional maturity, not external action. Pushing outward during this time only caused exhaustion.",
    turningPoint:
      'October 14th, 2024. Jupiter crosses your Midheaven. The waiting period officially ends.',
    momentum: 85,
  },
  advice: {
    career:
      'Do not switch industries right now. You are inches away from a breakthrough in your current field. Focus on consolidating your existing achievements and making your unique value highly visible to decision-makers.',
    wealth:
      'Avoid speculative or high-risk investments this quarter. Cash flow is stabilizing. A significant, unexpected partnership opportunity in late Q3 will offer a substantial wealth multiplier. Wait for it.',
    relationships:
      "Friction at home is a reflection of your own internal pressure. Stop trying to 'fix' your partner. Give them space, and focus that relentless energy on your upcoming professional launch.",
  },
};

export interface Next30DaysGuidance {
  theme: string;
  moonPhase: string;
  dos: string[];
  donts: string[];
}

export const MOCK_NEXT_30_DAYS: Next30DaysGuidance = {
  theme: 'Radical Decluttering & Preparation',
  moonPhase: 'Waning Crescent to New Moon in Scorpio',
  dos: [
    'Pitch your boldest idea to leadership on the 14th.',
    'Sign long-term contracts related to real estate or tech.',
    'Declutter your workspace to unblock stagnant Earth energy.',
  ],
  donts: [
    'Do not react to emotional provocations from older family members.',
    'Avoid launching new consumer-facing products before the 22nd.',
    'Lend money to friends—it will sever the karmic tie permanently.',
  ],
};

export const MOCK_INSIGHT_DATA = {
  nickname: "The Architect of Shadow",
  coreQuote: "Your darkest frictions are merely the blueprints for your greatest expansions. Do not fear the breakdown; engineer the rebuild.",
  summary: "Your natal chart reveals a profound tension between an obsessive drive for transformation (Scorpio Sun) and a bleeding empathy that seeks to heal everything it touches (Pisces Moon). For years, you have likely oscillated between being the ruthless executor and the selfless caretaker. This internal psychological warfare has caused massive energy leaks. The universe is current forcing a systemic shutdown of your 'caretaker' routine because it is obsolete. The authority you seek externally can only be claimed when you weaponize your empathy rather than being victimized by it.\\n\\n### 🔥 The Somatic Resolution\\nYou hold tension in your lower back—a literal manifestation of carrying responsibilities that are not yours. Your first task is physiological boundary setting. If your body recoils, your answer is immediately 'No.'",
  career: "The 10th House of authority is heavily aspects by Uranus, dictating that your career will never follow a linear, traditional trajectory. You are a disruptor. Whenever you try to fit into a corporate hierarchy, your subconscious self-sabotages to break you free. You are currently in a phase of professional disillusionment, which is precisely the required precursor to entrepreneurship or extreme autonomy. Stop fighting the disruption.\\n\\n### 🔥 Master Action Plan (Next 90 Days)\\n- **Step 1 (0-14 Days): Audit Energy Leaks.** List every professional obligation you hate. Sever at least two by the 14th day.\\n- **Step 2 (15-45 Days): The Asymmetric Bet.** Launch the side project you have kept hidden. Do not perfect it. The market needs your raw chaos, not your polished conformity.\\n- **Step 3 (45-90 Days): Reclaim Authority.** Raise your prices or demand the title change. If denied, walk away. Your chart demands leverage.",
  relationships: "With Venus in Libra but heavily squared by Pluto, your romantic life is a battlefield of intense karmic contracts. You attract partners who are either intensely controlling or profoundly broken. You subconsciously use relationships to work through your own power dynamics. The illusion is that you need a partner to feel balanced; the reality is you use partners to avoid looking at your own massive reservoir of unexpressed rage.\\n\\n### 🔥 Attachment Style Resolution\\n- **Step 1:** Recognize the 'Savior Trap'. Before agreeing to help a partner, wait 24 hours. Let them sit in their anxiety.\\n- **Step 2:** Express the taboo. Have the terrifying conversation you have been avoiding. The relationship will either authentically deepen or cleanly break. Both outcomes are victories.\\n- **Step 3:** Re-center on self-worship. Reclaim the energy you endlessly pour into others' cups.",
  wealth: "Your 2nd House of material security is locked in Saturnian delay. This means wealth for you is not a sudden lottery win, but an inevitable fortress built brick by brick. You possess immense financial anxiety, rooted not in a lack of money, but a lack of control over time. The breakthrough occurs when you stop trading hours for dollars and start trading your unique psychological insight for equity.\\n\\n### 🔥 The Wealth Structuring Protocol\\n- **Step 1:** Establish the 'F*** You' Fund. You need exactly 6 months of absolute baseline survival cash. Until this is full, you cannot make clear decisions.\\n- **Step 2:** Decouple time and income. Identify one skill you possess that can be productized or scaled via leverage (code, capital, or media).\\n- **Step 3:** Perform a brutal audit of recurring expenses that serve your ego rather than your true joy.",
  health: "The intense Scorpio/Pisces water energy makes your nervous system highly porous. You absorb the psychic trash of everyone around you. What you label as 'fatigue' is actually energetic toxicity. You need radical, non-negotiable isolation periods to flush your system.\\n\\n### 🔥 Energetic Purification\\n- **Step 1:** Implement a strict digital sunset 90 minutes before sleep. No exceptions.\\n- **Step 2:** Engage in intense, heavy resistance training. Your watery chart needs the physical grounding of moving heavy objects to anchor your spirit in reality.\\n- **Step 3:** Solitary water therapy. Epsom salt baths or silent swimming to physically represent the cleansing of external emotional residue.",
  strengths: "1. **Penetrating Intuition:** You can read a room's hidden motives within 30 seconds. Use this in negotiations.\\n2. **crisis Management:** While others panic, your Scorpio Sun thrives in the dark. You are the definitive anchor in chaos.\\n3. **Radical Adaptability:** Your mutable Moon allows you to seamlessly shift strategies when the current paradigm fails.",
  warnings: "Your greatest fatal blindspot is **Martyrization**. The moment you feel self-pity, you have lost. T-Squares in your chart warn against retreating into isolation when misunderstood. You must relentlessly force yourself to communicate your unmet needs rather than withdrawing and punishing others with silence."
};
