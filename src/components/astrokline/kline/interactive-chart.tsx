'use client';

import { Heading } from "@/components/astrokline/ui/heading";
import { Progress } from '@/shared/components/ui/progress';
import { useAppContext } from '@/shared/contexts/app';
import { getPersonalizedReading } from '@/lib/astrokline/transit-templates';

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
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// --- MOCK DASHA LOGIC ---
const mockDashaPeriods = [
  { planet: 'Sun', length: 6, color: 'url(#dashaGlowSun)' },
  { planet: 'Moon', length: 10, color: 'url(#dashaGlowMoon)' },
  { planet: 'Mars', length: 7, color: 'url(#dashaGlowMars)' },
  { planet: 'Rahu', length: 18, color: 'url(#dashaGlowRahu)' },
  { planet: 'Jupiter', length: 16, color: 'url(#dashaGlowJupiter)' },
  { planet: 'Saturn', length: 19, color: 'url(#dashaGlowSaturn)' },
  { planet: 'Mercury', length: 17, color: 'url(#dashaGlowMercury)' },
  { planet: 'Ketu', length: 7, color: 'url(#dashaGlowKetu)' },
  { planet: 'Venus', length: 20, color: 'url(#dashaGlowVenus)' },
];

function calculateDashaStrip(birthYear: number) {
  let currentStart = birthYear;
  // using Mars as baseline start for mock realism
  let startIdx = 2; 
  let results = [];
  for (let i = 0; i < 15; i++) {
     const p = mockDashaPeriods[(startIdx + i) % mockDashaPeriods.length];
     results.push({ ...p, startAge: currentStart - birthYear, endAge: currentStart + p.length - birthYear });
     currentStart += p.length;
     if (currentStart - birthYear > 100) break;
  }
  return results;
}
// ------------------------

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
  aiYearInsights?: Record<number, { aiSummary: string; aiAdvice: string }>;
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
        letterSpacing="0.08em"
      >
        {label.toUpperCase()}
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
  aiYearInsights,
}: Props) {
  const { setAuthModalType, setIsShowSignModal } = useAppContext();
  const currentYear = new Date().getFullYear();
  const visibleStartAge = currentYear - 1 - birthYear;
  const visibleEndAge = currentYear + 2 - birthYear;

  const dashaStrip = useMemo(() => calculateDashaStrip(birthYear), [birthYear]);

  const chartData1 = useMemo(() => {
    if (tier === 'GUEST' || tier === 'FREE') {
      const freeWindow = tier === 'FREE' ? 3 : 2;
      return data.map((d) => {
        const age = d.year - birthYear;
        // Keep actual data for current year window
        if (age >= visibleStartAge && age <= visibleEndAge + (freeWindow - 2)) return d;
        // Keep past years real but blur future
        if (d.year <= currentYear) return d;
        // Inject random noise for future to prevent inspect-element attacks
        return { ...d, score: 50 + Math.sin(d.year * 123) * 15 };
      });
    }
    return data;
  }, [data, tier, birthYear, visibleStartAge, visibleEndAge, currentYear]);

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
      data-testid="interactive-kline-chart"
    >
      <p className="sr-only">
        Interactive 100-year Life Curve timing chart showing life score trends by age.
      </p>
      <div
        className="relative w-full overflow-visible pb-6 pt-2"
      >
        {/* Header - Centered Big Title & Subtitle */}
        <div className="mb-8 flex flex-col items-center justify-center text-center px-4">
          <Heading level={2} className="font-serif text-3xl text-white/90 md:text-4xl">
            {profileName ? `${profileName}'s` : 'Your'} Life Curve {(tier === 'GUEST' || isSimulation) && <span className="ml-2 text-white/30 text-2xl font-normal inline-block">(Preview)</span>}
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
                    setAuthModalType('sign-up');
                    setIsShowSignModal(true);
                  }
                }}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-8 py-3 font-bold text-black transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" /> See My Full Timeline
              </button>
            </div>
          </div>
        )}

        {tier === 'FREE' && (
          <div className="pointer-events-none absolute right-0 top-32 bottom-0 z-20 w-[40%]">
            <div className="absolute inset-0 bg-gradient-to-l from-background via-background/60 to-transparent backdrop-blur-[2px]" />
            <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <button
                type="button"
                onClick={() => onActionGate?.('chart_future_unlock', 'LITE')}
                className="flex items-center gap-2 bg-[#D4AF37]/90 px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all"
              >
                <Lock className="h-3.5 w-3.5" /> Unlock Future
              </button>
              <p className="mt-2 text-[9px] text-white/40 font-mono text-center">See your full 100-year map</p>
            </div>
          </div>
        )}

        {/* Main Candlestick Chart */}
        <div className="w-full overflow-visible">
          <div className="h-[480px] overflow-visible md:h-[550px]">
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
                  <linearGradient id="dashaGlowSun" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" stopOpacity={0}/><stop offset="100%" stopColor="#fbbf24" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowMoon" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e8f0" stopOpacity={0}/><stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowMars" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" stopOpacity={0}/><stop offset="100%" stopColor="#f87171" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowRahu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0}/><stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowJupiter" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde047" stopOpacity={0}/><stop offset="100%" stopColor="#fde047" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowSaturn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowMercury" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0}/><stop offset="100%" stopColor="#34d399" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowKetu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8" stopOpacity={0}/><stop offset="100%" stopColor="#94a3b8" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="dashaGlowVenus" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f472b6" stopOpacity={0}/><stop offset="100%" stopColor="#f472b6" stopOpacity={0.1}/></linearGradient>
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

                {/* Dasha Strip Layer */}
                {dashaStrip.map(ds => (
                  <ReferenceArea 
                    key={`dasha-${ds.planet}`}
                    xAxisId={0}
                    yAxisId={0}
                    x1={ds.startAge}
                    x2={ds.endAge}
                    y1={0}
                    y2={30}
                    fill={tier === 'PRO' ? ds.color : 'url(#areaGlow)'}
                    strokeOpacity={0}
                  />
                ))}
                {/* Dasha Dividers and Text (PRO only) */}
                {tier === 'PRO' && dashaStrip.map((ds, i) => (
                  <ReferenceLine
                    key={`dsh-div-${ds.planet}-${i}`}
                    x={ds.startAge}
                    stroke="rgba(212,175,55,0.4)"
                    strokeDasharray="3 4"
                    strokeWidth={1}
                  />
                ))}
                {tier === 'PRO' && dashaStrip.map(ds => (
                  <ReferenceLine
                    key={`lbl-${ds.planet}`}
                    x={Math.round((ds.startAge + ds.endAge)/2)}
                    stroke="none"
                    label={{
                      position: 'insideBottom',
                      value: `${ds.planet}`,
                      fill: 'rgba(255,255,255,0.25)',
                      fontSize: 8,
                      offset: 6,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      textAnchor: 'middle'
                    }}
                  />
                ))}

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
                      aiYearInsights={aiYearInsights}
                    />
                  }
                  cursor={{
                    stroke: 'rgba(212,175,55,0.2)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  allowEscapeViewBox={{ x: false, y: true }}
                  wrapperStyle={{
                    zIndex: 99999,
                    pointerEvents: 'auto',
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
  _stage: string,
  change: number,
  mainTransit: { planet: string; aspect: string; theme: string; title: string } | null
): string {
  return getPersonalizedReading(score, change, mainTransit);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandleTooltip = ({ active, payload, transitDetails, tier, onActionGate, aiYearInsights }: any) => {
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
  const reading = getComprehensiveReading(d.score, d.stage, change, mainTransit);

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
      {/* ── Annual Destiny Card (At top of tooltip) ── */}
      {aiYearInsights?.[d.year] && (
        <div className="border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-2">
          <p className="flex items-center gap-1.5 font-mono text-[8px] font-bold tracking-widest text-[#D4AF37] uppercase">
            <Sparkles className="h-2.5 w-2.5" />
            Destiny Anchor — {d.year}
          </p>
          <p className="mt-1 text-xs italic leading-relaxed text-white/90">
            "{aiYearInsights[d.year].aiSummary}"
          </p>
        </div>
      )}

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
                  colorClass:
                    '[&>[data-slot=progress-indicator]]:bg-rose-500',
                },
                {
                  icon: Zap,
                  label: 'Vitality',
                  value: dims.health,
                  colorClass:
                    '[&>[data-slot=progress-indicator]]:bg-blue-500',
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
                    <Progress
                      value={dim.value}
                      className={`h-1 bg-white/5 opacity-60 ${dim.colorClass}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comprehensive Reading */}
          <div className="border-b border-white/5 bg-[#D4AF37]/[0.02] px-4 py-2.5">
            <p className="mb-1 flex items-center gap-1.5 font-mono text-[8px] tracking-widest text-[#D4AF37]/40 uppercase">
              Year Summary
              {aiYearInsights?.[d.year] && <span className="text-[#D4AF37] text-[7px] normal-case tracking-normal">✨ AI Enhanced</span>}
            </p>
            <p className="text-[11px] leading-relaxed text-white/60">
              {aiYearInsights?.[d.year]?.aiSummary || reading}
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

              {/* Transit Logic Layer */}
              {tier === 'LITE' && d.year !== currentYear ? (
                // LITE Time-Lock for history/future
                <div className="relative mt-2 flex flex-col items-center justify-center overflow-hidden rounded border border-white/5 bg-white/[0.02] p-4 text-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />
                  <div className="relative z-10 flex flex-col items-center">
                    <Lock className="mb-1.5 h-4 w-4 text-[#D4AF37]/60" />
                    <p className="text-[10px] font-bold text-white/90">Temporal Lock</p>
                    <p className="mt-1 max-w-[200px] text-[9px] leading-relaxed text-white/50">
                      You are viewing a timeline outside the current year. Upgrade to PRO to unlock full planetary trajectories and past/future validation.
                    </p>
                    <button 
                      onClick={() => onActionGate?.('time_travel', 'PRO')}
                      className="mt-3 bg-[#D4AF37]/10 px-3 py-1 font-mono text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-colors"
                    >
                      Unlock Pro
                    </button>
                  </div>
                </div>
              ) : tier === 'LITE' && d.year === currentYear ? (
                <p className=" bg-white/5 p-2 text-[11px] text-white/70 italic mt-2">
                  Upgrade to PRO to see exact planetary alignments, personalized
                  advice, and year-by-year action plans.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
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
