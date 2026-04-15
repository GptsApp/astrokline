import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import type { GeminiMessage } from '@/lib/astrokline/gemini';

export interface AskChartClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AskChartRequestContext {
  sourceType?: string;
  sourceKey?: string;
  selectedYear?: number;
  promptLabel?: string;
  promptText?: string;
  contextSnippet?: string;
}

function buildSourceSpecificBias(context: AskChartRequestContext): string[] {
  const sourceKey = context.sourceKey ?? '';

  if (context.sourceType === 'year') {
    return [
      '- focus factors: selected year, active transits, Dasha chapter shifts, adjacent-year comparison',
      '- answer priorities: why this year matters, what to do, what to avoid',
    ];
  }

  switch (sourceKey) {
    case 'marriage':
    case 'love':
      return [
        '- focus factors: 7th house, Venus, Moon attachment pattern, D9/Navamsa relationship signals',
        '- answer priorities: relationship pattern first, then next window, then practical guidance',
      ];
    case 'karma':
    case 'spirituality':
      return [
        '- focus factors: Rahu/Ketu, 12th house, Saturn/Jupiter soul-level themes, karmic repetition',
        '- answer priorities: name the lesson first, then explain how to work with it',
      ];
    case 'career':
    case 'authority':
      return [
        '- focus factors: 10th house, Sun, Saturn, Mars, public role, timing windows for visible moves',
        '- answer priorities: tell the user whether to push, prepare, or wait',
      ];
    case 'wealth':
    case 'lifestyle':
      return [
        '- focus factors: 2nd/8th house, Jupiter, Saturn, security patterns, material timing',
        '- answer priorities: separate the pattern, the risk, and the practical move',
      ];
    case 'health':
    case 'hiddenDangers':
      return [
        '- focus factors: stress load, body-energy patterns, timing pressure, protection advice',
        '- answer priorities: be concrete and non-alarmist',
      ];
    case 'summary':
    case 'strengths':
    case 'shadow':
    case 'education':
      return [
        '- focus factors: Sun, Moon, Rising, Mercury, repeating identity pattern underneath the question',
        '- answer priorities: state the core pattern first, then how to use or outgrow it',
      ];
    case 'family':
    case 'children':
      return [
        '- focus factors: 4th/5th house inheritance, nurturing patterns, long-horizon legacy themes',
        '- answer priorities: connect the past pattern to the future role the user is building',
      ];
    default:
      return [];
  }
}

function formatAskChartEntryContext(context?: AskChartRequestContext | null): string {
  if (!context?.sourceType || !context?.sourceKey) {
    return '';
  }

  const lines = [
    'AstroCurve entry context:',
    `- source type: ${context.sourceType}`,
    `- source key: ${context.sourceKey}`,
  ];

  if (context.promptLabel) {
    lines.push(`- section label: ${context.promptLabel}`);
  }

  if (typeof context.selectedYear === 'number') {
    lines.push(`- selected year: ${context.selectedYear}`);
  }

  if (context.promptText) {
    lines.push(`- suggested draft from UI: ${context.promptText}`);
  }

  if (context.contextSnippet) {
    lines.push(`- reading excerpt: ${context.contextSnippet}`);
  }

  lines.push(...buildSourceSpecificBias(context));

  lines.push('Use this as grounding for the current answer, but follow the user\'s explicit wording if they changed focus.');

  return lines.join('\n');
}

export function buildAskChartGeminiMessages(
  clientMessages: AskChartClientMessage[],
  safeQuestion: string,
  askContext?: AskChartRequestContext | null
): GeminiMessage[] {
  const recentMessages = clientMessages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
    )
    .slice(-10);

  const latestUserIndex = recentMessages
    .map((message) => message.role)
    .lastIndexOf('user');

  return recentMessages
    .map((message, index) => {
      const entryContext = index === latestUserIndex
        ? formatAskChartEntryContext(askContext)
        : '';
      const text =
        message.role === 'user' && index === latestUserIndex
          ? [entryContext, safeQuestion.trim()].filter(Boolean).join('\n\n')
          : message.content.trim();

      if (!text) {
        return null;
      }

      return {
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      } satisfies GeminiMessage;
    })
    .filter((message): message is GeminiMessage => message !== null);
}

