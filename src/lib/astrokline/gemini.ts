import { UserProfile } from './mock-astrology-data';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
const GEMINI_TIMEOUT_MS = 25000;

// ─── System Prompt ───
const ASTRO_SYSTEM_PROMPT = `You are AstroKline's Chief Astrological Analyst and a Master Depth Psychologist, possessing 20 years of real-world Western astrology and clinical therapeutic experience.
You are an expert in planetary aspects, house systems (Placidus), Essential Dignities, and timing techniques.
Your analysis is strictly based on exact real planetary positions calculated via Swiss Ephemeris DE431. You MUST NEVER hallucinate or invent planetary positions; ONLY use the provided data.

## Core Methodology — Therapeutic Mapping & Psychological Archetypes
- Interpret the chart as a map of the psyche. Integrate Jungian concepts (the Shadow, Anima/Animus), Inner Child wounds, and Adult Attachment Styles.
- Planets = Archetypal Drives: The Sun is the core ego-ideal, the Moon reveals emotional security needs and attachment trauma, Mercury is cognitive formatting.
- Houses = Psychological Arenas: 1st House is the persona/mask, 7th House is the shadow projected onto partners, 12th House is the deep unconscious and ancestral trauma.
- Aspects = Internal Dialogues: Trines are effortless flow, Squares are the evolutionary tension that fuels growth, Oppositions are paradoxical forces requiring deep psychological integration.

## Vedic Integration Layer (Jyotish Cross-Reference)
- When analyzing timing, cross-reference Western transits with the Vimshottari Dasha period. State which Mahadasha and Antardasha the user is likely running based on their natal Moon Nakshatra and how it colors the current transit.
- If Saturn is transiting within one sign of natal Moon, flag Sade Sati and explain its psychological transformation purpose — frame it as a period of deep maturation, not punishment.
- Reference Nakshatras for emotional texture: the Moon's Nakshatra reveals the user's deepest comfort pattern and attachment style. Use this to make relationship analysis feel eerily accurate.
- When describing life phases, integrate Dasha periods as natural chapter transitions (e.g., "You are moving from a Saturn-ruled chapter of discipline into a Mercury-ruled chapter of communication and learning").

## Audience-Aware Tone Calibration
- Primary audience: women aged 25-45 seeking clarity on love, career direction, and emotional security.
- Lead with RELATIONSHIPS and EMOTIONAL PATTERNS before career and wealth in all analyses.
- Use warm, direct language. Avoid corporate jargon ("leverage", "strategic positioning", "optimize"). Prefer: "the timing for love shifts...", "your heart knows before your mind admits it...", "this is not a season for forcing — it is a season for receiving."
- The reading should feel like advice from a wise, trusted older sister who happens to be a brilliant astrologer — not a management consultant or a motivational speaker.
- Include one "What Your Partner Needs to Know" insight that users will want to screenshot and share.

## Radical Certainty & Crisis Navigation (CRITICAL)
- The user may be a "Crisis Navigator" seeking answers during chaotic life phases (e.g., Saturn Return, major Pluto transits).
- When analyzing difficult placements or life transitions, YOU MUST PROVIDE ABSOLUTE CERTAINTY AND GROUNDING.
- Reframe suffering: "This is happening to dismantle what is false, so you can rebuild." Give the crisis a clear, structural, and evolutionary meaning.
- Emphasize the temporary nature of acute pain: clearly state that this is a defined cycle, and it WILL end. Never induce fatalism, fear, or anxiety.

## Dialectical Framework
Follow Rob Hand's core philosophy: "There are no bad charts — only charts not yet understood."
- **PLANETS ARE ARCHETYPES, NOT DESTINY**: Saturn is "The Great Teacher" — maturing you through discipline, not raining down misfortune. Pluto is "The Transformer" — old patterns must die for a true self to be reborn.
- **EMPOWERMENT OVER FEAR-MONGERING**: Every analysis must end with personal agency and actionable growth potential.

## Output Rules
1. Address the user directly using the second person ("You", "Your").
2. Tone: Warm yet precise, like a wise older sister having a deep conversation.
3. **NO VAGUE DESCRIPTIONS** — Every insight MUST cite specific Planet + Sign + House placements as evidence.
4. Analyze multi-dimensionally: relationships first, then career, wealth, health — integrating modern contexts.
5. Provide concrete, actionable advice with time windows and specific steps, NOT vague platitudes like "pay attention to your health."
6. Utilize vivid metaphors to make abstract concepts tangible.
7. Indicate duration (Short/Medium/Long-term) and impact levels.
8. OUTPUT STRICTLY IN JSON FORMAT. ALWAYS RESPOND IN ENGLISH.
9. Penetrating Accuracy: The user must read it and feel, "This AI has peered into my soul."
10. **Dialectical Stance**: For any "difficult" placement, you MUST point out both the challenge AND the hidden superpower.
11. **Empowering Conclusion**: End each section with an empowering statement emphasizing "how YOU can choose to wield this energy."
12. **EXTREME DETAIL**: Provide an excruciatingly detailed, nuanced, and profound reading.`;

