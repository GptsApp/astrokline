'use client';

import { useCallback, useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Heart, Lock, Sparkles, Users, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrocurve/ui/heading';

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

interface Props {
  profile: UserProfile;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
}

interface SynastryResult {
  compatibility: number;
  sparks: string;
  friction: string;
  advice: string;
}

function CompatibilityRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#D4AF37' : '#ef4444';

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="text-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-sm text-white/40">%</span>
        <p className="mt-0.5 font-mono text-[8px] tracking-widest text-white/30 uppercase">Match</p>
      </div>
    </div>
  );
}

export function SynastryPanel({ profile, tier, onActionGate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SynastryResult | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');

  const isLocked = tier === 'GUEST' || tier === 'FREE';

  const handleCompare = useCallback(async () => {
    if (!partnerDate || isLoading) return;
    setIsLoading(true);
    try {
      const [year, month, day] = partnerDate.split('-').map(Number);
      // Create a minimal partner profile from birth date
      const res = await fetch('/api/astrology/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, timeSlot: 'unknown', timezone: 8, latitude: 39.9, longitude: 116.4 }),
      });
      const chartData = await res.json();
      if (!chartData.success) throw new Error('Chart calc failed');

      // Now call synastry
      const synRes = await fetch('/api/astrology/synastry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileA: profile, profileB: chartData.data?.profile || profile }),
      });
      const synData = await synRes.json();
      if (synData.success) {
        setResult(synData.data);
      }
    } catch (err) {
      console.error('Synastry error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [partnerDate, isLoading, profile]);

  // Locked state for FREE users
  if (isLocked) {
    return (
      <button
        onClick={() => onActionGate('synastry', 'LITE')}
        className="group flex w-full items-center gap-4 border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/[0.02]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-rose-400/20 bg-rose-400/5">
          <Users className="h-5 w-5 text-rose-400/60" />
        </div>
        <div className="flex-1 text-left">
          <Heading level={3} className="text-sm font-bold text-white/80">
            Compatibility Check
          </Heading>
          <p className="mt-1 text-xs text-white/40">
            Compare your chart with someone special. See where you spark and where you clash.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-white/5 bg-white/[0.02] px-3 py-1.5 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10">
          <Lock className="h-3.5 w-3.5 text-white/30 group-hover:text-[#D4AF37]" />
          <span className="hidden text-[9px] font-bold tracking-widest text-white/30 uppercase group-hover:text-[#D4AF37] md:block">
            Lite+
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full">
      {/* Entry trigger */}
      {!isOpen && !result && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex w-full items-center gap-4 border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-rose-400/20 hover:bg-rose-400/[0.02]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-rose-400/20 bg-rose-400/10">
            <Heart className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex-1 text-left">
            <Heading level={3} className="text-sm font-bold text-white/80">
              Compare With Someone
            </Heading>
            <p className="mt-1 text-xs text-white/40">
              Enter their birth date to see your cosmic compatibility score.
            </p>
          </div>
          <span className="font-mono text-[10px] tracking-wider text-rose-400/50">→</span>
        </button>
      )}

      {/* Input form */}
      {isOpen && !result && (
        <div className="border border-rose-400/15 bg-rose-400/[0.02] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <Heart className="h-4 w-4" />
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase">Compatibility Check</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/50">Their Name</label>
              <input
                type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Optional"
                className="w-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-rose-400/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/50">Their Birth Date *</label>
              <input
                type="date" value={partnerDate} onChange={(e) => setPartnerDate(e.target.value)}
                className="w-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-rose-400/30 focus:outline-none"
              />
            </div>
            <button
              onClick={handleCompare} disabled={!partnerDate || isLoading}
              className="flex w-full items-center justify-center gap-2 bg-rose-500/80 py-3 text-sm font-bold text-white transition-all hover:bg-rose-500 disabled:opacity-40"
            >
              {isLoading ? (
                <><div className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white" /> Analyzing...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Check Compatibility</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="border border-rose-400/15 bg-rose-400/[0.02] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <Heart className="h-4 w-4" />
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                {partnerName ? `You & ${partnerName}` : 'Compatibility Result'}
              </span>
            </div>
            <button onClick={() => { setResult(null); setIsOpen(false); }} className="text-[10px] text-white/30 hover:text-white/60">
              New Check
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <CompatibilityRing score={result.compatibility} />
            <div className="flex-1 space-y-4">
              {[
                { label: '✨ Sparks', text: result.sparks, color: 'text-rose-400' },
                { label: '⚡ Friction', text: result.friction, color: 'text-amber-400' },
                { label: '💡 Advice', text: result.advice, color: 'text-emerald-400' },
              ].map((section) => (
                <div key={section.label}>
                  <p className={cn('mb-1 font-mono text-[10px] font-bold tracking-wider uppercase', section.color)}>
                    {section.label}
                  </p>
                  <p className="text-xs leading-relaxed text-white/60">{section.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
