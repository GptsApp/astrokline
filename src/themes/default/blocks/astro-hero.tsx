'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';

import { trackEvent } from '@/lib/astrokline/track-event';
import { useRouter } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { InlineBirthForm } from '@/components/astrokline/ui/inline-birth-form';
import { Heading } from '@/components/astrokline/ui/heading';
const SOCIAL_PROOFS = [
  { label: 'NASA JPL Planetary Data' },
  { label: '100-Year Trajectory Mapping' },
  { label: '0.001° Calculation Precision' },
];

const LIVE_ACTIONS = [
  { id: 1, user: 'Alex M.', loc: 'New York', action: 'just generated their timing curve' },
  { id: 2, user: 'Jenna L.', loc: 'London', action: 'discovered a peak year at age 34' },
  { id: 3, user: 'Ravi K.', loc: 'Singapore', action: 'saved their 5-year strategic plan' },
  { id: 4, user: 'Sofia E.', loc: 'Madrid', action: 'just generated their timing curve' },
  { id: 5, user: 'Tom W.', loc: 'Sydney', action: 'unlocked a deep reading for 2027' },
];

export function AstroHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const router = useRouter();
  const [proofIndex, setProofIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);

  useEffect(() => {
    const proofInterval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % SOCIAL_PROOFS.length);
    }, 4000);
    const actionInterval = setInterval(() => {
      setActionIndex((prev) => (prev + 1) % LIVE_ACTIONS.length);
    }, 3200);
    return () => {
      clearInterval(proofInterval);
      clearInterval(actionInterval);
    };
  }, []);

  return (
    <section
      id={section.id || 'hero'}
      className={cn(
        'relative overflow-hidden bg-background pt-24 pb-20 lg:pt-32 lg:pb-28',
        section.className,
        className
      )}
    >
      {/* Impeccable: Sharp, purposeful textures. No generic glowing orbs. */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-0 right-0 h-full w-[1px] bg-foreground/10" />
      <div className="absolute bottom-12 left-0 right-0 h-[1px] bg-foreground/10" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-12 xl:gap-24 relative">
          
          {/* Left Column: Asymmetric, heavy typography & Data Readouts */}
          <div className="flex-1 w-full lg:w-[45%] max-w-2xl space-y-10 lg:pr-8 xl:pr-12 pt-4 xl:pt-8 flex flex-col justify-center">
            
            {/* Live indicator & ticker - Tactical Radar Style */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-muted-foreground font-mono"
            >
              <div className="flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5">
                <span className="h-1.5 w-1.5 bg-[#4ade80] opacity-80 animate-pulse shadow-[0_0_8px_#4ade80]" />
                <span className="text-primary font-bold text-[10px]">SYNC ACTIVE</span>
              </div>
              <span className="text-foreground/20">/</span>
              <div className="relative h-6 overflow-hidden flex-1 min-w-[200px]">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={proofIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ ease: [0.19, 1.0, 0.22, 1.0], duration: 0.8 }}
                    className="absolute inset-0 flex items-center text-foreground/80 text-[10px] whitespace-nowrap"
                  >
                    [ ENGINE ] {SOCIAL_PROOFS[proofIndex].label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Native Heading - Prevents hydration disappearing bugs & inherits Impeccable base typography */}
            <Heading level={1} className="text-6xl md:text-8xl lg:text-[90px] xl:text-[100px] xl:whitespace-nowrap flex flex-col mb-4 tracking-tighter leading-[0.95]">
              <span className="block opacity-95">
                Master
              </span>
              <span className="block text-primary italic font-medium mt-0 md:mt-1 pt-1 pr-6 lg:pr-12 lg:text-right">
                your timeline.
              </span>
            </Heading>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light border-l-2 border-primary pl-6 max-w-lg"
            >
              Your birth chart contains a timing pattern. We calculate the exact planetary geometry and turn it into one clear curve — so you see when to act and when to wait.
            </motion.p>

            {/* Authority Proof / Data Readout Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-wrap border-y border-white/10 py-6 mt-12 items-center justify-between gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Data Source</span>
                <span className="text-sm font-bold text-foreground font-mono tracking-wide">NASA JPL</span>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Accuracy</span>
                <span className="text-sm font-bold text-primary flex items-center gap-1.5 font-mono tracking-wide">
                  <Star className="h-3.5 w-3.5 fill-primary" /> 99.98%
                </span>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Charts Generated</span>
                <span className="text-sm font-bold text-foreground font-mono tracking-wide">14,200+</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Lead Gen Form embedded directly! */}
          <div className="w-full lg:w-[55%] xl:w-[540px] relative z-20 shrink-0 pt-4 lg:pt-8 xl:pr-12">
             <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
             <InlineBirthForm />
          </div>
          
        </div>
      </div>

      {/* GLOBAL TERMINAL TICKER / FOMO ENGINE TAPE */}
      <div className="absolute bottom-0 left-0 w-full h-10 border-t border-white/5 bg-background/80 backdrop-blur-md z-30 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full h-full flex items-center gap-4 relative overflow-hidden">
           <div className="relative flex shrink-0">
             <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-ping absolute opacity-80" />
             <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] relative" />
           </div>
           <div className="flex-1 h-full relative overflow-hidden">
             <AnimatePresence mode="popLayout">
               <motion.div
                 key={actionIndex}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 transition={{ duration: 0.5, ease: "easeOut" }}
                 className="absolute inset-0 flex items-center font-mono text-[10px] sm:text-xs tracking-widest uppercase whitespace-nowrap"
               >
                 <span className="text-foreground font-bold">{LIVE_ACTIONS[actionIndex].user}</span> 
                 <span className="text-muted-foreground/60 mx-2">[{LIVE_ACTIONS[actionIndex].loc}]</span> 
                 <span className="text-primary/90">{LIVE_ACTIONS[actionIndex].action}</span>
                 <span className="ml-4 opacity-30">{"///"}</span>
                 <span className="text-muted-foreground/40 text-[9px] ml-4 hidden sm:inline-block">LIVE LATENCY: 14ms</span>
               </motion.div>
             </AnimatePresence>
           </div>
        </div>
      </div>
    </section>
  );
}
