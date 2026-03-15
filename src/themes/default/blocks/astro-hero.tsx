'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  User,
  Clock,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { trackEvent } from '@/lib/astrokline/track-event';

// Social proof notifications (rotating)
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
  const router = useRouter();
  const { open } = useBirthInfoModal();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const [proofIndex, setProofIndex] = useState(0);

  const LOADING_STEPS = [
    "Connecting to Swiss Ephemeris DE431...",
    "Calculating precise planetary transits...",
    "Analyzing 10-year destiny K-Line...",
    "Finalizing your cosmic blueprint..."
  ];

  // Rotate social proof notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % SOCIAL_PROOFS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= LOADING_STEPS.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 900);

      const timeout = setTimeout(() => {
        // Always go to /kline — no forced login redirect
        router.push('/kline');
      }, 3800);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      }
    }
  }, [isGenerating, router]);

  return (
    <section
      id={section.id || 'hero'}
      className={cn(
        'astro-starfield relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 flex items-center justify-center',
        section.className,
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-60" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 text-center">
        {/* Use CSS animation instead of framer-motion to avoid opacity:0 blocking LCP */}
        <div
          className="flex flex-col items-center animate-[fadeInUp_0.8s_ease-out_both]"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Badge */}
          {/* Rotating Social Proof Notification */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 min-h-[28px] min-w-[200px]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={proofIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="whitespace-nowrap"
              >
                {SOCIAL_PROOFS[proofIndex].name} in {SOCIAL_PROOFS[proofIndex].city} generated their K-Line {SOCIAL_PROOFS[proofIndex].time}
              </motion.span>
            </AnimatePresence>
          </div>
          

          {/* Title with gradient */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40">
              Stop Guessing Your Future.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321]">
              {section.highlight_text
                ? `Read Your ${section.highlight_text}.`
                : 'Read Your Destiny.'}
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-xl text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
            {section.description}
          </p>

          {/* Expert Quote */}
          <p className="text-sm font-serif italic text-white/35 mb-8 tracking-wide">
            &quot;There are no bad charts — only charts not yet understood.&quot;
            <span className="not-italic text-white/20 text-xs ml-2 font-mono">— Rob Hand</span>
          </p>

          {/* Trust Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex -space-x-4">
              <img
                className="w-10 h-10 rounded-full border-2 border-background z-30 object-cover"
                src="/images/avatars/hero/user1.png"
                alt="AstroKline user"
                loading="lazy"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-background z-20 object-cover"
                src="/images/avatars/hero/user2.png"
                alt="AstroKline user"
                loading="lazy"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-background z-10 object-cover"
                src="/images/avatars/hero/user3.png"
                alt="AstroKline user"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm text-foreground/80 font-medium">
                {section.tip || 'Trusted by 10,000+ visionaries'}
              </span>
            </div>
          </div>

          {/* Glassmorphism Birth Info CTA */}
          <div className="w-full max-w-xl relative mt-4 group">
            {/* Base Glass Backdrop */}
            <div className="absolute inset-0 bg-background/40 backdrop-blur-2xl rounded-2xl md:rounded-full shadow-2xl z-0" />

            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-2xl md:rounded-full overflow-hidden z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-30" />
            </div>

            {/* Static Border */}
            <div className="absolute inset-0 border border-foreground/5 rounded-2xl md:rounded-full pointer-events-none z-10" />

            {/* Animated Conic Gradient Border Light */}
            <div
              className="absolute inset-[-1px] rounded-[17px] md:rounded-[999px] pointer-events-none z-20 overflow-hidden"
              style={{
                padding: '1.5px',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            >
              <motion.div
                className="absolute left-1/2 top-1/2 w-[2000px] h-[2000px] origin-center -translate-x-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 75%, rgba(212,175,55,0.2) 85%, rgba(252,221,115,1) 100%)',
                }}
              />
            </div>

            {/* CTA Content */}
            <div className="relative z-30 p-6 md:p-8 overflow-visible flex flex-col items-center justify-center">
              <Button
                size="lg"
                onClick={() => {
                  trackEvent('hero_cta_click', { source: 'hero_button' });
                  open(() => {
                    setIsGenerating(true);
                  });
                }}
                className="w-full md:w-auto h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl md:rounded-full shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:shadow-[0_0_30px_-5px_var(--primary)] hover:scale-105"
              >
                Reveal My K-Line
                <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
              </Button>
              
              {/* Trust microcopy below CTA */}
              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                <p className="text-center text-xs text-muted-foreground/60 font-mono">
                  Free instant reading · No credit card required · 100% private
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground/40 border border-white/5 bg-white/5 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Powered by Swiss Ephemeris DE431 & StarMind AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-[-10px] rounded-full border border-primary/30 border-t-transparent animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-[-20px] rounded-full border border-primary/10 border-b-transparent animate-[spin_4s_linear_infinite_reverse]" />
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Synthesizing Cosmic Data
              </h3>
              
              <div className="h-6 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary/80 font-mono text-sm uppercase tracking-widest text-center"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
