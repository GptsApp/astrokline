'use client';

import React, { useCallback, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, MapPin, Sparkles, User } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { LocationAutocomplete } from '../ui/location-autocomplete';
import { ScrollPicker } from '../ui/scroll-picker';

const TIME_SLOTS = [
  '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', '05:00-06:00',
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-24:00',
  'unknown',
];

const STEP_META = [
  { id: 0, label: 'About Them', icon: User },
  { id: 1, label: 'Details', icon: MapPin },
];

export interface PartnerBirthData {
  name: string;
  date: string;
  timeSlot: string;
  location: string;
  lat: number | null;
  lon: number | null;
  timezoneValue: number | null;
}

interface PartnerBirthFormProps {
  onSubmit: (data: PartnerBirthData) => void;
  isLoading?: boolean;
}

export function PartnerBirthForm({ onSubmit, isLoading }: PartnerBirthFormProps) {
  const [data, setData] = useState<PartnerBirthData>({
    name: '',
    date: '',
    timeSlot: '',
    location: '',
    lat: null,
    lon: null,
    timezoneValue: null,
  });

  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract date segments for controlled inputs
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  // Sync year/month/day back to local state
  React.useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const d = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      setData(prev => ({ ...prev, date: d }));
    } else {
      setData(prev => ({ ...prev, date: '' }));
    }
  }, [birthYear, birthMonth, birthDay]);

  const yearUpperBound = Math.max(new Date().getFullYear(), 2026);
  const years = Array.from({ length: 102 }, (_, i) => String(yearUpperBound - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const maxDay = birthYear && birthMonth ? new Date(Number(birthYear), Number(birthMonth), 0).getDate() : 31;
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1));

  const validate = useCallback((): string => {
    if (step === 0) {
      if (!birthYear || !birthMonth || !birthDay) return 'Please complete their date of birth';
    } else if (step === 1) {
      // Made optional to reduce friction for compatibility tool
      // if (!data.timeSlot) return 'Pick a time slot';
    }
    return '';
  }, [step, birthYear, birthMonth, birthDay]);

  const onNext = () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');

    if (step === 0) {
      setStep(1);
    } else {
      // If time/location omitted, set defaults
      const finalData = { ...data };
      if (!finalData.timeSlot) finalData.timeSlot = 'unknown';
      if (!finalData.location) finalData.location = 'Unknown City';
      onSubmit(finalData);
    }
  };

  const onBack = () => { setErrorMsg(''); if (step > 0) setStep(step - 1); };

  return (
    <div className="relative w-full group max-w-lg mx-auto">
      {/* Sci-Fi Tactical Corner Crosshairs - GOLD THEME */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#D4AF37]/50 z-30 transition-all group-hover:border-[#D4AF37] group-hover:scale-110" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#D4AF37]/50 z-30 transition-all group-hover:border-[#D4AF37] group-hover:scale-110" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#D4AF37]/50 z-30 transition-all group-hover:border-[#D4AF37] group-hover:scale-110" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#D4AF37]/50 z-30 transition-all group-hover:border-[#D4AF37] group-hover:scale-110" />

      {/* Terminal Grid Background inside the form */}
      <div className="w-full border border-white/10 bg-[#050505]/95 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle gold radar sweep overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute -inset-[100%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(212,175,55,0.2)_360deg)] animate-[spin_8s_linear_infinite]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col min-h-[460px]">
          
          {/* Header & Steps */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              Partner Profile
            </h2>
            <p className="text-[10px] text-[#D4AF37]/60 mt-1 tracking-[0.2em] uppercase font-mono">
              ASTROMETRIC CALIBRATION
            </p>
            
            <div className="mt-6 flex gap-2">
              {STEP_META.map((m, idx) => (
                <div key={m.id} className="flex-1">
                  <div className={cn(
                    "h-[2px] transition-all duration-300",
                    step >= idx ? "bg-[#D4AF37]" : "bg-white/10"
                  )} />
                </div>
              ))}
            </div>
          </div>

        <div className="min-h-[280px]">
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-[#D4AF37]/60 font-mono">Their Name <span className="text-white/20 tracking-normal text-xs capitalize">(optional)</span></Label>
                <Input
                  autoFocus
                  value={data.name}
                  onChange={(e) => { setData(d => ({ ...d, name: e.target.value })); setErrorMsg(''); }}
                  placeholder="Nickname or initials"
                  className="h-12 border-b border-white/10 bg-[#111] text-lg font-mono tracking-tight rounded-none focus-visible:border-[#D4AF37]/50 focus-visible:ring-0 px-4"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-[#D4AF37]/60 font-mono">Date of Birth</Label>
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
                <Label className="text-[10px] uppercase tracking-widest text-[#D4AF37]/60 font-mono">
                  Time of Birth <span className="text-white/20 tracking-normal text-xs capitalize">(optional)</span>
                </Label>
                <select 
                  className="flex h-12 w-full appearance-none rounded-none border-b border-white/10 bg-[#111] px-4 font-mono text-base text-white transition-colors focus-visible:border-[#D4AF37]/50 focus-visible:outline-none"
                  value={data.timeSlot}
                  onChange={(e) => {
                    setData(d => ({ ...d, timeSlot: e.target.value }));
                    setErrorMsg('');
                  }}
                >
                  <option value="" disabled className="text-white/40">Select an hour slot</option>
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{t === 'unknown' ? "I don't know" : t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 relative z-50">
                <Label className="text-[10px] uppercase tracking-widest text-[#D4AF37]/60 font-mono">
                  City of Birth <span className="text-white/20 tracking-normal text-xs capitalize">(optional)</span>
                </Label>
                <div className="relative">
                  <LocationAutocomplete
                    value={data.location}
                    onChange={(name: string, lat: number, lon: number) => { 
                      setData(d => ({ ...d, location: name, lat, lon, timezoneValue: 0 })); 
                      setErrorMsg(''); 
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-white/40 mt-2 font-mono leading-relaxed">
                If unknown, we will use default parameters. Accuracy may vary.
              </p>
            </div>
          )}
        </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex gap-3">
            {step > 0 && (
              <button
                disabled={isLoading}
                onClick={onBack}
                className="h-14 px-6 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/30 bg-transparent transition-colors flex-1 max-w-[120px]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              disabled={isLoading}
              onClick={onNext}
              className="group relative flex-1 h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 translate-y-[100%] bg-white/20 transition-transform duration-300 group-hover:translate-y-[0%]" />
              <div className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    CALCULATING...
                  </span>
                ) : step === 0 ? (
                  <>Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                ) : (
                  <>Calculate Synastry <CheckCircle2 className="w-4 h-4" /></>
                )}
              </div>
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 border border-red-500/20 bg-red-500/10 flex items-center gap-2 text-red-400 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