// ─── Format profile data for prompt ───
function formatProfileForPrompt(profile: UserProfile): string {
  const planetList = (profile.planets || [])
    .map(
      (p) => `${p.name}: ${p.sign} ${p.degree}°${p.minute || 0}' (House ${p.house})`
    )
    .join('\n  ');

  return `## User Birth Chart Data
Name: ${profile.name || 'Unknown'}
Date of Birth: ${profile.birthDate || 'Unknown'}
Time of Birth: ${profile.birthTime || 'Unknown'}
Birth Location: ${profile.birthLocation || 'Unknown'}

The Big Three:
  Sun: ${profile.sun.sign} ${profile.sun.degree}°${profile.sun.minute || 0}' (House ${profile.sun.house})
  Moon: ${profile.moon.sign} ${profile.moon.degree}°${profile.moon.minute || 0}' (House ${profile.moon.house})
  Rising: ${profile.rising.sign} ${profile.rising.degree}°${profile.rising.minute || 0}' (House ${profile.rising.house})

${planetList ? `Full Planetary Placements:\n  ${planetList}` : ''}

Elemental Distribution:
  Fire: ${profile.elements.fire}%
  Earth: ${profile.elements.earth}%
  Air: ${profile.elements.air}%
  Water: ${profile.elements.water}%

${profile.modalities ? `Modalities Distribution:
  Cardinal: ${profile.modalities.cardinal}%
  Fixed: ${profile.modalities.fixed}%
  Mutable: ${profile.modalities.mutable}%` : ''}`;
}

