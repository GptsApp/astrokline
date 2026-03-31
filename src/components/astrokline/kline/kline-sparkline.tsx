'use client';

import type { DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';

interface Props {
  data: DestinyScorePoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

/** Compact SVG sparkline of K-line scores for embedding in cards */
export function KlineSparkline({
  data,
  width = 280,
  height = 60,
  color = '#D4AF37',
  className,
}: Props) {
  if (!data || data.length < 2) return null;

  const scores = data.map((d) => d.score);
  const min = Math.min(...scores) - 5;
  const max = Math.max(...scores) + 5;
  const range = max - min || 1;

  // Build SVG path
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((s - min) / range) * height;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  // Gradient fill area
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  // Find current year position
  const currentYear = new Date().getFullYear();
  const currentIdx = data.findIndex((d) => d.year === currentYear);
  const nowX = currentIdx >= 0 ? (currentIdx / (data.length - 1)) * width : -1;
  const nowY = currentIdx >= 0 ? height - ((scores[currentIdx] - min) / range) * height : -1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {nowX >= 0 && (
        <>
          <line x1={nowX} y1={0} x2={nowX} y2={height} stroke={color} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
          <circle cx={nowX} cy={nowY} r={3} fill={color} />
          <text x={nowX} y={nowY - 6} textAnchor="middle" fill={color} fontSize={7} fontFamily="monospace">
            NOW
          </text>
        </>
      )}
    </svg>
  );
}
