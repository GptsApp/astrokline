'use client';

import { CalendarDays, Check, X, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const WEEK = [
  { day: 'Mon', num: 7, color: 'bg-emerald-500' },
  { day: 'Tue', num: 8, color: 'bg-amber-500' },
  { day: 'Wed', num: 9, color: 'bg-emerald-500' },
  { day: 'Thu', num: 10, active: true, color: 'bg-emerald-500' },
  { day: 'Fri', num: 11, color: 'bg-rose-500' },
  { day: 'Sat', num: 12, color: 'bg-amber-500' },
  { day: 'Sun', num: 13, color: 'bg-emerald-500' },
];

export function DailyMockup() {
  return (
    <div className="select-none pointer-events-none overflow-hidden bg-[#15131A]/80 border border-white/5 p-4 sm:p-5 space-y-3 text-left max-w-md mx-auto">
      {/* Week Strip */}
      <div className="flex gap-1">
        {WEEK.map((d) => (
          <div
            key={d.day}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 transition-all',
              d.active
                ? 'bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                : 'bg-white/[0.02]'
            )}
          >
            <span className={cn('text-[8px] font-mono uppercase', d.active ? 'text-black/60' : 'text-white/30')}>{d.day}</span>
            <span className={cn('text-sm font-bold', d.active ? 'text-black' : 'text-white/50')}>{d.num}</span>
            <span className={cn('h-1 w-1', d.active ? 'bg-black' : d.color)} />
          </div>
        ))}
      </div>

      {/* Score + Planet */}
      <div className="flex items-center justify-between border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30 uppercase font-mono tracking-wider">Thu, Apr 10</span>
          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 font-mono">TODAY</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-400">78</span>
          <span className="text-xs font-semibold text-emerald-400">Strong</span>
        </div>
      </div>

      {/* Planet + Vedic Strip */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-base">♃</span>
        <span className="text-xs text-white/50">Jupiter in Sagittarius</span>
        <span className="text-white/15">·</span>
        <span className="text-xs text-white/30">Fire Day</span>
      </div>
      <div className="flex flex-wrap gap-2 px-1 pb-1 border-b border-white/5">
        <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">☽ Pushya</span>
        <span className="text-[9px] font-mono text-white/15">|</span>
        <span className="text-[9px] font-mono text-emerald-400/60 uppercase">Sampat</span>
        <span className="text-[9px] font-mono text-white/15">|</span>
        <span className="text-[9px] font-mono text-white/25 uppercase">Shukla Dvitiya</span>
      </div>

      {/* Do / Don't */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-emerald-500/10 bg-emerald-500/[0.02] p-3">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Do</div>
          <div className="space-y-1.5">
            {['Start new projects', 'Network with allies', 'Trust bold instincts'].map((t, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-[10px] text-white/50">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-rose-500/10 bg-rose-500/[0.02] p-3">
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">Don&apos;t</div>
          <div className="space-y-1.5">
            {['Rush financial choices', 'Ignore subtle cues', 'Overcommit energy'].map((t, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <X className="h-3 w-3 text-rose-400 mt-0.5 shrink-0" />
                <span className="text-[10px] text-white/50">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Hours */}
      <div className="border border-white/5 bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="h-3 w-3 text-white/30" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Best Hours</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-emerald-500/10 p-2">
            <span className="text-[9px] font-bold text-emerald-400">🟢 PEAK</span>
            <p className="text-[10px] text-white/60 mt-0.5">9:00 – 11:30 AM</p>
          </div>
          <div className="border border-amber-500/10 p-2">
            <span className="text-[9px] font-bold text-amber-400">🟡 NEUTRAL</span>
            <p className="text-[10px] text-white/60 mt-0.5">2:00 – 4:00 PM</p>
          </div>
          <div className="border border-rose-500/10 p-2">
            <span className="text-[9px] font-bold text-rose-400">🔴 LOW</span>
            <p className="text-[10px] text-white/60 mt-0.5">6:00 – 8:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
