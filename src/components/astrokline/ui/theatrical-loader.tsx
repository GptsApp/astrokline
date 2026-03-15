'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { ZodiacIcon, getZodiacSignByIndex, ZODIAC_SIGN_NAMES } from './zodiac-icons';
import { Compass, Database, Activity, Sparkles } from 'lucide-react';

interface AstrologyLoaderProps {
  isLoading: boolean;
  className?: string;
  onComplete?: () => void;
  durationMs?: number;
}

const LOADING_PHASES = [
  { text: "Aligning celestial coordinates…", Icon: Compass },
  { text: "Channeling Swiss Ephemeris data…", Icon: Database },
  { text: "Calculating planetary aspects…", Icon: Activity },
  { text: "Weaving your cosmic blueprint…", Icon: Sparkles },
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
      setPhaseIdx(Math.min(Math.floor(elapsed / phaseInterval), LOADING_PHASES.length - 1));

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
    <div className={cn("flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto space-y-10", className)}>

      {/* ─── Mystical Zodiac Ring ─── */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer zodiac ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {ZODIAC_SIGN_NAMES.map((sign, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const x = 50 + 45 * Math.cos(angle);
            const y = 50 + 45 * Math.sin(angle);
            return (
              <span
                key={i}
                className="absolute text-primary/40"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <ZodiacIcon sign={sign} size={14} />
              </span>
            );
          })}
        </motion.div>

        {/* Inner pulsing ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Spinning aspect line */}
        <motion.div
          className="absolute inset-6 rounded-full border border-dashed border-primary/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Center mystical symbol */}
        <div className="z-10 w-20 h-20 rounded-full bg-background/90 border border-primary/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={phaseIdx}
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center"
            >
              <phase.Icon className="w-8 h-8 text-primary" />
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Phase Text ─── */}
      <div className="w-full flex flex-col items-center space-y-5">
        <div className="h-8 w-full relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={phaseIdx}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="absolute text-sm text-foreground/80 font-medium tracking-wide text-center"
            >
              {phase.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtle progress bar */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/40 to-primary/80"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em] font-mono">
          Swiss Ephemeris DE431
        </p>
      </div>
    </div>
  );
}
