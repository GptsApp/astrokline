'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { InlineBirthForm } from '@/components/astrocurve/ui/inline-birth-form';

const SOCIAL_PROOFS = [
  { label: 'Based on NASA Planetary Data' },
  { label: 'Your 100-Year Life Map' },
  { label: 'Swiss Precision Astrology' },
];

const LIVE_ACTIONS = [
  { id: 1, action: '✨ A new life timeline was just revealed' },
  { id: 2, action: '🌙 Peak year discovered — age 34' },
  { id: 3, action: '💫 100-year life reading completed' },
  { id: 4, action: '❤️ Two charts just checked their compatibility' },
  { id: 5, action: '🔮 Deep reading for 2027 unlocked' },
];

export function SyncActiveTicker() {
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    // Only start ticker after 3 seconds to avoid blocking LCP on mobile
    const timer = setTimeout(() => {
      const proofInterval = setInterval(() => {
        setProofIndex((prev) => (prev + 1) % SOCIAL_PROOFS.length);
      }, 4000);
      return () => clearInterval(proofInterval);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-muted-foreground font-mono animate-in fade-in slide-in-from-left-4 duration-700"
      style={{ animationDelay: '200ms', animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5">
        <span className="h-1.5 w-1.5 bg-[#4ade80] opacity-80 shadow-[0_0_8px_#4ade80]" />
        <span className="text-primary font-bold text-[10px]">✨ LIVE</span>
      </div>
      <span className="text-foreground/20">/</span>
      <div className="relative h-6 overflow-hidden flex-1 min-w-[200px]">
        {SOCIAL_PROOFS.map((proof, i) => (
          <span
            key={i}
            className={cn(
              "absolute inset-0 flex items-center text-foreground/80 text-[10px] whitespace-nowrap transition-all duration-500",
              i === proofIndex ? "translate-y-0 opacity-100" : i < proofIndex ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
            )}
          >
            ✧ {proof.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LiveActionTicker() {
  const [actionIndex, setActionIndex] = useState(0);

  useEffect(() => {
    // Only start ticker after 3 seconds to avoid blocking LCP on mobile
    const timer = setTimeout(() => {
      const actionInterval = setInterval(() => {
        setActionIndex((prev) => (prev + 1) % LIVE_ACTIONS.length);
      }, 3200);
      return () => clearInterval(actionInterval);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-10 border-t border-white/5 bg-background/80 backdrop-blur-md z-30 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full h-full flex items-center gap-4 relative overflow-hidden">
         <div className="relative flex shrink-0">
           <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] absolute opacity-80" />
           <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] relative" />
         </div>
         <div className="flex-1 h-full relative overflow-hidden">
           {LIVE_ACTIONS.map((action, i) => (
             <div
               key={i}
               className={cn(
                 "absolute inset-0 flex items-center font-mono text-[10px] sm:text-xs tracking-widest uppercase whitespace-nowrap transition-all duration-500",
                 i === actionIndex ? "translate-y-0 opacity-100" : i < actionIndex ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
               )}
             >
                <span className="text-primary/90">{action.action}</span>
                <span className="ml-4 opacity-30">{"///"}</span>
                <span className="text-muted-foreground/40 text-[9px] ml-4 hidden sm:inline-block">LIVE</span>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}

export function FadeInText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("animate-in fade-in duration-1000 fill-mode-both", className)} style={{ animationDelay: '300ms' }}>
      {children}
    </p>
  );
}

export function FadeInStats({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both", className)} style={{ animationDelay: '400ms' }}>
      {children}
    </div>
  );
}

export function OnlineCount() {
  const [count, setCount] = useState(1204);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(800, prev + change);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-sm font-bold text-foreground font-mono tracking-wide flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full bg-green-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 bg-green-500" />
      </span>
      {count.toLocaleString()}
    </span>
  );
}
