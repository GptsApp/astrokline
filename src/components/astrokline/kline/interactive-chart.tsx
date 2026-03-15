"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Area, Rectangle
} from "recharts";
import { DestinyScorePoint, TransitEvent } from "@/lib/astrokline/mock-astrology-data";
import { Target, Compass, AlertCircle, ShieldCheck, TrendingUp, TrendingDown, Heart, Briefcase, Coins, Zap } from "lucide-react";

type Props = {
  data: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
  onNodeClick?: (year: number) => void;
  selectedYear?: number;
  visibleYears?: number;
  totalYears?: number;
};

// Generate candle data with dramatic high/low swings
function generateCandleData(data: DestinyScorePoint[]) {
  // Use a seeded approach so values are stable across renders
  const seed = data.map(d => d.score).join(',');
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
    const volume = point.isPeak ? 95 : point.isCrossroads ? 85 : 40 + Math.floor(pseudoRand() * 35);

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

// Custom candlestick shape with wick lines
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close, high, low, isBullish } = payload;
  const yScale = props.yScale || ((v: number) => y);

  // Colors
  const fillColor = isBullish ? '#10B981' : '#EF4444';
  const strokeColor = isBullish ? '#34D399' : '#F87171';

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
        y2={bodyY - (high - Math.max(open, close)) * (bodyH / (Math.abs(close - open) || 1))}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      {/* Lower wick */}
      <line
        x1={wickX}
        y1={bodyY + bodyH}
        x2={wickX}
        y2={bodyY + bodyH + (Math.min(open, close) - low) * (bodyH / (Math.abs(close - open) || 1))}
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
        rx={1}
      />
    </g>
  );
};

