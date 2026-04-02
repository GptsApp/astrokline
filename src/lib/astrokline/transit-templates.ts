/**
 * Transit Templates — P1/P2/P3 Precision Upgrade
 * 50+ title templates, description variants, planet-aware advice
 */

type Theme = 'Career' | 'Wealth' | 'Love' | 'Growth';
type Aspect = 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';

interface TargetInfo {
  name: string;
  sign: string;
  house: number;
}

// ─── P1: 50+ TITLE TEMPLATES ───
// Key: `${planet}-${aspect}` or `${planet}-${aspect}-${theme}`

const TITLE_MAP: Record<string, string[]> = {
  // ── Jupiter (benefic) ──
  'Jupiter-Conjunction': [
    'Jupiter Crowns Your ${target} with Expansion',
    'The Great Benefic Ignites Your ${target}',
    'Jupiter Supercharges Your ${theme} Potential',
  ],
  'Jupiter-Trine': [
    'Jupiter Opens Your ${theme} Window',
    'A Golden Corridor Activates in ${theme}',
    'Jupiter Blesses Your ${target} Trajectory',
  ],
  'Jupiter-Sextile': [
    'Jupiter Offers a ${theme} Opportunity',
    'A Quiet Jupiter Gift Ripens in ${theme}',
    'Jupiter Whispers Possibility to Your ${target}',
  ],
  'Jupiter-Square': [
    'Jupiter Delivers a ${theme} Growth Spurt',
    'Overexpansion Risk Meets ${theme} Ambition',
    'Jupiter Tests Your ${theme} Boundaries',
  ],
  'Jupiter-Opposition': [
    'Jupiter Challenges Your ${theme} Perspective',
    'A ${theme} Mirror Reflects What Needs Changing',
    'Jupiter Demands ${theme} Recalibration',
  ],

  // ── Saturn (taskmaster) ──
  'Saturn-Conjunction': [
    'Saturn Restructures Your ${target} Foundation',
    'The Great Teacher Arrives at Your ${target}',
    'Saturn Demands ${theme} Mastery',
  ],
  'Saturn-Trine': [
    'Saturn Rewards Your ${theme} Discipline',
    'Structural Maturity Pays Off in ${theme}',
    'Saturn Validates Your ${target} Effort',
  ],
  'Saturn-Sextile': [
    'Saturn Opens a Disciplined ${theme} Path',
    'Quiet Authority Builds Around ${theme}',
    'Saturn Offers a ${theme} Blueprint',
  ],
  'Saturn-Square': [
    'Saturn Tests the ${theme} Structure',
    'A ${theme} Pressure Point Demands Resolution',
    'Saturn Exposes ${theme} Weak Links',
  ],
  'Saturn-Opposition': [
    'Saturn Forces a ${theme} Reckoning',
    'The ${theme} Accountability Moment Arrives',
    'Saturn Mirrors Your ${theme} Limitations',
  ],

  // ── Uranus (rebel) ──
  'Uranus-Conjunction': [
    'Uranus Detonates a ${theme} Revolution',
    'Lightning Strikes Your ${target} Identity',
    'Uranus Rewires Your ${theme} Operating System',
  ],
  'Uranus-Trine': [
    'Uranus Sparks a ${theme} Breakthrough',
    'An Electrifying ${theme} Innovation Window Opens',
    'Uranus Liberates Your ${target} Expression',
  ],
  'Uranus-Sextile': [
    'Uranus Invites ${theme} Experimentation',
    'A Subtle Revolution Stirs in ${theme}',
    'Uranus Cracks Open a ${theme} Possibility',
  ],
  'Uranus-Square': [
    'Uranus Disrupts Your ${theme} Status Quo',
    'A ${theme} Earthquake Demands Adaptation',
    'Uranus Breaks ${theme} Patterns That No Longer Serve',
  ],
  'Uranus-Opposition': [
    'Uranus Forces a ${theme} Identity Crisis',
    'The Freedom-Security Axis Erupts in ${theme}',
    'Uranus Shatters Your ${theme} Comfort Zone',
  ],

  // ── Neptune (mystic) ──
  'Neptune-Conjunction': [
    'Neptune Dissolves ${theme} Boundaries',
    'A Spiritual Fog Descends on Your ${target}',
    'Neptune Initiates a ${theme} Awakening',
  ],
  'Neptune-Trine': [
    'Neptune Softens Your ${target} Lens',
    'Intuition Deepens Around ${theme} Decisions',
    'Neptune Infuses ${theme} with Creative Vision',
  ],
  'Neptune-Sextile': [
    'Neptune Whispers ${theme} Inspiration',
    'A Gentle Spiritual Current Touches ${theme}',
    'Neptune Opens Your ${theme} Imagination',
  ],
  'Neptune-Square': [
    'Neptune Fog Touches ${theme} Clarity',
    'Illusion vs Reality: A ${theme} Test',
    'Neptune Blurs the ${theme} Map',
  ],
  'Neptune-Opposition': [
    'Neptune Challenges ${theme} Perception',
    'A ${theme} Disillusionment Clears the Path',
    'Neptune Reveals What Was Hidden in ${theme}',
  ],

  // ── Pluto (transformer) ──
  'Pluto-Conjunction': [
    'Pluto Forces a ${theme} Reset',
    'A Once-in-a-Lifetime ${theme} Transformation',
    'Pluto Incinerates and Rebirths Your ${target}',
  ],
  'Pluto-Trine': [
    'Pluto Empowers Your ${theme} Evolution',
    'Deep Power Surfaces in ${theme} Territory',
    'Pluto Fuels Unstoppable ${theme} Momentum',
  ],
  'Pluto-Sextile': [
    'Pluto Offers a ${theme} Power Upgrade',
    'Hidden ${theme} Leverage Becomes Available',
    'Pluto Quietly Strengthens Your ${target}',
  ],
  'Pluto-Square': [
    'Pluto Triggers a ${theme} Power Struggle',
    'Control vs Surrender: A ${theme} Crucible',
    'Pluto Exposes ${theme} Shadow Dynamics',
  ],
  'Pluto-Opposition': [
    'Pluto Demands Total ${theme} Surrender',
    'A ${theme} Death-and-Rebirth Cycle Peaks',
    'Pluto Confronts Your ${theme} Deepest Fear',
  ],
};

