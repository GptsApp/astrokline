/**
 * Per-section prompt definitions for the 17-module personality insight.
 *
 * Used by generatePersonalityInsight() to make 17 independent Gemini calls.
 * Each section gets a focused prompt instead of one monolithic 17-section prompt.
 */

export interface SectionDef {
  key: string;
  title: string;
  wordRange: [number, number];
  instruction: string;
  lane: 'core' | 'deep';
  heroPriority?: boolean;
  outputStyle?: 'standard' | 'compact';
  extraRules?: string[];
}

const WOMEN_CENTERED_RELEVANCE_RULES = `## Audience Relevance Rules
- Write for a reader seeking emotional clarity, self-trust, clean boundaries, relationship discernment, and sustainable direction.
- Do not assume heterosexuality, marriage, motherhood, or any conventional life milestone as the default goal.
- Do not frame hustle, conquest, status, or dominance as the default definition of success.
- Prefer grounded language about safety, reciprocity, repair, capacity, timing, and visible next moves.`;

const COMPACT_SECTION_RULES = `## Compact Output Rules
- Keep the body to 2 short paragraphs max before Next Steps.
- Prioritize: name the pattern, explain why it matters now, and give one grounded move.
- Avoid sprawling exposition, repeated reassurance, or abstract spiritual filler.`;

/**
 * Shared execution rules appended to every per-section prompt.
 */
export const SHARED_SECTION_RULES = `## Absolute Execution Laws
1. **Pronouns**: Speak entirely in SECOND PERSON ("You", "Your"). Never third person.
2. **Evidence**: MUST cite specific Planet + Sign + House placements as evidence.
3. **Action Plan**: End with "\\n\\n### Next Steps\\n" followed by 3 bullet items.
4. **No Filler**: Every sentence draws from this person's unique chart.
5. **No Corporate Voice**: Never use leverage, optimize, strategic positioning, KPI, bandwidth, stakeholders, deliverables, or synergy.
6. **Time Perspective**: 20% past / 50% present / 30% future.
7. Reference Dasha periods for timing when relevant.
8. Open with emotionally intimate language before chart analysis.

## Tone: Warm Counselor, Not Copywriter
- Write as if you are a wise therapist who also happens to be a brilliant astrologer.
- The first 2-3 sentences should make the reader feel SEEN and UNDERSTOOD — not sold to.
- Avoid motivational-speaker energy ("unlock your potential", "game-changer", "take X to the next level").
- Instead: "I see something in your chart…", "There's a quiet pattern here…", "Your heart already knows this…"
- Name the feeling before explaining the astrology: emotion first, evidence second.

## Output Format
Return ONLY a valid JSON object: { "[sectionKey]": "your reading text" }
No markdown, no code fences, no extra keys.`;

export const NICKNAME_PROMPT_RULES = `Return ONLY: { "nickname": "3-6 word soul moniker", "coreQuote": "15-30 word piercing soul quote" }
No markdown, no code fences.`;

