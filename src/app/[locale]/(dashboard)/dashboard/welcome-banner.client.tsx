'use client';

import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Compass, Plus } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { getSavedBirthData, useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { useRouter } from 'next/navigation';

export function DashboardWelcomeBanner({ userName, userTier }: { userName?: string, userTier: string }) {
  const [hasData, setHasData] = useState<boolean | null>(null);
  const { open: openModal } = useBirthInfoModal();
  const router = useRouter();

  useEffect(() => {
    // Check local storage after mount
    setHasData(!!getSavedBirthData());
  }, []);

  // Avoid running hydration mismatch by not rendering until client is ready
  if (hasData === null) {
    return <div className="h-48 w-full bg-primary/5 rounded-3xl animate-pulse backdrop-blur-sm" />;
  }

  // --- EMPTY STATE CARD ---
  if (!hasData) {
    return (
      <div className="bg-gradient-to-br from-[#15131a]/80 to-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-6 animate-bounce">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-3 tracking-tight">
            Welcome to Your Cosmic Command Center
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            We need your exact birth coordinates to unlock your Destiny K-Line and Daily Forecast. 
            Calibrate your natal chart now to reveal the universe's blueprint for you.
          </p>
          <button
            onClick={() => {
              openModal(() => {
                setHasData(true);
                router.refresh();
              });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create My Cosmic Profile
          </button>
        </div>
      </div>
    );
  }

  // --- SYNCHRONIZED STATE CARD ---
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              {userTier} TIER
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">
            Welcome back, {userName || "Traveler"}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your cosmic blueprint has been synchronized.
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <Link 
            href="/dashboard/kline"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            Open Destiny Map
          </Link>
        </div>
      </div>
    </div>
  );
}
