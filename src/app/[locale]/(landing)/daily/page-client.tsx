'use client';

import { useEffect, useState } from 'react';
import { DailyEnergyReport } from '@/components/astrokline/daily/daily-energy-report';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { CrossLinkCard } from '@/components/astrokline/shared/cross-link-card';
import {
  getSavedBirthData,
  useBirthInfoModal,
} from '@/components/astrokline/ui/birth-info-context';
import { Sparkles } from 'lucide-react';

export function DailyClient({ userTier: _userTier }: { userTier: string }) {
  const { open } = useBirthInfoModal();
  const [hasUserData, setHasUserData] = useState(false);

  useEffect(() => {
    setHasUserData(!!getSavedBirthData());
  }, []);

  useEffect(() => {
    if (!hasUserData) {
      const t = setTimeout(() => open(), 500);
      return () => clearTimeout(t);
    }
  }, [hasUserData, open]);

  if (!hasUserData) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="bg-primary/10 border-primary/20 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <h1 className="mb-3 font-serif text-2xl font-bold text-white/90">
            Your Daily Cosmic Forecast
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-white/50">
            Enter your birth details to unlock your personalized daily energy
            report — calculated from real-time planetary transits hitting your
            exact natal chart.
          </p>
          <button
            onClick={() => open()}
            className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:scale-105"
          >
            Enter Birth Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mt-16">
        <DailyEnergyReport />
      </div>

      {/* KLine Cross-Link */}
      <ReportSection id="kline-link">
        <CrossLinkCard target="kline" />
      </ReportSection>
    </div>
  );
}
