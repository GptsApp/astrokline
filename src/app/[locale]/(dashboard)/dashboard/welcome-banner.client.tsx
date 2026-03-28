'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedBirthData,
  getSavedKlineResult,
  useBirthInfoModal,
} from '@/components/astrokline/ui/birth-info-context';
import { ArrowRight, Compass, Plus, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Heading } from "@/components/astrokline/ui/heading";

export function DashboardWelcomeBanner({
  userName,
  userTier,
}: {
  userName?: string;
  userTier: string;
}) {
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { open: openModal } = useBirthInfoModal();
  const router = useRouter();

  useEffect(() => {
    // Check local storage after mount
    const savedBirth = getSavedBirthData();
    setHasData(!!savedBirth);
    if (savedBirth) {
      const klineRes = getSavedKlineResult();
      if (klineRes?.profile) setProfile(klineRes.profile);
    }
  }, []);

  // Avoid running hydration mismatch by not rendering until client is ready
  if (hasData === null) {
    return (
      <div className="bg-primary/5 h-48 w-full animate-pulse  backdrop-blur-sm" />
    );
  }

  // --- EMPTY STATE CARD ---
  if (!hasData) {
    return (
      <div className="to-primary/5 border-primary/20 group relative overflow-hidden  border bg-gradient-to-br from-[#15131a]/80 p-8 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[url('/textures/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="bg-primary/10 group-hover:bg-primary/20 pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 blur-[100px] transition-all duration-700" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center py-6 text-center">
          <div className="bg-primary/10 border-primary/30 mb-6 flex h-16 w-16 animate-bounce items-center justify-center border shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <Compass className="text-primary h-8 w-8" />
          </div>
          <Heading level={2} variant="section" className="mb-3 text-3xl text-white md:text-4xl">
            Welcome to Your Cosmic Command Center
          </Heading>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            We need your exact birth coordinates to unlock your Destiny K-Line
            and Daily Forecast. Calibrate your natal chart now to reveal the
            universe's blueprint for you.
          </p>
          <button
            onClick={() => {
              openModal(() => {
                setHasData(true);
                router.refresh();
              });
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 px-8 py-4 font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Create My Cosmic Profile
          </button>
        </div>
      </div>
    );
  }

  // --- SYNCHRONIZED STATE CARD ---
  return (
    <div className="bg-primary/5 border-primary/20 relative overflow-hidden  border p-8 backdrop-blur-sm">
      <div className="bg-primary/10 absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="bg-primary/20 text-primary px-3 py-1 text-xs font-bold tracking-wider uppercase">
              {userTier} TIER
            </span>
          </div>
          <Heading level={1} className="mb-2 text-3xl text-white md:text-4xl">
            Welcome back, {userName || profile?.name || 'Traveler'}!
          </Heading>
          <p className="text-muted-foreground mb-6 text-lg">
            Your cosmic blueprint is synchronized and active.
          </p>

          {/* Big Three Prominent Display */}
          {profile && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="hover:border-primary/30 flex items-center gap-3  border border-white/10 bg-white/5 p-3 pr-6 transition-colors hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center bg-orange-500/10 text-lg font-bold text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  ☉
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                    Sun Sign
                  </div>
                  <div className="font-serif text-white">
                    {profile.sun?.sign || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="hover:border-primary/30 flex items-center gap-3  border border-white/10 bg-white/5 p-3 pr-6 transition-colors hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center bg-blue-500/10 text-lg font-bold text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  ☽
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                    Moon Sign
                  </div>
                  <div className="font-serif text-white">
                    {profile.moon?.sign || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="hover:border-primary/30 flex items-center gap-3  border border-white/10 bg-white/5 p-3 pr-6 transition-colors hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center bg-purple-500/10 text-lg font-bold text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  ASC
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                    Rising Sign
                  </div>
                  <div className="font-serif text-white">
                    {profile.rising?.sign || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex-shrink-0 md:ml-6 lg:mt-0">
          <Link
            href="/dashboard/kline"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 px-6 py-4 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            Open Destiny Map
          </Link>
        </div>
      </div>
    </div>
  );
}
