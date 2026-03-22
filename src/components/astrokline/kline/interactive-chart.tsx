'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DestinyScorePoint,
  TransitEvent,
} from '@/lib/astrokline/mock-astrology-data';
import {
  AlertCircle,
  Briefcase,
  Coins,
  Compass,
  Heart,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import {
  Area,
  Bar,
  Cell,
  ComposedChart,
  Line,
  Rectangle,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

type Props = {
  data: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
  onNodeClick?: (year: number) => void;
  selectedYear?: number;
  birthYear?: number;
  tier?: AppTier;
  isSimulation?: boolean;
};

// Generate candle data with dramatic high/low swings
function generateCandleData(data: DestinyScorePoint[]) {
  // Use a seeded approach so values are stable across renders
  const seed = data.map((d) => d.score).join(',');
  let seedIdx = 0;
  const pseudoRand = () => {
    seedIdx++;
    const x = Math.sin(seedIdx * 9301 + seed.length * 49297) * 49271;
    return x - Math.floor(x);
  };

  return data.map((point, i) => {
    const prevScore = i > 0 ? data[i - 1].score : point.score - 8;
    const open = prevScore;
    const close = point.score;
    // Dramatic wicks — larger swings for more visual impact
    const wickUp = Math.floor(pseudoRand() * 12 + 6);
    const wickDown = Math.floor(pseudoRand() * 12 + 6);
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    const isBullish = close >= open;
    const volume = point.isPeak
      ? 95
      : point.isCrossroads
        ? 85
        : 40 + Math.floor(pseudoRand() * 35);

    return {
      ...point,
      open,
      close,
      high,
      low,
      isBullish,
      volume,
    };
  });
}

// Height-based Rainbow Gradient mapping for 0-100 score
function getScoreColor(score: number) {
  // Clamp score between 0 and 100
  const s = Math.min(100, Math.max(0, score));

  if (s >= 50) {
    // Yellow (#EAB308: rgb(234,179,8)) to Green (#10B981: rgb(16,185,129))
    const ratio = (s - 50) / 50;
    const r = Math.round(234 + ratio * (16 - 234));
    const g = Math.round(179 + ratio * (185 - 179));
    const b = Math.round(8 + ratio * (129 - 8));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Red (#EF4444: rgb(239,68,68)) to Yellow (#EAB308: rgb(234,179,8))
    const ratio = s / 50;
    const r = Math.round(239 + ratio * (234 - 239));
    const g = Math.round(68 + ratio * (179 - 68));
    const b = Math.round(68 + ratio * (8 - 68));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function buildStarPoints(outerRadius: number, innerRadius: number) {
  const points: string[] = [];

  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return points.join(' ');
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
  const verticalOffset = labelPosition === 'top' ? -46 : 46;
  const starCy = cy + verticalOffset;
  const pillY = labelPosition === 'top' ? starCy - 34 : starCy + 16;
  const textY = labelPosition === 'top' ? starCy - 22 : starCy + 28;
  const connectorEndY = labelPosition === 'top' ? starCy + 16 : starCy - 16;
  const starPoints = buildStarPoints(12, 5.5);

  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={connectorEndY}
        stroke={stroke}
        strokeOpacity={0.7}
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <circle cx={cx} cy={cy} r={5} fill="#0f1016" stroke={fill} strokeWidth={2} />
      <circle cx={cx} cy={starCy} r={19} fill={fill} fillOpacity={0.14} />
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
        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        {label}
      </text>
    </g>
  );
}

// Custom candlestick shape with wick lines
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close, high, low, isBullish } = payload;
  const yScale = props.yScale || ((v: number) => y);

  // Colors based on absolute value (Rainbow mapping)
  const baseColor = getScoreColor(close);
  // To preserve some candlestick tradition, bear candles can be hollow, bull solid
  const fillColor = isBullish ? baseColor : 'transparent';
  const strokeColor = baseColor;

  // Body dimensions from props (recharts provides these)
  const bodyX = x;
  const bodyY = y;
  const bodyW = width;
  const bodyH = Math.max(height, 2); // minimum 2px height for visibility

  // Wick center
  const wickX = bodyX + bodyW / 2;

  return (
    <g>
      {/* Upper wick */}
      <line
        x1={wickX}
        y1={bodyY}
        x2={wickX}
        y2={
          bodyY -
          (high - Math.max(open, close)) *
            (bodyH / (Math.abs(close - open) || 1))
        }
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      {/* Lower wick */}
      <line
        x1={wickX}
        y1={bodyY + bodyH}
        x2={wickX}
        y2={
          bodyY +
          bodyH +
          (Math.min(open, close) - low) *
            (bodyH / (Math.abs(close - open) || 1))
        }
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      {/* Candle body */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
      />
    </g>
  );
};

export function InteractiveChart({
  data,
  transitDetails,
  onNodeClick,
  selectedYear,
  birthYear = 1990,
  tier = 'PRO',
  isSimulation = false,
}: Props) {
  const currentYear = new Date().getFullYear();
  const visibleStartAge = currentYear - 1 - birthYear;
  const visibleEndAge = currentYear + 2 - birthYear;

  const chartData1 = useMemo(() => {
    if (tier === 'GUEST') {
      return data.map((d) => {
        const age = d.year - birthYear;
        // Keep actual data for current year window
        if (age >= visibleStartAge && age <= visibleEndAge) return d;
        // Inject random noise for the rest to prevent inspect-element attacks
        return { ...d, score: 50 + Math.sin(d.year * 123) * 15 };
      });
    }
    return data;
  }, [data, tier, birthYear, visibleStartAge, visibleEndAge]);

  const candleData = useMemo(
    () => generateCandleData(chartData1),
    [chartData1]
  );
  const avgScore = useMemo(
    () =>
      Math.round(
        chartData1.reduce((a, b) => a + b.score, 0) / chartData1.length
      ),
    [chartData1]
  );

  // For the bar chart we need the body as a stacked bar: base + height
  const chartData = useMemo(
    () =>
      candleData.map((d) => ({
        ...d,
        age: d.year - birthYear,
        bodyBase: Math.min(d.open, d.close),
        bodyHeight: Math.abs(d.close - d.open) || 2,
      })),
    [candleData, birthYear]
  );

  const currentAge = new Date().getFullYear() - birthYear;

  const maxPoint = useMemo(
    () =>
      chartData.reduce(
        (prev, current) => (prev.close > current.close ? prev : current),
        chartData[0]
      ),
    [chartData]
  );
  const minPoint = useMemo(
    () =>
      chartData.reduce(
        (prev, current) => (prev.close < current.close ? prev : current),
        chartData[0]
      ),
    [chartData]
  );
  const currentPoint = useMemo(
    () => chartData.find((point) => point.age === currentAge) ?? null,
    [chartData, currentAge]
  );

  return (
    <div className="relative w-full">
      {/* Mystical Background Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[120px]" />

      <div
        className="relative rounded-3xl border border-white/5 bg-[#111015]/80 p-6 shadow-2xl backdrop-blur-md"
        style={{ overflow: 'visible' }}
      >
        {/* Header - Centered */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-[#F4E1A1] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            K-Line
          </div>
          <h3 className="mb-2 text-[10px] font-bold tracking-widest text-white/40 uppercase">
            100-Year Chart
          </h3>
          <h2 className="text-xl font-semibold text-white/90 md:text-2xl">
            100-Year Timing Curve {(tier === 'GUEST' || isSimulation) && '(Preview Mode)'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Read the full curve first, then use the summary below to understand
            the highest point, lowest point, and your current position. Markers
            are offset from the candles so the chart stays readable.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-white/55">
          <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
            ★ Gold/green star = best expansion window
          </div>
          <div className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-sky-200">
            ★ Blue star = deepest protection window
          </div>
          <div className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1.5 text-[#F4E1A1]">
            Dashed line = your current age
          </div>
          {currentPoint && (
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              Current score {currentPoint.close} · Avg {avgScore}
            </div>
          )}
        </div>

        {tier === 'GUEST' && (
          <div className="pointer-events-none absolute inset-0 z-[100] mt-32 flex flex-col items-center justify-center">
            <div className="absolute top-[20%] h-full w-[120%] bg-gradient-to-b from-transparent via-[#111015]/90 to-[#111015] backdrop-blur-[3px]" />
            <div className="border-primary/20 pointer-events-auto relative z-10 mt-20 flex flex-col items-center rounded-2xl border bg-black/60 p-6 shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-xl">
              <Lock className="text-primary mb-3 h-8 w-8" />
              <h3 className="mb-2 text-xl font-bold text-white">
                Unlock Your Lifetime Blueprint
              </h3>
              <p className="mb-6 max-w-sm text-center text-sm text-white/60">
                Create a free account to reveal your entire 80-year karmic
                trajectory and discover your destined turning points.
              </p>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('sign-up-button')?.click()
                }
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-full px-8 py-3 font-bold text-black transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" /> Sign Up For Free
              </button>
            </div>
          </div>
        )}

        {/* Main Candlestick Chart */}
        <div className="w-full overflow-visible">
          <div
            className="h-[480px] md:h-[550px]"
            style={{ overflow: 'visible' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 76, right: 26, left: 5, bottom: 52 }}
                barCategoryGap={0}
                barGap={0}
                onClick={(state) => {
                  if (state?.activeLabel && onNodeClick)
                    onNodeClick(Number(state.activeLabel));
                }}
              >
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="age"
                  axisLine={false}
                  tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={{
                    fill: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    dy: 10,
                    fontFamily: 'monospace',
                  }}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                />
                <YAxis
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={{
                    fill: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    fontFamily: 'monospace',
                  }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  interval={0}
                  width={30}
                />

                {/* Current Age Line & Bubble */}
                {currentAge >= 0 && currentAge <= 100 && (
                  <ReferenceLine
                    x={currentAge}
                    stroke="rgba(255,255,255,0.8)"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}
                {currentAge >= 0 && currentAge <= 100 && (
                  <ReferenceLine
                    x={currentAge}
                    label={{
                      position: 'insideBottomRight',
                      value: currentAge.toString(),
                      fill: 'rgba(255,255,255,0.9)',
                      fontSize: 12,
                      fontWeight: 600,
                      offset: 10,
                      fontFamily: 'sans-serif',
                    }}
                    stroke="none"
                  />
                )}

                {/* Max and Min Points (Optional subtle markers) */}
                {maxPoint && (
                  <ReferenceLine
                    x={maxPoint.age}
                    stroke="rgba(16, 185, 129, 0.2)"
                    strokeDasharray="3 3"
                  />
                )}
                {minPoint && (
                  <ReferenceLine
                    x={minPoint.age}
                    stroke="rgba(56, 189, 248, 0.24)"
                    strokeDasharray="3 3"
                  />
                )}
                {maxPoint && (
                  <ReferenceDot
                    x={maxPoint.age}
                    y={maxPoint.close}
                    ifOverflow="extendDomain"
                    shape={
                      <ExtremumStar
                        fill="#34d399"
                        stroke="#fef3c7"
                        label="Highest"
                        labelPosition="top"
                      />
                    }
                  />
                )}
                {minPoint && (
                  <ReferenceDot
                    x={minPoint.age}
                    y={minPoint.close}
                    ifOverflow="extendDomain"
                    shape={
                      <ExtremumStar
                        fill="#38bdf8"
                        stroke="#dbeafe"
                        label="Lowest"
                        labelPosition="bottom"
                      />
                    }
                  />
                )}

                {/* Hidden base for stacking */}
                <Bar
                  dataKey="bodyBase"
                  stackId="candle"
                  fill="transparent"
                  barSize={9999}
                />

                {/* Candle bodies — touching, no gap */}
                <Bar
                  dataKey="bodyHeight"
                  stackId="candle"
                  barSize={9999}
                  shape={<CandlestickShape />}
                />

                <Tooltip
                  content={
                    <CandleTooltip
                      transitDetails={transitDetails}
                      tier={tier}
                    />
                  }
                  cursor={{
                    stroke: 'rgba(212,175,55,0.2)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  wrapperStyle={{
                    zIndex: 99999,
                    pointerEvents: 'none',
                  }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Astrology Fortune Tooltip ──

// Fortune classification based on score
function getFortuneLevel(
  score: number,
  change: number
): { label: string; color: string; bgColor: string; glyph: string } {
  if (score >= 90 && change >= 0)
    return {
      label: 'Grand Fortune',
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/15 border-yellow-500/30',
      glyph: '++',
    };
  if (score >= 75 && change >= 0)
    return {
      label: 'Auspicious',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      glyph: '+',
    };
  if (score >= 60)
    return {
      label: 'Favorable',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      glyph: '+',
    };
  if (score >= 45)
    return {
      label: 'Neutral',
      color: 'text-white/50',
      bgColor: 'bg-white/5 border-white/10',
      glyph: '~',
    };
  if (score >= 30)
    return {
      label: 'Challenging',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      glyph: '-',
    };
  return {
    label: 'Adversity',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15 border-rose-500/30',
    glyph: '--',
  };
}

// Planetary ruler per year cycle
function getYearRuler(year: number): { planet: string; glyph: string } {
  const rulers = [
    { planet: 'Saturn', glyph: '♄' },
    { planet: 'Jupiter', glyph: '♃' },
    { planet: 'Mars', glyph: '♂' },
    { planet: 'Sun', glyph: '☉' },
    { planet: 'Venus', glyph: '♀' },
    { planet: 'Mercury', glyph: '☿' },
    { planet: 'Moon', glyph: '☽' },
  ];
  return rulers[year % 7];
}

// Comprehensive rating text
function getComprehensiveReading(
  score: number,
  stage: string,
  change: number
): string {
  if (score >= 85 && change > 0)
    return 'Stellar alignment creates a rare window of peak opportunity. Cosmic wind is at your back — bold action rewards tenfold.';
  if (score >= 85)
    return 'Powerful planetary positions sustain high energy, though momentum may plateau. Consolidate gains wisely.';
  if (score >= 70 && change > 0)
    return 'Favorable transits are building momentum. Inner planets support growth — lean into emerging opportunities.';
  if (score >= 70)
    return 'Strong foundational energy persists. Minor retrograde influences may cause temporary friction — patience is your ally.';
  if (score >= 55 && change > 0)
    return 'Energy is shifting upward through cardinal sign influence. Small wins compound into significant breakthroughs.';
  if (score >= 55)
    return 'A transitional period where mutable signs dominate. Stay flexible and avoid rigid commitments.';
  if (score >= 40)
    return "Saturn's discipline tests your resolve. This is a pruning year — release what no longer serves your trajectory.";
  return "Deep transformation through Pluto's influence. The darkest hour precedes dawn. Inner work now plants seeds for future harvest.";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandleTooltip = ({ active, payload, transitDetails, tier }: any) => {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload;
  if (!d) return null;

  const yearTransits = transitDetails?.[d.year] || [];
  const mainTransit = yearTransits[0] || null;
  const change = d.close - d.open;
  const changePercent = d.open > 0 ? ((change / d.open) * 100).toFixed(1) : '0';
  const isUp = change >= 0;

  const fortune = getFortuneLevel(d.score, change);
  const ruler = getYearRuler(d.year);
  const currentYear = new Date().getFullYear();
  const age = d.year - (d.year - (d.age ?? 0));
  const reading = getComprehensiveReading(d.score, d.stage, change);

  // Four Palace sub-scores derived from base score + stage + ruler influences
  const stageBonus: Record<
    string,
    { career: number; wealth: number; love: number; health: number }
  > = {
    Grounding: { career: -3, wealth: 2, love: -1, health: 5 },
    Expansion: { career: 8, wealth: 6, love: 3, health: 2 },
    'Peak Flow': { career: 10, wealth: 8, love: 7, health: 4 },
    Consolidation: { career: 4, wealth: 5, love: 2, health: 3 },
    Reflection: { career: -2, wealth: -3, love: 5, health: -2 },
    Transformation: { career: 3, wealth: -5, love: -4, health: -3 },
    Challenge: { career: -5, wealth: -6, love: -3, health: -5 },
    Harvest: { career: 6, wealth: 10, love: 5, health: 4 },
    Renewal: { career: 2, wealth: -2, love: 8, health: 6 },
  };
  const rulerBonus: Record<
    string,
    { career: number; wealth: number; love: number; health: number }
  > = {
    Saturn: { career: 5, wealth: -3, love: -4, health: -2 },
    Jupiter: { career: 6, wealth: 8, love: 4, health: 3 },
    Mars: { career: 4, wealth: 2, love: -2, health: -3 },
    Sun: { career: 7, wealth: 3, love: 2, health: 5 },
    Venus: { career: -2, wealth: 4, love: 8, health: 6 },
    Mercury: { career: 5, wealth: 5, love: -1, health: 2 },
    Moon: { career: -3, wealth: -1, love: 6, health: 4 },
  };
  const sb = stageBonus[d.stage] || {
    career: 0,
    wealth: 0,
    love: 0,
    health: 0,
  };
  const rb = rulerBonus[ruler.planet] || {
    career: 0,
    wealth: 0,
    love: 0,
    health: 0,
  };
  const clamp = (v: number) => Math.min(100, Math.max(10, Math.round(v)));
  const dims = {
    career: clamp(d.score + sb.career + rb.career),
    wealth: clamp(d.score + sb.wealth + rb.wealth),
    love: clamp(d.score + sb.love + rb.love),
    health: clamp(d.score + sb.health + rb.health),
  };

  return (
    <div className="relative z-[99999] max-w-[calc(100vw-24px)] min-w-[280px] overflow-hidden rounded-2xl border border-white/20 bg-[#0A0A0F]/95 shadow-[0_8px_32px_rgba(0,0,0,0.9)] backdrop-blur-3xl sm:max-w-[420px] sm:min-w-[340px]">
      <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-white">{d.year}</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-widest text-white/60 uppercase">
              {tier === 'FREE' ? '???' : d.stage}
            </span>
            <span className="text-[10px] text-white/30">Age ~{age}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl leading-none font-bold text-[#D4AF37]">
              {d.score}
            </span>
            <span
              className={`font-mono text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {isUp ? '▲' : '▼'} {isUp ? '+' : ''}
              {changePercent}%
            </span>
          </div>
        </div>

        {tier === 'FREE' ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Lock className="h-3.5 w-3.5 text-white/40" />
            <span className="text-xs text-white/60">
              Upgrade to unlock event details for {d.year}
            </span>
          </div>
        ) : (
          /* Fortune Level Badge */
          <div
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${fortune.bgColor}`}
          >
            <span className={`font-mono text-xs font-bold ${fortune.color}`}>
              {fortune.glyph}
            </span>
            <span className={`text-xs font-bold ${fortune.color}`}>
              {fortune.label}
            </span>
            <span className="ml-auto font-mono text-[9px] text-white/25">
              Ruler: {ruler.glyph} {ruler.planet}
            </span>
          </div>
        )}
      </div>

      {/* Hidden Sections for FREE users */}
      {tier !== 'FREE' && (
        <>
          {/* OHLC in Astrology Terms */}
          <div className="grid grid-cols-4 gap-1 border-b border-white/5 px-4 py-2 text-center">
            {[
              { label: 'Open', value: d.open, color: 'text-white/50' },
              { label: 'Peak', value: d.high, color: 'text-purple-400' },
              { label: 'Nadir', value: d.low, color: 'text-blue-400' },
              {
                label: 'Close',
                value: d.close,
                color: isUp ? 'text-emerald-400' : 'text-rose-400',
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-mono text-[7px] text-white/25 uppercase">
                  {s.label}
                </p>
                <p className={`font-mono text-sm font-bold ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* 4 Palace Analysis */}
          <div className="border-b border-white/5 px-4 py-2.5">
            <p className="mb-1.5 font-mono text-[8px] tracking-widest text-white/20 uppercase">
              Four Palace Analysis
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: Briefcase,
                  label: 'Career',
                  value: dims.career,
                  color: 'bg-yellow-500',
                },
                {
                  icon: Coins,
                  label: 'Wealth',
                  value: dims.wealth,
                  color: 'bg-emerald-500',
                },
                {
                  icon: Heart,
                  label: 'Love',
                  value: dims.love,
                  color: 'bg-rose-500',
                },
                {
                  icon: Zap,
                  label: 'Vitality',
                  value: dims.health,
                  color: 'bg-blue-500',
                },
              ].map((dim) => (
                <div key={dim.label} className="flex items-center gap-2">
                  <dim.icon className="h-3 w-3 shrink-0 text-white/30" />
                  <div className="flex-1">
                    <div className="mb-0.5 flex justify-between text-[9px]">
                      <span className="text-white/40">{dim.label}</span>
                      <span className="font-mono font-bold text-white/60">
                        {dim.value}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${dim.color}`}
                        style={{ width: `${dim.value}%`, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comprehensive Reading */}
          <div className="border-b border-white/5 bg-[#D4AF37]/[0.02] px-4 py-2.5">
            <p className="mb-1 font-mono text-[8px] tracking-widest text-[#D4AF37]/40 uppercase">
              Comprehensive Reading
            </p>
            <p className="text-[11px] leading-relaxed text-white/60">
              {reading}
            </p>
          </div>

          {/* Transit — styled as astrological event (PRO / LITE) */}
          {mainTransit && (
            <div className="space-y-2 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[8px] tracking-widest text-[#D4AF37]/40 uppercase">
                  Annual Transit
                </span>
                {mainTransit.impactScore >= 9 && (
                  <span className="flex items-center gap-0.5 rounded border border-rose-500/30 bg-rose-500/10 px-1 py-0.5 text-[7px] font-bold text-rose-400 uppercase">
                    <AlertCircle className="h-2 w-2" /> Critical
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white">
                {mainTransit.title}
              </h4>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                {mainTransit.description}
              </p>

              {/* LITE gets summary, PRO gets deep Swiss Ephemeris transit block */}
              {tier === 'LITE' ? (
                <p className="rounded bg-white/5 p-2 text-[11px] text-white/70 italic">
                  Upgrade to PRO for exact geometric alignments and orbital
                  insight.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-2">
                    <div className="mb-0.5 flex items-center gap-1">
                      <Target className="h-3 w-3 text-[#D4AF37]" />
                      <span className="text-[8px] font-bold text-white/40 uppercase">
                        Transit
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-[#D4AF37]">
                      {mainTransit.planet} {mainTransit.aspect}
                    </p>
                    <p className="mt-0.5 flex items-center gap-0.5 font-mono text-[8px] text-emerald-400/50">
                      <ShieldCheck className="h-2.5 w-2.5" /> Swiss Ephemeris
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-2">
                    <div className="mb-0.5 flex items-center gap-1">
                      <Compass className="h-3 w-3 text-[#D4AF37]" />
                      <span className="text-[8px] font-bold text-[#D4AF37] uppercase">
                        Guidance
                      </span>
                    </div>
                    <p className="line-clamp-3 text-[10px] leading-relaxed text-white/70">
                      {mainTransit.advice}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