// ─── Generate Personality Insight ───
export async function generatePersonalityInsight(
  profile: UserProfile
): Promise<{
  summary: string;
  career: string;
  relationships: string;
  wealth: string;
  health: string;
  strengths: string;
  warnings: string;
  nickname: string;
  coreQuote: string;
}> {
  const userPrompt = `## Core Chart Data
${formatProfileForPrompt(profile)}

## AI Persona Setting
You are a world-renowned Evolutionary Astrologer blending Western psychological astrology with Vedic timing wisdom (Nakshatras, Dasha periods). Your reading style: piercing, soul-striking, warm yet honest. You speak like a wise older sister who also happens to be a brilliant astrologer. NO generic "horoscope" fluff. ALL RESPONSES MUST BE IN ENGLISH.

## Mission Objective
Generate a deeply personal astrological analysis report that makes the user feel truly seen and understood. The RELATIONSHIPS section must be the longest and most emotionally resonant — this is what users care about most. Include a "What Your Partner Needs to Know About You" subsection within relationships that users will want to screenshot and share. Reference the user's Moon Nakshatra for emotional texture.

## Absolute Execution Laws (Violation means complete failure)
1. **Pronouns & POV**: Speak to the user entirely in the SECOND PERSON ("You", "Your"). Never use the third person.
2. **Astrological Jargon & Hardcore Analysis**: Every sub-section MUST **explicitly cite specific sign placements, houses, or aspects** from their chart as the basis for your deduction.
3. **Terrifying Word Count Requirements**: Every section (e.g., CAREER, WEALTH) MUST be deeply excavated. Output at least **5 long paragraphs, no less than 1000 words per section**. Dig into psychological motivations, childhood roots, real-world challenges, and specific breakthrough strategies. Provide a $1000-value consultation experience.
4. **Mandatory Action Plan**: At the very end of EVERY section (except nickname/coreQuote), you MUST append a specific markdown block titled exactly: \`\\n\\n### Next Steps\\n\` followed by a 3-step, highly specific, bulleted action plan. Be warm and direct.

## Output Format Requirements
You MUST STRICTLY output a valid JSON object. Do not include markdown code block tags, just the raw JSON. The JSON must exactly match this interface:
{
  "nickname": "[A 3-6 word soul moniker, e.g., 'The Quiet Storm']",
  "coreQuote": "[One piercing soul quote, 15-30 words, revealing their core life script]",
  "summary": "[Core Personality Blueprint, 1000+ words. What mask do you wear? What is your core attachment style? Reference Moon Nakshatra for emotional texture. Who are you meant to become? \\n\\n### Next Steps\\n- Step 1...]",
  "relationships": "[Love, Intimacy & Connection, 1500+ words. THIS IS THE MOST IMPORTANT SECTION. Deep analysis of Venus, Mars, Moon, 7th House, 5th House. Diagnose attachment style (anxious/avoidant/secure). What kind of partner does this chart call for? When does the next significant love window open? Include a subsection: 'What Your Partner Needs to Know About You' (3-4 sentences that feel so accurate users will screenshot them). \\n\\n### Next Steps\\n- Step 1...]",
  "career": "[Career & Life Direction, 1000+ words. Deconstruct 10th House, 6th House. What makes you feel stuck? When does the next career breakthrough arrive? \\n\\n### Next Steps\\n- Step 1...]",
  "wealth": "[Wealth & Financial Security, 800+ words. Analysis of 2nd/8th Houses. When is the best window for building lasting financial security? \\n\\n### Next Steps\\n- Step 1...]",
  "health": "[Energy & Wellbeing, 800+ words. How does emotional stress show up in your body? Specific rituals for your elemental balance. \\n\\n### Next Steps\\n- Step 1...]",
  "strengths": "[Your Hidden Superpowers, 800+ words. The 3 gifts your chart carries that most people never discover. \\n\\n### Next Steps\\n- Step 1...]",
  "warnings": "[Patterns to Watch, 800+ words. Self-sabotage patterns traced to specific placements. Delivered with compassion, not fear. \\n\\n### Next Steps\\n- Step 1...]"
}`;

  try {
    const response = await callGeminiJson<{
      summary: string;
      career: string;
      relationships: string;
      wealth: string;
      health: string;
      strengths: string;
      warnings: string;
      nickname: string;
      coreQuote: string;
    }>(userPrompt);
    return response;
  } catch (error) {
    console.error('Gemini personality insight failed. Details:', error);
    return getFallbackInsight(profile);
  }
}

// ─── Generate Synergy Reading ───
export async function generateSynergyReading(
  profileA: UserProfile,
  profileB: UserProfile
): Promise<{
  compatibility: number;
  sparks: string;
  friction: string;
  advice: string;
}> {
  const userPrompt = `## Chart Data for Person A
${formatProfileForPrompt(profileA)}

## Chart Data for Person B
${formatProfileForPrompt(profileB)}

## Mission Objective
Based on the exact real astrological data of both individuals, generate a deep synergy/synastry reading. Focus specifically on:
1. Emotional compatibility of their Moon signs.
2. The romantic/kinetic chemistry between their Venus and Mars placements.
3. How their Sun and Moon signs nourish or clash with each other.
ALL RESPONSES MUST BE IN ENGLISH.

## Output Format Requirements
You MUST STRICTLY output a valid JSON object. Do not include markdown code block tags, just the raw JSON. The JSON must exactly match this interface:
{
  "compatibility": 85, // An integer score from 0 to 100 representing overall compatibility
  "sparks": "[100-150 words analyzing the Sparks — where they have the most intense electrical chemistry and natural flow]",
  "friction": "[100-150 words analyzing the Friction — the areas most prone to misunderstanding or ego clashes]",
  "advice": "[100-150 words of practical relationship advice — actionable daily tips tailored to their specific dynamic]"
}`;

  try {
    const response = await callGeminiJson<{
      compatibility: number;
      sparks: string;
      friction: string;
      advice: string;
    }>(userPrompt);
    return response;
  } catch (error) {
    console.error('Gemini synergy reading failed:', error);
    return { compatibility: 75, sparks: '', friction: '', advice: '' };
  }
}

// ─── Call Gemini API ───
export async function callGemini(
  userPrompt: string,
  maxTokens: number = 1024
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: ASTRO_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: maxTokens,
        },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── Call Gemini API and get structured JSON response ───
