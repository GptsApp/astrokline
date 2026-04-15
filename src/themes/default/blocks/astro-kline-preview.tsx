import {
  Briefcase,
  Coins,
  Compass,
  Heart,
  LockOpen,
  type LucideIcon,
  ShieldCheck,
  Target,
  Zap,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

import { Heading } from '@/components/astrocurve/ui/heading';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type CurveAnchor = {
  age: number;
  score: number;
};

type PreviewCandle = {
  age: number;
  score: number;
  open: number;
  close: number;
  high: number;
  low: number;
  isBullish: boolean;
};

const DEFAULT_BIRTH_YEAR = 1993;
const PREVIEW_AGE = 35;
const PREVIEW_YEAR = DEFAULT_BIRTH_YEAR + PREVIEW_AGE;
const PREVIEW_SCORE = 84.0;
const PREVIEW_OPEN = 76.14;
const PREVIEW_HIGH = 88.36;
const PREVIEW_LOW = 73.82;
const PREVIEW_CLOSE = 84.78;

const DASHA_SEGMENTS = [
  { label: 'Ma', widthClass: 'w-[7%]', className: 'bg-[#f87171] text-black/75' },
  { label: 'Rahu', widthClass: 'w-[18%]', className: 'bg-[#a78bfa] text-black/75' },
  { label: 'Jupiter', widthClass: 'w-[16%]', className: 'bg-[#fde047] text-black/75' },
  { label: 'Saturn', widthClass: 'w-[19%]', className: 'bg-[#60a5fa] text-black/75' },
  { label: 'Mercury', widthClass: 'w-[17%]', className: 'bg-[#34d399] text-black/75' },
  { label: 'Ke', widthClass: 'w-[7%]', className: 'bg-[#94a3b8] text-black/75' },
  { label: 'Venus', widthClass: 'w-[16%]', className: 'bg-[#f472b6] text-black/75' },
];

const SVG_WIDTH = 940;
const SVG_HEIGHT = 468;
const PLOT_LEFT = 48;
const PLOT_RIGHT = 24;
const PLOT_TOP = 22;
const PLOT_BOTTOM = 42;
const PLOT_WIDTH = SVG_WIDTH - PLOT_LEFT - PLOT_RIGHT;
const PLOT_HEIGHT = SVG_HEIGHT - PLOT_TOP - PLOT_BOTTOM;

const CURVE_ANCHORS: CurveAnchor[] = [
  { age: 0, score: 14 },
  { age: 8, score: 38 },
  { age: 14, score: 30 },
  { age: 20, score: 24 },
  { age: 26, score: 52 },
  { age: 32, score: 68 },
  { age: PREVIEW_AGE, score: PREVIEW_SCORE },
  { age: 38, score: 62 },
  { age: 44, score: 55 },
  { age: 50, score: 58 },
  { age: 54, score: 60 },
  { age: 60, score: 54 },
  { age: 66, score: 56 },
  { age: 72, score: 49 },
  { age: 78, score: 37 },
  { age: 84, score: 28 },
  { age: 90, score: 43 },
  { age: 96, score: 50 },
  { age: 100, score: 34 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function scaleX(age: number) {
  return PLOT_LEFT + (age / 100) * PLOT_WIDTH;
}

function scaleY(score: number) {
  return PLOT_TOP + ((100 - score) / 100) * PLOT_HEIGHT;
}

function interpolateScore(age: number) {
  for (let index = 1; index < CURVE_ANCHORS.length; index += 1) {
    const previous = CURVE_ANCHORS[index - 1];
    const next = CURVE_ANCHORS[index];

    if (age <= next.age) {
      const progress = (age - previous.age) / (next.age - previous.age);
      return previous.score + (next.score - previous.score) * progress;
    }
  }

  return CURVE_ANCHORS[CURVE_ANCHORS.length - 1].score;
}

function getScoreColor(score: number) {
  const safeScore = clamp(score, 0, 100);

  if (safeScore >= 50) {
    const ratio = (safeScore - 50) / 50;
    const r = Math.round(234 + ratio * (16 - 234));
    const g = Math.round(179 + ratio * (185 - 179));
    const b = Math.round(8 + ratio * (129 - 8));
    return `rgb(${r}, ${g}, ${b})`;
  }

  const ratio = safeScore / 50;
  const r = Math.round(239 + ratio * (234 - 239));
  const g = Math.round(68 + ratio * (179 - 68));
  const b = Math.round(68 + ratio * (8 - 68));
  return `rgb(${r}, ${g}, ${b})`;
}

function getFortuneLevel(score: number, change: number) {
  if (score >= 90 && change >= 0) {
    return {
      label: 'Excellent Year',
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/15 border-yellow-500/30',
      glyph: '++',
    };
  }

  if (score >= 75 && change >= 0) {
    return {
      label: 'Great Year',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      glyph: '+',
    };
  }

  if (score >= 60) {
    return {
      label: 'Good Year',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      glyph: '+',
    };
  }

  if (score >= 45) {
    return {
      label: 'Steady Year',
      color: 'text-white/50',
      bgColor: 'bg-white/5 border-white/10',
      glyph: '~',
    };
  }

  if (score >= 30) {
    return {
      label: 'Challenging Year',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      glyph: '-',
    };
  }

  return {
    label: 'Difficult Year',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15 border-rose-500/30',
    glyph: '--',
  };
}

function buildStarPoints(outerRadius: number, innerRadius: number) {
  const points: string[] = [];

  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}

function generatePreviewCandles(): PreviewCandle[] {
  const ages = Array.from(
    new Set([...Array.from({ length: 51 }, (_, index) => index * 2), PREVIEW_AGE])
  ).sort((left, right) => left - right);
  let seedIndex = 0;
  const pseudoRand = () => {
    seedIndex += 1;
    const x = Math.sin(seedIndex * 9301 + ages.length * 49297) * 49271;
    return x - Math.floor(x);
  };

  let prevClose = interpolateScore(0) - 1.6;

  return ages.map((age, index) => {
    if (age === PREVIEW_AGE) {
      prevClose = PREVIEW_CLOSE;
      return {
        age,
        score: PREVIEW_SCORE,
        open: PREVIEW_OPEN,
        close: PREVIEW_CLOSE,
        high: PREVIEW_HIGH,
        low: PREVIEW_LOW,
        isBullish: true,
      };
    }

    const center = interpolateScore(age);
    const previousCenter = index > 0 ? interpolateScore(ages[index - 1]) : center;
    const trend = center - previousCenter;
    const trendDirection = trend >= 0 ? 1 : -1;
    const open = clamp(prevClose, 8, 92);
    const volatility = Math.max(1.6, Math.abs(trend) * 0.42 + pseudoRand() * 2.4 + 0.8);

    let close = open + trendDirection * volatility * (0.36 + pseudoRand() * 0.3);
    close += (center - close) * (0.42 + pseudoRand() * 0.16);
    close = clamp(close, 8, 92);

    if (Math.abs(close - open) < 1.15) {
      close = clamp(open + trendDirection * (1.35 + pseudoRand() * 0.9), 8, 92);
    }

    const bodySize = Math.max(1.2, Math.abs(close - open));
    const high = clamp(Math.max(open, close) + bodySize * (0.18 + pseudoRand() * 0.24), 10, 96);
    const low = clamp(Math.min(open, close) - bodySize * (0.18 + pseudoRand() * 0.24), 4, 90);

    prevClose = close;

    return {
      age,
      score: roundToTwo(center),
      open: roundToTwo(open),
      close: roundToTwo(close),
      high: roundToTwo(high),
      low: roundToTwo(low),
      isBullish: close >= open,
    };
  });
}

function ExtremumStar({
  cx = 0,
  cy = 0,
  fill,
  stroke,
  label,
  labelPosition = 'top',
}: {
  cx?: number;
  cy?: number;
  fill: string;
  stroke: string;
  label: string;
  labelPosition?: 'top' | 'bottom';
}) {
  const verticalOffset = labelPosition === 'top' ? -56 : 56;
  const starCy = labelPosition === 'top' ? Math.max(cy + verticalOffset, 40) : cy + verticalOffset;
  const pillY = labelPosition === 'top' ? Math.max(starCy - 30, 8) : starCy + 14;
  const textY = labelPosition === 'top' ? Math.max(starCy - 18, 20) : starCy + 26;
  const connectorStartY = cy + (labelPosition === 'top' ? -12 : 12);
  const connectorEndY = labelPosition === 'top' ? starCy + 14 : starCy - 14;
  const starPoints = buildStarPoints(9.6, 4.4);

  return (
    <g>
      <line
        x1={cx}
        y1={connectorStartY}
        x2={cx}
        y2={connectorEndY}
        stroke={stroke}
        strokeOpacity={0.7}
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <circle cx={cx} cy={starCy} r={15} fill={fill}>
        <animate attributeName="r" values="12;18;12" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.4;0.05;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <g transform={`translate(${cx}, ${starCy})`}>
        <polygon
          points={starPoints}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      </g>
      <rect
        x={cx - 38}
        y={pillY}
        width={76}
        height={18}
        rx={9}
        fill="rgba(10,10,15,0.92)"
        stroke={fill}
        strokeOpacity={0.35}
      />
      <text
        x={cx}
        y={textY}
        textAnchor="middle"
        fontSize="10"
        fontWeight={700}
        fill={stroke}
        letterSpacing="0.08em"
      >
        {label.toUpperCase()}
      </text>
    </g>
  );
}

const previewCandles = generatePreviewCandles();
const highlightCandle =
  previewCandles.find((candle) => candle.age === PREVIEW_AGE) ?? previewCandles[27];
const maxCandle = previewCandles.reduce((best, current) =>
  current.high > best.high ? current : best
);
const minCandle = previewCandles.reduce((best, current) =>
  current.low < best.low ? current : best
);
const averageScore = Math.round(
  previewCandles.reduce((total, candle) => total + candle.close, 0) / previewCandles.length
);
const previewChange = PREVIEW_CLOSE - PREVIEW_OPEN;
const previewChangePercent = ((previewChange / PREVIEW_OPEN) * 100).toFixed(1);
const previewFortune = getFortuneLevel(PREVIEW_SCORE, previewChange);

function LifeAreaBar({
  icon: Icon,
  label,
  value,
  progressClass,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  progressClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 shrink-0 text-white/30" />
      <div className="flex-1">
        <div className="mb-0.5 flex justify-between text-[9px]">
          <span className="text-white/40">{label}</span>
          <span className="font-mono font-bold text-white/60">{value}</span>
        </div>
        <Progress
          value={value}
          className={cn('h-1 bg-white/5 opacity-60', progressClass)}
        />
      </div>
    </div>
  );
}

function PreviewInsightCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative z-20 border border-white/10 bg-[#050505]/96 shadow-2xl backdrop-blur-md md:[animation:preview-window-pulse_2.4s_ease-in-out_infinite]',
        className
      )}
    >
      <div className="border-b border-white/5 bg-transparent px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-white">{PREVIEW_YEAR}</span>
            <span className="bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-widest text-white/60">
              Breakthrough
            </span>
            <span className="text-[10px] text-white/30">Age ~{PREVIEW_AGE}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold leading-none text-[#D4AF37]">
              {PREVIEW_SCORE.toFixed(1)}
            </span>
            <span className="font-mono text-[10px] font-bold text-emerald-400">
              ▲ +{previewChangePercent}%
            </span>
          </div>
        </div>

        <div className={cn('flex items-center gap-2 border px-2.5 py-1.5', previewFortune.bgColor)}>
          <span className={cn('font-mono text-xs font-bold', previewFortune.color)}>
            {previewFortune.glyph}
          </span>
          <span className={cn('text-xs font-bold', previewFortune.color)}>
            {previewFortune.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 border-b border-white/5 px-4 py-2 text-center">
        {[
          { label: 'Start', value: PREVIEW_OPEN.toFixed(2), color: 'text-white/50' },
          { label: 'High', value: PREVIEW_HIGH.toFixed(2), color: 'text-purple-400' },
          { label: 'Low', value: PREVIEW_LOW.toFixed(2), color: 'text-blue-400' },
          { label: 'End', value: PREVIEW_CLOSE.toFixed(2), color: 'text-emerald-400' },
        ].map((item) => (
          <div key={item.label}>
            <p className="font-mono text-[7px] uppercase text-white/25">{item.label}</p>
            <p className={cn('font-mono text-sm font-bold', item.color)}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-white/5 px-4 py-2.5">
        <p className="mb-1.5 font-mono text-[8px] uppercase tracking-widest text-white/20">
          Life Areas
        </p>
        <div className="grid grid-cols-2 gap-2">
          <LifeAreaBar
            icon={Briefcase}
            label="Career"
            value={68}
            progressClass="[&>[data-slot=progress-indicator]]:bg-yellow-500"
          />
          <LifeAreaBar
            icon={Coins}
            label="Wealth"
            value={60}
            progressClass="[&>[data-slot=progress-indicator]]:bg-emerald-500"
          />
          <LifeAreaBar
            icon={Heart}
            label="Love"
            value={59}
            progressClass="[&>[data-slot=progress-indicator]]:bg-rose-500"
          />
          <LifeAreaBar
            icon={Zap}
            label="Vitality"
            value={61}
            progressClass="[&>[data-slot=progress-indicator]]:bg-blue-500"
          />
        </div>
      </div>

      <div className="border-b border-white/5 bg-[#D4AF37]/[0.02] px-4 py-2.5">
        <p className="mb-1 font-mono text-[8px] uppercase tracking-widest text-[#D4AF37]/40">
          Year Summary
        </p>
        <p className="text-[11px] leading-relaxed text-white/60">
          Jupiter opens a gentle career corridor. The year rewards steady action over dramatic leaps,
          consistency compounds here.
        </p>
      </div>

      <div className="space-y-2 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] uppercase tracking-widest text-[#D4AF37]/40">
            Annual Transit
          </span>
        </div>
        <Heading level={4} className="text-sm font-bold text-white">
          The Jupiter Sextile Phase
        </Heading>
        <p className="text-[10px] leading-relaxed text-white/55">
          As Jupiter moves into a Sextile geometry with your natal placements, the Career sector
          undergoes powerful expansion. The cosmos is actively opening doors and creating momentum in
          this area of your life.
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="border border-white/5 bg-white/5 p-2">
            <div className="mb-0.5 flex items-center gap-1">
              <Target className="h-3 w-3 text-[#D4AF37]" />
              <span className="text-[8px] font-bold uppercase text-white/40">Transit</span>
            </div>
            <p className="font-mono text-[10px] text-[#D4AF37]">Jupiter Sextile</p>
            <p className="mt-0.5 flex items-center gap-0.5 font-mono text-[8px] text-emerald-400/60">
              <ShieldCheck className="h-2.5 w-2.5" /> Verified Data
            </p>
          </div>

          <div className="border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-2">
            <div className="mb-0.5 flex items-center gap-1">
              <Compass className="h-3 w-3 text-[#D4AF37]" />
              <span className="text-[8px] font-bold uppercase text-[#D4AF37]">Guidance</span>
            </div>
            <p className="text-[10px] leading-relaxed text-white/70">
              Lean into this energy. Say yes to the opportunity, take the leap, and trust that the
              universe is supporting your next move.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reusable chart container — used by both AstroKlinePreview block and HeroKline. */
export function KlinePreviewChart({ className, compact }: { className?: string; compact?: boolean }) {
  const highlightX = scaleX(highlightCandle.age);
  const highlightY = scaleY(highlightCandle.close);
  const maxMarkerY = scaleY(maxCandle.high);
  const minMarkerY = scaleY(minCandle.low);

  return (
    <div className={cn("relative w-full max-w-6xl overflow-hidden border border-white/8 bg-[#0b0b0c]/96 px-5 pt-8 pb-10 shadow-[0_24px_90px_-30px_rgba(0,0,0,0.88)] md:px-10 md:pt-10 md:pb-14", className)}>
          {!compact && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_14%,rgba(212,175,55,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
          )}

          {!compact && (
          <div className="relative z-10 flex flex-col items-center px-2 text-center md:px-6">
            <Heading level={3} className="font-serif text-4xl text-white/92 md:text-6xl">
              Your Life Curve
              <span className="ml-3 inline-block align-middle text-xl font-normal text-white/35 md:text-3xl">
                (Preview)
              </span>
            </Heading>

            <p className="mt-4 text-sm leading-relaxed text-white/55 md:text-base">
              A complete projection of your life energy across a 100-year timeline.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-[0.12em] text-white/32 md:gap-5 md:text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                Peak
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                Valley
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-px w-3 border-t border-dashed border-white/45" />
                Focus
              </span>
              <span className="border-l border-white/10 pl-4">
                Score: <span className="text-white/72">{PREVIEW_SCORE.toFixed(0)}</span>
              </span>
              <span>
                Avg: <span className="text-white/72">{averageScore}</span>
              </span>
            </div>
          </div>
          )}

          <div className={cn("relative mx-auto w-full max-w-[980px] px-2 pb-2 md:px-3", compact ? "mt-2" : "mt-10")}>
            {compact && (
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-white/80 tracking-wide">Life Curve</span>
                <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">(Preview)</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-white/30">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-emerald-400" />Peak
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-sky-400" />Valley
                </span>
                <span>Score: <span className="text-white/60">{PREVIEW_SCORE.toFixed(0)}</span></span>
              </div>
            </div>
            )}
            <div className="relative overflow-visible">
              {/* Top edge fade for softer boundary (full mode only) */}
              {!compact && (
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0b0b0c] to-transparent z-10" />
              )}
              <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="mx-auto h-auto w-full max-w-[920px] select-none"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="chartAtmosphere" cx="58%" cy="10%" r="74%">
                    <stop offset="0%" stopColor="rgba(212,175,55,0.16)" />
                    <stop offset="52%" stopColor="rgba(212,175,55,0.03)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </radialGradient>
                  <radialGradient id="focusHalo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,243,182,0.45)" />
                    <stop offset="55%" stopColor="rgba(255,243,182,0.12)" />
                    <stop offset="100%" stopColor="rgba(255,243,182,0)" />
                  </radialGradient>
                  <filter id="focusGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="10" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <style>{`
                    @keyframes candleGrow {
                      from { opacity: 0; transform: scaleY(0); }
                      to { opacity: 1; transform: scaleY(1); }
                    }
                    @keyframes glowPulse {
                      0%, 100% { opacity: 0.3; }
                      50% { opacity: 0.7; }
                    }
                  `}</style>
                </defs>

                <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="transparent" />
                {!compact && (
                <rect
                  x={PLOT_LEFT}
                  y={PLOT_TOP}
                  width={PLOT_WIDTH}
                  height={PLOT_HEIGHT}
                  fill="rgba(0,0,0,0.38)"
                />
                )}
                {!compact && (
                <>
                <rect
                  x={PLOT_LEFT}
                  y={PLOT_TOP}
                  width={PLOT_WIDTH}
                  height={PLOT_HEIGHT}
                  fill="url(#chartAtmosphere)"
                />
                {/* Animated glow sweep */}
                <rect
                  x={PLOT_LEFT}
                  y={PLOT_TOP}
                  width={PLOT_WIDTH}
                  height={PLOT_HEIGHT}
                  fill="url(#chartAtmosphere)"
                  style={{ animation: 'glowPulse 4s ease-in-out infinite' }}
                />
                </>
                )}

                {[0, 20, 40, 60, 80, 100].map((score) => {
                  const y = scaleY(score);
                  return (
                    <text
                      key={score}
                      x={PLOT_LEFT - 12}
                      y={y + 4}
                      textAnchor="end"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="12"
                      fontFamily="var(--font-mono)"
                    >
                      {score}
                    </text>
                  );
                })}

                {Array.from({ length: 11 }, (_, index) => index * 10).map((age) => {
                  const x = scaleX(age);
                  return (
                    <g key={age}>
                      <line
                        x1={x}
                        y1={PLOT_TOP}
                        x2={x}
                        y2={PLOT_TOP + PLOT_HEIGHT}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={SVG_HEIGHT - 10}
                        textAnchor={age === 0 ? 'start' : age === 100 ? 'end' : 'middle'}
                        fill="rgba(255,255,255,0.5)"
                        fontSize="12"
                        fontFamily="var(--font-mono)"
                      >
                        {age}
                      </text>
                    </g>
                  );
                })}

                <line
                  x1={scaleX(maxCandle.age)}
                  y1={PLOT_TOP}
                  x2={scaleX(maxCandle.age)}
                  y2={PLOT_TOP + PLOT_HEIGHT}
                  stroke="rgba(16,185,129,0.18)"
                  strokeDasharray="3 3"
                />
                <line
                  x1={scaleX(minCandle.age)}
                  y1={PLOT_TOP}
                  x2={scaleX(minCandle.age)}
                  y2={PLOT_TOP + PLOT_HEIGHT}
                  stroke="rgba(56,189,248,0.18)"
                  strokeDasharray="3 3"
                />
                <line
                  x1={highlightX}
                  y1={PLOT_TOP}
                  x2={highlightX}
                  y2={PLOT_TOP + PLOT_HEIGHT}
                  stroke="rgba(255,255,255,0.76)"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />

                {previewCandles.map((candle, i) => {
                  const x = scaleX(candle.age);
                  const open = scaleY(candle.open);
                  const close = scaleY(candle.close);
                  const high = scaleY(candle.high);
                  const low = scaleY(candle.low);
                  const candleColor = getScoreColor(candle.close);
                  const bodyTop = Math.min(open, close);
                  const bodyHeight = Math.max(4, Math.abs(close - open));
                  const bodyWidth = candle.age === PREVIEW_AGE ? 11.5 : 10;

                  return (
                    <g
                      key={candle.age}
                      style={{
                        transformOrigin: `${x}px ${PLOT_TOP + PLOT_HEIGHT}px`,
                        animation: `candleGrow 0.5s ease-out ${i * 25}ms both`,
                      }}
                    >
                      <line
                        x1={x}
                        y1={high}
                        x2={x}
                        y2={low}
                        stroke={candleColor}
                        strokeWidth={candle.age === PREVIEW_AGE ? 1.8 : 1.5}
                        opacity="0.95"
                      />
                      <rect
                        x={x - bodyWidth / 2}
                        y={bodyTop}
                        width={bodyWidth}
                        height={bodyHeight}
                        fill={candle.isBullish ? candleColor : 'transparent'}
                        stroke={candleColor}
                        strokeWidth={1.1}
                        opacity="0.96"
                      />
                    </g>
                  );
                })}

                <g filter="url(#focusGlow)" style={{ opacity: 0, animation: 'candleGrow 0.8s ease-out 1.4s both' }}>
                  <circle cx={highlightX} cy={highlightY} r="30" fill="url(#focusHalo)">
                    <animate attributeName="r" values="22;30;22" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.55;0.82;0.55" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={highlightX} cy={highlightY} r="6" fill="#fff3b6" />
                </g>

                <g style={{ opacity: 0, animation: 'candleGrow 0.6s ease-out 1.6s both' }}>
                <ExtremumStar
                  cx={scaleX(maxCandle.age)}
                  cy={maxMarkerY}
                  fill="#34d399"
                  stroke="#fef3c7"
                  label="Highest"
                  labelPosition="top"
                />
                </g>
                <g style={{ opacity: 0, animation: 'candleGrow 0.6s ease-out 1.8s both' }}>
                <ExtremumStar
                  cx={scaleX(minCandle.age)}
                  cy={minMarkerY}
                  fill="#38bdf8"
                  stroke="#dbeafe"
                  label="Lowest"
                  labelPosition="bottom"
                />
                </g>
              </svg>

              {!compact && (
              <PreviewInsightCard className="mt-6 mb-6 md:absolute md:right-[3.5%] md:top-[6%] md:mt-0 md:mb-0 md:w-[42%] md:max-w-[386px] md:max-h-[88%] md:overflow-y-auto" />
              )}

              {!compact && (
              <div className="mt-6">
                <p className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-white/32">
                  Mahadasha Periods
                </p>
                <div className="flex h-6 w-full overflow-hidden rounded-sm">
                  {DASHA_SEGMENTS.map((segment) => (
                    <div
                      key={segment.label}
                      className={cn(
                        'flex items-center justify-center border-r border-black/35 font-mono text-[8px] font-bold uppercase tracking-[0.14em] last:border-r-0',
                        segment.widthClass,
                        segment.className
                      )}
                    >
                      {segment.label}
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
    </div>
  );
}

export function AstroKlinePreview({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id || 'kline-preview'}
      className={cn(
        'relative overflow-hidden border-t border-foreground/10 bg-background py-24 md:py-32',
        section.className,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.09),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/textures/noise.svg')] opacity-[0.06] mix-blend-screen" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6">
        <div className="mb-14 max-w-3xl text-center">
          <Heading level={2} variant="section" className="text-center">
            {section.title || 'Your Next 100 Years, One Curve.'}
          </Heading>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {section.description ||
              'Your life curve maps your momentum - peaks mean support, dips mean friction. See exactly when your turning points are likely to happen.'}
          </p>
        </div>

        <KlinePreviewChart />

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/kline"
            prefetch={false}
            className="inline-flex h-14 items-center gap-2 bg-primary px-8 text-lg font-bold text-primary-foreground shadow-[0_0_30px_-5px_var(--primary)] transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-[0_0_50px_-5px_var(--primary)]"
          >
            <LockOpen className="h-5 w-5" />
            Unlock Your Full Life Curve - Free
          </Link>
          <p className="font-mono text-xs text-white/30">
            No credit card required - Takes 30 seconds
          </p>
        </div>
      </div>
    </section>
  );
}