'use client';

import { useEffect } from 'react';
import { DailyEnergyReport } from '@/components/astrokline/daily/daily-energy-report';
import { CrossLinkCard } from '@/components/astrokline/shared/cross-link-card';
import { ReportSection } from '@/components/astrokline/kline/report-section';
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { Sparkles } from 'lucide-react';

export function DailyClient({ userTier }: { userTier: string }) {
  const { open } = useBirthInfoModal();

  // Auto-open birth info modal when no user data
  const hasUserData = false; // TODO: wire to real user data check

  useEffect(() => {
    if (!hasUserData) {
      const t = setTimeout(() => open(), 500);
      return () => clearTimeout(t);
    }
  }, [hasUserData, open]);

  if (!hasUserData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white/90 mb-3">
            Your Daily Cosmic Forecast
          </h1>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            Enter your birth details to unlock your personalized daily energy report — calculated from real-time planetary transits hitting your exact natal chart.
          </p>
          <button
            onClick={() => open()}
            className="px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 hover:scale-105 transition-all"
          >
            Enter Birth Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
