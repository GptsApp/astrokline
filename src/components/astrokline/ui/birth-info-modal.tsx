'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { trackEvent } from '@/lib/astrokline/track-event';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';

import { useBirthInfoModal, type BirthData } from './birth-info-context';
import { LocationAutocomplete } from './location-autocomplete';
import { ScrollPicker } from './scroll-picker';

const TIME_SLOTS = [
  '00:00-01:00',
  '01:00-02:00',
  '02:00-03:00',
  '03:00-04:00',
  '04:00-05:00',
  '05:00-06:00',
  '06:00-07:00',
  '07:00-08:00',
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
  '22:00-23:00',
  '23:00-24:00',
  'unknown',
];

const STEP_META = [
  { id: 0, label: 'Identity & Date', icon: User },
  { id: 1, label: 'Time & Place', icon: MapPin },
] as const;

export function BirthInfoModal() {
  const { isOpen, close, data, setData, onCompleteCallback } =
    useBirthInfoModal();
  const t = useTranslations('common.birthModal');
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasOpened, setHasOpened] = useState(false);

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  // Track open event & reset state
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setErrorMsg('');
      setBirthYear('');
      setBirthMonth('');
      setBirthDay('');
      if (!hasOpened) {
        trackEvent('birth_modal_open');
        setHasOpened(true);
      }
    } else {
      setHasOpened(false);
    }
  }, [isOpen]);

  // Sync year/month/day → data.date
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const d = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      setData((prev) => {
        const newData = { ...prev, date: d };
        // Auto-save partial data to prevent drop-off loss
        if (newData.name) {
          try {
            localStorage.setItem('astrokline_birth_data', JSON.stringify(newData));
          } catch (e) {}
        }
        return newData;
      });
    } else {
      setData((prev) => ({ ...prev, date: '' }));
    }
  }, [birthYear, birthMonth, birthDay, setData]);

  // Auto-save on data change if at least name is present
  useEffect(() => {
    if (data.name) {
      try {
        localStorage.setItem('astrokline_birth_data', JSON.stringify(data));
      } catch (e) {}
    }
  }, [data]);

  // Validate current step — returns error string or ""
  const validate = useCallback((): string => {
    if (step === 0) {
      if (!data.name.trim()) return 'Please enter your name';
      if (!birthYear || !birthMonth || !birthDay)
        return 'Please select your complete birth date';
    } else if (step === 1) {
      if (!data.timeSlot) return 'Please select your birth time range';
      if (!data.location.trim() || data.lat === null || data.lon === null) {
        return 'Please search and select a location';
      }
    }
    return '';
  }, [step, data, birthYear, birthMonth, birthDay]);

  const onClickNext = useCallback(() => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');

    if (step === 0) {
      trackEvent('birth_modal_step_complete', { step: 1 });
      setStep(1);
    } else {
      // step === 1 — submit
      trackEvent('birth_modal_submit');

      // SYNC SAVE: forcefully save to localStorage immediately to prevent redirect data loss
      if (data.name && data.date && data.location) {
        try {
          localStorage.setItem('astrokline_birth_data', JSON.stringify(data));
        } catch (e) {}
      }

      onCompleteCallback?.(data);
      setTimeout(() => close(), 100);
    }
  }, [step, validate, data, onCompleteCallback, close]);

  const onClickBack = useCallback(() => {
    setErrorMsg('');
    if (step > 0) setStep(step - 1);
  }, [step]);

  // Handle modal close without completing (abandon tracking)
  const handleClose = useCallback(() => {
    if (step < 1 || (step === 1 && !data.location.trim())) {
      trackEvent('birth_modal_abandon', { step: step + 1 });
    }
    close();
  }, [step, data.location, close]);

  // Year/month/day option arrays
  const yearUpperBound = Math.max(new Date().getFullYear(), 2026);
  const years = Array.from({ length: 102 }, (_, i) =>
    String(yearUpperBound - i)
  );
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const maxDay =
    birthYear && birthMonth
      ? new Date(Number(birthYear), Number(birthMonth), 0).getDate()
      : 31;
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="data-[state=open]:slide-in-from-bottom-2 max-h-[85dvh] !gap-0 overflow-visible overflow-y-auto border-white/10 !bg-[#0D0B12] !p-0 sm:max-w-[480px]"
        showCloseButton={true}
      >
        {/* Accessibility: hidden title for screen readers */}
        <DialogTitle className="sr-only">Birth Info Wizard</DialogTitle>

        {/* ─── Header ─── */}
        <div className="relative overflow-hidden rounded-t-lg px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          <div className="from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent" />
          <div className="relative z-10 text-center">
            <div className="bg-primary/10 border-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-foreground text-xl font-bold">
              Your Timing Map Is Ready To Be Calculated
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Step {step + 1} of 2 —{' '}
              {step === 0 ? "Let's find your chart" : 'Final precision step'}
            </p>
          </div>
        </div>

        {/* ─── Step Indicators ─── */}
        <div className="relative flex items-start justify-center gap-8 px-10 pt-4 pb-3">
          <div className="absolute top-[34px] right-10 left-10 z-0 h-0.5 -translate-y-1/2 bg-white/5" />
          {STEP_META.map((s) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div
                key={s.id}
                className="relative z-10 flex w-24 flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                    active
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : done
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'text-muted-foreground border-white/10 bg-[#15131A]'
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-center font-mono text-[9px] tracking-wider uppercase',
                    active
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground/50'
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ─── Step Content ─── */}
        <div className="min-h-[260px] px-6 py-4 sm:min-h-[300px] sm:px-8 sm:py-6">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-5 duration-300">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="modal-name"
                  className="text-foreground/80 text-sm font-medium"
                >
                  Your Name <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="modal-name"
                  autoFocus
                  value={data.name}
                  onChange={(e) => {
                    setData((d) => ({ ...d, name: e.target.value }));
                    setErrorMsg('');
                  }}
                  placeholder="Enter your name"
                  className={cn(
                    'focus-visible:ring-primary/50 placeholder:text-muted-foreground/50 h-12 rounded-xl border-white/10 bg-black/50 text-white',
                    errorMsg && !data.name.trim() && 'border-amber-500/50'
                  )}
                />
              </div>

              {/* Gender (optional) */}
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm font-medium">
                  Gender{' '}
                  <span className="text-muted-foreground/50 text-xs">
                    (optional)
                  </span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male' as const, label: 'Male' },
                    { value: 'female' as const, label: 'Female' },
                    { value: 'non-binary' as const, label: 'Other' },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => {
                        setData((d) => ({ ...d, gender: g.value }));
                        setErrorMsg('');
                      }}
                      className={cn(
                        'flex h-10 items-center justify-center rounded-xl border text-sm font-medium whitespace-nowrap transition-all',
                        data.gender === g.value
                          ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                          : 'text-muted-foreground border-white/10 bg-black/30 hover:border-white/20'
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Date — Drum Scroll Pickers */}
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm font-medium">
                  Birth Date <span className="text-amber-400">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <span className="text-muted-foreground/50 mb-1 block text-[10px] tracking-wider uppercase">
                      Year
                    </span>
                    <ScrollPicker
                      items={years.map((y) => ({ value: y, label: y }))}
                      value={birthYear}
                      onChange={(v) => {
                        setBirthYear(v);
                        setErrorMsg('');
                      }}
                      placeholder="Year"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground/50 mb-1 block text-[10px] tracking-wider uppercase">
                      Month
                    </span>
                    <ScrollPicker
                      items={months.map((m) => ({
                        value: m,
                        label: m.padStart(2, '0'),
                      }))}
                      value={birthMonth}
                      onChange={(v) => {
                        setBirthMonth(v);
                        setBirthDay('');
                        setErrorMsg('');
                      }}
                      placeholder="Mon"
                      loop={true}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground/50 mb-1 block text-[10px] tracking-wider uppercase">
                      Day
                    </span>
                    <ScrollPicker
                      items={days.map((d) => ({
                        value: d,
                        label: d.padStart(2, '0'),
                      }))}
                      value={birthDay}
                      onChange={(v) => {
                        setBirthDay(v);
                        setErrorMsg('');
                      }}
                      placeholder="Day"
                      loop={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-5 duration-300">
              {/* Birth Time — Drum Scroll Picker */}
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm font-medium">
                  Birth Time Range <span className="text-amber-400">*</span>
                </Label>
                <p className="text-muted-foreground -mt-1 text-xs">
                  Precise timing determines your ascendant sign.
                </p>
                <ScrollPicker
                  items={TIME_SLOTS.map((slot) => ({
                    value: slot,
                    label: slot === 'unknown' ? "I don't know" : slot,
                  }))}
                  value={data.timeSlot}
                  onChange={(v) => {
                    setData((d) => ({ ...d, timeSlot: v }));
                    setErrorMsg('');
                  }}
                  placeholder="Select time range"
                  visibleCount={5}
                  loop={true}
                />
              </div>

              {/* Birth Location */}
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm font-medium">
                  Birth Location <span className="text-amber-400">*</span>
                </Label>
                <p className="text-muted-foreground -mt-1 text-xs">
                  {t('locationHint')}
                </p>
                <LocationAutocomplete
                  value={data.location}
                  onChange={(name: string, lat: number, lon: number) => {
                    setData((d) => ({ ...d, location: name, lat, lon }));
                    setErrorMsg('');
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── Error Message ─── */}
        {errorMsg && (
          <div className="px-8 pb-3">
            <div className="animate-in fade-in flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400 duration-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* ─── Footer Buttons ─── */}
        <div className="flex gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
          {step > 0 && (
            <button
              type="button"
              onClick={onClickBack}
              className="text-foreground flex h-12 flex-[1] items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent text-sm font-medium transition-all hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onClickNext}
            className={cn(
              'bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]',
              step === 0 ? 'w-full' : 'flex-[2]'
            )}
          >
            {step === 1 ? (
              <>
                <Sparkles className="h-4 w-4" />
                Unlock My Timing Map
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