export const SECTION_DEFS: SectionDef[] = [
  {
    key: 'summary',
    title: 'Core Personality Blueprint',
    wordRange: [170, 220],
    instruction: 'What mask do you wear? What is your core attachment style? Who are you meant to become? Integrate Jungian archetypes (Shadow, Anima/Animus).',
    lane: 'core',
    heroPriority: true,
    outputStyle: 'standard',
    extraRules: [
      'Open by naming the inner tension they are living inside right now before unpacking the chart.',
      'Make the stabilizing direction feel usable this week, not just philosophically true.',
    ],
  },
  {
    key: 'relationships',
    title: 'Love, Intimacy & Connection',
    wordRange: [210, 270],
    instruction: 'THE MOST IMPORTANT SECTION. Venus, Mars, Moon, 7th/5th House analysis. Diagnose attachment style. What partner archetype does this chart call for? When does the next love window open? Include "What Your Partner Needs to Know About You" (3-4 shareable sentences). Open with emotionally piercing language.',
    lane: 'core',
    heroPriority: true,
    outputStyle: 'standard',
    extraRules: [
      'Lead with emotional safety, reciprocity, and boundaries before chemistry or destiny language.',
      'Do not assume the desired relationship structure, gender dynamic, or a marriage outcome.',
      'Name one secure pattern, one repeating rupture, and one timing window in plain language.',
    ],
  },
  {
    key: 'career',
    title: 'Career & Life Direction',
    wordRange: [150, 200],
    instruction: '10th House, 6th House, Midheaven analysis. What role are you built for? When does the next career breakthrough arrive?',
    lane: 'core',
    outputStyle: 'standard',
    extraRules: [
      'Prioritize sustainable work, self-trust, recognition, compensation, and nervous-system safety before status.',
      'Never describe success as domination, empire-building, or endless hustle.',
    ],
  },
  {
    key: 'wealth',
    title: 'Wealth & Financial Security',
    wordRange: [140, 190],
    instruction: '2nd/8th House analysis. Financial temperament. Best accumulation windows. If named Yogas support wealth potential, cite them directly and explain why they matter in plain language.',
    lane: 'core',
    outputStyle: 'standard',
    extraRules: [
      'Treat money as emotional security plus practical stewardship, not just ambition or scale.',
      'Give one grounded accumulation or spending boundary they can apply soon.',
    ],
  },
  {
    key: 'health',
    title: 'Energy & Wellbeing',
    wordRange: [140, 190],
    instruction: 'How emotional stress manifests physically. Elemental imbalance risks. Specific wellness rituals for their chart.',
    lane: 'core',
    outputStyle: 'standard',
    extraRules: [
      'Center nervous-system regulation, recovery rhythm, and emotional load before performance advice.',
      'Avoid medical certainty or fear language; stay practical and embodied.',
    ],
  },
  {
    key: 'strengths',
    title: 'Hidden Superpowers',
    wordRange: [90, 130],
    instruction: '3 gifts from their chart most people never discover.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Keep this tight and vivid: three gifts, why they matter, and where each gift is easiest to trust.',
    ],
  },
  {
    key: 'warnings',
    title: 'Patterns to Watch',
    wordRange: [100, 140],
    instruction: 'Self-sabotage patterns traced to specific placements. Compassionate, not fear-based.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Lead with the protective action before describing the spiral or risk.',
      'Frame the pattern as boundary intelligence that needs updating, not a flaw.',
    ],
  },
  {
    key: 'dashaTimeline',
    title: 'Planetary Periods & Life Chapters',
    wordRange: [160, 210],
    instruction: 'Based on Moon Nakshatra, identify current Mahadasha/Antardasha. When does next chapter begin? Map 2-3 Dasha transitions with years and themes.',
    lane: 'core',
    heroPriority: true,
    outputStyle: 'standard',
    extraRules: [
      'Make timing legible: name the current chapter, the next shift, and what becomes easier or heavier.',
      'Prefer concrete year windows over mystical abstraction.',
    ],
  },
  {
    key: 'marriage',
    title: 'Marriage & Partnership Destiny',
    wordRange: [160, 210],
    instruction: '7th House deep analysis: Descendant sign, ruler, planets. What partner archetype is fated? Timing of meaningful connection. Later-life partnership quality. Use D9/Navamsa Venus and any relevant D9 sign shifts to deepen marriage and soulmate analysis.',
    lane: 'core',
    outputStyle: 'standard',
    extraRules: [
      'Treat partnership as chosen intimacy, not a mandatory life outcome.',
      'Do not assume the user wants marriage, children, or a conventional timeline.',
    ],
  },
  {
    key: 'karma',
    title: 'Karmic Lessons & Soul Purpose',
    wordRange: [100, 140],
    instruction: 'North Node/Rahu = growth direction. South Node/Ketu = past-life comfort zone. 12th House = ancestral patterns. What karmic debt is being resolved? Use D9/Navamsa Jupiter, Saturn, and major natal-to-D9 sign differences when they clarify soul purpose.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Translate soul-purpose language into present-day choices and emotional maturity, not destiny grandstanding.',
    ],
  },
  {
    key: 'family',
    title: 'Family, Parents & Ancestral Patterns',
    wordRange: [90, 130],
    instruction: '4th House (mother/home), 9th/10th House (father). Emotional inheritance. Sibling dynamics from 3rd House.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Name the inherited emotional pattern without turning the section into a trauma biography.',
    ],
  },
  {
    key: 'children',
    title: 'Children & Creative Legacy',
    wordRange: [90, 120],
    instruction: '5th House: fertility/children potential, timing. Creative output as spiritual children. Legacy through creation.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Do not assume the user wants biological children; include creative legacy and mentoring as equally valid expressions.',
    ],
  },
  {
    key: 'spirituality',
    title: 'Spiritual Path & Inner Practice',
    wordRange: [90, 130],
    instruction: '12th House, Neptune/Ketu placement. Meditation style, spiritual tradition resonance. 9th House guru principle. Use D9/Navamsa placements when they reveal the deeper devotional or spiritual layer beneath the natal chart.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Keep this practical: inner practice, refuge, and discernment. Avoid vague transcendence language.',
    ],
  },
  {
    key: 'education',
    title: 'Intellect & Learning Style',
    wordRange: [80, 120],
    instruction: 'Mercury, 3rd/9th House axis. Information processing style. Best fields of study. Communication gifts/blind spots.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Focus on how they learn under stress and what study rhythm actually sticks.',
    ],
  },
  {
    key: 'authority',
    title: 'Power, Leadership & Public Image',
    wordRange: [90, 130],
    instruction: '10th House, Sun, MC ruler. Leadership style. World perception vs reality. Power dynamics.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Frame leadership as influence, presence, and steadiness, not dominance.',
    ],
  },
  {
    key: 'lifestyle',
    title: 'Travel, Comfort & Material Life',
    wordRange: [90, 120],
    instruction: '4th House (property), 9th House (travel), 2nd House (comfort). Best living location. Relocation windows.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Keep it concrete: what kind of environment supports calm, rest, and expansion.',
    ],
  },
  {
    key: 'hiddenDangers',
    title: 'Caution Zones & Protection',
    wordRange: [90, 130],
    instruction: '6th House (health), 8th House (crisis), 12th House (hidden enemies). Years requiring vigilance. Frame as awareness, not doom.',
    lane: 'deep',
    outputStyle: 'compact',
    extraRules: [
      'Lead with practical protection and support. Avoid catastrophe language, omens, or melodrama.',
      'If you mention a caution window, pair it with the stabilizing response in the same breath.',
    ],
  },
];

