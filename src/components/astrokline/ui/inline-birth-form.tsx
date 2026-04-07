'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, MapPin, Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { trackEvent } from '@/lib/astrokline/track-event';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrokline/ui/heading';
import { useBirthInfoModal, type BirthData } from './birth-info-context';
import { LocationAutocomplete } from './location-autocomplete';
import { ScrollPicker } from './scroll-picker';

const TIME_SLOTS = [
  '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', '05:00-06:00',
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-24:00',
  'unknown',
];

const STEP_META = [
  { id: 0, label: 'About You', icon: User },
  { id: 1, label: 'Details', icon: MapPin },
];

export function InlineBirthForm() {
  const { data, setData } = useBirthInfoModal();
  const t = useTranslations('common.birthModal');
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract date segments for controlled inputs
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  // Auto-hydrating date parsing from context
  useEffect(() => {
    if (data.date && !birthYear) {
      const parts = data.date.split('-');
      if (parts.length === 3) {
        setBirthYear(parts[0]);
        setBirthMonth(parts[1].replace(/^0/, ''));
        setBirthDay(parts[2].replace(/^0/, ''));
      }
    }
  }, [data.date, birthYear]);

  // Sync year/month/day back to context
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const d = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      setData((prev: BirthData) => {
        const newData = { ...prev, date: d };
        try { localStorage.setItem('astrokline_birth_data', JSON.stringify(newData)); } catch (e) {}
        return newData;
      });
    } else {
      setData((prev: BirthData) => ({ ...prev, date: '' }));
    }
  }, [birthYear, birthMonth, birthDay, setData]);

  // Validation
  const validate = useCallback((): string => {
    if (step === 0) {
      if (!birthYear || !birthMonth || !birthDay) return 'Please complete your date of birth';
    } else if (step === 1) {
      if (!data.timeSlot) return 'Pick a time slot to get started';
      if (!data.location.trim() || data.lat === null || data.lon === null) return 'Please select your birth city';
    }
    return '';
  }, [step, data, birthYear, birthMonth, birthDay]);

  const onNext = () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');

    if (step === 0) {
      trackEvent('birth_modal_step_complete', { step: 1 });
      setStep(1);
    } else {
      trackEvent('birth_modal_submit');
      if (data.date && data.location) {
        try { localStorage.setItem('astrokline_birth_data', JSON.stringify(data)); } catch (e) {}
      }
      // Submit -> Navigate!
      router.push('/kline/result');
    }
  };

  const onBack = () => { setErrorMsg(''); if (step > 0) setStep(step - 1); };

  const yearUpperBound = Math.max(new Date().getFullYear(), 2026);
  const years = Array.from({ length: 102 }, (_, i) => String(yearUpperBound - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const maxDay = birthYear && birthMonth ? new Date(Number(birthYear), Number(birthMonth), 0).getDate() : 31;
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1));

  return (
    <>
      {/* Step indicator - client interactive */}
      <div className="flex items-center gap-3 mt-2 mb-6">
        <p className="text-[10px] tracking-[0.2em] text-primary uppercase font-mono">
          {step === 0 ? 'Your Birthday' : 'Time & Place'} {"//"} Step 0{step + 1}
        </p>
        <div className="flex gap-1.5">
          {STEP_META.map(s => (
            <div key={s.id} className={cn("h-1 w-6 transition-all duration-500", step >= s.id ? "bg-primary shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "bg-white/10")} />
          ))}
        </div>
      </div>

      <div className="min-h-[280px]">
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Your Name <span className="text-white/20">(optional)</span></Label>
              <Input
                autoFocus
                value={data.name}
                onChange={(e) => { setData((d: BirthData) => ({ ...d, name: e.target.value })); setErrorMsg(''); }}
                placeholder="Nickname or initials"
                className="h-12 border-b border-white/10 bg-[#111] text-lg font-medium tracking-tight rounded-none focus-visible:border-primary/50 focus-visible:ring-0 px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Date of Birth</Label>
              <div className="grid grid-cols-3 gap-3">
                <ScrollPicker
                  items={years.map(y => ({ value: y, label: y }))}
                  value={birthYear}
                  onChange={(v) => { setBirthYear(v); setErrorMsg(''); }}
                  placeholder="YYYY"
                />
                <ScrollPicker
                  items={months.map(m => ({ value: m, label: m.padStart(2, '0') }))}
                  value={birthMonth}
                  onChange={(v) => { setBirthMonth(v); setBirthDay(''); setErrorMsg(''); }}
                  placeholder="MM"
                  loop={true}
                />
                <ScrollPicker
                  items={days.map(d => ({ value: d, label: d.padStart(2, '0') }))}
                  value={birthDay}
                  onChange={(v) => { setBirthDay(v); setErrorMsg(''); }}
                  placeholder="DD"
                  loop={true}
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Birth Time</Label>
              <ScrollPicker
                items={TIME_SLOTS.map(slot => ({ value: slot, label: slot === 'unknown' ? "I don't know" : slot }))}
                value={data.timeSlot}
                onChange={(v) => { setData((d: BirthData) => ({ ...d, timeSlot: v })); setErrorMsg(''); }}
                placeholder="Select time range"
                visibleCount={3}
                loop={true}
              />
              <div className="min-h-[20px] pt-1">
                {data.timeSlot === 'unknown' && (
                  <p className="text-[10px] text-primary/70 uppercase tracking-wider font-mono">We'll use 12:00 PM as default — still accurate for your timeline.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Birth Place</Label>
              <div className="relative">
                <LocationAutocomplete
                  value={data.location}
                  onChange={(name: string, lat: number, lon: number) => { setData((d: BirthData) => ({ ...d, location: name, lat, lon })); setErrorMsg(''); }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono uppercase tracking-wide">{errorMsg}</span>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            onClick={onBack}
            className="flex h-14 w-14 items-center justify-center border border-white/20 bg-transparent text-foreground hover:bg-white/5 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-1 h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] animate-[glow-pulse_2s_ease-in-out_infinite]"
          style={{
            // @ts-ignore -- CSS custom animation
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        >
          {step === 0 ? "Continue ✨" : "Reveal My Stars ✨"}
          {step === 1 ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>

      {step === 1 && (
        <div className="text-center mt-5 flex justify-center items-center gap-2 opacity-50">
           <span className="w-4 h-4 border border-white/20 flex items-center justify-center text-[8px] font-mono">i</span>
           <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
             Your data is encrypted and never stored.
           </p>
        </div>
      )}
    </>
  );
}
