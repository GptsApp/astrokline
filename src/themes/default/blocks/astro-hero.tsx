import { Star } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { InlineBirthForm } from '@/components/astrokline/ui/inline-birth-form';
import { Heading } from '@/components/astrokline/ui/heading';
import { SyncActiveTicker, LiveActionTicker, OnlineCount } from './astro-hero-client';

// Server-side pure CSS animation wrappers (no JS hydration needed)
function FadeInText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("animate-in fade-in duration-1000 fill-mode-both", className)} style={{ animationDelay: '300ms' }}>
      {children}
    </p>
  );
}
function FadeInStats({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both", className)} style={{ animationDelay: '400ms' }}>
      {children}
    </div>
  );
}

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
            <Heading level={1} className="text-5xl md:text-7xl lg:text-[80px] xl:text-[90px] flex flex-col mb-4 tracking-tighter leading-[1]">
              <span className="block opacity-95">
                Your Stars Have
              </span>
              <span className="block italic mt-0 md:mt-1 pt-1 text-primary font-light">
                a Message for You.
              </span>
            </Heading>

            <FadeInText className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light border-l-2 border-primary pl-6 max-w-lg">
              We read the exact position of every planet at the moment you were born — and reveal a clear timeline of your best years, love windows, and turning points.
            </FadeInText>

            {/* Authority Proof / Data Readout Panel */}
            <FadeInStats className="flex flex-wrap border-y border-white/10 py-6 mt-12 items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Powered by</span>
                <span className="text-sm font-bold text-foreground font-mono tracking-wide">NASA Data</span>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Precision</span>
                <span className="text-sm font-bold text-primary flex items-center gap-1.5 font-mono tracking-wide">
                  <Star className="h-3.5 w-3.5 fill-primary" /> Swiss Ephemeris
                </span>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Readings Created</span>
                <span className="text-sm font-bold text-foreground font-mono tracking-wide">14,200+</span>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Exploring Now</span>
                <OnlineCount />
              </div>
            </FadeInStats>

          </div>


          {/* Right Column: Lead Gen Form embedded directly! */}
          <div className="w-full lg:w-[55%] xl:w-[540px] relative z-20 shrink-0 pt-4 lg:pt-8 xl:pr-12">
             <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
             {/* Server-rendered form shell for instant LCP paint */}
             <div className="relative w-full group">
               <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-primary/50 z-30" />
               <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-primary/50 z-30" />
               <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-primary/50 z-30" />
               <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-primary/50 z-30" />
               <div className="w-full border border-white/10 bg-[#050505]/90 shadow-2xl relative overflow-hidden">
                 <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 relative z-10" />
                 <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                   <span className="h-1.5 w-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />
                   <span className="text-[8px] font-mono text-muted-foreground/50 tracking-widest uppercase">SECURE</span>
                 </div>
                 <div className="p-8 relative z-10">
                   <div className="mb-6 flex flex-col justify-start">
                      <Heading level={3} variant="card" className="pr-24">Reveal Your Timeline ✨</Heading>
                   </div>
                   <InlineBirthForm />
                 </div>
               </div>
             </div>
          </div>
          
        </div>
      </div>

      <LiveActionTicker />
    </section>
  );
}
