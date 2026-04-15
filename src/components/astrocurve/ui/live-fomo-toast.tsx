'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const MESSAGES = [
  "S.L. from London just unlocked their Destiny Blueprint",
  "M.K. in New York just saved their 2026 life curve",
  "A user in Singapore is generating their 100-Year Map",
  "E.R. from Berlin just upgraded to Pro",
  "D.C. in San Francisco just uncovered a major 'Weak Window'",
  "Y.T. in Tokyo just generated a full natal chart",
  "A user in Sydney is reviewing their Saturn Return",
  "J.M. from Toronto just unlocked their career trajectory",
  "A user in Seoul is mapping their next decade",
  "L.W. in Amsterdam just downloaded their PDF report",
];

export function LiveFomoToast() {
  const [onlineCount, setOnlineCount] = useState(1204);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(800, prev + change);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const showToast = () => {
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setCurrentMessage(msg);
      setTimeout(() => setCurrentMessage(null), 4000);
      const nextTime = Math.floor(Math.random() * 15000) + 10000;
      setTimeout(showToast, nextTime);
    };

    const initialTimer = setTimeout(showToast, 5000);
    return () => clearTimeout(initialTimer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-20 left-4 z-[45] flex flex-col gap-3 pointer-events-none lg:bottom-4 lg:z-[100]">
      {/* Live Online Users Badge */}
      <div className="bg-black/90 border border-white/10 backdrop-blur-xl px-3 py-2 flex items-center justify-center gap-2 shadow-2xl w-fit">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-xs font-mono text-white/70 tracking-widest uppercase"><strong className="text-white font-bold">{onlineCount}</strong> online</span>
      </div>

      {/* Notification Toast */}
      <div
        className={cn(
          "bg-[#0A0A0A]/95 backdrop-blur-2xl border border-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.1)] px-4 py-3 max-w-[280px] flex gap-3 items-center transition-all duration-500",
          currentMessage ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="bg-[#D4AF37]/10 p-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>
        <p className="text-xs font-medium text-white/80 leading-snug">
          {currentMessage}
        </p>
      </div>
    </div>
  );
}
