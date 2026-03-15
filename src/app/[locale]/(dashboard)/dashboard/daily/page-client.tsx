'use client';

import { DailyTarotCards } from '@/components/astrokline/daily/daily-tarot-cards';
import { Eye, Sparkles } from 'lucide-react';
import { useSession } from '@/core/auth/client';
import { useEffect, useState } from 'react';
import { TransitAspects } from '@/components/astrokline/daily/transit-aspects';
import { MoonPhaseCard } from '@/components/astrokline/daily/moon-phase-card';
import { MOCK_TRANSIT_DETAILS, MOCK_USER_PROFILE } from '@/lib/astrokline/mock-astrology-data';
import { getSavedBirthData } from '@/components/astrokline/ui/birth-info-context';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import { SocialShareModal } from '@/components/astrokline/ui/social-share-modal';

export function DashboardDailyClient({ userTier }: { userTier: string }) {
  const { data: session } = useSession();
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  }).format(today);
  const firstName = session?.user?.name || "Traveler";

  const [isUserData, setIsUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentYearTransits, setCurrentYearTransits] = useState(MOCK_TRANSIT_DETAILS[2024] || []);

  useEffect(() => {
    const fetchTransits = async () => {
      const savedBirth = getSavedBirthData();
      if (!savedBirth) return; // Stay on Mock

      setIsLoading(true);
      try {
         const [year, month, day] = savedBirth.date.split('-').map(Number);
         const timezone = -(new Date().getTimezoneOffset() / 60);

         // 1. Get Natal Chart
         const natalRes = await fetch('/api/astrology/natal-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              year, month, day,
              timeSlot: savedBirth.timeSlot,
              timezone,
              latitude: savedBirth.lat,
              longitude: savedBirth.lon,
            }),
         }).then(r => r.json());

         if (natalRes.success && natalRes.data) {
            // Simplified profile generation for daily transit needs
            const profile = { ...MOCK_USER_PROFILE, name: savedBirth.name, planets: natalRes.data.planets, ...natalRes.data };
            
            // 2. Fetch AI Transits
            const transitRes = await fetch('/api/astrology/daily-transit', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ profile })
            }).then(r => r.json());

            if (transitRes.success && transitRes.data) {
               setCurrentYearTransits(transitRes.data.transits);
               setIsUserData(true);
            }
         }
      } catch (err) {
         console.error("Daily Transit AI Generation failed", err);
      } finally {
         setIsLoading(false);
      }
    };

    fetchTransits();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {!isUserData && !isLoading && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Eye className="w-3 h-3" />
              Sample Preview
            </div>
            <p className="text-sm text-muted-foreground">
              These are sample transits. Return to Kline to enter your precise birth data for AI analysis.
            </p>
          </div>
        </div>
      )}

      {isLoading && (
         <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center">
            <AstrologyLoader isLoading={isLoading} onComplete={() => setIsLoading(false)} durationMs={5000} />
         </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground tracking-widest uppercase">
              {formattedDate}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary tracking-widest uppercase">
              {userTier} TIER
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-white mb-4">
            Daily Cosmic Weather
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Hello, {firstName}. Here is your atmospheric reading based on today's transits against your natal chart.
          </p>
          {isUserData && (
             <div className="mt-4">
               <SocialShareModal profile={MOCK_USER_PROFILE} source="daily" />
             </div>
          )}
        </div>
        
        {/* Pro Action Header (Optional up-sells or actions) */}
        {(userTier as string) !== 'PREMIUM' && (
          <div className="flex-shrink-0">
             <a href="/settings/billing" className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors">
                <Sparkles className="w-4 h-4" />
                Upgrade to Ask AI Astrologer
             </a>
          </div>
        )}
      </div>

      {/* Main Tool Component */}
      <section className="relative z-10 w-full mb-12">
        <DailyTarotCards userTier={userTier as any} />
      </section>

      {/* Advanced Astrological Transits Dashboard */}
      <section className="relative z-10 w-full mb-8">
         <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-serif text-white/90">Deep Karma & Lunar Cycle</h2>
            <div className="h-px bg-white/10 flex-1 ml-4 hidden md:block" />
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Transit Tracker (Spans 8 cols on large screens) */}
            <div className="lg:col-span-8 xl:col-span-9">
               <TransitAspects transits={currentYearTransits} />
            </div>

            {/* Right: Lunar Phase & Advice (Spans 4 cols on large screens) */}
            <div className="lg:col-span-4 xl:col-span-3">
               <MoonPhaseCard 
                 className="sticky top-24" 
                 phaseName="Waning Gibbous"
                 illumination={78}
                 moonSign="Scorpio"
                 advice="Release emotional baggage. The current Scorpio transit urges you to dive deep and let go of what no longer serves your spiritual growth."
                 nextNewMoon="May 8, Taurus"
                 nextFullMoon="May 23, Sagittarius"
               />
            </div>
         </div>
      </section>

    </div>
  );
}
// Append this to the bottom of the daily page file for the Server Component export

