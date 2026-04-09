"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Gift, Zap, LockKeyhole, FlaskConical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { useRouter } from '@/core/i18n/navigation';
import { Heading } from "@/components/astrokline/ui/heading";

export function CTA() {
  const { open } = useBirthInfoModal();
  const router = useRouter();

  return (
    <section aria-labelledby="cta-heading" data-testid="cta-section" className="py-32 relative overflow-hidden bg-[#0A0A0A]">
      {/* Background glow and texture */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/textures/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="flex flex-col items-center"
        >
          <Heading level={2} id="cta-heading" className="mb-6">
            Your next turning point is<br/>
            <span className="text-primary italic font-light mt-2 block">already on the map.</span>
          </Heading>
          
          <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-12 font-light tracking-wide">
            See it before it arrives. Generate your personal timing curve in 30 seconds — completely free.
          </p>
          
          <Button
            size="lg"
            className="h-14 px-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-none transition-all hover:scale-105 uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] md:h-14 md:text-base"
            data-testid="cta-generate-kline"
            data-ai-action="open-kline-generator"
            onClick={() => {
              open(() => {
                router.push('/kline');
              });
            }}
          >
            Reveal My Stars — Free ✨
            <ArrowRight className="ml-3 w-5 h-5 shrink-0" aria-hidden="true" />
          </Button>
          
          <div className="mt-8 flex items-center justify-center gap-3 text-[10px] text-white/30 font-mono tracking-widest uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            30 seconds · No credit card · Your data is encrypted &amp; never shared
          </div>
        </motion.div>
      </div>
    </section>
  );
}
