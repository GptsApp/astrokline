'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Compass, Database, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import {
  getZodiacSignByIndex,
  ZODIAC_SIGN_NAMES,
  ZodiacIcon,
} from './zodiac-icons';

interface AstrologyLoaderProps {
  isLoading: boolean;
  className?: string;
  onComplete?: () => void;
  durationMs?: number;
}

const LOADING_PHASES = [
  { text: 'Aligning celestial coordinates…', Icon: Compass },
  { text: 'Channeling Swiss Ephemeris data…', Icon: Database },
  { text: 'Calculating planetary aspects…', Icon: Activity },
  { text: 'Weaving your cosmic blueprint…', Icon: Sparkles },
];

export function AstrologyLoader({
  isLoading,
  className,
  onComplete,
  durationMs = 6000,
}: AstrologyLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref fresh without triggering useEffect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setPhaseIdx(0);
      return;
    }

    const startTime = Date.now();
    const phaseInterval = durationMs / LOADING_PHASES.length;
    let frameId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(pct);
      setPhaseIdx(
        Math.min(Math.floor(elapsed / phaseInterval), LOADING_PHASES.length - 1)
      );

      if (pct < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Done!
        onCompleteRef.current?.();
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isLoading, durationMs]); // NO phaseIdx in deps — this was the bug

  if (!isLoading) return null;

  const phase = LOADING_PHASES[phaseIdx];

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-10 p-8',
        className
      )}
    >
      {/* ─── Mystical Zodiac Ring (Spatial 3D) ─── */}
      <div className="relative flex h-64 w-64 items-center justify-center perspective-[800px]">
        {/* Deep background galaxy blur */}
        <div className="bg-primary/20 pointer-events-none absolute inset-0 scale-150 animate-pulse blur-[80px]" />

        {/* Outer zodiac ring tilted in 3D */}
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateZ: 360,
            rotateX: [60, 65, 60],
            translateY: [-10, 10, -10],
          }}
          transition={{
            rotateZ: { duration: 25, repeat: Infinity, ease: 'linear' },
            rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            translateY: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {ZODIAC_SIGN_NAMES.map((sign, i) => {
            const angle = i * 30 * (Math.PI / 180);
            const x = (50 + 45 * Math.cos(angle)).toFixed(4);
            const y = (50 + 45 * Math.sin(angle)).toFixed(4);
            return (
              <span
                key={i}
                className="text-primary/60 absolute drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%) rotateX(-60deg)',
                }}
              >
                <ZodiacIcon sign={sign} size={16} />
              </span>
            );
          })}
        </motion.div>

        {/* Inner pulsing structural rings (Spatial Depth) */}
        <motion.div
          className="border-primary/20 absolute inset-4 border"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [50, 55, 50],
            scale: [1, 1.05, 1],
            translateZ: [20, 30, 20],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="border-primary/30 absolute inset-8 border"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [70, 65, 70],
            scale: [1, 1.1, 1],
            translateZ: [-20, -10, -20],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Spinning aspect line */}
        <motion.div
          className="border-primary/40 absolute inset-10 border border-dashed"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating dust particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="absolute h-1 w-1 bg-white shadow-[0_0_10px_#fff]"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: (Math.random() - 0.5) * 200,
              y: (Math.random() - 0.5) * 200,
              scale: [0, Math.random() + 0.5, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Center mystical symbol floating */}
        <motion.div
          className="border-primary/40 z-10 flex h-24 w-24 items-center justify-center border-2 bg-[#0A0A0A]/90 shadow-[0_0_40px_rgba(212,175,55,0.4)] backdrop-blur-md"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phaseIdx}
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center"
            >
              <phase.Icon className="text-primary h-10 w-10 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ─── Phase Text ─── */}
      <div className="flex w-full flex-col items-center space-y-5">
        <div className="relative flex h-8 w-full items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={phaseIdx}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="text-foreground/80 absolute text-center text-sm font-medium tracking-wide"
            >
              {phase.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtle progress bar */}
        <div className="h-0.5 w-48 overflow-hidden bg-white/5">
          <motion.div
            className="from-primary/40 to-primary/80 h-full bg-gradient-to-r"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-muted-foreground/40 font-mono text-[10px] tracking-[0.3em] uppercase">
          Swiss Ephemeris DE431
        </p>
      </div>
    </div>
  );
}
