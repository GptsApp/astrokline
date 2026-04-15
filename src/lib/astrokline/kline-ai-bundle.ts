import type { AiInsightData } from './ai-insight-cache';
import type { KeyYearInput, KeyYearInsight } from './gemini';

export type KlineBundleTier = 'HERO' | 'LITE' | 'PRO';
export type KlineBundlePhase = 'hero' | 'core' | 'deep' | 'full';

const DIAGNOSIS_SECTION_KEYS: Array<keyof KlineDiagnosisInsight> = [
  'summary',
  'relationships',
  'career',
  'wealth',
  'health',
  'strengths',
  'warnings',
  'dashaTimeline',
  'marriage',
  'karma',
  'family',
  'children',
  'spirituality',
  'education',
  'authority',
  'lifestyle',
  'hiddenDangers',
];

export interface KlineHeroInsight {
  nickname: string | null;
  coreQuote: string | null;
  title: string | null;
  supportLine: string | null;
  proofLine: string | null;
}

export interface KlineDiagnosisInsight {
  summary: string | null;
  relationships: string | null;
  career: string | null;
  wealth: string | null;
  health: string | null;
  strengths: string | null;
  warnings: string | null;
  dashaTimeline: string | null;
  marriage: string | null;
  karma: string | null;
  family: string | null;
  children: string | null;
  spirituality: string | null;
  education: string | null;
  authority: string | null;
  lifestyle: string | null;
  hiddenDangers: string | null;
}

export interface KlineActionCard {
  year: number | null;
  stage: string | null;
  transitTitle: string | null;
  theme: string | null;
  summary: string | null;
  advice: string | null;
}

export interface KlineActionYear {
  year: number;
  stage: string;
  transitTitle: string;
  transitTheme: string;
  summary: string | null;
  advice: string | null;
}

export interface KlineActionInsight {
  currentFocus: KlineActionCard | null;
  nextWindow: KlineActionCard | null;
  guardrail: KlineActionCard | null;
  years: KlineActionYear[];
}

export interface KlineAskContext {
  chartSummary: string | null;
  currentQuestionHooks: string[];
}

export interface KlineAIBundle {
  meta: {
    tier: KlineBundleTier;
    phase: KlineBundlePhase;
    generatedAt: string;
    fallbackUsed: boolean;
    hasDiagnosis: boolean;
    hasAction: boolean;
    includedSections: string[];
  };
  hero: KlineHeroInsight;
  diagnosis: KlineDiagnosisInsight | null;
  action: KlineActionInsight | null;
  askContext: KlineAskContext;
}

