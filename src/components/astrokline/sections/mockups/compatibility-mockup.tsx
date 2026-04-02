'use client';

import { Heart, MessageCircle, Shield, Zap, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const DIMS = [
  { icon: Heart, label: 'Romance', score: 82, text: 'Venus-Mars trine creates natural attraction and emotional warmth between you.' },
  { icon: MessageCircle, label: 'Communication', score: 71, text: 'Mercury aspects support understanding, though different styles require patience.' },
  { icon: Shield, label: 'Shared Values', score: 76, text: 'Moon-Jupiter alignment suggests shared life philosophy and mutual support.' },
  { icon: Zap, label: 'Tension Points', score: 38, text: 'Saturn square Venus requires conscious effort to balance freedom and commitment.' },
];

export function CompatibilityMockup() {
  return (
    <div className="select-none pointer-events-none overflow-hidden bg-[#0a0a0d] border border-white/5 p-4 sm:p-5 text-left max-w-md mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-rose-400/20 bg-rose-400/10">
          <Users className="h-4 w-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-sm font-serif text-white tracking-wide">Compatibility Check</h3>
          <p className="text-[8px] uppercase font-mono tracking-widest text-rose-400/60">Synastry Analysis</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="border border-[#D4AF37]/20 bg-white/[0.02] p-6 text-center">
        <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-mono mb-1">
          Alex + Jordan
        </p>
        <p className="text-4xl font-mono text-white">
          78<span className="text-lg text-[#D4AF37]/30">/100</span>
        </p>
        <p className="mt-2 text-[9px] font-mono uppercase tracking-widest text-[#D4AF37]">
          [Strong Connection]
        </p>
      </div>

      {/* Dimension Cards */}
      <div className="grid grid-cols-2 gap-2">
        {DIMS.map((d) => (
          <div key={d.label} className="border border-white/10 bg-[#0a0a0d] p-3 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 border border-white/10 bg-white/5">
                <d.icon className={cn('h-3 w-3', d.score >= 60 ? 'text-[#D4AF37]' : 'text-white/30')} />
              </div>
              <span className="text-[8px] uppercase tracking-widest font-mono text-white/40">{d.label}</span>
              <span className={cn('ml-auto text-base font-mono', d.score >= 60 ? 'text-[#D4AF37]' : 'text-white/60')}>
                {d.score}
              </span>
            </div>
            <div className="h-[2px] bg-white/5 overflow-hidden mb-2">
              <div
                className={cn('h-full', d.score >= 60 ? 'bg-[#D4AF37]' : 'bg-white/30')}
                style={{ width: `${d.score}%` }}
              />
            </div>
            <p className="text-[8px] text-white/30 leading-relaxed font-mono line-clamp-2">{d.text}</p>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="text-center pt-1">
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/20 border border-white/10 px-3 py-1.5">
          Analyze Another Profile
        </span>
      </div>
    </div>
  );
}
