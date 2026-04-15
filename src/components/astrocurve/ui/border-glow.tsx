'use client';

import { useRef, useCallback, useEffect, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import './border-glow.css';

// ── helpers ──────────────────────────────────────────────────────────
function parseHSL(hslStr: string) {
  const m = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!m) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const pairs: [string, number][] = [
    ['', 100], ['-60', 60], ['-50', 50], ['-40', 40],
    ['-30', 30], ['-20', 20], ['-10', 10],
  ];
  const vars: Record<string, string> = {};
  for (const [k, o] of pairs)
    vars[`--glow-color${k}`] = `hsl(${base} / ${Math.min(o * intensity, 100)}%)`;
  return vars;
}

const POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
  const v: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(MAP[i], colors.length - 1)];
    v[KEYS[i]] = `radial-gradient(at ${POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  v['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return v;
}

function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x: number) { return x * x * x; }

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: {
  start?: number; end?: number; duration?: number; delay?: number;
  ease?: (x: number) => number; onUpdate: (v: number) => void; onEnd?: () => void;
}) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

// ── component ────────────────────────────────────────────────────────
interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

export function BorderGlow({
  children,
  className,
  edgeSensitivity = 13,
  glowColor = '260 60 70',       // violet, distinct from gold primary
  backgroundColor = 'transparent',
  borderRadius = 9999,            // pill by default
  glowRadius = 20,
  glowIntensity = 2.0,
  coneSpread = 25,
  animated = false,
  colors = ['#8B5CF6', '#EC4899', '#38BDF8'],  // violet, pink, cyan
  fillOpacity = 0.35,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2] as const;
  }, []);

  const getEdgeProximity = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx; const dy = y - cy;
    let kx = Infinity; let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx; const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const card = cardRef.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    card.style.setProperty('--edge-proximity', `${(getEdgeProximity(card, x, y) * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${getCursorAngle(card, x, y).toFixed(3)}deg`);
  }, [getEdgeProximity, getCursorAngle]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    const s = 110; const e = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${s}deg`);
    animateValue({ duration: 500, onUpdate: v => card.style.setProperty('--edge-proximity', String(v)) });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => card.style.setProperty('--cursor-angle', `${(e - s) * (v / 100) + s}deg`) });
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => card.style.setProperty('--cursor-angle', `${(e - s) * (v / 100) + s}deg`) });
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0, onUpdate: v => card.style.setProperty('--edge-proximity', String(v)), onEnd: () => card.classList.remove('sweep-active') });
  }, [animated]);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={cn('border-glow-card', className)}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      } as React.CSSProperties}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  );
}