function normalizeParagraph(value?: string | null): string | null {
  const normalized = (value ?? '')
    .replace(/###\s*Next Steps[\s\S]*$/i, '')
    .replace(/What Your Partner Needs to Know[\s\S]*$/i, '')
    .replace(/[*_`#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || null;
}

function getFirstSentence(value?: string | null): string | null {
  const normalized = normalizeParagraph(value);
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/.*?[.!?](?=\s|$)/);
  return (match?.[0] ?? normalized).trim();
}

function pickFirstSentence(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const sentence = getFirstSentence(value);
    if (sentence) {
      return sentence;
    }
  }

  return null;
}

function buildFallbackActionSummary(input: KeyYearInput): string {
  return `${input.transitTitle} defines the ${input.stage.toLowerCase()} tone around ${input.transitTheme.toLowerCase()} in ${input.year}.`;
}

function buildFallbackActionAdvice(input: KeyYearInput): string {
  return `Use ${input.year} to move carefully through ${input.transitTheme.toLowerCase()} decisions.`;
}

function toActionCard(input: KeyYearInput | undefined, insightByYear: Map<number, KeyYearInsight>): KlineActionCard | null {
  if (!input) {
    return null;
  }

  const insight = insightByYear.get(input.year);

  return {
    year: input.year,
    stage: input.stage,
    transitTitle: input.transitTitle,
    theme: input.transitTheme,
    summary: insight?.aiSummary ?? buildFallbackActionSummary(input),
    advice: insight?.aiAdvice ?? buildFallbackActionAdvice(input),
  };
}

function buildActionInsight(keyYears: KeyYearInput[], keyYearInsights: KeyYearInsight[]): KlineActionInsight | null {
  if (keyYears.length === 0) {
    return null;
  }

  const sortedYears = [...keyYears].sort((left, right) => left.year - right.year);
  const insightByYear = new Map(keyYearInsights.map((insight) => [insight.year, insight]));
  const strongestYear = [...sortedYears].sort((left, right) => right.score - left.score)[0];
  const lowestYear = [...sortedYears]
    .filter((item) => item.year !== strongestYear?.year)
    .sort((left, right) => left.score - right.score)[0] ?? sortedYears[0];

  return {
    currentFocus: toActionCard(sortedYears[0], insightByYear),
    nextWindow: toActionCard(strongestYear, insightByYear),
    guardrail: toActionCard(lowestYear, insightByYear),
    years: sortedYears.map((item) => {
      const insight = insightByYear.get(item.year);

      return {
        year: item.year,
        stage: item.stage,
        transitTitle: item.transitTitle,
        transitTheme: item.transitTheme,
        summary: insight?.aiSummary ?? buildFallbackActionSummary(item),
        advice: insight?.aiAdvice ?? buildFallbackActionAdvice(item),
      };
    }),
  };
}

function filterDiagnosisInsight(
  diagnosis: KlineDiagnosisInsight | null,
  includedSections: string[],
): KlineDiagnosisInsight | null {
  if (!diagnosis) {
    return null;
  }

  const allowedSections = new Set(includedSections);
  let hasVisibleSection = false;

  const filtered = DIAGNOSIS_SECTION_KEYS.reduce((result, key) => {
    const nextValue = allowedSections.has(key) ? diagnosis[key] : null;
    if (nextValue) {
      hasVisibleSection = true;
    }
    result[key] = nextValue;
    return result;
  }, {} as KlineDiagnosisInsight);

  return hasVisibleSection ? filtered : null;
}

export function buildKlineAIBundle(input: {
  tier: KlineBundleTier;
  phase?: KlineBundlePhase;
  aiInsight: AiInsightData | null;
  keyYears?: KeyYearInput[];
  keyYearInsights?: KeyYearInsight[];
  includedSections?: string[];
}): KlineAIBundle {
  const aiInsight = input.aiInsight ?? null;
  const phase = input.phase ?? 'full';
  const keyYears = input.keyYears ?? [];
  const keyYearInsights = input.keyYearInsights ?? [];
  const includedSections = input.includedSections ?? DIAGNOSIS_SECTION_KEYS;
  const action = input.tier === 'HERO' ? null : buildActionInsight(keyYears, keyYearInsights);
  const diagnosis = input.tier === 'HERO'
    ? null
    : {
        summary: normalizeParagraph(aiInsight?.summary),
        relationships: normalizeParagraph(aiInsight?.relationships),
        career: normalizeParagraph(aiInsight?.career),
        wealth: normalizeParagraph(aiInsight?.wealth),
        health: normalizeParagraph(aiInsight?.health),
        strengths: normalizeParagraph(aiInsight?.strengths),
        warnings: normalizeParagraph(aiInsight?.warnings),
        dashaTimeline: normalizeParagraph(aiInsight?.dashaTimeline),
        marriage: normalizeParagraph(aiInsight?.marriage),
        karma: normalizeParagraph(aiInsight?.karma),
        family: normalizeParagraph(aiInsight?.family),
        children: normalizeParagraph(aiInsight?.children),
        spirituality: normalizeParagraph(aiInsight?.spirituality),
        education: normalizeParagraph(aiInsight?.education),
        authority: normalizeParagraph(aiInsight?.authority),
        lifestyle: normalizeParagraph(aiInsight?.lifestyle),
        hiddenDangers: normalizeParagraph(aiInsight?.hiddenDangers),
      };
  const visibleDiagnosis = phase === 'hero'
    ? null
    : filterDiagnosisInsight(diagnosis, includedSections);

  return {
    meta: {
      tier: input.tier,
      phase,
      generatedAt: new Date().toISOString(),
      fallbackUsed: Boolean(aiInsight?._fallback),
      hasDiagnosis: Boolean(visibleDiagnosis),
      hasAction: Boolean(action?.years.length),
      includedSections,
    },
    hero: {
      nickname: aiInsight?.nickname ?? null,
      coreQuote: aiInsight?.coreQuote ?? null,
      title: pickFirstSentence(aiInsight?.summary, aiInsight?.relationships, aiInsight?.dashaTimeline, aiInsight?.career),
      supportLine: pickFirstSentence(aiInsight?.relationships, aiInsight?.dashaTimeline, aiInsight?.career, aiInsight?.wealth),
      proofLine: pickFirstSentence(aiInsight?.dashaTimeline, aiInsight?.summary, aiInsight?.health, aiInsight?.strengths),
    },
    diagnosis: visibleDiagnosis,
    action,
    askContext: {
      chartSummary: pickFirstSentence(aiInsight?.summary, aiInsight?.relationships, aiInsight?.career),
      currentQuestionHooks: [
        action?.currentFocus?.year ? `What is ${action.currentFocus.year} asking me to prioritize?` : null,
        action?.nextWindow?.year ? `How should I use the opening in ${action.nextWindow.year}?` : null,
        action?.guardrail?.year ? `What should I protect in ${action.guardrail.year}?` : null,
      ].filter((value): value is string => Boolean(value)),
    },
  };
}