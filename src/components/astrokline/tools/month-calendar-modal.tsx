'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MonthCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  getScoreForDate: (date: Date) => number;
  selectedDate: Date;
  minDate?: Date;
  maxDate?: Date;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getScoreColor(score: number) {
  if (score >= 68) return 'bg-emerald-500';
  if (score >= 42) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function MonthCalendarModal({
  isOpen,
  onClose,
  onSelectDate,
  getScoreForDate,
  selectedDate,
  minDate,
  maxDate,
}: MonthCalendarModalProps) {
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const totalDays = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    cells.push(new Date(year, month, d));
  }

  const prevMonth = () =>
    setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(year, month + 1, 1));

  const isSelected = (d: Date) =>
    d.toISOString().slice(0, 10) === selectedDate.toISOString().slice(0, 10);
  const isToday = (d: Date) =>
    d.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm border border-white/10 bg-[#15131A] p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="p-1 text-white/40 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-white">{monthName}</span>
          <button onClick={nextMonth} className="p-1 text-white/40 hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day labels */}
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {DAY_LABELS.map((l) => (
            <span key={l} className="text-[10px] font-mono text-white/30">
              {l}
            </span>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const disabled = isDisabled(d);
            const score = disabled ? 0 : getScoreForDate(d);
            return (
              <button
                key={d.toISOString()}
                disabled={disabled}
                onClick={() => { onSelectDate(d); onClose(); }}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1.5 text-xs transition-all',
                  isSelected(d) && 'bg-primary/20 ring-1 ring-primary',
                  isToday(d) && !isSelected(d) && 'bg-white/5',
                  disabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10'
                )}
              >
                <span className={cn(
                  'font-medium',
                  isSelected(d) ? 'text-primary' : isToday(d) ? 'text-white' : 'text-white/60'
                )}>
                  {d.getDate()}
                </span>
                {!disabled && (
                  <span className={cn('h-1.5 w-1.5', getScoreColor(score))} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-500" /> High</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-amber-500" /> Neutral</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-rose-500" /> Low</span>
        </div>
      </div>
    </div>
  );
}
