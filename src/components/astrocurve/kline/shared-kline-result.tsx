'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowRight, Lock, Sparkles, TrendingUp, Users } from 'lucide-react';

import { InteractiveChart } from '@/components/astrocurve/kline/interactive-chart';
import { AiReadingPanels } from '@/components/astrocurve/kline/ai-reading-panels';
import { FiveYearPlan } from '@/components/astrocurve/kline/five-year-plan';
import { FloatingNav } from '@/components/astrocurve/kline/floating-nav';
import { ResultCommandDeck } from '@/components/astrocurve/kline/result-command-deck';
import { CosmicIdCard } from '@/components/astrocurve/kline/cosmic-id-card';
import { AskChartPanel } from '@/components/astrocurve/kline/ask-chart-panel';
import { ChartValidation } from '@/components/astrocurve/kline/chart-validation';
import { SignComparison } from '@/components/astrocurve/kline/sign-comparison';
import { ReportSection } from '@/components/astrocurve/kline/report-section';
import {
  runClientRequest,
} from '@/lib/astrokline/client-request-cache';
import { cn } from '@/shared/lib/utils';
import type { AiInsightData } from '@/lib/astrokline/ai-insight-cache';
import type { AskChartContextPrompt } from '@/lib/astrokline/ask-chart-client';
import type { KeyYearInput } from '@/lib/astrokline/gemini';
import type { KlineAIBundle, KlineActionYear, KlineBundlePhase, KlineBundleTier } from '@/lib/astrokline/kline-ai-bundle';
import { trackEvent } from '@/lib/astrokline/track-event';
import type { DestinyScorePoint, Next30DaysGuidance, TransitEvent, UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Heading } from "@/components/astrocurve/ui/heading";

const DIAGNOSIS_FIELDS = [
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
] as const;

function hasDiagnosisContent(bundle: KlineAIBundle | null) {
  if (!bundle?.diagnosis) {
    return false;
  }

  return DIAGNOSIS_FIELDS.some((field) => Boolean(bundle.diagnosis?.[field]));
}

function mergeDiagnosisBundle(
  currentDiagnosis: KlineAIBundle['diagnosis'],
  nextDiagnosis: KlineAIBundle['diagnosis'],
): KlineAIBundle['diagnosis'] {
  if (!currentDiagnosis) {
    return nextDiagnosis;
  }

  if (!nextDiagnosis) {
    return currentDiagnosis;
  }

  const merged = { ...currentDiagnosis };

  DIAGNOSIS_FIELDS.forEach((field) => {
    merged[field] = nextDiagnosis[field] ?? currentDiagnosis[field] ?? null;
  });

  return DIAGNOSIS_FIELDS.some((field) => Boolean(merged[field])) ? merged : null;
}

function mergeActionBundle(
  currentAction: KlineAIBundle['action'],
  nextAction: KlineAIBundle['action'],
): KlineAIBundle['action'] {
  if (!currentAction) {
    return nextAction;
  }

  if (!nextAction) {
    return currentAction;
  }

  const yearsById = new Map<number, KlineActionYear>();
  currentAction.years.forEach((item) => {
    yearsById.set(item.year, item);
  });
  nextAction.years.forEach((item) => {
    yearsById.set(item.year, item);
  });

  return {
    currentFocus: nextAction.currentFocus ?? currentAction.currentFocus,
    nextWindow: nextAction.nextWindow ?? currentAction.nextWindow,
    guardrail: nextAction.guardrail ?? currentAction.guardrail,
    years: Array.from(yearsById.values()).sort((left, right) => left.year - right.year),
  };
}

function mergeKlineBundle(
  currentBundle: KlineAIBundle | null,
  nextBundle: KlineAIBundle,
): KlineAIBundle {
  if (!currentBundle || nextBundle.meta.phase === 'full') {
    return nextBundle;
  }

  return {
    meta: {
      ...nextBundle.meta,
      hasDiagnosis: currentBundle.meta.hasDiagnosis || nextBundle.meta.hasDiagnosis,
      hasAction: currentBundle.meta.hasAction || nextBundle.meta.hasAction,
      includedSections: Array.from(new Set([
        ...currentBundle.meta.includedSections,
        ...nextBundle.meta.includedSections,
      ])),
    },
    hero: {
      nickname: nextBundle.hero.nickname ?? currentBundle.hero.nickname,
      coreQuote: nextBundle.hero.coreQuote ?? currentBundle.hero.coreQuote,
      title: nextBundle.hero.title ?? currentBundle.hero.title,
      supportLine: nextBundle.hero.supportLine ?? currentBundle.hero.supportLine,
      proofLine: nextBundle.hero.proofLine ?? currentBundle.hero.proofLine,
    },
    diagnosis: mergeDiagnosisBundle(currentBundle.diagnosis, nextBundle.diagnosis),
    action: mergeActionBundle(currentBundle.action, nextBundle.action),
    askContext: {
      chartSummary: nextBundle.askContext.chartSummary ?? currentBundle.askContext.chartSummary,
      currentQuestionHooks: nextBundle.askContext.currentQuestionHooks.length
        ? Array.from(new Set([
            ...currentBundle.askContext.currentQuestionHooks,
            ...nextBundle.askContext.currentQuestionHooks,
          ]))
        : currentBundle.askContext.currentQuestionHooks,
    },
  };
}

function buildYearInsightMap(bundle: KlineAIBundle | null) {
  const map: Record<number, { aiSummary: string; aiAdvice: string }> = {};

  bundle?.action?.years?.forEach((item: KlineActionYear) => {
    if (item.year && item.summary) {
      map[item.year] = {
        aiSummary: item.summary,
        aiAdvice: item.advice || '',
      };
    }
  });

  return map;
}

