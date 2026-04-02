import { Star } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { InlineBirthForm } from '@/components/astrokline/ui/inline-birth-form';
import { Heading } from '@/components/astrokline/ui/heading';
import { SyncActiveTicker, LiveActionTicker, FadeInText, FadeInStats } from './astro-hero-client';

export function AstroHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
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
            <SyncActiveTicker />

            {/* Native Heading - Prevents hydration disappearing bugs & inherits Impeccable base typography */}
            <Heading level={1} className="text-5xl md:text-7xl lg:text-[80px] xl:text-[90px] xl:whitespace-nowrap flex flex-col mb-4 tracking-tighter leading-[1]">
              <span className="block opacity-95">
                The Data-Driven
              </span>
              <span className="block italic mt-0 md:mt-1 pt-1 pr-6 lg:pr-12 lg:text-right">
                Vedic Astrology Calculator
              </span>
            </Heading>

            <FadeInText className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light border-l-2 border-primary pl-6 max-w-lg">
              Stop guessing how to read astrology charts. We calculate exact planetary geometry and instantly turn it into a clear, predictive K-Line curve—so you see when to act and when to wait.
            </FadeInText>

            {/* Authority Proof / Data Readout Panel */}
            <FadeInStats className="flex flex-wrap border-y border-white/10 py-6 mt-12 items-center justify-between gap-6">
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
            </FadeInStats>

          </div>

          {/* Right Column: Lead Gen Form embedded directly! */}
          <div className="w-full lg:w-[55%] xl:w-[540px] relative z-20 shrink-0 pt-4 lg:pt-8 xl:pr-12">
             <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
             <InlineBirthForm />
          </div>
          
        </div>
      </div>

      <LiveActionTicker />
    </section>
  );
}