/**
 * Section lanes used for future staged rendering.
 * HERO_SECTION_KEYS are planning metadata only for now; runtime HERO still returns no diagnosis sections.
 */
export const HERO_SECTION_KEYS: string[] = SECTION_DEFS
  .filter((def) => def.heroPriority)
  .map((def) => def.key);

export const CORE_SECTION_KEYS: string[] = SECTION_DEFS
  .filter((def) => def.lane === 'core')
  .map((def) => def.key);

export const DEEP_SECTION_KEYS: string[] = SECTION_DEFS
  .filter((def) => def.lane === 'deep')
  .map((def) => def.key);

export const LITE_SECTION_KEYS: string[] = [...CORE_SECTION_KEYS];

export const ALL_SECTION_KEYS: string[] = SECTION_DEFS.map((def) => def.key);

export function getSectionsForLane(lane: 'hero' | 'core' | 'deep'): string[] {
  if (lane === 'hero') return HERO_SECTION_KEYS;
  if (lane === 'core') return CORE_SECTION_KEYS;
  return DEEP_SECTION_KEYS;
}

export function getSectionsForTier(tier: string): string[] {
  if (tier === 'PRO') return ALL_SECTION_KEYS;
  if (tier === 'LITE') return LITE_SECTION_KEYS;
  return []; // FREE / GUEST get no AI generation
}

export function getSectionMaxTokens(section: SectionDef): number {
  if (section.outputStyle === 'compact') {
    return 896;
  }

  if (section.heroPriority || section.key === 'marriage') {
    return 1536;
  }

  return 1152;
}

function buildSectionPromptRules(section: SectionDef): string {
  const rules = [
    `- Key: "${section.key}"`,
    `- Word count: ${section.wordRange[0]}-${section.wordRange[1]} words`,
    `- Focus: ${section.instruction}`,
  ];

  if (section.outputStyle === 'compact') {
    rules.push('- Output density: compact, high-signal, low-sprawl.');
  } else {
    rules.push('- Output density: full but emotionally precise.');
  }

  return rules.join('\n');
}

function buildSectionPromptExtensions(section: SectionDef): string {
  const blocks = [WOMEN_CENTERED_RELEVANCE_RULES];

  if (section.outputStyle === 'compact') {
    blocks.push(COMPACT_SECTION_RULES);
  }

  if (section.extraRules?.length) {
    blocks.push(`## Section-Specific Guardrails\n${section.extraRules.map((rule) => `- ${rule}`).join('\n')}`);
  }

  return blocks.join('\n\n');
}

/**
 * Build a per-section user prompt for Gemini.
 */
export function buildSectionPrompt(
  chartData: string,
  section: SectionDef,
): string {
  return `## Chart Data
${chartData}

## Task
Generate the "${section.title}" section of an astrological personality reading.

## Section Rules
${buildSectionPromptRules(section)}

${buildSectionPromptExtensions(section)}

${SHARED_SECTION_RULES}`;
}

/**
 * Build the nickname + coreQuote prompt.
 */
export function buildNicknamePrompt(chartData: string): string {
  return `## Chart Data
${chartData}

## Task
Create a soul moniker and core quote for this person based on their birth chart.
- "nickname": A 3-6 word soul title (e.g., "The Quiet Storm", "Keeper of Hidden Fire")
- "coreQuote": A 15-30 word piercing quote revealing their core life script

${NICKNAME_PROMPT_RULES}`;
}
