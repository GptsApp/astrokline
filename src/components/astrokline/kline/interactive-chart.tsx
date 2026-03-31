'use client';

import { Heading } from "@/components/astrokline/ui/heading";

import { useMemo } from 'react';
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

  ArrowRight,
  History,
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
  profileName?: string;
  onActionGate?: (context: string, tier: AppTier) => void;
};

// Generate candle data with natural bull/bear patterns and NO gaps between candles.
// Each candle's open === previous candle's close for continuity.
function generateCandleData(data: DestinyScorePoint[]) {
  // Use a seeded approach so values are stable across renders
  const seed = data.map((d) => d.score).join(',');
  let seedIdx = 0;
  const pseudoRand = () => {
    seedIdx++;
    const x = Math.sin(seedIdx * 9301 + seed.length * 49297) * 49271;
    return x - Math.floor(x);
  };

  // Track the previous candle's close so the next opens there (no gaps)
  let prevClose = data.length > 0 ? data[0].score : 50;

  return data.map((point, i) => {
    const prevScore = i > 0 ? data[i - 1].score : point.score;
    const trend = point.score - prevScore;

    // This candle's open is ALWAYS the previous candle's close
    const open = i === 0 ? point.score : prevClose;

    // Natural intra-candle volatility scaled to the score movement
    const volatility = Math.max(2, Math.abs(trend) * 0.6 + pseudoRand() * 4 + 1.5);

    // In strong trends ~80% follow direction; in weak trends ~55%
    const trendStrength = Math.abs(trend);
    const followsTrend =
      pseudoRand() < (trendStrength > 5 ? 0.82 : trendStrength > 2 ? 0.65 : 0.55);

    let close: number;

    if (followsTrend) {
      if (trend >= 0) {
        // Bullish: close above open, pulled toward current score
        close = open + volatility * (0.3 + pseudoRand() * 0.5);
      } else {
        // Bearish: close below open
        close = open - volatility * (0.3 + pseudoRand() * 0.5);
      }
    } else {
      // Counter-trend candle (adds realism)
      if (trend >= 0) {
        close = open - volatility * (0.15 + pseudoRand() * 0.3);
      } else {
        close = open + volatility * (0.15 + pseudoRand() * 0.3);
      }
    }

    // Gently pull close toward the actual score so the chart tracks the destiny curve
    const pullStrength = 0.3 + pseudoRand() * 0.2;
    close = close + (point.score - close) * pullStrength;

    // Clamp to valid range
    close = Math.max(3, Math.min(97, close));

    // Ensure minimum body size — no identical-looking flat candles
    if (Math.abs(close - open) < 1.5) {
      const adj = 1.5 + pseudoRand() * 2;
      close = trend >= 0
        ? Math.min(97, close + adj)
        : Math.max(3, close - adj);
    }

    // Update prevClose for the next candle
    prevClose = close;

    const isBullish = close >= open;
    const bodySize = Math.abs(close - open);

    // Proportional wicks — 15-50% of body, slightly larger at key points
    const isKeyCandle = point.isPeak || point.isCrossroads;
    const wickUp = Math.max(1, Math.floor(
      bodySize * (0.15 + pseudoRand() * (isKeyCandle ? 0.45 : 0.3))
    ));
    const wickDown = Math.max(1, Math.floor(
      bodySize * (0.15 + pseudoRand() * (isKeyCandle ? 0.45 : 0.3))
    ));

    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;

    const volume = point.isPeak
      ? 95
      : point.isCrossroads
        ? 85
        : 40 + Math.floor(pseudoRand() * 35);

    return {
      ...point,
      open: Math.round(open * 100) / 100,
      close: Math.round(close * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
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
  const verticalOffset = labelPosition === 'top' ? -56 : 56;
  const starCy = cy + verticalOffset;
  const pillY = labelPosition === 'top' ? starCy - 30 : starCy + 14;
  const textY = labelPosition === 'top' ? starCy - 18 : starCy + 26;
  const connectorStartY = cy + (labelPosition === 'top' ? -12 : 12);
  const connectorEndY = labelPosition === 'top' ? starCy + 14 : starCy - 14;
  
  // Shrink star by 20% compared to origin (12, 5.5) -> (9.6, 4.4)
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
         <animate attributeName="r" values="12; 18; 12" dur="2.5s" repeatCount="indefinite" />
         <animate attributeName="fill-opacity" values="0.4; 0.05; 0.4" dur="2.5s" repeatCount="indefinite" />
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

  // Colors based on absolute value (Rainbow mapping)
  const baseColor = getScoreColor(close);
  const fillColor = isBullish ? baseColor : 'transparent';
  const strokeColor = baseColor;

  // Body dimensions from props (recharts provides these)
  const bodyX = x;
  const bodyY = y;
  const bodyW = width;
  const bodyH = Math.max(height, 2); // minimum 2px height for visibility

  // Wick center
  const wickX = bodyX + bodyW / 2;

  // Stable wick calculation: derive pixels-per-unit from body, cap to prevent pin bars
  const bodyDataRange = Math.abs(close - open) || 1;
  const pixelsPerUnit = bodyH / bodyDataRange;
  const maxWickPx = Math.max(bodyH * 1.2, 6);
  const upperWickPx = Math.min((high - Math.max(open, close)) * pixelsPerUnit, maxWickPx);
  const lowerWickPx = Math.min((Math.min(open, close) - low) * pixelsPerUnit, maxWickPx);

  return (
    <g>
      {/* Upper wick */}
      <line
        x1={wickX}
        y1={bodyY}
        x2={wickX}
        y2={bodyY - upperWickPx}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      {/* Lower wick */}
      <line
        x1={wickX}
        y1={bodyY + bodyH}
        x2={wickX}
        y2={bodyY + bodyH + lowerWickPx}
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
  profileName,
  onActionGate,
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
        (prev, current) => (prev.score > current.score ? prev : current),
        chartData[0]
      ),
    [chartData]
  );
  const minPoint = useMemo(
    () =>
      chartData.reduce(
        (prev, current) => (prev.score < current.score ? prev : current),
        chartData[0]
      ),
    [chartData]
  );
  const currentPoint = useMemo(
    () => chartData.find((point) => point.age === currentAge) ?? null,
    [chartData, currentAge]
  );

  const pastLowPoint = useMemo(() => {
    // Find absolute lowest point between 2-10 years ago (at least 2 years back for meaningful look-back)
    const pastData = chartData.filter(d => d.year >= currentYear - 10 && d.year <= currentYear - 2);
    if (!pastData.length) return null;
    return pastData.reduce((prev, current) => (prev.score < current.score ? prev : current), pastData[0]);
  }, [chartData, currentYear]);



  return (
    <div
      className="relative w-full"
      role="img"
      aria-label="Interactive 100-year K-Line destiny timing chart showing life score trends by age"
      data-testid="interactive-kline-chart"
    >
      <div
        className="relative w-full pb-6 pt-2"
        style={{ overflow: 'visible' }}
      >
        {/* Header - Centered Big Title & Subtitle */}
        <div className="mb-8 flex flex-col items-center justify-center text-center px-4">
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            {profileName ? `${profileName}'s` : 'Your'} Life Kline {(tier === 'GUEST' || isSimulation) && <span className="ml-2 text-white/30 text-2xl font-normal inline-block">(Preview)</span>}
          </Heading>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            A complete projection of your life energy across a 100-year timeline.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-[0.1em] text-white/30">
            <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />Peak</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />Valley</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-3 border-t border-dashed border-white/40" />Now</span>
            {currentPoint && (
              <span className="ml-2 border-l border-white/10 pl-4">Score: <span className="text-white/70">{currentPoint.score}</span> <span className="mx-2">·</span> Avg: <span className="text-white/70">{avgScore}</span></span>
            )}
          </div>
        </div>

        {tier === 'GUEST' && (
          <div className="pointer-events-none absolute inset-0 z-30 mt-32 flex flex-col items-center justify-center">
            <div className="absolute top-[20%] bottom-0 w-[120%] -left-[10%] -b-[3rem] bg-gradient-to-b from-transparent via-background/90 to-background backdrop-blur-[3px]" />
            <div className="border-primary/20 pointer-events-auto relative z-10 mt-20 flex flex-col items-center  border bg-black/60 p-6 shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-xl">
              <Lock className="text-primary mb-3 h-8 w-8" />
              <Heading level={3} className="mb-2 text-xl font-bold text-white">
                Your Timeline Has More to Tell You
              </Heading>
              <p className="mb-6 max-w-sm text-center text-sm text-white/60">
                Your chart reveals when love arrives, when career peaks, and when to protect your energy. Sign in to see your full story.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onActionGate) {
                    onActionGate('interactive_chart_unlock', 'FREE');
                  } else {
                    if (typeof window !== 'undefined' && (window as any).setAuthModalType) {
                      (window as any).setAuthModalType('sign-up');
                      const el = document.querySelector('[data-auth-trigger]');
                      if (el) (el as HTMLElement).click();
                    }
                  }
                }}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-8 py-3 font-bold text-black transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" /> See My Full Timeline
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
                      position: 'insideTopLeft',
                      value: 'NOW',
                      fill: 'rgba(212,175,55,0.9)',
                      fontSize: 9,
                      fontWeight: 700,
                      offset: 4,
                      fontFamily: 'monospace',
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
                    y={maxPoint.score}
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
                    y={minPoint.score}
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
                      onActionGate={onActionGate}
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

        {/* Look Back removed — past predictions risk trust if inaccurate */}

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
      label: 'Excellent Year',
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/15 border-yellow-500/30',
      glyph: '++',
    };
  if (score >= 75 && change >= 0)
    return {
      label: 'Great Year',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      glyph: '+',
    };
  if (score >= 60)
    return {
      label: 'Good Year',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      glyph: '+',
    };
  if (score >= 45)
    return {
      label: 'Steady Year',
      color: 'text-white/50',
      bgColor: 'bg-white/5 border-white/10',
      glyph: '~',
    };
  if (score >= 30)
    return {
      label: 'Challenging Year',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      glyph: '-',
    };
  return {
    label: 'Difficult Year',
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
    return 'This is one of your strongest years. Momentum is building naturally — a great time for big decisions, new projects, and stepping into the spotlight.';
  if (score >= 85)
    return 'A powerful year with strong energy, though growth may feel more gradual. Focus on refining what\'s already working.';
  if (score >= 70 && change > 0)
    return 'Things are picking up. You\'re entering a period where effort pays off more than usual. Lean into the opportunities you see.';
  if (score >= 70)
    return 'A solid year overall. Some minor friction may slow things down temporarily, but the foundation is strong.';
  if (score >= 55 && change > 0)
    return 'Energy is shifting in your favor. Small wins are starting to add up. Stay consistent and watch for emerging opportunities.';
  if (score >= 55)
    return 'A transitional year. Stay flexible and avoid overcommitting. Adaptability is your biggest asset right now.';
  if (score >= 40)
    return 'A year that asks for patience and discipline. Focus on what truly matters and let go of what isn\'t serving you.';
  return 'A tough but transformative year. The challenges you face now are building the foundation for something better ahead.';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandleTooltip = ({ active, payload, transitDetails, tier, onActionGate }: any) => {
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
    <div className="relative z-40 max-w-[calc(100vw-24px)] min-w-[280px] border border-white/10 bg-[#050505] shadow-2xl sm:max-w-[420px] sm:min-w-[340px]">
      <div className="border-b border-white/5 bg-transparent px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-white">{d.year}</span>
            <span className=" bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-widest text-white/60 uppercase">
              {tier === 'FREE' || tier === 'GUEST' ? <span className="flex items-center gap-1"><Lock className="h-2.5 w-2.5" />Locked</span> : d.stage}
            </span>
            <span className="text-[10px] text-white/30">Age ~{age}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl leading-none font-bold text-[#D4AF37]">
              {(typeof d.score === 'number' ? d.score.toFixed(1) : d.score)}
            </span>
            <span
              className={`font-mono text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {isUp ? '▲' : '▼'} {isUp ? '+' : ''}
              {changePercent}%
            </span>
          </div>
        </div>

        {tier === 'FREE' || tier === 'GUEST' ? (
          <button 
            type="button" 
            onClick={() => onActionGate?.('chart_tooltip', 'LITE')}
            className="group mt-2 flex w-full items-center justify-between border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 cursor-pointer transition-all hover:bg-[#D4AF37]/20"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="text-xs text-[#D4AF37] font-semibold">
                Unlock {d.year} Forecast
              </span>
            </div>
            <ArrowRight className="h-3 w-3 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          /* Fortune Level Badge */
          <div
            className={`flex items-center gap-2  border px-2.5 py-1.5 ${fortune.bgColor}`}
          >
            <span className={`font-mono text-xs font-bold ${fortune.color}`}>
              {fortune.glyph}
            </span>
            <span className={`text-xs font-bold ${fortune.color}`}>
              {fortune.label}
            </span>
          </div>
        )}
      </div>

      {/* Hidden Sections for FREE/GUEST users */}
      {tier !== 'FREE' && tier !== 'GUEST' && (
        <>
          {/* OHLC in Astrology Terms */}
          <div className="grid grid-cols-4 gap-1 border-b border-white/5 px-4 py-2 text-center">
            {[
              { label: 'Start', value: typeof d.open === 'number' ? d.open.toFixed(2) : d.open, color: 'text-white/50' },
              { label: 'High', value: typeof d.high === 'number' ? d.high.toFixed(2) : d.high, color: 'text-purple-400' },
              { label: 'Low', value: typeof d.low === 'number' ? d.low.toFixed(2) : d.low, color: 'text-blue-400' },
              {
                label: 'End',
                value: typeof d.close === 'number' ? d.close.toFixed(2) : d.close,
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
              Life Areas
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
                    <div className="h-1 w-full overflow-hidden bg-white/5">
                      <div
                        className={`h-full ${dim.color}`}
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
              Year Summary
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
                  <span className="flex items-center gap-0.5  border border-rose-500/30 bg-rose-500/10 px-1 py-0.5 text-[7px] font-bold text-rose-400 uppercase">
                    <AlertCircle className="h-2 w-2" /> Critical
                  </span>
                )}
              </div>
              <Heading level={4} className="text-sm font-bold text-white">
                {mainTransit.title}
              </Heading>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                {mainTransit.description}
              </p>

              {/* LITE gets summary, PRO gets deep Swiss Ephemeris transit block */}
              {tier === 'LITE' ? (
                <p className=" bg-white/5 p-2 text-[11px] text-white/70 italic">
                Upgrade to PRO to see exact planetary alignments, personalized
                advice, and year-by-year action plans.
              </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className=" border border-white/5 bg-white/5 p-2">
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
                      <ShieldCheck className="h-2.5 w-2.5" /> Verified Data
                    </p>
                  </div>
                  <div className=" border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-2">
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