export function getTransitTitle(
  planet: string,
  aspect: string,
  theme: Theme,
  target: TargetInfo,
  year: number
): string {
  const key = `${planet}-${aspect}`;
  const templates = TITLE_MAP[key];
  if (!templates?.length) {
    return `${planet} ${aspect} Your ${target.name}`;
  }
  // Deterministic selection based on year for consistency
  const idx = year % templates.length;
  return templates[idx]
    .replace(/\$\{target\}/g, target.name)
    .replace(/\$\{theme\}/g, theme);
}

// ─── P2: DESCRIPTION VARIANTS (per planet personality) ───

const DESC_OPENERS: Record<string, string[]> = {
  Jupiter: [
    'In ${year}, Jupiter — the great amplifier — moves through ${transitSign} and forms a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
    'The year ${year} carries a signature of expansion as Jupiter in ${transitSign} activates your ${target} in ${targetSign} (House ${house}) via ${aspect}.',
    '${year} is marked by Jupiter\'s generous hand reaching across the sky from ${transitSign}, forming a ${aspect} to your natal ${target} at the ${targetSign} frequency (House ${house}).',
  ],
  Saturn: [
    'In ${year}, Saturn — the architect of permanence — transits ${transitSign} and forms a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
    'The taskmaster Saturn, moving through ${transitSign} in ${year}, locks into a ${aspect} with your ${target} in ${targetSign} (House ${house}).',
    '${year} brings Saturn\'s rigorous examination from ${transitSign}, forming a ${aspect} to your natal ${target} positioned in ${targetSign} (House ${house}).',
  ],
  Uranus: [
    'In ${year}, Uranus — the cosmic disruptor — electrifies ${transitSign} and forms a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
    'The revolutionary Uranus, charging through ${transitSign} in ${year}, creates a ${aspect} with your ${target} in ${targetSign} (House ${house}).',
    '${year} crackles with Uranian voltage from ${transitSign}, sending a ${aspect} signal to your natal ${target} in ${targetSign} (House ${house}).',
  ],
  Neptune: [
    'In ${year}, Neptune — the veiled oracle — drifts through ${transitSign} and forms a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
    'Neptune\'s ethereal current, flowing through ${transitSign} in ${year}, touches your ${target} in ${targetSign} (House ${house}) via ${aspect}.',
    '${year} carries Neptune\'s dreamy signature from ${transitSign}, creating a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
  ],
  Pluto: [
    'In ${year}, Pluto — the lord of transformation — burrows through ${transitSign} and forms a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
    'The phoenix-planet Pluto, grinding through ${transitSign} in ${year}, locks into a ${aspect} with your ${target} in ${targetSign} (House ${house}).',
    '${year} is shaped by Pluto\'s volcanic intensity from ${transitSign}, forming a ${aspect} to your natal ${target} in ${targetSign} (House ${house}).',
  ],
};

