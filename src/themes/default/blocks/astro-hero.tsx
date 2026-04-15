'use client';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { Heading } from '@/components/astrocurve/ui/heading';
import { ZodiacIcon } from '@/components/icons';
import { HeroKline } from '@/components/astrocurve/kline/hero-kline';
import { useBirthInfoModal } from '@/components/astrocurve/ui/birth-info-context';

function SyncActiveTicker() {
  return (
    <div
      className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-muted-foreground font-mono animate-in fade-in slide-in-from-left-4 duration-700 [animation-delay:200ms] [animation-fill-mode:both]"
    >
      <div className="flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5">
        <span className="h-1.5 w-1.5 bg-[#4ade80] opacity-80 shadow-[0_0_8px_#4ade80]" />
        <span className="text-primary font-bold text-xs">LIVE</span>
      </div>
      <span className="text-foreground/20">/</span>
      <div className="relative h-6 overflow-hidden flex-1 min-w-[200px]">
        <span className="absolute inset-0 flex items-center text-foreground/80 text-xs whitespace-nowrap">
          Based on NASA Planetary Data
        </span>
      </div>
    </div>
  );
}




// Server-side pure CSS animation wrappers (no JS hydration needed)
function FadeInText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("animate-in fade-in duration-1000 fill-mode-both [animation-delay:300ms]", className)}>
      {children}
    </p>
  );
}
export function AstroHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const { open: openBirthModal } = useBirthInfoModal();

  return (
    <section
      id={section.id || 'hero'}
      className={cn(
        'relative overflow-hidden bg-background pt-24 pb-12 lg:pt-32 lg:pb-16',
        section.className,
        className
      )}
    >
      {/* Impeccable: Sharp, purposeful textures. No generic glowing orbs. */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:48px_48px]"
      />
      <div className="absolute top-0 right-0 h-full w-[1px] bg-foreground/10" />
      <div className="absolute bottom-12 left-0 right-0 h-[1px] bg-foreground/10" />

      {/* Floating zodiac glyphs — subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {([
          { sign: 'aries' as const, x: '8%', y: '15%', size: 32 as const, opacity: 0.12 },
          { sign: 'leo' as const, x: '85%', y: '20%', size: 32 as const, opacity: 0.10 },
          { sign: 'scorpio' as const, x: '75%', y: '70%', size: 24 as const, opacity: 0.08 },
          { sign: 'pisces' as const, x: '12%', y: '75%', size: 24 as const, opacity: 0.10 },
          { sign: 'capricorn' as const, x: '50%', y: '10%', size: 24 as const, opacity: 0.07 },
        ]).map(({ sign, x, y, size, opacity }) => (
          <div
            key={sign}
            className="absolute"
            style={{ left: x, top: y, opacity }}
          >
            <ZodiacIcon sign={sign} size={size} color="#D4AF37" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12 lg:gap-10 xl:gap-16 relative">
          
          {/* Left Column: Heavy typography + CTA */}
          <div className="flex-1 w-full lg:w-[45%] max-w-xl space-y-5 md:space-y-6 lg:pr-6 xl:pr-10 pt-4 xl:pt-8 flex flex-col justify-center">
            
            {/* Live indicator */}
            <SyncActiveTicker />

            {/* PAS: Pain eyebrow — name the problem before the solution */}
            <p className="animate-in fade-in duration-700 fill-mode-both [animation-delay:150ms] text-sm text-muted-foreground/60 font-mono tracking-wide">
              Blindly timing life&apos;s biggest decisions?
            </p>

            <Heading level={1} className="text-5xl md:text-7xl lg:text-[80px] xl:text-[90px] flex flex-col mb-4 tracking-tighter leading-[1] -mt-2">
              <span className="block opacity-95">
                {new Date().getFullYear()}–{new Date().getFullYear() + 3},
              </span>
              <span className="block italic mt-0 md:mt-1 pt-1 text-primary font-light">
                Mapped.
              </span>
            </Heading>

            <FadeInText className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light border-l-2 border-primary pl-6 max-w-lg">
              Saturn returns, Jupiter expansions — happening whether you see them or not. Map yours before the next window closes.
            </FadeInText>

            {/* CTA Button */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [animation-delay:400ms]">
              <button
                type="button"
                onClick={() => openBirthModal()}
                className="inline-flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm px-10 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)]"
              >
                See My {new Date().getFullYear()}–{new Date().getFullYear() + 3} →
              </button>
              <p className="text-xs text-muted-foreground/50 font-mono tracking-wide mt-3">
                Free · 10 seconds · No account needed · <span className="text-primary/70">Early access</span>
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Value stack + social proof */}
            <div className="animate-in fade-in duration-700 fill-mode-both [animation-delay:500ms] flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground/70 font-mono">
                <span className="inline-flex items-center gap-1.5"><span className="text-primary">✓</span> 3-year planetary timeline</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-primary">✓</span> Career &amp; relationship windows</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-primary">✓</span> Your personal Saturn return date</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {(['bg-violet-500','bg-sky-500','bg-emerald-500','bg-amber-500','bg-rose-500']).map((bg, i) => (
                    <div key={i} className={`h-7 w-7 rounded-full ${bg} border-2 border-background flex items-center justify-center text-xs font-bold text-white`}>
                      {['E','J','S','M','A'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/70 font-mono">
                  <span className="font-bold text-foreground/80">5,380+</span> charts generated
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Testimonial */}
            <div className="animate-in fade-in duration-1000 fill-mode-both [animation-delay:600ms]">
              <p className="text-sm text-foreground/80 italic leading-relaxed">&ldquo;It flagged a career window in Q1 2024. I got promoted that March — the timing was unreal.&rdquo;</p>
              <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-widest mt-1.5">— Emma K., Leo · London</p>
            </div>

          </div>


          {/* Right Column: K-Line Chart */}
          <div className="w-full lg:w-[55%] relative z-20 shrink-0">
            <div className="relative w-full">
              <HeroKline />
            </div>
          </div>
          
        </div>

      </div>

    </section>
  );
}