export function InteractiveChart({ data, transitDetails, onNodeClick, selectedYear, visibleYears, totalYears }: Props) {
  const chartData1 = useMemo(() => {
    if (visibleYears && visibleYears < data.length) {
      return data.slice(0, visibleYears);
    }
    return data;
  }, [data, visibleYears]);
  const candleData = useMemo(() => generateCandleData(chartData1), [chartData1]);
  const avgScore = useMemo(() => Math.round(chartData1.reduce((a, b) => a + b.score, 0) / chartData1.length), [chartData1]);

  // For the bar chart we need the body as a stacked bar: base + height
  const chartData = useMemo(() => candleData.map(d => ({
    ...d,
    bodyBase: Math.min(d.open, d.close),
    bodyHeight: Math.abs(d.close - d.open) || 2,
  })), [candleData]);

  return (
    <div className="w-full relative">
      {/* Mystical Background Glows */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative bg-[#15131A]/30 backdrop-blur-sm border border-white/5 rounded-3xl p-3 md:p-6" style={{ overflow: 'visible' }}>
        {/* Header with Authority Markers */}
        <div className="mb-3 md:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-serif tracking-tight text-white/90">{visibleYears ? `${visibleYears}-Year` : totalYears ? `${totalYears}-Year` : '10-Year'} Destiny Trajectory</h3>
              <span className="text-[10px] font-mono text-emerald-400/50 flex items-center gap-0.5 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" /> Swiss Ephemeris
              </span>
            </div>
            <p className="text-[10px] text-white/30 mt-0.5 font-mono flex items-center gap-2">
              <span>☉ ☽ ♄ ♃ ♂ ♀ ☿</span>
              <span className="text-white/10">|</span>
              NATAL TRANSIT · DESTINY SCORE · PLANETARY ASPECTS
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-wider">
              <span className="w-3 h-1.5 rounded-sm bg-emerald-500/80" /> Bull
              <span className="w-3 h-1.5 rounded-sm bg-rose-500/80 ml-2" /> Bear
            </div>
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-white/40">Live</span>
            </div>
          </div>
        </div>

        {/* Main Candlestick Chart */}
        <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
          <div className="min-w-[600px] h-[300px] md:h-[420px]" style={{ overflow: 'visible' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 5, bottom: 0 }}
              barCategoryGap={0}
              barGap={0}
              onClick={(state) => {
                if (state?.activeLabel && onNodeClick) onNodeClick(Number(state.activeLabel));
              }}
            >
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis 
                dataKey="year" 
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, dy: 8, fontFamily: 'monospace' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'monospace' }}
                domain={['dataMin - 25', 'dataMax + 20']}
                width={30}
              />
              
              {/* Average baseline (dashed) */}
              <ReferenceLine 
                y={avgScore} 
                stroke="rgba(212,175,55,0.25)" 
                strokeDasharray="6 4"
                label={{ value: `AVG ${avgScore}`, position: 'right', fill: 'rgba(212,175,55,0.4)', fontSize: 9, fontFamily: 'monospace' }}
              />

              {/* score 50 baseline */}
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />

              {/* Selected year line */}
              {selectedYear && (
                <ReferenceLine x={selectedYear} stroke="rgba(212,175,55,0.4)" strokeDasharray="4 4" />
              )}

              {/* Subtle area under score */}
              <Area type="monotone" dataKey="score" fill="url(#areaGlow)" stroke="none" />

              {/* Upper wick line (dashed) */}
              <Line type="monotone" dataKey="high" stroke="rgba(139,92,246,0.2)" strokeWidth={1} strokeDasharray="3 3" dot={false} activeDot={false} />
              {/* Lower wick line (dashed) */}
              <Line type="monotone" dataKey="low" stroke="rgba(59,130,246,0.15)" strokeWidth={1} strokeDasharray="3 3" dot={false} activeDot={false} />

              {/* Hidden base for stacking */}
              <Bar dataKey="bodyBase" stackId="candle" fill="transparent" barSize={9999} />

              {/* Candle bodies — touching, no gap */}
              <Bar
                dataKey="bodyHeight"
                stackId="candle"
                barSize={9999}
                shape={<CandlestickShape />}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isBullish ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>

              {/* Main score line (solid gold) */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#D4AF37"
                strokeWidth={1.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#D4AF37",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                  className: "drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] outline-none"
                }}
              />

              <Tooltip
                content={<CandleTooltip transitDetails={transitDetails} />}
                cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
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
function getFortuneLevel(score: number, change: number): { label: string; color: string; bgColor: string; emoji: string } {
  if (score >= 90 && change >= 0) return { label: '大吉 · Grand Fortune', color: 'text-yellow-300', bgColor: 'bg-yellow-500/15 border-yellow-500/30', emoji: '☰' };
  if (score >= 75 && change >= 0) return { label: '中吉 · Auspicious', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30', emoji: '☳' };
  if (score >= 60) return { label: '小吉 · Favorable', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20', emoji: '☴' };
  if (score >= 45) return { label: '平 · Neutral', color: 'text-white/50', bgColor: 'bg-white/5 border-white/10', emoji: '☷' };
  if (score >= 30) return { label: '小凶 · Challenging', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20', emoji: '☵' };
  return { label: '大凶 · Adversity', color: 'text-rose-400', bgColor: 'bg-rose-500/15 border-rose-500/30', emoji: '☲' };
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
function getComprehensiveReading(score: number, stage: string, change: number): string {
  if (score >= 85 && change > 0) return 'Stellar alignment creates a rare window of peak opportunity. Cosmic wind is at your back — bold action rewards tenfold.';
  if (score >= 85) return 'Powerful planetary positions sustain high energy, though momentum may plateau. Consolidate gains wisely.';
  if (score >= 70 && change > 0) return 'Favorable transits are building momentum. Inner planets support growth — lean into emerging opportunities.';
  if (score >= 70) return 'Strong foundational energy persists. Minor retrograde influences may cause temporary friction — patience is your ally.';
  if (score >= 55 && change > 0) return 'Energy is shifting upward through cardinal sign influence. Small wins compound into significant breakthroughs.';
  if (score >= 55) return 'A transitional period where mutable signs dominate. Stay flexible and avoid rigid commitments.';
  if (score >= 40) return 'Saturn\'s discipline tests your resolve. This is a pruning year — release what no longer serves your trajectory.';
  return 'Deep transformation through Pluto\'s influence. The darkest hour precedes dawn. Inner work now plants seeds for future harvest.';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandleTooltip = ({ active, payload, transitDetails }: any) => {
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
  const age = d.year - currentYear + 30; // approximate age
  const reading = getComprehensiveReading(d.score, d.stage, change);

  const dims = {
    career: Math.min(100, d.score + (mainTransit?.theme === 'Career' ? 10 : -5)),
    wealth: Math.min(100, d.score + (mainTransit?.theme === 'Wealth' ? 12 : -3)),
    love: Math.min(100, d.score + (mainTransit?.theme === 'Love' ? 8 : -7)),
    health: Math.min(100, Math.max(30, d.score - 10 + Math.floor(d.year % 7 * 3))),
  };

  return (
    <div className="bg-[#08080A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[340px] max-w-[420px] overflow-hidden">
      {/* Header — Year + Age + Fortune */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif text-white">{d.year}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono font-medium text-white/60 uppercase tracking-widest">{d.stage}</span>
            <span className="text-[10px] text-white/30">Age ~{age}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-[#D4AF37] leading-none">{d.score}</span>
            <span className={`text-[10px] font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{changePercent}%
            </span>
          </div>
        </div>
        {/* Fortune Level Badge */}
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${fortune.bgColor}`}>
          <span className="text-lg">{fortune.emoji}</span>
          <span className={`text-xs font-bold ${fortune.color}`}>{fortune.label}</span>
          <span className="ml-auto text-[9px] font-mono text-white/25">Ruler: {ruler.glyph} {ruler.planet}</span>
        </div>
      </div>

      {/* OHLC in Astrology Terms */}
      <div className="px-4 py-2 grid grid-cols-4 gap-1 border-b border-white/5 text-center">
        {[
          { label: '始 Open', value: d.open, color: 'text-white/50' },
          { label: '峰 Peak', value: d.high, color: 'text-purple-400' },
          { label: '谷 Nadir', value: d.low, color: 'text-blue-400' },
          { label: '终 Close', value: d.close, color: isUp ? 'text-emerald-400' : 'text-rose-400' },
        ].map(s => (
          <div key={s.label}>
            <p className="text-[7px] font-mono text-white/25 uppercase">{s.label}</p>
            <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 4 Palace Analysis */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1.5">四宫分析 · Four Palace Analysis</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Briefcase, label: '事业宫 Career', value: dims.career, color: 'bg-yellow-500' },
            { icon: Coins, label: '财帛宫 Wealth', value: dims.wealth, color: 'bg-emerald-500' },
            { icon: Heart, label: '感情宫 Love', value: dims.love, color: 'bg-rose-500' },
            { icon: Zap, label: '生命力 Vitality', value: dims.health, color: 'bg-blue-500' },
          ].map(dim => (
            <div key={dim.label} className="flex items-center gap-2">
              <dim.icon className="w-3 h-3 text-white/30 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-white/40">{dim.label}</span>
                  <span className="text-white/60 font-mono font-bold">{dim.value}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${dim.color}`} style={{ width: `${dim.value}%`, opacity: 0.6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Reading */}
      <div className="px-4 py-2.5 border-b border-white/5 bg-[#D4AF37]/[0.02]">
        <p className="text-[8px] font-mono text-[#D4AF37]/40 uppercase tracking-widest mb-1">综合解读 · Comprehensive Reading</p>
        <p className="text-[11px] text-white/60 leading-relaxed">{reading}</p>
      </div>

      {/* Transit — styled as astrological event */}
      {mainTransit && (
        <div className="px-4 py-2.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono text-[#D4AF37]/40 uppercase tracking-widest">流年星象 · Annual Transit</span>
            {mainTransit.impactScore >= 9 && (
              <span className="flex items-center gap-0.5 text-[7px] font-bold px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 uppercase">
                <AlertCircle className="w-2 h-2" /> Critical
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-white">{mainTransit.title}</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{mainTransit.description}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/5 p-2 border border-white/5">
              <div className="flex items-center gap-1 mb-0.5">
                <Target className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[8px] font-bold text-white/40 uppercase">Transit</span>
              </div>
              <p className="text-[10px] font-mono text-[#D4AF37]">{mainTransit.planet} {mainTransit.aspect}</p>
              <p className="text-[8px] font-mono text-emerald-400/50 flex items-center gap-0.5 mt-0.5"><ShieldCheck className="w-2.5 h-2.5" /> Swiss Ephemeris</p>
            </div>
            <div className="rounded-lg bg-[#D4AF37]/10 p-2 border border-[#D4AF37]/20">
              <div className="flex items-center gap-1 mb-0.5">
                <Compass className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[8px] font-bold text-[#D4AF37] uppercase">Guidance</span>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed line-clamp-3">{mainTransit.advice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