const DESC_CLOSERS: Record<string, string[]> = {
  Trine: [
    'This harmonious angle means the energy flows naturally — take advantage of what the cosmos is handing you.',
    'The trine creates a green-light corridor. Momentum builds organically when you step into it.',
  ],
  Sextile: [
    'This gentle aspect rewards initiative — the door is open but you must walk through it.',
    'The sextile offers opportunity without pressure. Strategic action converts potential into results.',
  ],
  Conjunction: [
    'The conjunction fuses transit and natal energy into one beam. This is intense, singular, and defining.',
    'When planets merge by conjunction, identity shifts follow. This year rewrites part of your operating code.',
  ],
  Square: [
    'The square creates friction that forces evolution. Resistance is the raw material for breakthrough.',
    'Squares are the engine of growth. The tension you feel is the universe demanding your next level.',
  ],
  Opposition: [
    'The opposition creates a see-saw — balancing opposing forces is the key skill this year demands.',
    'Oppositions externalize inner conflicts. What seems like an outside challenge is actually an inner recalibration.',
  ],
};

export function getTransitDescription(
  year: number,
  planet: string,
  transitSign: string,
  aspect: string,
  target: TargetInfo,
  orbDistance: number
): string {
  const openers = DESC_OPENERS[planet] || DESC_OPENERS['Jupiter'];
  const closers = DESC_CLOSERS[aspect as keyof typeof DESC_CLOSERS] || DESC_CLOSERS['Conjunction'];

  const opener = openers[year % openers.length]
    .replace(/\$\{year\}/g, String(year))
    .replace(/\$\{transitSign\}/g, transitSign)
    .replace(/\$\{aspect\}/g, aspect.toLowerCase())
    .replace(/\$\{target\}/g, target.name)
    .replace(/\$\{targetSign\}/g, target.sign)
    .replace(/\$\{house\}/g, String(target.house));

  const closer = closers[year % closers.length];
  const orbNote = orbDistance < 1
    ? `Orb ${orbDistance.toFixed(2)}° — razor-tight precision. This transit is impossible to ignore.`
    : orbDistance < 3
    ? `Orb ${orbDistance.toFixed(2)}° — strong enough to shape concrete decisions, not just background mood.`
    : `Orb ${orbDistance.toFixed(2)}° — a wider influence that colors the year's texture without dominating every day.`;

  return `${opener} ${orbNote} ${closer}`;
}

// ─── P3: PLANET-AWARE ADVICE ───

const ADVICE_MAP: Record<string, Record<string, string[]>> = {
  Jupiter: {
    positive: [
      'Jupiter is handing you a rare expansion window for ${theme}. Make the opportunity visible — publish, pitch, or renegotiate while this support lasts.',
      'The cosmos is amplifying your ${theme} signal. This is the year to aim higher than your comfort zone normally allows.',
    ],
    negative: [
      'Jupiter\'s generosity can become overextension. In ${theme}, resist the urge to say yes to everything. Strategic selection beats scattered growth.',
      'Too much Jupiter creates bloat. Trim excess commitments in ${theme} and focus on what compounds rather than what flatters.',
    ],
  },
  Saturn: {
    positive: [
      'Saturn rewards the structure you\'ve already built in ${theme}. This is maturity paying dividends — not exciting, but deeply profitable.',
      'The disciplined groundwork you\'ve laid in ${theme} is being recognized. Continue building with patience; Saturn pays permanent wages.',
    ],
    negative: [
      'Saturn is auditing your ${theme} foundation. Anything built on shortcuts will be exposed. Rebuild with integrity and the structure becomes unshakable.',
      'The pressure in ${theme} is Saturn demanding mastery over mediocrity. Cut what\'s hollow, reinforce what\'s real, and trust the slow architecture.',
    ],
  },
  Uranus: {
    positive: [
      'Uranus is electrifying your ${theme} sector with breakthrough energy. Embrace the unconventional — your most original impulse is your best strategy.',
      'Freedom and innovation are your allies in ${theme}. Uranus rewards those who break from the expected and experiment boldly.',
    ],
    negative: [
      'Uranus is disrupting ${theme} patterns that felt safe but had become cages. The instability is liberation in disguise — adapt rather than resist.',
      'Sudden shifts in ${theme} are Uranus removing outdated wiring. Stay flexible, avoid rigid plans, and let the new configuration reveal itself.',
    ],
  },
  Neptune: {
    positive: [
      'Neptune is enhancing your intuition around ${theme}. Trust the signals that arrive through dreams, gut feelings, and quiet knowing rather than spreadsheets.',
      'Creative and spiritual currents are enriching ${theme}. This is a year where imagination becomes a practical tool — let vision lead logistics.',
    ],
    negative: [
      'Neptune can create beautiful illusions in ${theme}. Verify facts, question assumptions that feel too good, and keep one foot on solid ground.',
      'Clarity around ${theme} may feel elusive. Don\'t force decisions through the fog — wait for the mist to thin before making irreversible commitments.',
    ],
  },
  Pluto: {
    positive: [
      'Pluto is handing you deep, regenerative power in ${theme}. This is transformation fuel — use it to permanently upgrade your position and capacity.',
      'Volcanic energy rises in ${theme}. Pluto empowers those willing to shed skin. Let old identities die so the authentic version takes the throne.',
    ],
    negative: [
      'Pluto is forcing a confrontation with power dynamics in ${theme}. Control must be released where it\'s become toxic. What survives this fire is truly yours.',
      'The intensity in ${theme} is Pluto demanding radical authenticity. Shadow patterns you\'ve avoided will surface — meet them with courage, not denial.',
    ],
  },
};

