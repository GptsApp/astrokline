'use client';

import { Heading } from "@/components/astrocurve/ui/heading";

import { useRef, useState } from 'react';
import { RadarData } from '@/lib/astrokline/mock-astrology-data';
import { motion } from 'framer-motion';
import { Focus } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTick = ({
  payload,
  x,
  y,
  cx,
  cy,
  index,
  onMouseEnter,
  activeIndex,
  dataArray,
}: any) => {
  const data = dataArray.find((d: RadarData) => d.dimension === payload.value);
  const score = data ? data.score : '';
  const isActive = index === activeIndex;

  // Calculate vector direction from chart center to the vertex
  const dx = x - (cx || x);
  const dy = y - (cy || y);
  const length = Math.sqrt(dx * dx + dy * dy);

  // Push text 20px further out from the actual vertex
  const offset = 20;
  const finalX = length ? x + (dx / length) * offset : x;
  const finalY = length ? y + (dy / length) * offset : y;

  return (
    <g
      className="recharts-layer recharts-polar-angle-axis-tick"
      onMouseEnter={() => onMouseEnter?.(index)}
      onClick={() => onMouseEnter?.(index)}
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
    >
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        className="transition-all"
      >
        <tspan
          x={finalX}
          y={finalY - 8}
          fill={isActive ? '#FFFFFF' : '#D4AF37'}
          fontSize={18}
          fontWeight="bold"
          className="drop-shadow-md transition-colors"
        >
          {score}
        </tspan>
        <tspan
          x={finalX}
          y={finalY + 14}
          fill={isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)'}
          fontSize={11}
          fontFamily="monospace"
          className="transition-colors"
        >
          {payload.value}
        </tspan>
      </text>
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomRadarDot = (props: any) => {
  const { cx, cy, index, activeIndex, setActiveIndex } = props;
  const isActive = index === activeIndex;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setActiveIndex(index)}
      onClick={() => setActiveIndex(index)}
      style={{ pointerEvents: 'auto' }}
    >
      {isActive && (
        <>
          <line
            x1={cx}
            y1={cy}
            x2="50%"
            y2="50%"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
            className="animate-pulse"
          />
          <circle
            cx={cx}
            cy={cy}
            r={4.5}
            fill="#FFFFFF"
            stroke="#D4AF37"
            strokeWidth={2.5}
            className="drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          />
        </>
      )}
      {/* Invisible larger hover area for the dot */}
      <circle cx={cx} cy={cy} r={25} fill="transparent" stroke="transparent" />
    </g>
  );
};

export function LifeRadar({ data }: { data: RadarData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeData = data[activeIndex] || data[0];
  const radarContainerRef = useRef<HTMLDivElement>(null);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarContainerRef.current) return;

    // Calculate mouse position relative to center of radar container
    const rect = radarContainerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Distance check to avoid triggering when mouse is in the very corners of the box far outside the radar
    // We constrain the interaction radius to be precisely around the labels/numbers.
    // The actual radar is at 65% of container half-width, so 85% generously covers the text labels.
    const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
    const maxInteractRadius = Math.min(cx, cy) * 0.85;
    if (distance > maxInteractRadius) return;

    // Calculate angle in degrees. Math.atan2(y, x) where top is negative y.
    let angleDeg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;

    // Shift coordinate system: Top (-90 deg) becomes 0, and we normalize to 0-360
    angleDeg = angleDeg + 90;
    if (angleDeg < 0) angleDeg += 360;

    // We have 7 dimensions. Calculate sector size.
    const numItems = data.length;
    const anglePerItem = 360 / numItems;

    // Snap to closest index
    let closestIndex = 0;
    let minDiff = 360;

    for (let i = 0; i < numItems; i++) {
      const itemAngle = i * anglePerItem;
      let diff = Math.abs(angleDeg - itemAngle);
      if (diff > 180) diff = 360 - diff; // Handle 360 wrapping
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (activeIndex !== closestIndex) {
      setActiveIndex(closestIndex);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="mb-10 flex items-center gap-3">
        <Heading level={2} className="font-serif text-3xl tracking-tight text-white/90">
          Cosmic Dimension Radar
        </Heading>
        <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 items-center gap-8 -[2.5rem] border border-white/5 bg-[#111015] p-6 shadow-2xl md:p-10 lg:grid-cols-2">
        {/* Left Side: The Radar Chart */}
        <div
          ref={radarContainerRef}
          onMouseMove={handleContainerMouseMove}
          className="relative flex h-[350px] w-full cursor-crosshair items-center justify-center md:h-[450px]"
        >
          {/* Deep glow background */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37]/5 blur-[80px]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/5 blur-[60px]" />

          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}>
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="65%"
              data={data}
              style={{ pointerEvents: 'none' }} // Disable internal recharts hover to prevent conflicts
            >
              <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={(props: any) => (
                  <CustomTick
                    {...props}
                    onMouseEnter={setActiveIndex}
                    activeIndex={activeIndex}
                    dataArray={data}
                  />
                )}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />

              <defs>
                <linearGradient id="radarGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
                </linearGradient>
                <filter
                  id="glowFilter"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <Radar
                name="Cosmic Blueprint"
                dataKey="score"
                stroke="#FCDD73"
                strokeWidth={2}
                fill="url(#radarGlow)"
                fillOpacity={0.5}
                filter="url(#glowFilter)"
                dot={
                  <CustomRadarDot
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                  />
                }
                activeDot={false}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Interactive Active Dimension Analysis */}
        <div className="flex h-full flex-col justify-center px-4 py-4 md:px-8">
          <div className="w-full transition-all duration-150 ease-out">
            <div className="mb-6">
              <div className="relative mb-2 flex items-center gap-3 text-[#D4AF37]">
                <Focus className="animate-spin-slow h-5 w-5" />
                <span className="font-mono text-xs tracking-[0.2em] uppercase">
                  Active Dimension
                </span>
              </div>
              <Heading level={3} className="font-serif text-4xl tracking-tight text-white md:text-5xl">
                {activeData.dimension}
              </Heading>
            </div>

            <div className="mb-8 flex items-end gap-5">
              <div className="mb-[-8px] text-8xl leading-none font-light tracking-tighter text-[#D4AF37]">
                {activeData.score}
              </div>
              <div className="pb-2">
                <div className="mb-1 font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  Astrological Anchor
                </div>
                <div className="font-medium text-white/80">
                  {activeData.house}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8 h-1.5 w-full overflow-hidden bg-white/5 shadow-inner">
              <motion.div
                animate={{
                  width: `${activeData.score}%`,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`absolute top-0 left-0 h-full ${activeData.score >= 90 ? 'bg-gradient-to-r from-[#D4AF37] to-[#FCDD73]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
              />
            </div>

            <div className="relative flex min-h-[120px] items-center overflow-hidden  border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <div
                className={`absolute top-0 left-0 h-full w-1 ${activeData.score >= 90 ? 'bg-[#D4AF37]' : 'bg-emerald-500'}`}
              />
              <p className="text-sm leading-relaxed text-white/80 md:text-base">
                {activeData.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
            <span className="h-1.5 w-1.5 animate-pulse bg-white" />
            <p className="text-center font-mono text-xs tracking-widest uppercase">
              Hover chart to decode dimensions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
