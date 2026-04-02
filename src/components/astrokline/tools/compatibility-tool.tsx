'use client';

import React, { useState } from 'react';
import { Users, ArrowRight, Heart, MessageCircle, Zap, Shield } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { PartnerBirthForm, PartnerBirthData } from './partner-birth-form';
import { computeCompatibility, SynastryScore } from '@/lib/astrokline/compatibility-engine';

// Helper to build UTC date from given info.
function buildUtcDate(dateStr: string, timeSlot: string, tzOffset: number | null): Date {
  let [yyyy, mm, dd] = [2000, 1, 1];
  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      yyyy = parseInt(parts[0], 10);
      mm = parseInt(parts[1], 10);
      dd = parseInt(parts[2], 10);
    }
  }

  // default to noon if unknown
  let hour = 12;
  if (timeSlot && timeSlot !== 'unknown' && timeSlot.includes('-')) {
    hour = parseInt(timeSlot.split(':')[0], 10);
  }

  // Apply timezone approximation logically, or just build standard Local and assume it represents UTC for the engine since engine takes Date.
  // Actually, if we just build Date(UTC), it's consistent.
  let date = new Date(Date.UTC(yyyy, mm - 1, dd, hour, 0, 0));
  
  if (tzOffset !== null) {
    // If tz is +480 (Asia/Shanghai), we subtract 480 mins to get UTC. 
    // Wait, let's keep it simple: New Date(Date.UTC(...)) - tzOffset * 60000 ensures alignment.
    date = new Date(date.getTime() + (tzOffset * 60000));
  }
  return date;
}

interface CompatibilityToolProps {
  tier: string;
  klineResult: any;
}

export function CompatibilityTool({ tier, klineResult }: CompatibilityToolProps) {
  const data = typeof klineResult === 'string' ? JSON.parse(klineResult) : klineResult;
  const myDateStr = data?.profile?.date || data?.profile?.birthDate;
  const myTimeSlot = data?.profile?.timeSlot;
  const myTz = data?.profile?.timezoneValue || 0;
  const myName = data?.profile?.name || 'You';

  const [partnerName, setPartnerName] = useState('');
  const [result, setResult] = useState<SynastryScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handlePartnerSubmit = (pData: PartnerBirthData) => {
    setIsCalculating(true);
    setPartnerName(pData.name);
    
    // Simulate complex calculation time
    setTimeout(() => {
      const d1 = buildUtcDate(myDateStr, myTimeSlot, myTz);
      const d2 = buildUtcDate(pData.date, pData.timeSlot, pData.timezoneValue);
      setResult(computeCompatibility(d1, d2));
      setIsCalculating(false);
    }, 1200);
  };

  const dimensions = result ? [
    { icon: Heart, label: 'Romance', score: result.romance },
    { icon: MessageCircle, label: 'Communication', score: result.communication },
    { icon: Shield, label: 'Shared Values', score: result.values },
    { icon: Zap, label: 'Tension Points', score: result.challenge },
  ] : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-rose-400/20 bg-rose-400/10">
            <Users className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-white tracking-wide">Compatibility Check</h1>
            <p className="mt-1 text-[10px] uppercase font-mono tracking-widest text-rose-400/70">Synastry analysis based on real birth data</p>
          </div>
        </div>
      </div>

      {/* Input form - Hidden when result exists */}
      {!result && (
        <PartnerBirthForm onSubmit={handlePartnerSubmit} isLoading={isCalculating} />
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Overall score */}
          <div className="border border-[#D4AF37]/20 bg-white/[0.02] p-8 text-center">
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono mb-2">
              {myName} + {partnerName || 'Partner'}
            </p>
            <p className="text-5xl font-mono text-white">{result.overall}<span className="text-xl text-[#D4AF37]/40">/100</span></p>
            <p className={cn('mt-3 text-[10px] font-mono uppercase tracking-widest',
              result.overall >= 75 ? 'text-[#D4AF37]' : result.overall >= 55 ? 'text-white/80' : 'text-white/40'
            )}>
              [{result.overall >= 75 ? 'Strong Connection' : result.overall >= 55 ? 'Promising Chemistry' : 'Growth Opportunity'}]
            </p>
          </div>

          {/* Dimension breakdown */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dimensions.map((d) => (
              <div key={d.label} className="border border-white/10 bg-[#0a0a0d] p-5 shadow-xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 border border-white/10 bg-white/5">
                    <d.icon className={cn("h-4 w-4", d.score >= 75 ? "text-[#D4AF37]" : "text-white/40")} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-white/50">{d.label}</span>
                  <span className={cn('ml-auto text-xl font-mono', d.score >= 75 ? 'text-[#D4AF37]' : 'text-white')}>{d.score}</span>
                </div>
                
                <div className="h-[2px] bg-white/5 overflow-hidden mb-5">
                  <div className={cn('h-full', d.score >= 75 ? 'bg-[#D4AF37]' : 'bg-white/40')} style={{ width: `${d.score}%` }} />
                </div>
                
                <p className="text-[11px] text-white/40 leading-relaxed font-mono">
                  {d.label === 'Romance' && result.insights.romanceText}
                  {d.label === 'Communication' && result.insights.communicationText}
                  {d.label === 'Shared Values' && result.insights.valuesText}
                  {d.label === 'Tension Points' && result.insights.challengeText}
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setResult(null)}
              className="px-6 py-3 border border-white/10 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-white hover:border-white/30 transition-colors"
            >
              Analyze Another Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
