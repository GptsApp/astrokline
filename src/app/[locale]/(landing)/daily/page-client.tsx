'use client';

import { DailyTarotCards } from '@/components/astrokline/daily/daily-tarot-cards';
import { UpgradeBanner } from '@/components/astrokline/shared/upgrade-banner';
import { Eye, Sparkles } from 'lucide-react';
import {
  ToolFeatures,
  ToolHowItWorks,
  ToolAudience,
  ToolCrossLinks,
  AstroFaq
} from '@/themes/default/blocks';
import { DAILY_SEO_CONTENT } from '@/lib/astrokline/daily-seo-data';
import { TransitAspects } from '@/components/astrokline/daily/transit-aspects';
import { MoonPhaseCard } from '@/components/astrokline/daily/moon-phase-card';
import { MOCK_TRANSIT_DETAILS } from '@/lib/astrokline/mock-astrology-data';
import { Lock } from 'lucide-react';
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { TrustBadge } from '@/components/astrokline/ui/trust-badge';

export function DailyClient({ userTier }: { userTier: string }) {
  const currentYearTransits = MOCK_TRANSIT_DETAILS[2024] || [];
  const { open } = useBirthInfoModal();
  return (
    <div className="min-h-screen bg-background astro-starfield">
      {/* Sample Data Banner */}
      <div className="sticky top-16 z-50 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Eye className="w-3 h-3" />
              Sample Preview
            </div>
            <p className="text-sm text-muted-foreground">
              These are sample scores. Enter your birthday to see <strong className="text-primary">your personalized</strong> daily forecast.
            </p>
          </div>
          <button
            onClick={() => open()}
            className="shrink-0 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get My Forecast
          </button>
        </div>
      </div>

      <div className="pt-28 pb-16 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40 max-w-[800px] max-h-[800px]" />

        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Daily Cosmic Forecast</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Stop Reading Vague Horoscopes.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321]">
              Read Your Daily Energy Map.
            </span>
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground mx-auto mb-10 leading-relaxed">
            Four dimensions of your cosmic weather today — Love, Career, Wealth,
            and Health — calculated from real-time planetary transits hitting your exact natal chart.
          </p>

          <TrustBadge className="justify-center" />
        </div>

        {/* INTERACTIVE TOOL */}
        <section id="tool" className="relative z-20 max-w-7xl mx-auto px-6 flex flex-col gap-12">
          <DailyTarotCards userTier={userTier as any} />

          {/* Locked Advanced Astrological Transits Dashboard for Landing Page */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/5 bg-black/20">
            
            {/* The blurred content underneath */}
            <div className="opacity-40 blur-[8px] pointer-events-none select-none transition-all duration-1000 p-6 md:p-8">
               <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl md:text-3xl font-serif text-white/90">Deep Karma & Lunar Cycle</h2>
                  <div className="h-px bg-white/10 flex-1 ml-4 hidden md:block" />
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 xl:col-span-9">
                     <TransitAspects transits={currentYearTransits} />
                  </div>
                  <div className="lg:col-span-4 xl:col-span-3">
                     <MoonPhaseCard 
                       phaseName="Waning Gibbous"
                       illumination={78}
                       moonSign="Scorpio"
                       advice="Release emotional baggage. The current Scorpio transit urges you to dive deep and let go of what no longer serves your spiritual growth."
                       nextNewMoon="May 8, Taurus"
                       nextFullMoon="May 23, Sagittarius"
                     />
                  </div>
               </div>
            </div>

            {/* Premium / Lead-Gen Lock Overlay */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-background/90 via-background/60 to-transparent">
               <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-6 pulse-glow">
                 <Lock className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-2xl md:text-3xl font-serif text-white font-bold mb-3 drop-shadow-md">
                 Master Your Cosmic Timing
               </h3>
               <p className="text-white/70 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
                 Unlock real-time planetary transits and lunar cycle tracking. See exactly how today's sky activates your unique birth chart.
               </p>
               <button onClick={() => open()} className="px-8 py-4 rounded-full bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 hover:scale-105 duration-300">
                 <Sparkles className="w-5 h-5" />
                 Reveal My Transits Now
               </button>
            </div>
          </div>
        </section>
      </div>

      {/* ---------------- SEO LANDING PAGE BLOCKS ---------------- */}

      {/* 1. How It Works */}
      <ToolHowItWorks section={DAILY_SEO_CONTENT.howItWorks} className="pt-24" />

      {/* 2. Feature Deep Dive */}
      <ToolFeatures section={DAILY_SEO_CONTENT.features} />

      {/* 3. Target Audience / Use Cases */}
      <ToolAudience section={DAILY_SEO_CONTENT.audience} />

      {/* 4. Upgrade CTA Banner */}
      <div className="py-24">
        <UpgradeBanner context="daily" />
      </div>

      {/* 5. Cross-Links to other tools */}
      <ToolCrossLinks />

      {/* 6. Tool-Specific FAQ */}
      <AstroFaq section={{ id: "faq" }} className="!pt-0 pb-24" />
      
    </div>
  );
}