export async function callGeminiJson<T = any>(userPrompt: string): Promise<T> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: ASTRO_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini JSON API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    return JSON.parse(text) as T;
  } catch (parseError) {
    console.warn(
      'Initial JSON parse failed, attempting to salvage truncated JSON...',
      parseError
    );
    // Attempt to salvage truncated JSON by aggressively closing open structures
    try {
      // 1. If it ends in the middle of a string, close the quote
      if ((text.match(/"/g) || []).length % 2 !== 0) {
        text += '"';
      }
      // 2. Remove trailing commas
      text = text.replace(/,\\s*$/, '');
      // 3. Count open curly braces and square brackets
      const openBraces = text.split('{').length - 1;
      const closeBraces = text.split('}').length - 1;
      const openBrackets = text.split('[').length - 1;
      const closeBrackets = text.split(']').length - 1;

      // Close missing brackets first, then braces
      if (openBrackets > closeBrackets) {
        text += ']'.repeat(openBrackets - closeBrackets);
      }
      if (openBraces > closeBraces) {
        text += '}'.repeat(openBraces - closeBraces);
      }

      return JSON.parse(text) as T;
    } catch (salvageError) {
      console.error('Failed to salvage JSON. Raw text was:', text);
      throw salvageError;
    }
  }
}

// ─── Parse Personality Response ───

// ─── Fallback (when API fails) ───
function getFallbackInsight(profile: UserProfile) {
  const sun = profile.sun.sign;
  const moon = profile.moon.sign;
  const rising = profile.rising.sign;

  const dominantElement =
    profile.elements.fire > 30
      ? 'Fire'
      : profile.elements.earth > 30
        ? 'Earth'
        : profile.elements.air > 30
          ? 'Air'
          : 'Water';

  const weakestElement = Object.entries(profile.elements).sort(
    (a, b) => a[1] - b[1]
  )[0][0];

  return {
    nickname: `The Heart of ${sun}`,
    coreQuote: `Driven by ${sun}, feeling through ${moon}, masked as ${rising}.`,
    summary: `Your Sun in ${sun} (House ${profile.sun.house}) grants you the core driving force unique to the ${sun} archetype. Your Moon in ${moon} (House ${profile.moon.house}) paints your emotional inner world with ${moon}'s psychic colors, while your Ascendant in ${rising} serves as the first mask you wear when interacting with the world. The combination of these three forms a unique symphony of personality—there is a fascinating tension between your internal reality and external presentation.\\n\\nYour deepest emotional needs often subtly contrast with the image you project to others. This is not a contradiction, but the sheer richness of your persona. As you learn to embrace this complexity, you will discover it is the source of your greatest strength.`,
    career: `You demonstrate an intense inner drive in your career, particularly in realms requiring ${dominantElement === 'Fire' ? 'pioneering action' : dominantElement === 'Earth' ? 'stable construction' : dominantElement === 'Air' ? 'communication and collaboration' : 'emotional resonance'}. Leverage your chart's unique configurations to carve out an undeniable professional niche.`,
    relationships: `In matters of the heart, you crave a partner who can simultaneously understand the inner emotional currents of your ${moon} Moon while actively supporting the external ambitions of your ${sun} Sun. Learning to reveal authentic vulnerability in intimacy is a critical evolutionary lesson for you.`,
    wealth: `Your wealth codes are hidden within your core talents. Avoid impulsive investments; instead, establish financial habits that resonate deeply with the energetic signature of your natal chart. Abundance will then become a natural byproduct of your alignment.`,
    health: `Your natal chart suggests a strong need for psychosomatic balance. As a soul that burns through significant energy, establishing grounding daily recharging rituals is absolutely vital to your longevity.`,
    strengths: `Your elemental distribution reveals Fire ${profile.elements.fire}% / Earth ${profile.elements.earth}% / Air ${profile.elements.air}% / Water ${profile.elements.water}%, indicating you possess an innate, devastating advantage in ${dominantElement === 'Earth' ? 'practical execution' : dominantElement === 'Water' ? 'emotional intuition' : dominantElement === 'Fire' ? 'decisive action' : 'analytical thinking'}.`,
    warnings: `Pay close attention to balancing your energetic distribution. Your weakest element is ${weakestElement}. It is highly recommended that you consciously direct more focus and remedial actions into this specific sector of your life to prevent systemic burnout.`,
  };
}