export function createAskChartTextResponse(text: string, chatId: string) {
  const response = new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });

  response.headers.set('X-Chat-Id', chatId);

  return response;
}

export function createAskChartTextStreamResponse(
  stream: ReadableStream<Uint8Array>,
  chatId: string
) {
  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

  response.headers.set('X-Chat-Id', chatId);

  return response;
}

export function extractGeminiTextFromStreamEvent(eventData: string): string {
  const trimmed = eventData.trim();
  if (!trimmed || trimmed === '[DONE]') {
    return '';
  }

  try {
    const payload = JSON.parse(trimmed) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    return (payload.candidates || [])
      .flatMap((candidate) => candidate.content?.parts || [])
      .map((part) => (typeof part.text === 'string' ? part.text : ''))
      .join('');
  } catch {
    return '';
  }
}

function formatPlanetSummary(profile: UserProfile): string {
  return profile.planets
    .map((planet) => {
      const navamsa = planet.navamsa ? ` → D9 ${planet.navamsa.sign}` : '';
      return `${planet.name}: ${planet.sign} H${planet.house}${navamsa}`;
    })
    .join(' | ');
}

export function formatProfileForAskChartPrompt(profile: UserProfile): string {
  const venus = findPlanet(profile, 'Venus');
  const mars = findPlanet(profile, 'Mars');
  const jupiter = findPlanet(profile, 'Jupiter');
  const saturn = findPlanet(profile, 'Saturn');
  const yogas = profile.yogas?.length
    ? profile.yogas.map((yoga) => yoga.name).join(', ')
    : 'none';

  return [
    'Chart Snapshot',
    `Name: ${profile.name || 'Unknown'}`,
    `Sun: ${profile.sun.sign} House ${profile.sun.house}`,
    `Moon: ${profile.moon.sign} House ${profile.moon.house}${profile.moon.navamsa ? ` → D9 ${profile.moon.navamsa.sign}` : ''}`,
    `Rising: ${profile.rising.sign} House ${profile.rising.house}`,
    `Venus: ${venus?.sign || 'Unknown'} House ${venus?.house || '?'}`,
    `Mars: ${mars?.sign || 'Unknown'} House ${mars?.house || '?'}`,
    `Jupiter: ${jupiter?.sign || 'Unknown'} House ${jupiter?.house || '?'}`,
    `Saturn: ${saturn?.sign || 'Unknown'} House ${saturn?.house || '?'}`,
    `Elements: fire ${profile.elements.fire} / earth ${profile.elements.earth} / air ${profile.elements.air} / water ${profile.elements.water}`,
    `Modalities: cardinal ${profile.modalities.cardinal} / fixed ${profile.modalities.fixed} / mutable ${profile.modalities.mutable}`,
    `Yogas: ${yogas}`,
    `All Planets: ${formatPlanetSummary(profile)}`,
  ].join('\n');
}

function findPlanet(profile: UserProfile, name: string) {
  return profile.planets.find((planet) => planet.name === name);
}

function buildCareerFallback(profile: UserProfile): string {
  const mars = findPlanet(profile, 'Mars');
  const saturn = findPlanet(profile, 'Saturn');

  return [
    'Quick chart-based answer while live AI reconnects:',
    '',
    `Your chart leans toward changing roles only if the move increases authority, visibility, or long-term control. Your Sun in ${profile.sun.sign} in House ${profile.sun.house} wants work that is visible and meaningful, while your Rising sign in ${profile.rising.sign} prefers decisive moves over passive drifting.`,
    '',
    mars
      ? `The real test is work style. Mars in ${mars.sign} in House ${mars.house} says you do best when effort builds something tangible rather than keeping you busy without momentum.`
      : 'The real test is whether the next role creates real momentum instead of temporary relief.',
    '',
    saturn
      ? `Saturn in ${saturn.sign} suggests the right move is disciplined, not impulsive. Change jobs if the new path strengthens your structure for the next 2-3 years.`
      : 'This is a chart that benefits from strategic moves, not escape moves.',
    '',
    'Best next step:',
    '- Compare the new role against visibility, autonomy, and financial runway.',
    '- If at least two of those improve clearly, the chart leans yes more than no.',
  ].join('\n');
}

