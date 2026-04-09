'use client';

import {
  ArrowRight,
  CalendarRange,
  Orbit,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

import { Heading } from '@/components/astrokline/ui/heading';
import { cn } from '@/shared/lib/utils';
import type {
  DestinyScorePoint,
  TransitEvent,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

type YearAnchor = {
  year: number;
  label: string;
  badge: string;
  summary: string;
  score: number;
  accentClass: string;
};

function maskName(name?: string) {
  const trimmed = name?.trim();
  if (!trimmed) return 'V***';
  return `${trimmed.charAt(0).toUpperCase()}***`;
}

function getWindowProfile(score: number, stage: string) {
  if (score >= 78) {
    return {
      eyebrow: 'Acceleration Window',
      title: 'Push while the chart is supportive',
      summary:
        'You are in a high-momentum stretch. The chart is rewarding visible moves, decisive positioning, and clean follow-through.',
      risk: 'Main risk: overextending instead of compounding.',
      accentClass: 'text-emerald-300',
      surfaceClass: 'border-emerald-400/20 bg-emerald-400/[0.06]',
      signal: `Stage: ${stage}`,
    };
  }

  if (score >= 60) {
    return {
      eyebrow: 'Building Window',
      title: 'Structure first, then accelerate',
      summary:
        'Momentum is present, but it still needs shape. This is the phase for better positioning, sharper decisions, and disciplined preparation.',
      risk: 'Main risk: moving too early without tightening the plan.',
      accentClass: 'text-amber-200',
      surfaceClass: 'border-amber-300/20 bg-amber-300/[0.06]',
      signal: `Stage: ${stage}`,
    };
  }

  if (score >= 45) {
    return {
      eyebrow: 'Transition Window',
      title: 'You are between chapters',
      summary:
        'The chart is neither fully open nor fully closed. This is where timing discipline matters most: simplify, observe, and prepare the next move.',
      risk: 'Main risk: mistaking ambiguity for failure.',
      accentClass: 'text-sky-200',
      surfaceClass: 'border-sky-300/20 bg-sky-300/[0.06]',
      signal: `Stage: ${stage}`,
    };
  }

  return {
    eyebrow: 'Protective Window',
    title: 'Defend energy before forcing outcomes',
    summary:
      'This cycle is asking for reduction, recovery, and selective focus. The right move is not bigger effort; it is cleaner protection.',
    risk: 'Main risk: forcing expansion inside a contraction phase.',
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
  tier,
  onPrimaryAction,
  onSecondaryAction,
  onYearSelect,
}: {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  tier: AppTier;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onYearSelect: (year: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const birthYear = Number.parseInt(profile.birthDate.split('-')[0] || '1990', 10);
  const currentPoint = klineData.find((point) => point.year === currentYear) ?? klineData[0];
  const nextPeak = klineData.find((point) => point.year > currentYear && point.isPeak);
  const nextCrossroads = klineData.find((point) => point.year > currentYear && point.isCrossroads);
  const anchors = getAnchorYears(klineData, transitDetails, currentYear);
  const windowProfile = getWindowProfile(currentPoint?.score ?? 55, currentPoint?.stage ?? 'Recalibration');
  const primaryLabel = tier === 'LITE' || tier === 'PRO' ? 'Ask My Chart' : 'Unlock Full Reading';

  return (
    <div className="relative overflow-hidden border border-[#d9c07a]/15 bg-[#0d0c12] px-5 py-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,192,122,0.16),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(90,160,255,0.12),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9c07a]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-5">
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
          <span className="bg-white/[0.04] px-3 py-2 text-white/65">Personal Timing Console</span>
          <span>{maskName(profile.name)}</span>
          <span>{profile.sun.sign} Sun</span>
          <span>{profile.moon.sign} Moon</span>
          <span>{profile.rising.sign} Rising</span>
        </div>
        <div className={cn('border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]', windowProfile.surfaceClass, windowProfile.accentClass)}>
          {windowProfile.eyebrow}
        </div>
      </div>

      <div className="relative z-10 mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className={cn('text-[11px] font-semibold uppercase tracking-[0.28em]', windowProfile.accentClass)}>
              {windowProfile.signal}
            </p>
            <Heading level={2} className="max-w-3xl font-serif text-3xl leading-tight text-white md:text-5xl md:leading-[1.06]">
              {windowProfile.title}
            </Heading>
            <p className="max-w-2xl text-sm leading-7 text-white/68 md:text-[15px]">
              {windowProfile.summary}
            </p>
            <p className="max-w-2xl text-sm leading-7 text-white/45">
              {windowProfile.risk}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-2 bg-[#d9c07a] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.01]"
            >
              <Sparkles className="h-4 w-4" />
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 border border-white/12 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/78 transition-colors hover:border-white/25 hover:text-white"
            >
              Inspect The Curve
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'Swiss Ephemeris data',
              'Transit-weighted scoring',
              'AI interpretation layer',
            ].map((badge) => (
              <span
                key={badge}
                className="border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/48"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
              <span>Current Score</span>
              <Target className="h-4 w-4 text-[#d9c07a]" />
            </div>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-serif text-5xl text-white">{currentPoint?.score ?? 55}</span>
              <span className="pb-2 text-xs uppercase tracking-[0.22em] text-white/38">/ 100</span>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
              <span>Next Peak</span>
              <Orbit className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">
              {nextPeak ? `${nextPeak.year}` : 'Scanning'}
            </p>
            <p className="mt-2 text-xs leading-6 text-white/46">
              {nextPeak
                ? `Around age ${nextPeak.year - birthYear}, the chart opens one of its clearest expansion windows.`
                : 'The next high-conviction window is still forming in the timeline.'}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
              <span>Decision Gate</span>
              <CalendarRange className="h-4 w-4 text-sky-300" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">
              {nextCrossroads ? `${nextCrossroads.year}` : 'Stable'}
            </p>
            <p className="mt-2 text-xs leading-6 text-white/46">
              {nextCrossroads
                ? `Expect a directional choice around age ${nextCrossroads.year - birthYear}. Small decisions will have long shadows.`
                : 'The immediate future favors continuity over abrupt pivots.'}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
              <span>Confidence</span>
              <ShieldCheck className="h-4 w-4 text-[#d9c07a]" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">High</p>
            <p className="mt-2 text-xs leading-6 text-white/46">
              Birth data, transit scoring, and timing structure are all aligned enough to trust the directional signal.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 border-t border-white/8 pt-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">Key Year Anchors</p>
          <p className="hidden sm:block text-[11px] uppercase tracking-[0.18em] text-white/28">Tap a year to jump the curve</p>
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {anchors.map((anchor) => (
            <button
              type="button"
              key={anchor.year}
              onClick={() => onYearSelect(anchor.year)}
              className={cn('group border p-4 text-left transition-transform hover:scale-[1.01]', anchor.accentClass)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold text-white">{anchor.year}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/55">{anchor.label}</p>
                </div>
                <span className="text-xs font-semibold text-white/78">{anchor.score}</span>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/42">{anchor.badge}</p>
              <p className="mt-2 text-sm leading-6 text-white/68">{anchor.summary}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}