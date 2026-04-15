'use client';

import {
  Activity,
  ArrowRight,
  CalendarRange,
  Flame,
  HeartPulse,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

import type { AiInsightData } from '@/lib/astrokline/ai-insight-cache';
import type { KlineHeroInsight } from '@/lib/astrokline/kline-ai-bundle';
import { cn } from '@/shared/lib/utils';
import type {
  DestinyScorePoint,
  TransitEvent,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';

type YearAnchor = {
  year: number;
  label: string;
  badge: string;
  summary: string;
  score: number;
  accentClass: string;
};

interface ResultCommandDeckProps {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  aiInsight?: AiInsightData | null;
  heroInsight?: KlineHeroInsight | null;
  onSecondaryAction(): void;
  // eslint-disable-next-line no-unused-vars
  onYearSelect(year: number): void;
}

type InsightTextKey =
  | 'summary'
  | 'career'
  | 'wealth'
  | 'love'
  | 'relationships'
  | 'health'
  | 'strengths';

function normalizeInsightText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function splitInsightSentences(value?: string | null) {
  return normalizeInsightText(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getThemeInsightField(theme?: string | null): InsightTextKey {
  switch (theme?.toLowerCase()) {
    case 'career':
      return 'career';
    case 'wealth':
      return 'wealth';
    case 'love':
      return 'love';
    case 'relationships':
      return 'relationships';
    case 'health':
      return 'health';
    case 'growth':
      return 'strengths';
    default:
      return 'summary';
  }
}

function isUsableHeroSentence(value?: string | null) {
  const text = normalizeInsightText(value);
  return (
    text.length >= 28 &&
    text.length <= 140 &&
    !/\bhouse\b|\bnatal\b|your sun in|your moon in|rising sign/i.test(text)
  );
}

function getUsableCoreQuote(value?: string | null) {
  const text = normalizeInsightText(value);
  if (isUsableHeroSentence(text)) {
    return text;
  }

  const fragments = text
    .split(/\s+[—-]\s+/)
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  for (let index = fragments.length - 1; index >= 0; index -= 1) {
    const fragment = fragments[index];
    if (isUsableHeroSentence(fragment)) {
      return fragment.charAt(0).toUpperCase() + fragment.slice(1);
    }
  }

  return '';
}

function getWindowProfile(score: number, stage: string) {
  if (score >= 78) {
    return {
      eyebrow: 'Acceleration Window',
      title: 'This chapter is open and moving',
      summary:
        'Momentum is here if you stay clear, focused, and consistent.',
      recognition:
        'You can feel the opening, but it fades when your attention splits too far.',
      nextMove:
        'Stay close to what is already working. This phase rewards steadiness over sprawl.',
      risk: 'Carrying too much at once will blur the signal.',
      accentClass: 'text-emerald-300',
      surfaceClass: 'border-emerald-400/20 bg-emerald-400/[0.06]',
      signal: `Stage: ${stage}`,
    };
  }

  if (score >= 60) {
    return {
      eyebrow: 'Building Window',
      title: 'Something important is building, but it still needs shape',
      summary:
        'Movement is here, but it still needs a cleaner container.',
      recognition:
        'This phase often feels stop-start: ready to move, not ready to lock in.',
      nextMove:
        'Tighten the structure before you speed up. Order makes the next opening stronger.',
      risk: 'Moving too early can make a real opening feel weaker than it is.',
      accentClass: 'text-amber-200',
      surfaceClass: 'border-amber-300/20 bg-amber-300/[0.06]',
      signal: `Stage: ${stage}`,
    };
  }

  if (score >= 45) {
    return {
      eyebrow: 'Transition Window',
      title: 'This chapter is quiet, so clarity matters more than speed',
      summary:
        'The chart is between openings, not fully closed.',
      recognition:
        'Nothing is fully blocked, but nothing feels clean enough to trust right away.',
      nextMove:
        'Simplify, notice what repeats, and let the next move become obvious before you force it.',
      risk: 'If you read uncertainty as failure, this chapter will feel heavier than it is.',
      accentClass: 'text-sky-200',
      surfaceClass: 'border-sky-300/20 bg-sky-300/[0.06]',
      signal: `Stage: ${stage}`,
    };
  }

  return {
    eyebrow: 'Protective Window',
    title: 'Right now the chart is asking for softer pacing and stronger boundaries',
    summary:
      'Reduce noise, recover energy, and get more selective.',
    recognition:
      'If things feel heavy, the system is asking for cleaner edges, not more force.',
    nextMove:
      'Protect energy, cut noise, and keep only the commitments that still deserve your best attention.',
    risk: 'Forcing expansion here will cost more than it gives back.',
    accentClass: 'text-rose-200',
    surfaceClass: 'border-rose-300/20 bg-rose-300/[0.06]',
    signal: `Stage: ${stage}`,
  };
}

function formatTransitSummary(event: TransitEvent | undefined, point: DestinyScorePoint) {
  if (event) {
    return `${event.planet} ${event.aspect} in ${event.theme.toLowerCase()} reshapes this chapter.`;
  }

  if (point.isPeak) return 'A high-conviction expansion window is forming here.';
  if (point.isCrossroads) return 'A decision year that changes the shape of the next cycle.';
  if (point.score <= 45) return 'Pressure rises here; protect capital, energy, and attention.';
  return `${point.energyLevel} momentum with a ${point.stage.toLowerCase()} tone.`;
}

function buildYearAnchor(
  point: DestinyScorePoint,
  event: TransitEvent | undefined,
  currentYear: number
): YearAnchor {
  if (point.year === currentYear) {
    return {
      year: point.year,
      label: 'Current Chapter',
      badge: point.stage,
      summary: formatTransitSummary(event, point),
      score: point.score,
      accentClass: 'border-amber-300/30 bg-amber-300/[0.08] text-amber-100',
    };
  }

  if (point.isPeak) {
    return {
      year: point.year,
      label: 'Peak Window',
      badge: event?.theme ?? 'Expansion',
      summary: formatTransitSummary(event, point),
      score: point.score,
      accentClass: 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-100',
    };
  }

  if (point.isCrossroads) {
    return {
      year: point.year,
      label: 'Decision Gate',
      badge: event?.theme ?? 'Pivot',
      summary: formatTransitSummary(event, point),
      score: point.score,
      accentClass: 'border-sky-400/25 bg-sky-400/[0.07] text-sky-100',
    };
  }

  if (point.score <= 45) {
    return {
      year: point.year,
      label: 'Pressure Test',
      badge: event?.theme ?? 'Protection',
      summary: formatTransitSummary(event, point),
      score: point.score,
      accentClass: 'border-rose-400/25 bg-rose-400/[0.07] text-rose-100',
    };
  }

  return {
    year: point.year,
    label: 'Build Phase',
    badge: point.stage,
    summary: formatTransitSummary(event, point),
    score: point.score,
    accentClass: 'border-white/10 bg-white/[0.04] text-white/85',
  };
}

function getAnchorYears(
  klineData: DestinyScorePoint[],
  transitDetails: Record<number, TransitEvent[]>,
  currentYear: number
) {
  const currentPoint = klineData.find((point) => point.year === currentYear);
  const future = klineData.filter((point) => point.year > currentYear && point.year <= currentYear + 12);
  const byPriority = [
    currentPoint,
    future.find((point) => point.isPeak),
    future.find((point) => point.isCrossroads),
    future.find((point) => point.score <= 45),
    future.find((point) => point.score >= 72),
  ].filter(Boolean) as DestinyScorePoint[];

  const anchors: YearAnchor[] = [];
  const seenYears = new Set<number>();

  for (const point of byPriority) {
    if (seenYears.has(point.year)) continue;
    seenYears.add(point.year);
    anchors.push(buildYearAnchor(point, transitDetails[point.year]?.[0], currentYear));
  }

  if (anchors.length < 4) {
    for (const point of future) {
      if (seenYears.has(point.year)) continue;
      seenYears.add(point.year);
      anchors.push(buildYearAnchor(point, transitDetails[point.year]?.[0], currentYear));
      if (anchors.length === 4) break;
    }
  }

  return anchors.slice(0, 4).sort((left, right) => left.year - right.year);
}

export function ResultCommandDeck({
  profile,
  klineData,
  transitDetails,
  aiInsight,
  heroInsight,
  onSecondaryAction,
  onYearSelect,
}: ResultCommandDeckProps) {
  const currentYear = new Date().getFullYear();
  const currentPoint = klineData.find((point) => point.year === currentYear) ?? klineData[0];
  const currentEvent = currentPoint ? transitDetails[currentPoint.year]?.[0] : undefined;
  const nextPeak = klineData.find((point) => point.year > currentYear && point.isPeak);
  const nextCrossroads = klineData.find((point) => point.year > currentYear && point.isCrossroads);
  const anchors = getAnchorYears(klineData, transitDetails, currentYear);
  const windowProfile = getWindowProfile(currentPoint?.score ?? 55, currentPoint?.stage ?? 'Recalibration');
  const chartOwner = profile.name?.trim() || 'Your chart';
  const themeInsightField = getThemeInsightField(currentEvent?.theme);
  const themeInsightText = themeInsightField ? aiInsight?.[themeInsightField] : aiInsight?.summary;
  const themeInsightSentences = splitInsightSentences(themeInsightText);
  const fallbackInsightSentences = splitInsightSentences(aiInsight?.summary);
  const heroVerdict = heroInsight?.title || windowProfile.title;
  const heroSummary = heroInsight?.supportLine || windowProfile.summary;
  const heroRecognition = heroInsight?.proofLine || (isUsableHeroSentence(themeInsightSentences[1])
    ? themeInsightSentences[1]
    : isUsableHeroSentence(fallbackInsightSentences[0])
      ? fallbackInsightSentences[0]
      : getUsableCoreQuote(aiInsight?.coreQuote)
        ? getUsableCoreQuote(aiInsight?.coreQuote)
        : windowProfile.recognition);
  const bestPosture = (currentPoint?.score ?? 55) >= 78
    ? 'Compound, do not sprawl'
    : (currentPoint?.score ?? 55) >= 60
      ? 'Structure before speed'
      : 'Protect energy first';
  const feltStateTitle = (currentPoint?.score ?? 55) >= 78
    ? 'High-momentum stretch'
    : (currentPoint?.score ?? 55) >= 60
      ? 'Shaping the next move'
      : 'Quiet protection phase';
  const feelingCards = [
    {
      label: 'What it feels like',
      title: feltStateTitle,
      detail: windowProfile.recognition,
      icon: Flame,
      panelClass: 'border-emerald-400/18 bg-emerald-400/[0.05] text-emerald-100',
      iconClass: 'text-emerald-200',
    },
    {
      label: 'Best move now',
      title: bestPosture,
      detail: windowProfile.nextMove,
      icon: HeartPulse,
      panelClass: 'border-sky-400/18 bg-sky-400/[0.05] text-sky-100',
      iconClass: 'text-sky-200',
    },
    {
      label: 'Main risk',
      title: windowProfile.risk,
      detail: currentEvent
        ? `This risk gets louder because ${currentEvent.planet} ${currentEvent.aspect} is hitting your ${currentEvent.theme.toLowerCase()} axis.`
        : windowProfile.signal,
      icon: ShieldAlert,
      panelClass: 'border-rose-400/18 bg-rose-400/[0.05] text-rose-100',
      iconClass: 'text-rose-200',
    },
  ];
  const keyMarkers = [
    {
      label: 'Current Score',
      value: `${currentPoint?.score ?? 55}`,
      suffix: '/100',
      helper: 'Strength of support around you right now',
      icon: Activity,
      cardClass: 'border-[#d9c07a]/30 bg-[#d9c07a]/[0.08]',
      iconClass: 'text-[#f5d27a]',
    },
    {
      label: 'Next Peak',
      value: nextPeak ? String(nextPeak.year) : 'Not set',
      suffix: '',
      helper: nextPeak ? `Next major opening: ${nextPeak.stage}` : 'No clear peak window mapped yet',
      icon: TrendingUp,
      cardClass: 'border-emerald-400/24 bg-emerald-400/[0.07]',
      iconClass: 'text-emerald-200',
    },
    {
      label: 'Decision Gate',
      value: nextCrossroads ? String(nextCrossroads.year) : 'Not set',
      suffix: '',
      helper: nextCrossroads ? `Direction-changing year: ${nextCrossroads.stage}` : 'No pivotal gate mapped yet',
      icon: CalendarRange,
      cardClass: 'border-sky-400/24 bg-sky-400/[0.07]',
      iconClass: 'text-sky-200',
    },
  ];

  return (
    <div className="relative overflow-hidden border border-[#d9c07a]/15 bg-[#0d0c12] px-5 py-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,192,122,0.16),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(90,160,255,0.12),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9c07a]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="relative z-10 space-y-5">
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-base font-medium text-white/88 md:text-lg">{chartOwner}</p>
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] text-white/45">
                <span>{profile.sun?.sign ?? 'Sun'} Sun</span>
                <span className="text-white/20">•</span>
                <span>{profile.moon?.sign ?? 'Moon'} Moon</span>
                <span className="text-white/20">•</span>
                <span>{profile.rising?.sign ?? 'Rising'} Rising</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-serif text-3xl leading-tight text-white md:text-5xl md:leading-[1.02]">
                {heroVerdict}
              </p>
              <p className="text-base leading-8 text-white/62 md:text-[17px]">
                {heroSummary}
              </p>
              <p className="text-base leading-8 text-white/78 md:text-[17px]">
                {heroRecognition}
              </p>
              <div className="border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/72">
                <span className="mr-2 text-[10px] uppercase tracking-[0.18em] text-[#f5d27a]">What to do now</span>
                {windowProfile.nextMove}
              </div>
            </div>
          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {keyMarkers.map((marker) => {
            const Icon = marker.icon;

            return (
              <div
                key={marker.label}
                className={cn(
                  'relative overflow-hidden border px-4 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_20px_60px_rgba(0,0,0,0.24)] md:px-5 md:py-5',
                  marker.cardClass
                )}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/48">
                  <Icon className={cn('h-4 w-4', marker.iconClass)} />
                  <span>{marker.label}</span>
                </div>
                <div className="mt-4 flex items-end gap-2 text-white">
                  <span className="font-serif text-[3.1rem] font-normal leading-none tracking-[-0.04em] md:text-[4.5rem]">
                    {marker.value}
                  </span>
                  {marker.suffix ? (
                    <span className="mb-2 text-sm font-normal text-white/55 md:text-lg">{marker.suffix}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-xs leading-6 text-white/56 md:text-sm">{marker.helper}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {feelingCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={cn(
                  'border px-4 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_18px_50px_rgba(0,0,0,0.22)]',
                  card.panelClass
                )}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                  <Icon className={cn('h-4 w-4', card.iconClass)} />
                  <span>{card.label}</span>
                </div>
                <p className="mt-3 text-base font-semibold leading-7 text-white/88">{card.title}</p>
                <p className="mt-2 text-sm leading-7 text-white/62">{card.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/8 pt-4">
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 border border-white/12 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/78 transition-colors hover:border-white/25 hover:text-white"
          >
            Inspect The Curve
            <ArrowRight className="h-4 w-4" />
          </button>
          <span className="text-[11px] leading-6 text-white/45">
            {currentEvent
              ? `${currentEvent.planet} ${currentEvent.aspect} is the transit making this chapter feel louder.`
              : windowProfile.signal}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
          <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-white/35">Key Years</span>
          {anchors.map((anchor) => (
            <button
              type="button"
              key={anchor.year}
              onClick={() => onYearSelect(anchor.year)}
              className={cn('border px-2.5 py-1 text-xs font-semibold transition-transform hover:scale-[1.02]', anchor.accentClass)}
            >
              {anchor.year} <span className="text-[9px] font-normal uppercase text-white/50">{anchor.label}</span>
            </button>
          ))}
        </div>

        {(() => {
          const yogas = profile.yogas ?? [];
          const d9Venus = profile.planets?.find((p) => p.name === 'Venus')?.navamsa?.sign;
          const d9Moon = profile.moon?.navamsa?.sign;
          if (yogas.length === 0 && !d9Venus && !d9Moon) return null;
          return (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-3">
              {yogas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Active Yogas</span>
                  {yogas.map((yoga) => (
                    <span
                      key={yoga.name}
                      title={yoga.description}
                      className="inline-flex cursor-help items-center gap-1 border border-[#D4AF37]/25 bg-[#D4AF37]/[0.07] px-2 py-0.5 font-mono text-[10px] text-[#D4AF37]/80"
                    >
                      ✦ {yoga.name}
                    </span>
                  ))}
                </div>
              )}
              {(d9Venus || d9Moon) && (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">D9</span>
                  {d9Venus && (
                    <span className="inline-flex items-center gap-1 border border-sky-400/20 bg-sky-400/[0.05] px-2 py-0.5 font-mono text-[10px] text-sky-300/70">
                      Venus · {d9Venus}
                    </span>
                  )}
                  {d9Moon && (
                    <span className="inline-flex items-center gap-1 border border-violet-400/20 bg-violet-400/[0.05] px-2 py-0.5 font-mono text-[10px] text-violet-300/70">
                      Moon · {d9Moon}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}