function getPhasePlanForTier(bundleTier: KlineBundleTier): KlineBundlePhase[] {
  if (bundleTier === 'PRO' || bundleTier === 'LITE') {
    return ['hero', 'core'];
  }

  return ['hero'];
}

function buildKeyYearsForTimeline(
  profile: UserProfile,
  klineData: DestinyScorePoint[],
  transitDetails: Record<number, TransitEvent[]>,
  currentYear: number,
): KeyYearInput[] {
  const nextFiveYears = klineData
    .filter((point) => point.year >= currentYear && point.year <= currentYear + 5 && transitDetails[point.year]?.length > 0);

  const priorityYears = klineData
    .filter(
      (point) => point.year >= currentYear
        && (point.isPeak || point.isCrossroads)
        && transitDetails[point.year]?.length > 0,
    );

  return Array.from(
    new Map(
      [...nextFiveYears, ...priorityYears]
        .sort((left, right) => left.year - right.year)
        .map((point) => [point.year, point]),
    ).values(),
  )
    .slice(0, 10)
    .map((point) => {
      const transit = transitDetails[point.year][0];
      return {
        year: point.year,
        score: point.score,
        stage: point.stage,
        transitTitle: transit.title,
        transitPlanet: transit.planet,
        transitAspect: transit.aspect,
        transitTheme: transit.theme,
        targetSign: profile.sun?.sign || 'Aries',
        targetHouse: 1,
      };
    });
}

function logKlineClientEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('[AstroCurve][KlineEvent]', {
    event,
    at: new Date().toISOString(),
    ...payload,
  });
}

function describeFutureMoment(
  klineData: DestinyScorePoint[],
  transitDetails: Record<number, TransitEvent[]>,
  currentYear: number
) {
  const futurePoints = klineData.filter((point) => point.year >= currentYear).slice(0, 6);

  if (futurePoints.length === 0) {
    return [];
  }

  const highestScorePoint = [...futurePoints].sort((left, right) => right.score - left.score)[0];
  const lowestScorePoint = [...futurePoints].sort((left, right) => left.score - right.score)[0];
  const biggestShiftPoint = futurePoints
    .map((point, index) => ({
      point,
      shift: index === 0 ? 0 : Math.abs(point.score - futurePoints[index - 1].score),
    }))
    .sort((left, right) => right.shift - left.shift)[0]?.point;

  const openingPoint = futurePoints.find((point) => point.isPeak) ?? highestScorePoint;
  const decisionPoint = futurePoints.find(
    (point) => point.isCrossroads && point.year !== openingPoint?.year
  ) ?? biggestShiftPoint;
  const protectionPoint = futurePoints.find(
    (point) => point.score < 45 && point.year !== openingPoint?.year && point.year !== decisionPoint?.year
  ) ?? lowestScorePoint;

  return [
    { point: openingPoint, label: 'Next Opening' },
    { point: decisionPoint, label: 'Decision Gate' },
    { point: protectionPoint, label: 'Protection Window' },
  ]
    .filter((entry): entry is { point: DestinyScorePoint; label: string } => Boolean(entry.point))
    .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.point.year === entry.point.year) === index)
    .map(({ point, label }) => {
      const event = transitDetails[point.year]?.[0];
      return {
        year: point.year,
        label,
        summary: event
          ? `${event.planet} ${event.aspect} shifts your ${event.theme.toLowerCase()} timeline.`
          : `${point.stage} energy becomes more visible here.`,
      };
    });
}

function buildStageNarrative(score: number, stage: string, currentMonth: string) {
  if (score >= 75) {
    return {
      eyebrow: `${currentMonth} is an expansion month`,
      title: 'You are in a supportive growth phase',
      summary: 'The chart is backing visible moves, sharper decisions, and confident positioning.',
      advice: 'Move with focus. The main risk now is overcommitting instead of compounding what is already working.',
      surfaceClass: 'border-emerald-400/20 bg-emerald-400/[0.06]',
      scoreClass: 'text-emerald-300',
      badge: stage,
    };
  }

  if (score >= 55) {
    return {
      eyebrow: `${currentMonth} is a calibration month`,
      title: 'You are building the next chapter',
      summary: 'Momentum is present, but it still needs clearer shape and better timing discipline.',
      advice: 'Stabilize the essentials first. This phase rewards precision more than speed.',
      surfaceClass: 'border-amber-300/20 bg-amber-300/[0.06]',
      scoreClass: 'text-amber-200',
      badge: stage,
    };
  }

  return {
    eyebrow: `${currentMonth} is asking for protection`,
    title: 'You are between cycles right now',
    summary: 'This is a reset window. Reduce noise, recover energy, and resist forcing outcomes too early.',
    advice: 'The chart is asking for fewer commitments and cleaner boundaries before the next expansion opens.',
    surfaceClass: 'border-sky-300/20 bg-sky-300/[0.06]',
    scoreClass: 'text-sky-200',
    badge: stage,
  };
}

