"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Gift, Zap, LockKeyhole, FlaskConical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { useRouter } from '@/core/i18n/navigation';

export function CTA() {
  const { open } = useBirthInfoModal();
  const router = useRouter();

  return (
    <section aria-labelledby="cta-heading" data-testid="cta-section" className="py-24 relative overflow-hidden bg-[#0A0A0A]">
      {/* Background glow and texture */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Your next turning point is already calculated</span>
          </div>

          {/* Limited offer badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Gift className="w-3.5 h-3.5 inline-block mr-1" /> Your first K-Line is completely free — no credit card needed
          </div>
          
          <h2 id="cta-heading" className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Your next turning point is<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FCDD73]">already in your birth chart.</span>
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The question is: will you see it before it arrives, or only recognize it in hindsight? Enter your birth details and find out — it takes 30 seconds.
          </p>
          
          <Button
            size="lg"
            className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl shadow-[0_0_30px_-5px_var(--primary)] transition-all hover:shadow-[0_0_50px_-5px_var(--primary)] hover:scale-105"
            data-testid="cta-generate-kline"
            data-ai-action="open-kline-generator"
            onClick={() => {
              open((birthData) => {
                router.push('/kline/result');
              });
            }}
          >
            Get My Timing Map — Free
            <ArrowRight className="ml-2 w-5 h-5 shrink-0" aria-hidden="true" />
          </Button>
          
          <p className="mt-6 text-sm text-white/40 font-mono">
            30 seconds. No credit card. Your data stays private.
          </p>

          {/* Trust microcopy */}
          <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-white/30 font-mono">
            <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" /> Results in 30 seconds</span>
            <span className="inline-flex items-center gap-1"><LockKeyhole className="w-3 h-3" /> Your data stays private</span>
            <span className="inline-flex items-center gap-1"><FlaskConical className="w-3 h-3" /> NASA JPL planetary data</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
