'use client';

import { useEffect, useState } from 'react';
import { DailyTarotCards } from '@/components/astrokline/daily/daily-tarot-cards';
import { MoonPhaseCard } from '@/components/astrokline/daily/moon-phase-card';
import { TransitAspects } from '@/components/astrokline/daily/transit-aspects';
import { getSavedBirthData } from '@/components/astrokline/ui/birth-info-context';
import { SocialShareModal } from '@/components/astrokline/ui/social-share-modal';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import {
  MOCK_TRANSIT_DETAILS,
  MOCK_USER_PROFILE,
} from '@/lib/astrokline/mock-astrology-data';
import { Eye, Sparkles } from 'lucide-react';

import { useSession } from '@/core/auth/client';

export function DashboardDailyClient({ userTier }: { userTier: string }) {
  const { data: session } = useSession();
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(today);
  const firstName = session?.user?.name || 'Traveler';

  const [isUserData, setIsUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentYearTransits, setCurrentYearTransits] = useState(
    MOCK_TRANSIT_DETAILS[2024] || []
  );

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
            year,
            month,
            day,
            timeSlot: savedBirth.timeSlot,
            timezone,
            latitude: savedBirth.lat,
            longitude: savedBirth.lon,
          }),
        }).then((r) => r.json());

        if (natalRes.success && natalRes.data) {
          // Build profile matching Daily Transit requirements
          const planets = natalRes.data.planets;
          const findP = (name: string) =>
            planets.find((p: any) => p.name === name) || {
              sign: 'Unknown',
              degree: 0,
              minute: 0,
              house: 1,
            };
          const profile = {
            name: savedBirth.name,
            planets,
            sun: findP('Sun'),
            moon: findP('Moon'),
            rising: {
              sign: natalRes.data.ascendant?.sign || 'Unknown',
              degree: 0,
              minute: 0,
              house: 1,
            },
            elements: { fire: 25, earth: 25, air: 25, water: 25 }, // dummy for daily transit
          };

          // 2. Fetch AI Transits
          const transitRes = await fetch('/api/astrology/daily-transit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile }),
          }).then((r) => r.json());

          if (transitRes.success && transitRes.data) {
            setCurrentYearTransits(transitRes.data.transits);
            setIsUserData(true);
          }
        }
      } catch (err) {
        console.error('Daily Transit AI Generation failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransits();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {!isUserData && !isLoading && (
        <div className="bg-primary/10 border-primary/20 flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 text-primary flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase">
              <Eye className="h-3 w-3" />
              Sample Preview
            </div>
            <p className="text-muted-foreground text-sm">
              These are sample transits. Return to Kline to enter your precise
              birth data for AI analysis.
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-background/95 fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl">
          <AstrologyLoader
            isLoading={isLoading}
            onComplete={() => setIsLoading(false)}
            durationMs={5000}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-8 py-4 md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-muted-foreground rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {formattedDate}
            </span>
            <span className="bg-primary/10 border-primary/20 text-primary rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {userTier} TIER
            </span>
          </div>
          <h1 className="mb-4 font-serif text-3xl tracking-tight text-white md:text-5xl">
            Daily Cosmic Weather
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Hello, {firstName}. Here is your atmospheric reading based on
            today's transits against your natal chart.
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
            <a
              href="/settings/billing"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-white/90"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade to Ask AI Astrologer
            </a>
          </div>
        )}
      </div>

      {/* Main Tool Component */}
      <section className="relative z-10 mb-12 w-full">
        <DailyTarotCards userTier={userTier as any} />
      </section>

      {/* Advanced Astrological Transits Dashboard */}
      <section className="relative z-10 mb-8 w-full">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="font-serif text-2xl text-white/90 md:text-3xl">
            Deep Karma & Lunar Cycle
          </h2>
          <div className="ml-4 hidden h-px flex-1 bg-white/10 md:block" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
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