function pickAskChartContextSnippet(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = (value ?? '')
      .replace(/###\s*Next Steps[\s\S]*$/i, '')
      .replace(/What Your Partner Needs to Know[\s\S]*$/i, '')
      .replace(/[*_`#>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalized) {
      continue;
    }

    const sentence = normalized.match(/.*?[.!?](?=\s|$)/)?.[0]?.trim();
    return sentence || normalized;
  }

  return 'Use the current Kline reading as the context for this question.';
}

function normalizeActionCopy(value?: string | null) {
  return (value ?? '')
    .replace(/###\s*Next Steps[\s\S]*$/i, '')
    .replace(/What Your Partner Needs to Know[\s\S]*$/i, '')
    .replace(/[*_`#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function SectionShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden border border-white/[0.08] bg-[#0A0A0F]/80 p-5 md:p-8', className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}

const SECTION_COPY = {
  en: {
    destinyKline: {
      eyebrow: 'Destiny K-Line',
      title: 'Your Life Timeline, Revealed',
      description: 'Saturn returns, Jupiter expansions, Pluto transformations — mapped year by year. See where your current year sits on the curve and when your next major transit window opens.',
    },
    pastProof: {
      eyebrow: 'Past Proof',
      title: 'Let\'s Verify Your Chart',
      description: 'Your natal chart predicted specific turning points. We\'ll show you two — confirm them, and watch your chart accuracy score climb.',
    },
    cosmicProfile: {
      eyebrow: 'Cosmic Profile',
      title: 'Your Cosmic Identity',
      description: 'Sun sign, rising, and planetary placements distilled into your unique scores — plus how they stack against others born under the same sky.',
    },
    deepReading: {
      eyebrow: 'Deep Reading',
      title: 'Why This Pattern Keeps Repeating',
      description: 'The transits behind the curve: which planetary aspect keeps triggering the same pattern, what is opening next, and the part of your natal chart that quietly drives it all.',
    },
    actionMap: {
      eyebrow: 'Action Map',
      title: 'How To Move Through The Next Chapter',
      cards: {
        focus: 'Focus',
        next: 'Next Window',
        guard: 'Guardrail',
        guardTitle: 'Stay deliberate, not reactive',
      },
      futureEyebrow: 'Future Windows',
      futureTitle: 'Your Longer Timeline',
    },
    unlock: {
      eyebrow: 'Unlock',
      title: 'Keep The Reading Going',
      description: 'Ask a pointed follow-up about any transit, save your reading, or explore the tools that stay useful long after the main chart is done.',
      askEyebrow: 'Ask Chart',
      askTitle: 'Still need clarity on one thing?',
      askDescription: 'Ask Chart stays fixed in the lower-right corner, so you can open it whenever a question appears while reading.',
      askCta: 'Open Ask Chart',
      toolsEyebrow: 'Tools',
      toolsTitle: 'Useful Next Stops',
      toolsDescription: 'These stay, but they no longer interrupt the main reading flow.',
    },
  },
  ja: {
    destinyKline: {
      eyebrow: '命運K線',
      title: 'あなたの人生タイムライン',
      description: '全体像を見ます。今の年がどこにあり、次のチャンスがいつ開くのかを確認してください。',
    },
    pastProof: {
      eyebrow: '過去の検証',
      title: 'あなたのチャートを検証しましょう',
      description: 'あなたの惑星の位置がこれらの瞬間を予測しました。合っているか教えてください。',
    },
    cosmicProfile: {
      eyebrow: 'コズミック・プロフ',
      title: 'あなたの宇宙的アイデンティティ',
      description: 'あなた独自の惑星配置 — スコア、順位、他の人との比較。',
    },
    deepReading: {
      eyebrow: '深層リーディング',
      title: 'なぜこのパターンが繰り返されるのか',
      description: 'ここでは曲線を意味に変えます。何が繰り返され、何が開きつつあり、どの配置が今の体験を動かしているのかを読み解きます。',
    },
    actionMap: {
      eyebrow: '次にどう動くか',
      title: '次の章をどう進むか',
      cards: {
        focus: '焦点',
        next: '次の窓',
        guard: '注意点',
        guardTitle: '反応よりも慎重さを',
      },
      futureEyebrow: '未来のウィンドウ',
      futureTitle: 'これから先のタイムライン',
    },
    unlock: {
      eyebrow: 'さらに深く',
      title: 'このリーディングを続ける',
      description: 'もっと具体的に聞く、結果を保存する、あるいは次に見るべきツールへ進むための場所です。',
      askEyebrow: 'Ask Chart',
      askTitle: 'まだ確認したいことがありますか？',
      askDescription: 'Ask Chart は右下に固定されているので、読みながら疑問が出た瞬間にいつでも開けます。',
      askCta: 'Ask Chart を開く',
      toolsEyebrow: 'ツール',
      toolsTitle: '次に役立つ場所',
      toolsDescription: '必要な時に使えるまま残しますが、メインの読みの流れは邪魔しません。',
    },
  },
  es: {
    destinyKline: {
      eyebrow: 'K-Line del Destino',
      title: 'Tu Línea de Tiempo, Revelada',
      description: 'La imagen completa: dónde has estado, dónde estás ahora y cuándo se abre la próxima ventana.',
    },
    pastProof: {
      eyebrow: 'Prueba del Pasado',
      title: 'Verifiquemos Tu Carta',
      description: 'Tus posiciones planetarias predijeron estos momentos. Dinos si coinciden.',
    },
    cosmicProfile: {
      eyebrow: 'Perfil Cósmico',
      title: 'Tu Identidad Cósmica',
      description: 'Tu huella planetaria única — puntuaciones, ranking y cómo te comparas.',
    },
    deepReading: {
      eyebrow: 'Por Qué Se Siente Así',
      title: 'Por Qué Este Patrón Se Repite',
      description: 'Este capítulo convierte la curva en significado: qué se repite, qué se está abriendo y qué partes de tu carta están impulsando esta experiencia.',
    },
    actionMap: {
      eyebrow: 'Qué Hacer Ahora',
      title: 'Cómo Atravesar El Próximo Capítulo',
      cards: {
        focus: 'Enfoque',
        next: 'Próxima Ventana',
        guard: 'Cuidado',
        guardTitle: 'Muévete con calma, no por reacción',
      },
      futureEyebrow: 'Ventanas Futuras',
      futureTitle: 'Tu Línea de Tiempo Más Amplia',
    },
    unlock: {
      eyebrow: 'Profundizar',
      title: 'Sigue Con La Lectura',
      description: 'Haz una pregunta más precisa, guarda tu resultado o entra a las herramientas que siguen siendo útiles después de la lectura principal.',
      askEyebrow: 'Ask Chart',
      askTitle: '¿Todavía necesitas claridad sobre algo?',
      askDescription: 'Ask Chart permanece fijo en la esquina inferior derecha para que puedas abrirlo en el momento en que aparezca una duda.',
      askCta: 'Abrir Ask Chart',
      toolsEyebrow: 'Herramientas',
      toolsTitle: 'Siguientes Pasos Útiles',
      toolsDescription: 'Se mantienen disponibles, pero ya no interrumpen el flujo principal de lectura.',
    },
  },
} as const;


function ActionableFutureCliffhanger({ onActionGate, tier, klineData, transitDetails, aiYearInsights }: any) {
  if (tier === 'PRO') {
    return (
      <FiveYearPlan
        klineData={klineData}
        transitDetails={transitDetails}
        aiYearInsights={aiYearInsights}
      />
    );
  }

  const currentYear = new Date().getFullYear();
  const previewMoments = describeFutureMoment(klineData, transitDetails, currentYear).slice(0, 3);

  return (
    <div className="relative py-8">
      <div
        className="mx-auto grid max-w-4xl gap-4 px-4 pb-40 opacity-55 select-none [mask-image:linear-gradient(to_bottom,black_0%,transparent_72%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,transparent_72%)] md:grid-cols-3"
        aria-hidden="true"
      >
        {previewMoments.map((moment) => {
          const insight = aiYearInsights[moment.year];
          return (
            <div key={moment.year} className="border border-white/[0.06] bg-white/[0.02] p-5 text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/70">{moment.label}</p>
              <p className="mt-3 font-serif text-2xl text-white/88">{moment.year}</p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                {normalizeActionCopy(insight?.aiSummary || moment.summary)}
              </p>
              {insight?.aiAdvice ? (
                <p className="mt-3 text-xs leading-6 text-[#D4AF37]/78">
                  {normalizeActionCopy(insight.aiAdvice)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Overlay Paywall */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex h-3/4 flex-col items-center justify-end bg-gradient-to-t from-background via-background/90 to-transparent pb-16">
        <button 
          onClick={() => onActionGate?.('unlock_5_year_plan', 'FREE')}
          className="group flex flex-col items-center gap-1 transition-transform hover:scale-105"
        >
          <span className="flex items-center gap-2 bg-[#D4AF37] px-10 py-4 text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_40px_rgba(212,175,55,0.1)]">
            <Sparkles className="h-4 w-4" />
            See What's Coming for You
          </span>
          <span className="mt-4 font-mono text-[9.5px] uppercase tracking-widest text-[#D4AF37]/50 transition-colors group-hover:text-[#D4AF37]/80">
            Your career, timing, and turning points — revealed
          </span>
        </button>
      </div>
    </div>
  );
}

import { PlanetIcon } from '@/components/icons';
import type { Planet } from '@/components/icons/astro-types';

const STEP_PLANET: Record<number, Planet> = {
  1: 'saturn',
  2: 'jupiter',
  3: 'sun',
  4: 'neptune',
  5: 'mars',
  6: 'pluto',
};

function SectionLead({
  step,
  title,
  description,
}: {
  step?: number;
  title: string;
  description: string;
}) {
  const planet = step != null ? STEP_PLANET[step] : undefined;
  return (
    <div className="mb-8">
      {step != null && (
        <div className="mb-2 flex items-center gap-2">
          {planet && <PlanetIcon planet={planet} size={16} className="opacity-50" />}
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]/60">
            {String(step).padStart(2, '0')}
          </p>
        </div>
      )}
      <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
        {title}
      </Heading>
      {description.trim() ? (
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function DiagnosisPreview({
  profile,
  onActionGate,
  tier,
}: {
  profile: UserProfile;
  // eslint-disable-next-line no-unused-vars
  onActionGate: (context?: string, tier?: string) => void;
  tier: string;
}) {
  const previewCards = [
    {
      title: 'Core Pattern',
      text: `${profile.sun.sign} drive and ${profile.moon.sign} sensitivity create your baseline timing tension. That inner split explains why some windows feel powerful and fragile at the same time.`,
    },
    {
      title: 'Career Trigger',
      text: 'Your chart is not asking for endless effort. It is asking for precise timing, especially around public visibility, leverage, and reputation shifts.',
    },
    {
      title: 'Pressure Pattern',
      text: 'There is a recurring resistance cycle that mirrors your Saturn return rhythm. The full diagnosis maps when to push through and when to step back.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {previewCards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">{card.title}</p>
            <p className="mt-4 text-sm leading-7 text-white/72">{card.text}</p>
          </div>
        ))}
      </div>

      <div className="border border-[#D4AF37]/15 bg-[#D4AF37]/[0.04] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Diagnosis Preview</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/75">
              The full diagnosis unlocks your timing logic across career, money, love, health, strengths, and shadow patterns. This is where the chart stops being decorative and starts becoming useful.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onActionGate?.('diagnosis_preview', tier === 'GUEST' ? 'FREE' : 'LITE')}
            className="inline-flex shrink-0 items-center gap-2 bg-[#D4AF37] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.01]"
          >
            Unlock Full Diagnosis
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SharedKlineResultProps {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  tier: string;
  // eslint-disable-next-line no-unused-vars
  onActionGate: (context?: string, tier?: string) => void;
  hideFloatingNav?: boolean;
  radarData?: any[] | null;
  next30Days?: Next30DaysGuidance | null;
  klineId?: string;
  initialAiInsight?: AiInsightData | null;
  // eslint-disable-next-line no-unused-vars
  onAiInsightResolved?: (insight: AiInsightData) => void;
}

export function SharedKlineResult({
  profile,
  klineData,
  transitDetails,
  tier,
  onActionGate,
  hideFloatingNav,
  klineId,
  initialAiInsight,
  onAiInsightResolved,
}: SharedKlineResultProps) {
  const locale = useLocale();
  const copy = SECTION_COPY[locale as keyof typeof SECTION_COPY] ?? SECTION_COPY.en;
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [askChartOpen, setAskChartOpen] = useState(false);
  const [askChartPrompt, setAskChartPrompt] = useState<AskChartContextPrompt | null>(null);
  const [validatePastOpen, setValidatePastOpen] = useState(false);
  const [aiBrief, setAiBrief] = useState<KlineAIBundle | null>(null);
  const [aiBriefStatus, setAiBriefStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [aiYearInsights, setAiYearInsights] = useState<Record<number, { aiSummary: string; aiAdvice: string }>>({});
  const [deepRequested, setDeepRequested] = useState(false);

  const birthYear = parseInt(profile?.birthDate?.split('-')[0] || '1990', 10);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentPoint = klineData.find(p => p.year === currentYear);
  const currentScore = currentPoint?.score ?? 65;
  const currentMonthLabel = monthNames[currentMonth];
  const firstName = (profile?.name || 'Voyager').split(' ')[0];
  const bundleTier: KlineBundleTier = tier === 'PRO' || tier === 'PREMIUM'
    ? 'PRO'
    : tier === 'LITE' || tier === 'STANDARD'
      ? 'LITE'
      : 'HERO';
  const stageNarrative = buildStageNarrative(
    currentScore,
    currentPoint?.stage ?? 'Transition Window',
    currentMonthLabel
  );
  const futureMoments = describeFutureMoment(klineData, transitDetails, currentYear);
  const nextWindow = futureMoments.find((moment) => moment.label === 'Next Opening') ?? futureMoments[0];
  const guardrailWindow = futureMoments.find(
    (moment) => moment.label === 'Protection Window' && moment.year !== nextWindow?.year
  )
    ?? futureMoments.find((moment) => moment.year !== nextWindow?.year)
    ?? futureMoments.find((moment) => moment.label === 'Protection Window')
    ?? futureMoments[futureMoments.length - 1];
  const briefAction = aiBrief?.action;
  const heroBriefInsight: AiInsightData | null = aiBrief
    ? {
        nickname: aiBrief.hero.nickname ?? undefined,
        coreQuote: aiBrief.hero.coreQuote ?? undefined,
        summary: aiBrief.hero.title ?? undefined,
        relationships: aiBrief.diagnosis?.relationships ?? undefined,
        dashaTimeline: aiBrief.diagnosis?.dashaTimeline ?? undefined,
        career: aiBrief.diagnosis?.career ?? undefined,
        wealth: aiBrief.diagnosis?.wealth ?? undefined,
        health: aiBrief.diagnosis?.health ?? undefined,
        strengths: aiBrief.diagnosis?.strengths ?? undefined,
        warnings: aiBrief.diagnosis?.warnings ?? undefined,
      }
    : null;
  const diagnosisBriefInsight: AiInsightData | null = hasDiagnosisContent(aiBrief)
    ? {
        nickname: aiBrief?.hero.nickname ?? undefined,
        coreQuote: aiBrief?.hero.coreQuote ?? undefined,
        summary: aiBrief?.diagnosis?.summary ?? undefined,
        relationships: aiBrief?.diagnosis?.relationships ?? undefined,
        love: aiBrief?.diagnosis?.relationships ?? undefined,
        career: aiBrief?.diagnosis?.career ?? undefined,
        wealth: aiBrief?.diagnosis?.wealth ?? undefined,
        health: aiBrief?.diagnosis?.health ?? undefined,
        strengths: aiBrief?.diagnosis?.strengths ?? undefined,
        warnings: aiBrief?.diagnosis?.warnings ?? undefined,
        shadow: aiBrief?.diagnosis?.warnings ?? undefined,
        dashaTimeline: aiBrief?.diagnosis?.dashaTimeline ?? undefined,
        marriage: aiBrief?.diagnosis?.marriage ?? undefined,
        karma: aiBrief?.diagnosis?.karma ?? undefined,
        family: aiBrief?.diagnosis?.family ?? undefined,
        children: aiBrief?.diagnosis?.children ?? undefined,
        spirituality: aiBrief?.diagnosis?.spirituality ?? undefined,
        education: aiBrief?.diagnosis?.education ?? undefined,
        authority: aiBrief?.diagnosis?.authority ?? undefined,
        lifestyle: aiBrief?.diagnosis?.lifestyle ?? undefined,
        hiddenDangers: aiBrief?.diagnosis?.hiddenDangers ?? undefined,
      }
    : null;
  const currentYearInsight = aiYearInsights[currentYear];
  const nextWindowInsight = nextWindow ? aiYearInsights[nextWindow.year] : undefined;
  const guardrailInsight = guardrailWindow ? aiYearInsights[guardrailWindow.year] : undefined;
  const fallbackAiInsight = aiBriefStatus === 'error' ? initialAiInsight : null;
  const heroAiInsight = heroBriefInsight ?? fallbackAiInsight;
  const diagnosisInsight = diagnosisBriefInsight ?? (aiBriefStatus === 'error' ? initialAiInsight : null);
  const shouldHoldDiagnosisForBrief =
    (tier === 'LITE' || tier === 'PRO')
    && !hasDiagnosisContent(aiBrief)
    && aiBriefStatus !== 'error';
  const askChartContextSnippet = pickAskChartContextSnippet(
    selectedYear ? aiYearInsights[selectedYear]?.aiSummary : null,
    selectedYear ? aiYearInsights[selectedYear]?.aiAdvice : null,
    aiBrief?.askContext.chartSummary,
    diagnosisInsight?.summary,
    stageNarrative.summary,
  );
  const askChartDefaultPrompt: AskChartContextPrompt = {
    id: `kline-brief-default:${klineId || profile.birthDate || profile.name || 'chart'}:${selectedYear ?? 'current'}:${aiBrief?.meta.generatedAt ?? 'fallback'}`,
    label: selectedYear ? `Year ${selectedYear}` : 'Current reading',
    text: selectedYear
      ? `What is ${selectedYear} really asking me to understand or do differently?`
      : aiBrief?.askContext.currentQuestionHooks[0] || 'What is this current chapter asking me to focus on right now?',
    contextSnippet: askChartContextSnippet,
    sourceType: selectedYear ? 'year' : 'module',
    sourceKey: selectedYear ? `kline-year-${selectedYear}` : 'kline-brief',
    selectedYear,
  };
  const askChartStarterPrompts = (aiBrief?.askContext.currentQuestionHooks ?? [])
    .filter((prompt) => prompt !== askChartDefaultPrompt.text)
    .slice(0, 4);
  const actionCards = [
    {
      label: copy.actionMap.cards.focus,
      title: normalizeActionCopy(briefAction?.currentFocus?.summary || currentYearInsight?.aiSummary || nextWindowInsight?.aiSummary || stageNarrative.title),
      summary: normalizeActionCopy(
        briefAction?.currentFocus?.advice
        || currentYearInsight?.aiAdvice
        || nextWindowInsight?.aiAdvice
        || stageNarrative.summary,
      ),
    },
    {
      label: copy.actionMap.cards.next,
      title: briefAction?.nextWindow?.year ? String(briefAction.nextWindow.year) : nextWindow ? String(nextWindow.year) : currentYear.toString(),
      summary: normalizeActionCopy(briefAction?.nextWindow?.summary || nextWindowInsight?.aiSummary
        || nextWindow?.summary
        || stageNarrative.advice),
    },
    {
      label: copy.actionMap.cards.guard,
      title: briefAction?.guardrail?.year ? String(briefAction.guardrail.year) : guardrailWindow ? String(guardrailWindow.year) : copy.actionMap.cards.guardTitle,
      summary: normalizeActionCopy(briefAction?.guardrail?.advice
        || briefAction?.guardrail?.summary
        || guardrailInsight?.aiAdvice
        || normalizeActionCopy(guardrailInsight?.aiSummary)
        || guardrailWindow?.summary
        || stageNarrative.advice),
    },
  ];

  const handleHeroSecondaryAction = () => {
    document
      .getElementById('destiny-kline')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeroYearSelect = (year: number) => {
    setSelectedYear(year);
    trackEvent('result_key_year_click', {
      year,
      source: 'hero_deck',
    });
    document
      .getElementById('destiny-kline')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const prefetchActionInsights = useCallback(async (cacheKey: string, keyYears: KeyYearInput[]) => {
    if (bundleTier === 'HERO' || keyYears.length === 0) {
      return;
    }

    try {
      logKlineClientEvent('kline_action_request_started', {
        tier: bundleTier,
        years: keyYears.map((item) => item.year),
      });

      const { insights } = await runClientRequest(
        `${cacheKey}:action`,
        async () => {
          const res = await fetch('/api/astrology/key-year-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile,
              keyYears,
              locale,
            }),
          });

          if (!res.ok) {
            throw new Error('key-year-insights request failed');
          }

          return res.json();
        },
        { ttlMs: 60_000 },
      );

      if (!Array.isArray(insights) || insights.length === 0) {
        return;
      }

      setAiYearInsights((currentInsights) => {
        const nextInsights = { ...currentInsights };

        insights.forEach((item: { year: number; aiSummary: string; aiAdvice: string }) => {
          if (!item?.year) {
            return;
          }

          nextInsights[item.year] = {
            aiSummary: item.aiSummary,
            aiAdvice: item.aiAdvice,
          };
        });

        return nextInsights;
      });

      logKlineClientEvent('kline_action_rendered', {
        tier: bundleTier,
        years: insights.map((item: { year: number }) => item.year),
      });
    } catch {
      // Fallback action cards already render from rule-based timeline data.
    }
  }, [bundleTier, locale, profile]);

  const prefetchAiBrief = useCallback(async () => {
    if (!profile || !klineData?.length || !transitDetails) return;

    setAiBriefStatus('loading');
    setDeepRequested(false);

    const keyYears = buildKeyYearsForTimeline(profile, klineData, transitDetails, currentYear);

    if (keyYears.length === 0) {
      setAiBriefStatus('error');
      return;
    }

    try {
      const cacheKey = `kline:brief:${klineId || profile.birthDate || profile.name || 'chart'}:${bundleTier}:${keyYears.map((point) => point.year).join(',')}`;
      const phasePlan = getPhasePlanForTier(bundleTier);
      let mergedBundle: KlineAIBundle | null = null;

      for (const phase of phasePlan) {
        const { bundle } = await runClientRequest(
          `${cacheKey}:${phase}`,
          async () => {
            logKlineClientEvent(`kline_${phase}_request_started`, {
              tier: bundleTier,
              klineId: klineId || profile.birthDate || profile.name || 'chart',
            });

            const res = await fetch('/api/astrology/kline-brief', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profile,
                tier: bundleTier,
                phase,
                locale,
                keyYears,
                includeDiagnosis: bundleTier !== 'HERO',
                includeAction: phase === 'full' && bundleTier !== 'HERO',
              }),
            });
            if (!res.ok) {
              throw new Error(`kline-brief ${phase} request failed`);
            }

            return res.json();
          },
          { ttlMs: 60_000 }
        );

        if (!bundle) {
          continue;
        }

        mergedBundle = mergeKlineBundle(mergedBundle, bundle);
        setAiBrief(mergedBundle);
        setAiYearInsights(buildYearInsightMap(mergedBundle));
        logKlineClientEvent(`kline_${phase}_rendered`, {
          tier: bundleTier,
          includedSections: mergedBundle.meta.includedSections,
        });

        if (phase === 'hero') {
          void prefetchActionInsights(cacheKey, keyYears);
        }
      }

      if (mergedBundle) {
        setAiBriefStatus('ready');
      } else {
        setAiBriefStatus('error');
      }
    } catch {
      setAiBriefStatus('error');
    }
  }, [bundleTier, currentYear, klineId, klineData, prefetchActionInsights, profile, transitDetails]);

  useEffect(() => {
    prefetchAiBrief();
  }, [prefetchAiBrief]);

  useEffect(() => {
    if (bundleTier !== 'PRO' || deepRequested || aiBriefStatus !== 'ready' || !hasDiagnosisContent(aiBrief)) {
      return;
    }

    const diagnosisSection = document.getElementById('deep-reading');
    if (!diagnosisSection) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDeepRequested(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '240px 0px',
        threshold: 0.15,
      },
    );

    observer.observe(diagnosisSection);
    return () => observer.disconnect();
  }, [aiBrief, aiBriefStatus, bundleTier, deepRequested]);

  useEffect(() => {
    if (!deepRequested || bundleTier !== 'PRO' || !profile || !klineData?.length || !transitDetails) {
      return;
    }

    const keyYears = buildKeyYearsForTimeline(profile, klineData, transitDetails, currentYear);
    const cacheKey = `kline:brief:${klineId || profile.birthDate || profile.name || 'chart'}:${bundleTier}:${keyYears.map((point) => point.year).join(',')}`;

    let cancelled = false;

    const loadDeepBundle = async () => {
      try {
        const { bundle } = await runClientRequest(
          `${cacheKey}:deep`,
          async () => {
            logKlineClientEvent('kline_deep_request_started', {
              tier: bundleTier,
              klineId: klineId || profile.birthDate || profile.name || 'chart',
            });

            const res = await fetch('/api/astrology/kline-brief', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profile,
                tier: bundleTier,
                phase: 'deep',
                locale,
                keyYears,
                includeDiagnosis: true,
                includeAction: false,
              }),
            });

            if (!res.ok) {
              throw new Error('kline-brief deep request failed');
            }

            return res.json();
          },
          { ttlMs: 60_000 },
        );

        if (!bundle || cancelled) {
          return;
        }

        setAiBrief((currentBundle) => mergeKlineBundle(currentBundle, bundle));
        logKlineClientEvent('kline_deep_rendered', {
          tier: bundleTier,
          includedSections: bundle.meta.includedSections,
        });
      } catch {
        // Deep is enhancement-only; keep core reading stable if it fails.
      }
    };

    void loadDeepBundle();

    return () => {
      cancelled = true;
    };
  }, [bundleTier, currentYear, deepRequested, klineData, klineId, locale, profile, transitDetails]);

  const handleAskChartOpen = () => {
    setAskChartPrompt({
      ...askChartDefaultPrompt,
      id: `${askChartDefaultPrompt.id}:launch:${Date.now()}`,
    });
    setAskChartOpen(true);
  };

  return (
    <>
    <div className="w-full">
      {!hideFloatingNav ? <FloatingNav /> : null}

      <ReportSection id="destiny-kline" divider={false} className="py-8 md:pt-12">
        <SectionLead
          step={1}
          title={copy.destinyKline.title}
          description={copy.destinyKline.description}
        />

        <SectionShell className="overflow-visible px-0 py-0">
          <div id="kline-hero">
            <InteractiveChart
              data={klineData}
              transitDetails={transitDetails}
              onNodeClick={(year) => setSelectedYear(year)}
              selectedYear={selectedYear}
              birthYear={birthYear}
              profileName={profile?.name}
              tier={tier as any}
              onActionGate={onActionGate}
              aiYearInsights={aiYearInsights}
            />
          </div>
        </SectionShell>
      </ReportSection>

      {/* ── 2. PAST PROOF ── */}
      <ReportSection id="past-proof" divider={false} className="py-8">
        <SectionLead
          step={2}
          title={copy.pastProof.title}
          description={copy.pastProof.description}
        />
        <ChartValidation
          klineData={klineData}
          transitDetails={transitDetails}
          birthYear={birthYear}
        />
      </ReportSection>

      {/* ── 3. COSMIC PROFILE ── */}
      <ReportSection id="cosmic-profile" divider={false} className="py-8 md:py-12">
        <SectionLead
          step={3}
          title={copy.cosmicProfile.title}
          description={copy.cosmicProfile.description}
        />

        <ResultCommandDeck
          profile={profile}
          klineData={klineData}
          transitDetails={transitDetails}
          aiInsight={heroAiInsight}
          heroInsight={aiBrief?.hero}
          onSecondaryAction={handleHeroSecondaryAction}
          onYearSelect={handleHeroYearSelect}
        />

        <div className="mt-6">
          <SignComparison profile={profile} klineData={klineData} />
        </div>
      </ReportSection>

      {/* ── 4. DEEP READING ── */}
      <ReportSection id="deep-reading" divider={false} className="py-14">
        <SectionLead
          step={4}
          title={copy.deepReading.title}
          description={copy.deepReading.description}
        />

        {(tier === 'LITE' || tier === 'PRO') ? (
          <SectionShell className="p-5 md:p-6">
            <div id="ai-reading">
              {shouldHoldDiagnosisForBrief ? (
                <div className="space-y-4">
                  <div className="h-4 w-40 animate-pulse bg-white/8" />
                  <div className="h-24 animate-pulse border border-white/8 bg-white/[0.02]" />
                  <div className="h-24 animate-pulse border border-white/8 bg-white/[0.02]" />
                </div>
              ) : (
                <AiReadingPanels
                  profile={profile}
                  tier={tier}
                  onActionGate={onActionGate}
                  selectedYear={selectedYear}
                  klineId={klineId}
                  initialInsight={diagnosisInsight}
                  allowLegacyFetch={aiBriefStatus === 'error'}
                  onInsightResolved={onAiInsightResolved}
                />
              )}
            </div>
          </SectionShell>
        ) : (
          <DiagnosisPreview profile={profile} onActionGate={onActionGate} tier={tier} />
        )}
      </ReportSection>

      <ReportSection id="action-map" divider={false} className="py-14">
        <SectionLead
          step={5}
          title={copy.actionMap.title}
          description=""
        />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {actionCards.map((card) => (
            <SectionShell key={card.label} className="p-4 md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/75">{card.label}</p>
              <p className="mt-3 text-[15px] font-semibold text-white/90">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">{card.summary}</p>
            </SectionShell>
          ))}
        </div>

        <SectionShell>
          <ActionableFutureCliffhanger tier={tier} onActionGate={onActionGate} klineData={klineData} transitDetails={transitDetails} aiYearInsights={aiYearInsights} />
        </SectionShell>
      </ReportSection>

      <ReportSection id="unlock" divider={false} className="py-14">
        <SectionLead
          step={6}
          title={copy.unlock.title}
          description={copy.unlock.description}
        />

        <div className="space-y-6">
          <SectionShell>
            <p className="text-[15px] font-semibold text-white/80">{copy.unlock.askTitle}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">{copy.unlock.askDescription}</p>
            <button
              type="button"
              onClick={handleAskChartOpen}
              className="mt-5 inline-flex items-center gap-2 bg-[#D4AF37] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.01]"
            >
              {copy.unlock.askCta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </SectionShell>

          <SectionShell>
            <div className="mb-5">
              <p className="text-[15px] font-semibold text-white/80">{copy.unlock.toolsTitle}</p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">{copy.unlock.toolsDescription}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { icon: TrendingUp, label: 'Energy Forecast', desc: 'See your month-by-month energy peaks and dips.', color: 'text-purple-400', borderColor: 'border-purple-400/20 hover:border-purple-400/40', bgColor: 'bg-purple-400/5', href: '/dashboard/tools/energy' },
                { icon: Users, label: 'Compatibility', desc: 'Discover chemistry and friction with anyone.', color: 'text-rose-400', borderColor: 'border-rose-400/20 hover:border-rose-400/40', bgColor: 'bg-rose-400/5', href: '/dashboard/tools/compatibility' },
              ].map((tool, i) => (
                <motion.a
                  key={tool.label}
                  href={tool.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={cn(
                    'group flex flex-col items-center gap-3 border p-6 text-center transition-all hover:scale-[1.02] hover:shadow-lg',
                    tool.borderColor,
                    'bg-white/[0.01]'
                  )}
                >
                  <div className={cn('flex h-12 w-12 items-center justify-center border', tool.borderColor, tool.bgColor)}>
                    <tool.icon className={cn('h-5 w-5', tool.color)} />
                  </div>
                  <p className="text-sm font-bold text-white/80">{tool.label}</p>
                  <p className="text-[11px] leading-relaxed text-white/40">{tool.desc}</p>
                  <span className={cn('mt-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100', tool.color)}>
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.a>
              ))}
            </div>
          </SectionShell>

          {(tier === 'GUEST' || tier === 'FREE') && (
            <SectionShell className="bg-gradient-to-r from-[#D4AF37]/[0.04] to-transparent">
              <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                  <Users className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white/80">Know someone who needs this?</p>
                  <p className="mt-1 text-xs text-white/40">Share your reading. When 3 friends sign up through your link, you unlock Lite features free for a month.</p>
                </div>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?ref=${encodeURIComponent(firstName)}`;
                    if (navigator.share) {
                      navigator.share({ title: `${firstName}'s Cosmic Timeline`, url });
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  className="shrink-0 flex items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Share My Reading
                </button>
              </div>
            </SectionShell>
          )}

          <SectionShell>
            <CosmicIdCard profile={profile} klineData={klineData} />
          </SectionShell>
        </div>
      </ReportSection>
    </div>

    {/* ── FLOATING: ASK YOUR CHART (desktop FAB + mobile full-screen panel) ── */}
    <AskChartPanel
      profile={profile}
      tier={tier}
      onActionGate={onActionGate}
      defaultPrompt={askChartDefaultPrompt}
      starterPrompts={askChartStarterPrompts}
      externalOpen={askChartOpen}
      externalPrompt={askChartPrompt}
      onExternalClose={() => { setAskChartOpen(false); setAskChartPrompt(null); setValidatePastOpen(false); }}
      externalValidatePast={validatePastOpen}
    />
    </>
  );
}

