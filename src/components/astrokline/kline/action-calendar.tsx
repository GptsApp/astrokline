'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Calendar, ChevronLeft, ChevronRight, Lock, Sparkles, Star, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrokline/ui/heading';

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

interface DayData {
  day: number;
  type: 'green' | 'red' | 'neutral';
  advice: string;
  do: string[];
  dont: string[];
}

interface CalendarData {
  monthTheme: string;
  keyDates: {
    bestAction: { day: number; reason: string };
    restDay: { day: number; reason: string };
    cautionDay: { day: number; reason: string };
  };
  days: DayData[];
}

interface Props {
  profile: UserProfile;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ActionCalendar({ profile, tier, onActionGate }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const isLocked = tier === 'GUEST' || tier === 'FREE';

  const monthName = new Date(year, month - 1, 1).toLocaleString('en', { month: 'long' });
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const fetchCalendar = useCallback(async () => {
    if (isLocked) return;
    setIsLoading(true);
    setSelectedDay(null);
    try {
      const res = await fetch('/api/astrology/monthly-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, year, month }),
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile, year, month, isLocked]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const getDayData = (day: number) => data?.days?.find(d => d.day === day);
  const isKeyDate = (day: number) => {
    if (!data?.keyDates) return null;
    if (data.keyDates.bestAction?.day === day) return 'best';
    if (data.keyDates.restDay?.day === day) return 'rest';
    if (data.keyDates.cautionDay?.day === day) return 'caution';
    return null;
  };

  // Locked state
  if (isLocked) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <button
          onClick={() => onActionGate('action_calendar', 'LITE')}
          className="group flex w-full items-center gap-4 border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/[0.02]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/10 bg-white/5">
            <Calendar className="h-5 w-5 text-emerald-400/60" />
          </div>
          <div className="flex-1 text-left">
            <Heading level={3} className="text-sm font-bold text-white/80">30-Day Action Calendar</Heading>
            <p className="mt-1 text-xs text-white/40">
              See what to do (and avoid) each day this month, tailored to your chart.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-white/5 bg-white/[0.02] px-3 py-1.5 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10">
            <Lock className="h-3.5 w-3.5 text-white/30 group-hover:text-[#D4AF37]" />
            <span className="hidden text-[9px] font-bold tracking-widest text-white/30 uppercase group-hover:text-[#D4AF37] md:block">Lite+</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-emerald-400">
          <Calendar className="h-4 w-4" />
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase">Your Action Calendar</span>
        </div>
        <Heading level={2} className="font-serif text-2xl text-white/90 md:text-3xl">
          {monthName} {year}
        </Heading>
        {data?.monthTheme && (
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/40">{data.monthTheme}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="text-white/30 hover:text-white/70 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-mono text-xs text-white/30">{monthName} {year}</span>
        <button onClick={nextMonth} className="text-white/30 hover:text-white/70 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Key Dates Legend */}
      {data?.keyDates && (
        <div className="mb-4 flex flex-wrap justify-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-400" /> Best Action Day</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-sky-400" /> Rest Day</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-red-400" /> Caution Day</span>
        </div>
      )}

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin border-2 border-emerald-400/30 border-t-emerald-400" />
        </div>
      ) : (
        <div className="border border-white/5 bg-white/[0.01]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-2 text-center font-mono text-[9px] font-bold tracking-wider text-white/20 uppercase">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square border-b border-r border-white/[0.02]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dd = getDayData(day);
              const key = isKeyDate(day);
              const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => dd && setSelectedDay(selectedDay?.day === day ? null : dd)}
                  className={cn(
                    'relative aspect-square border-b border-r border-white/[0.02] p-1 text-left transition-all hover:bg-white/[0.03]',
                    selectedDay?.day === day && 'bg-white/[0.05] ring-1 ring-[#D4AF37]/30',
                    isToday && 'ring-1 ring-white/20'
                  )}
                >
                  <span className={cn(
                    'text-[11px] font-bold',
                    dd?.type === 'green' ? 'text-emerald-400/80' : dd?.type === 'red' ? 'text-red-400/80' : 'text-white/40'
                  )}>
                    {day}
                  </span>

                  {/* Type indicator dot */}
                  {dd && (
                    <div className={cn(
                      'absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2',
                      dd.type === 'green' ? 'bg-emerald-400' : dd.type === 'red' ? 'bg-red-400' : 'bg-white/20'
                    )} />
                  )}

                  {/* Key date star */}
                  {key && (
                    <Star className={cn(
                      'absolute top-0.5 right-0.5 h-2.5 w-2.5',
                      key === 'best' ? 'text-emerald-400' : key === 'rest' ? 'text-sky-400' : 'text-red-400'
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="mt-4 border border-white/10 bg-white/[0.02] p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                'flex h-7 w-7 items-center justify-center font-mono text-xs font-bold',
                selectedDay.type === 'green' ? 'bg-emerald-400/20 text-emerald-400' :
                selectedDay.type === 'red' ? 'bg-red-400/20 text-red-400' : 'bg-white/10 text-white/50'
              )}>
                {selectedDay.day}
              </span>
              <span className="font-mono text-[10px] font-bold tracking-wider text-white/30 uppercase">
                {monthName} {selectedDay.day}
              </span>
            </div>
            <button onClick={() => setSelectedDay(null)} className="text-white/20 hover:text-white/50">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-white/70">{selectedDay.advice}</p>

          <div className="grid grid-cols-2 gap-4">
            {selectedDay.do?.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[9px] font-bold tracking-wider text-emerald-400 uppercase">✅ Do</p>
                {selectedDay.do.map((item, i) => (
                  <p key={i} className="mb-1 text-xs text-white/50">• {item}</p>
                ))}
              </div>
            )}
            {selectedDay.dont?.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[9px] font-bold tracking-wider text-red-400 uppercase">❌ Avoid</p>
                {selectedDay.dont.map((item, i) => (
                  <p key={i} className="mb-1 text-xs text-white/50">• {item}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