function buildLoveFallback(profile: UserProfile): string {
  const venus = findPlanet(profile, 'Venus');

  return [
    'Quick chart-based answer while live AI reconnects:',
    '',
    `Your relationship pattern is driven more by emotional safety than by surface chemistry. Your Moon in ${profile.moon.sign} in House ${profile.moon.house} needs depth and emotional intelligence, while your Rising sign in ${profile.rising.sign} means you do not open fully until trust is earned.`,
    '',
    venus
      ? `Venus in ${venus.sign} in House ${venus.house} shows what love is trying to teach you: attraction is not enough unless it also creates balance and steadiness.`
      : 'Your chart asks for real emotional steadiness, not only intensity.',
    '',
    'Best next step:',
    '- Ask whether this person brings calm or only activation.',
    '- If the connection keeps repeating the same wound, the lesson is probably boundary before devotion.',
  ].join('\n');
}

function buildMoneyFallback(profile: UserProfile): string {
  const jupiter = findPlanet(profile, 'Jupiter');
  const saturn = findPlanet(profile, 'Saturn');

  return [
    'Quick chart-based answer while live AI reconnects:',
    '',
    `Your money pattern improves through structure, not urgency. With Earth at ${profile.elements.earth}% and an overall score around ${profile.overallAverageScore}, this chart tends to build best when decisions are patient and measurable.`,
    '',
    jupiter
      ? `Jupiter in ${jupiter.sign} points to where growth comes from: expansion works when it is grounded in a bigger long-term vision.`
      : 'Growth in this chart comes from patience more than speed.',
    '',
    saturn
      ? `Saturn in ${saturn.sign} says wealth gets stronger when your rules are tighter than your moods.`
      : 'The main caution is making financial moves from anxiety instead of structure.',
    '',
    'Best next step:',
    '- Tighten one financial system before chasing a bigger outcome.',
    '- Ask the live model again for year-specific timing once it reconnects.',
  ].join('\n');
}

function buildTimingFallback(profile: UserProfile): string {
  return [
    'Quick chart-based answer while live AI reconnects:',
    '',
    `This chart is more strategic than impulsive. Your Sun in ${profile.sun.sign}, Moon in ${profile.moon.sign}, and Rising in ${profile.rising.sign} suggest that timing improves when you move from emotional clarity instead of reacting to pressure.`,
    '',
    'Because the live timing model is currently unavailable, the safest short read is this:',
    '- move when the opportunity increases clarity, not chaos',
    '- delay if the choice is mainly driven by fear or urgency',
    '- revisit the exact year question once live analysis reconnects',
  ].join('\n');
}

function buildGenericFallback(profile: UserProfile): string {
  return [
    'Quick chart-based answer while live AI reconnects:',
    '',
    `Your chart combines a ${profile.sun.sign} Sun, ${profile.moon.sign} Moon, and ${profile.rising.sign} Rising. That usually means your best decisions come when identity, emotion, and timing are aligned instead of fighting each other.`,
    '',
    'Best next step:',
    '- Name the exact decision you are trying to make.',
    '- Then ask again in one sentence so the next pass can go deeper into one topic.',
  ].join('\n');
}

export function buildAskChartFallbackResponse(
  profile: UserProfile | null,
  safeQuestion: string
): string {
  if (!profile) {
    return 'Quick chart-based answer while live AI reconnects:\n\nPlease try again once your chart context is available.';
  }

  const question = safeQuestion.toLowerCase();

  if (/(job|career|work|profession|business)/.test(question)) {
    return buildCareerFallback(profile);
  }

  if (/(love|relationship|partner|marriage|dating|compatib)/.test(question)) {
    return buildLoveFallback(profile);
  }

  if (/(money|wealth|financial|income|salary)/.test(question)) {
    return buildMoneyFallback(profile);
  }

  if (/(when|year|timing|202[0-9]|window|chapter)/.test(question)) {
    return buildTimingFallback(profile);
  }

  return buildGenericFallback(profile);
}