export function getTransitAdvice(
  planet: string,
  aspect: string,
  theme: Theme,
  target: TargetInfo,
  year: number
): string {
  const isPositive = ['Trine', 'Sextile'].includes(aspect) ||
    (aspect === 'Conjunction' && ['Jupiter'].includes(planet));
  const planetAdvice = ADVICE_MAP[planet];
  if (!planetAdvice) {
    return isPositive
      ? `Lean into ${theme.toLowerCase()} opportunities. The chart supports deliberate forward motion.`
      : `Treat ${theme.toLowerCase()} friction as growth fuel. Simplify and respond with structure.`;
  }
  const pool = isPositive ? planetAdvice.positive : planetAdvice.negative;
  return pool[year % pool.length].replace(/\$\{theme\}/g, theme.toLowerCase());
}

// ─── P0: PERSONALIZED YEAR SUMMARY ───

export function getPersonalizedReading(
  score: number,
  change: number,
  transit: { planet: string; aspect: string; theme: string; title: string } | null,
  targetSign?: string,
  targetHouse?: number
): string {
  if (!transit) {
    // No dominant transit — use score-based reading with more nuance
    if (score >= 85) return 'A powerful integration year. No single transit dominates, which means your own momentum carries the narrative. Build on what\'s already working.';
    if (score >= 70) return 'A steady consolidation year. The cosmic noise is lower, giving you rare permission to execute without external disruption.';
    if (score >= 55) return 'A transitional year. The chart is recalibrating between chapters. Stay adaptable and avoid locking in permanent decisions too early.';
    if (score >= 40) return 'A patience year. The tension you feel is not random — it\'s the pressure that precedes structural upgrade. Trust the discomfort.';
    return 'A foundational year. The challenges carving into you now are building the resilience that later decades depend on.';
  }

  const { planet, aspect, theme, title } = transit;
  const positive = ['Trine', 'Sextile'].includes(aspect);
  const loc = targetSign && targetHouse ? ` through your ${targetSign} ${theme.toLowerCase()} axis (House ${targetHouse})` : '';

  if (score >= 80 && positive) {
    return `${title} defines this year. ${planet}'s supportive angle${loc} creates a natural tailwind — lean into ${theme.toLowerCase()} decisions with confidence.`;
  }
  if (score >= 80) {
    return `Despite strong overall energy, ${planet}'s ${aspect.toLowerCase()}${loc} adds productive tension. Channel the friction into disciplined ${theme.toLowerCase()} upgrades.`;
  }
  if (score >= 60 && positive) {
    return `${planet} opens a gentle ${theme.toLowerCase()} corridor${loc}. The year rewards steady action over dramatic leaps — consistency compounds here.`;
  }
  if (score >= 60) {
    return `${planet}'s pressure${loc} shapes this year's ${theme.toLowerCase()} storyline. Focus on structural improvements rather than forcing outcomes.`;
  }
  if (positive) {
    return `Even in a challenging year, ${planet}'s ${aspect.toLowerCase()}${loc} provides a ${theme.toLowerCase()} lifeline. Protect and nurture this one green-light signal.`;
  }
  return `${planet}'s ${aspect.toLowerCase()}${loc} is the year's dominant teacher. The ${theme.toLowerCase()} tension isn't punishment — it's the pressure that builds diamond-grade clarity.`;
}
