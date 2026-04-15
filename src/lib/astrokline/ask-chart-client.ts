import type { DepthBadge } from '@/lib/astrokline/depth-badges';

export type AskChartErrorType = 'auth' | 'upgrade' | 'limit' | 'ai_unavailable' | 'network' | 'unknown';
export type AskChartMessageState = 'complete' | 'loading' | 'error';
export type AskChartSourceType = 'module' | 'year' | 'hero' | 'footer' | 'answer';
export type AskChartUpgradeSource = 'ask_chart' | 'ask_chart_failure' | 'ask_chart_limit' | 'depth_badge_click' | 'proof_layer_open' | 'module_followup_cta';

export interface AskChartContextPrompt {
  id: string;
  label: string;
  text: string;
  contextSnippet?: string;
  sourceType: AskChartSourceType;
  sourceKey: string;
  selectedYear?: number;
}

export interface AskChartMessage {
  role: 'user' | 'assistant';
  content: string;
  state?: AskChartMessageState;
  errorType?: AskChartErrorType;
  upgradeSource?: AskChartUpgradeSource;
  retryText?: string;
  followUpPrompts?: string[];
  depthBadges?: DepthBadge[];
  proofLines?: string[];
}

export const ASK_CHART_LOADING_STEPS = [
  'Reading your chart context...',
  'Checking timing and pattern signals...',
  'Writing your answer...',
];

export function buildAskChartUserMessage(content: string): AskChartMessage {
  return { role: 'user', content, state: 'complete' };
}

export function buildAskChartLoadingMessage(question: string): AskChartMessage {
  return {
    role: 'assistant',
    content: '',
    state: 'loading',
    retryText: question,
  };
}

export function buildAskChartAssistantMessage(
  content: string,
  followUpPrompts?: string[],
  depthBadges?: DepthBadge[],
  proofLines?: string[]
): AskChartMessage {
  return { role: 'assistant', content, state: 'complete', followUpPrompts, depthBadges, proofLines };
}

export function buildAskChartFollowUpPrompts(
  question: string,
  answer: string,
  sourcePrompt?: AskChartContextPrompt | null
): string[] {
  const proofPrompt = sourcePrompt?.sourceType === 'year' && sourcePrompt.selectedYear
    ? `Show me why ${sourcePrompt.selectedYear} matters in chart terms.`
    : 'Show me why this answer fits my chart.';

  const combinedText = `${question} ${answer}`.toLowerCase();

  if (sourcePrompt?.sourceType === 'year' && sourcePrompt.selectedYear) {
    return [
      proofPrompt,
      `What should I actively do in ${sourcePrompt.selectedYear} to use this timing well?`,
      `What is the biggest mistake to avoid in ${sourcePrompt.selectedYear}?`,
      `What chart evidence makes ${sourcePrompt.selectedYear} important?`,
    ];
  }

  if (/(career|job|work|profession|promotion)/.test(combinedText)) {
    return [
      proofPrompt,
      'How should I act on this career timing right now?',
      'What work pattern is holding me back here?',
      'What chart evidence supports this career answer?',
    ];
  }

  if (/(love|relationship|marriage|partner|dating)/.test(combinedText)) {
    return [
      proofPrompt,
      'What relationship pattern keeps repeating here?',
      'How should I handle this timing in love?',
      'What chart evidence supports this relationship answer?',
    ];
  }

  if (/(money|finance|financial|wealth|income)/.test(combinedText)) {
    return [
      proofPrompt,
      'What financial pattern is blocking growth here?',
      'What is the smartest move to make with this money timing?',
      'What chart evidence supports this financial answer?',
    ];
  }

  return [
    proofPrompt,
    'How should I act on this timing next?',
    'What pattern is blocking this area?',
    'What chart evidence supports this answer?',
  ];
}

export function buildAskChartProofLines(
  sourcePrompt?: AskChartContextPrompt | null,
  depthBadges?: DepthBadge[]
): string[] {
  if (!sourcePrompt) {
    return [];
  }

  const proofLines = [
    sourcePrompt.contextSnippet
      ? `Grounded in the section you opened: ${sourcePrompt.contextSnippet}`
      : `Grounded in the ${sourcePrompt.label} surface you opened from the Kline reading.`,
  ];

  if (sourcePrompt.sourceType === 'year' && sourcePrompt.selectedYear) {
    proofLines.push(`The answer is anchored to ${sourcePrompt.selectedYear} specifically, not just to your chart in general.`);
    proofLines.push('The reasoning prioritizes timing pressure, active transits, and chapter changes around that year.');
  } else if (sourcePrompt.sourceKey === 'marriage' || sourcePrompt.sourceKey === 'love') {
    proofLines.push('The reasoning prioritizes relationship houses, Venus, attachment patterns, and partnership timing.');
  } else if (sourcePrompt.sourceKey === 'karma' || sourcePrompt.sourceKey === 'spirituality') {
    proofLines.push('The reasoning prioritizes karmic repetition, soul-level themes, and deeper life lessons in the chart.');
  } else if (sourcePrompt.sourceKey === 'career' || sourcePrompt.sourceKey === 'authority') {
    proofLines.push('The reasoning prioritizes public role, work direction, timing windows, and how visible effort compounds.');
  } else {
    proofLines.push('The reasoning prioritizes the chart factors most closely tied to the section you came from, instead of answering generically.');
  }

  if (depthBadges?.length) {
    proofLines.push(`Advanced layers used here: ${depthBadges.map((badge) => badge.label).join(', ')}.`);
  }

  proofLines.push('Your explicit wording still leads, but the answer stays anchored to this original reading context.');

  return proofLines;
}

export function buildAskChartErrorMessage(
  errorType: AskChartErrorType,
  question: string,
  upgradeSource?: AskChartUpgradeSource
): AskChartMessage {
  return {
    role: 'assistant',
    content: getAskChartErrorText(errorType),
    state: 'error',
    errorType,
    upgradeSource,
    retryText: question,
  };
}

export function classifyAskChartError(status: number): AskChartErrorType {
  if (status === 401) return 'auth';
  if (status === 403) return 'upgrade';
  if (status === 429) return 'limit';
  if (status === 502) return 'ai_unavailable';
  return 'unknown';
}

export function getAskChartErrorText(errorType: AskChartErrorType): string {
  switch (errorType) {
    case 'auth':
      return 'Please sign in again to continue this chart conversation.';
    case 'upgrade':
      return 'This chart conversation needs a paid plan before it can continue.';
    case 'limit':
      return 'You have reached the current Ask Chart limit for this plan.';
    case 'ai_unavailable':
      return 'I could not finish that answer just now. Your question is still here.';
    case 'network':
      return 'The connection dropped before I could finish your answer.';
    default:
      return 'I could not complete that answer right now.';
  }
}

export function buildShorterAskChartQuestion(question: string): string {
  return `Give me the clearest short answer to this question: ${question}`;
}

export function replaceLastAssistantMessage(
  messages: AskChartMessage[],
  nextMessage: AskChartMessage
): AskChartMessage[] {
  const nextMessages = [...messages];

  for (let index = nextMessages.length - 1; index >= 0; index -= 1) {
    if (nextMessages[index]?.role === 'assistant') {
      nextMessages[index] = nextMessage;
      return nextMessages;
    }
  }

  nextMessages.push(nextMessage);
  return nextMessages;
}

export function toAskChartRequestMessages(messages: AskChartMessage[]) {
  return messages
    .filter(
      (message) =>
        message.role === 'user' ||
        (message.role === 'assistant' && message.state !== 'loading' && message.state !== 'error')
    )
    .map((message) => ({ role: message.role, content: message.content }));
}