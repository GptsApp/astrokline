'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles, Star } from 'lucide-react';

import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { trackEvent } from '@/lib/astrokline/track-event';
import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const SOCIAL_PROOFS = [
  { name: 'Sarah', city: 'NYC', time: '2 min ago' },
  { name: 'Alex', city: 'London', time: '5 min ago' },
  { name: 'Yuki', city: 'Tokyo', time: '8 min ago' },
  { name: 'Maria', city: 'São Paulo', time: '12 min ago' },
  { name: 'David', city: 'Sydney', time: '15 min ago' },
];

export function AstroHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const { open } = useBirthInfoModal();
  const router = useRouter();
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % SOCIAL_PROOFS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id={section.id || 'hero'}
      className={cn(
        'astro-starfield relative flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28',
        section.className,
        className
      )}
    >
      <div className="absolute top-1/2 left-1/2 h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 opacity-60 blur-[120px] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 text-center">
        <div
          className="flex flex-col items-center animate-[fadeInUp_0.8s_ease-out_both]"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="mb-6 inline-flex min-h-[28px] min-w-[200px] items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={proofIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="whitespace-nowrap"
              >
                {SOCIAL_PROOFS[proofIndex].name} in{' '}
                {SOCIAL_PROOFS[proofIndex].city} generated their K-Line{' '}
                {SOCIAL_PROOFS[proofIndex].time}
              </motion.span>
            </AnimatePresence>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight leading-tight md:text-6xl">
            <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent">
              See Your K-Line.
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321] bg-clip-text text-transparent">
              Know When to Move.
            </span>
          </h1>

          <p className="text-muted-foreground mb-8 max-w-xl text-base leading-relaxed md:text-lg">
            {section.description}
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex -space-x-4">
              <img
                className="border-background z-[60] h-10 w-10 rounded-full border-2 object-cover"
                src="/images/avatars/diverse/hero_casual_1.webp"
                alt="AstroKline user"
                loading="lazy"
              />
              <img
                className="border-background z-[50] h-10 w-10 rounded-full border-2 object-cover"
                src="/images/avatars/diverse/hero_casual_2.webp"
                alt="AstroKline user"
                loading="lazy"
              />
              <img
                className="border-background z-[40] h-10 w-10 rounded-full border-2 object-cover"
                src="/images/avatars/diverse/hero_casual_3.webp"
                alt="AstroKline user"
                loading="lazy"
              />
              <img
                className="border-background z-[30] h-10 w-10 rounded-full border-2 object-cover"
                src="/images/avatars/diverse/hero_casual_4.webp"
                alt="AstroKline user"
                loading="lazy"
              />
              <img
                className="border-background z-[20] h-10 w-10 rounded-full border-2 object-cover"
                src="/images/avatars/diverse/hero_casual_5.webp"
                alt="AstroKline user"
                loading="lazy"
              />
              <div className="border-background relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-emerald-500/10 shadow-inner backdrop-blur-sm">
                <span className="h-2.5 w-2.5 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-foreground/80 text-sm font-medium md:text-base">
                <span className="font-bold tracking-tight text-emerald-400">
                  Live
                </span>{' '}
                readings today
              </span>
            </div>
          </div>

          <div className="group relative mt-4 w-full max-w-xl">
            <div className="absolute inset-0 z-0 rounded-xl bg-background/40 shadow-2xl backdrop-blur-2xl" />

            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
              <div className="from-primary/10 to-primary/10 absolute inset-0 bg-gradient-to-r via-transparent opacity-30" />
            </div>

            <div className="border-foreground/5 pointer-events-none absolute inset-0 z-10 rounded-xl border" />

            <div
              className="pointer-events-none absolute inset-[-1px] z-20 overflow-hidden rounded-[11px]"
              style={{
                padding: '1.5px',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            >
              <motion.div
                className="absolute top-1/2 left-1/2 h-[2000px] w-[2000px] origin-center -translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 75%, rgba(212,175,55,0.2) 85%, rgba(252,221,115,1) 100%)',
                }}
              />
            </div>

            <div className="relative z-30 flex flex-col items-center justify-center px-6 py-10 md:px-12 md:py-12">
              <Button
                size="lg"
                type="button"
                onClick={() => {
                  trackEvent('hero_cta_click', { source: 'hero_button' });
                  open((birthData) => {
                    // User completed birth info → navigate to /kline where auto-calculate triggers
                    router.push('/kline');
                  });
                }}
                className="group h-14 w-full animate-[pulse_2s_ease-in-out_infinite] rounded-xl bg-primary px-10 text-lg font-bold text-primary-foreground shadow-[0_0_30px_-5px_var(--primary)] transition-all hover:scale-[1.03] hover:bg-primary/90 hover:animate-none hover:shadow-[0_0_40px_-5px_var(--primary)] active:scale-95 md:w-auto"
              >
                Generate My K-Line
                <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Button>

              <div className="mt-6 flex flex-col items-center justify-center">
                <div className="text-muted-foreground/60 flex flex-wrap items-center justify-center gap-3 font-mono text-xs md:text-[13px]">
                  <span className="flex items-center gap-1.5">
                    <Check className="text-primary/70 h-4 w-4" />
                    Free instant reading
                  </span>
                  <span className="hidden text-white/20 md:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Check className="text-primary/70 h-4 w-4" />
                    No credit card required
                  </span>
                  <span className="hidden text-white/20 md:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Check className="text-primary/70 h-4 w-4" />
                    100% private
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
