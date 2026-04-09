'use client';

import { cn } from '@/shared/lib/utils';

/** Simulated Life Curve data matching the real chart structure */
const KLINE_DATA = [
  { year: 2020, o: 45, h: 58, l: 38, c: 52 },
  { year: 2021, o: 52, h: 65, l: 44, c: 60 },
  { year: 2022, o: 60, h: 72, l: 50, c: 55 },
  { year: 2023, o: 55, h: 80, l: 48, c: 75 },
  { year: 2024, o: 75, h: 88, l: 62, c: 82 },
  { year: 2025, o: 82, h: 90, l: 70, c: 78 },
  { year: 2026, o: 78, h: 85, l: 55, c: 65 },
  { year: 2027, o: 65, h: 70, l: 42, c: 48 },
  { year: 2028, o: 48, h: 62, l: 40, c: 58 },
  { year: 2029, o: 58, h: 75, l: 52, c: 72 },
  { year: 2030, o: 72, h: 82, l: 60, c: 68 },
];

const W = 440;
const H = 200;
const PAD = { top: 20, right: 20, bottom: 28, left: 35 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;
const barW = chartW / KLINE_DATA.length;

function yScale(v: number) {
  return PAD.top + chartH - ((v - 20) / 80) * chartH;
}

export function KlineMockup() {
  // Trend line through closing prices
  const trendPath = KLINE_DATA.map((d, i) => {
    const x = PAD.left + i * barW + barW / 2;
    const y = yScale(d.c);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="select-none pointer-events-none overflow-hidden bg-[#0a0a0d] border border-white/5 p-4 sm:p-5 text-left max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">⚹ Your Life Curve</span>
          <span className="text-[8px] font-mono bg-white/10 text-white/40 px-1.5 py-0.5">(Preview)</span>
        </div>
        <div className="flex items-center gap-3 text-[8px] font-mono text-white/25 uppercase">
          <span>Peak <span className="text-[#D4AF37]">88</span></span>
          <span>Valley <span className="text-white/50">40</span></span>
          <span>Score <span className="text-white/50">65</span></span>
          <span>Age <span className="text-white/50">36</span></span>
        </div>
      </div>

      {/* Chart SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid lines */}
        {[20, 40, 60, 80, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} stroke="white" strokeOpacity={0.05} />
            <text x={PAD.left - 6} y={yScale(v) + 3} fill="white" fillOpacity={0.2} fontSize={8} textAnchor="end" fontFamily="monospace">{v}</text>
          </g>
        ))}

        {/* Candlesticks */}
        {KLINE_DATA.map((d, i) => {
          const x = PAD.left + i * barW + barW / 2;
          const isUp = d.c >= d.o;
          const color = isUp ? '#D4AF37' : '#666';
          const bodyTop = yScale(Math.max(d.o, d.c));
          const bodyH = Math.abs(yScale(d.o) - yScale(d.c)) || 1;

          return (
            <g key={d.year}>
              {/* Wick */}
              <line x1={x} y1={yScale(d.h)} x2={x} y2={yScale(d.l)} stroke={color} strokeWidth={1} strokeOpacity={0.6} />
              {/* Body */}
              <rect x={x - barW * 0.25} y={bodyTop} width={barW * 0.5} height={bodyH} fill={isUp ? color : 'transparent'} stroke={color} strokeWidth={1} opacity={isUp ? 0.9 : 0.5} />
              {/* Year label */}
              <text x={x} y={H - 8} fill="white" fillOpacity={0.2} fontSize={7} textAnchor="middle" fontFamily="monospace">
                {d.year}
              </text>
            </g>
          );
        })}

        {/* Trend line */}
        <path d={trendPath} fill="none" stroke="#D4AF37" strokeWidth={1.5} strokeOpacity={0.4} strokeLinecap="round" strokeLinejoin="round" />

        {/* Glow on peak */}
        <circle cx={PAD.left + 4 * barW + barW / 2} cy={yScale(88)} r={4} fill="#D4AF37" fillOpacity={0.3} />
        <circle cx={PAD.left + 4 * barW + barW / 2} cy={yScale(88)} r={2} fill="#D4AF37" />

        {/* Peak tooltip */}
        <g transform={`translate(${PAD.left + 4 * barW + barW / 2 + 10}, ${yScale(88) - 4})`}>
          <rect x={0} y={-8} width={62} height={14} fill="black" fillOpacity={0.8} stroke="#D4AF37" strokeWidth={0.5} strokeOpacity={0.3} />
          <text x={5} y={2} fill="#D4AF37" fontSize={7} fontFamily="monospace">HIGHEST 88</text>
        </g>
      </svg>

      {/* Bottom CTA */}
      <div className="mt-2 text-center">
        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-primary/60">See my full timeline →</span>
      </div>
    </div>
  );
}
