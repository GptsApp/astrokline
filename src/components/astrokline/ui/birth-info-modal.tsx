"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBirthInfoModal, type BirthData } from "./birth-info-context";
import { LocationAutocomplete } from "./location-autocomplete";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { Sparkles, User, Calendar, Clock, MapPin, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { trackEvent } from "@/lib/astrokline/track-event";

const TIME_SLOTS = [
  "00:00-01:00", "01:00-02:00", "02:00-03:00", "03:00-04:00",
  "04:00-05:00", "05:00-06:00", "06:00-07:00", "07:00-08:00",
  "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
  "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00",
  "20:00-21:00", "21:00-22:00", "22:00-23:00", "23:00-24:00",
  "unknown",
];

const STEP_META = [
  { id: 0, label: "Identity & Date", icon: User },
  { id: 1, label: "Time & Place", icon: MapPin },
] as const;

export function BirthInfoModal() {
  const { isOpen, close, data, setData, onCompleteCallback } = useBirthInfoModal();
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasOpened, setHasOpened] = useState(false);

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  // Track open event & reset state
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setErrorMsg("");
      setBirthYear("");
      setBirthMonth("");
      setBirthDay("");
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
      const d = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
      setData(prev => ({ ...prev, date: d }));
    } else {
      setData(prev => ({ ...prev, date: "" }));
    }
  }, [birthYear, birthMonth, birthDay, setData]);

  // Validate current step — returns error string or ""
  const validate = useCallback((): string => {
    if (step === 0) {
      if (!data.name.trim()) return "Please enter your name";
      if (!birthYear || !birthMonth || !birthDay) return "Please select your complete birth date";
    } else if (step === 1) {
      if (!data.timeSlot) return "Please select your birth time range";
      if (!data.location.trim() || data.lat === null || data.lon === null) {
        return "Please search and select a location";
      }
    }
    return "";
  }, [step, data, birthYear, birthMonth, birthDay]);

  const onClickNext = useCallback(() => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");

    if (step === 0) {
      trackEvent('birth_modal_step_complete', { step: 1 });
      setStep(1);
    } else {
      // step === 1 — submit
      trackEvent('birth_modal_submit');
      onCompleteCallback?.(data);
      setTimeout(() => close(), 100);
    }
  }, [step, validate, data, onCompleteCallback, close]);

  const onClickBack = useCallback(() => {
    setErrorMsg("");
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
  const curYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(curYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const maxDay = birthYear && birthMonth
    ? new Date(Number(birthYear), Number(birthMonth), 0).getDate()
    : 31;
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="sm:max-w-[480px] !bg-[#0D0B12] border-white/10 !p-0 overflow-visible !gap-0 max-h-[85dvh] overflow-y-auto data-[state=open]:slide-in-from-bottom-2"
        showCloseButton={true}
      >
        {/* Accessibility: hidden title for screen readers */}
        <DialogTitle className="sr-only">Birth Info Wizard</DialogTitle>

        {/* ─── Header ─── */}
        <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Unlock Your Cosmic Blueprint</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {step + 1} of 2 — {step === 0 ? 'Tell us about yourself' : 'Almost there!'}
            </p>
          </div>
        </div>

        {/* ─── Step Indicators ─── */}
        <div className="flex justify-center items-start px-10 pt-4 pb-3 relative gap-8">
          <div className="absolute left-10 right-10 top-[34px] h-0.5 -translate-y-1/2 bg-white/5 z-0" />
          {STEP_META.map((s) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5 w-24">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                  active
                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    : done
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-[#15131A] border-white/10 text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-mono tracking-wider text-center",
                  active ? "text-primary font-bold" : "text-muted-foreground/50"
                )}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ─── Step Content ─── */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 min-h-[260px] sm:min-h-[300px]">
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="modal-name" className="text-sm font-medium text-foreground/80">
                  Your Name <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="modal-name"
                  autoFocus
                  value={data.name}
                  onChange={(e) => { setData(d => ({ ...d, name: e.target.value })); setErrorMsg(""); }}
                  placeholder="Enter your name"
                  className={cn(
                    "h-12 bg-black/50 border-white/10 text-white rounded-xl focus-visible:ring-primary/50 placeholder:text-muted-foreground/50",
                    errorMsg && !data.name.trim() && "border-amber-500/50"
                  )}
                />
              </div>

              {/* Gender (optional) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Gender <span className="text-muted-foreground/50 text-xs">(optional)</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "male" as const, label: "Male" },
                    { value: "female" as const, label: "Female" },
                    { value: "non-binary" as const, label: "Other" },
                  ]).map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => { setData(d => ({ ...d, gender: g.value })); setErrorMsg(""); }}
                      className={cn(
                        "h-10 flex items-center justify-center rounded-xl border text-sm font-medium transition-all whitespace-nowrap",
                        data.gender === g.value
                          ? "bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                          : "bg-black/30 border-white/10 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Birth Date <span className="text-amber-400">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={birthYear} onValueChange={(v) => { setBirthYear(v); setErrorMsg(""); }}>
                    <SelectTrigger className={cn("h-10 bg-black/50 border-white/10 text-white rounded-xl w-full text-sm", errorMsg && !birthYear && "border-amber-500/50")}>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={birthMonth} onValueChange={(v) => { setBirthMonth(v); setBirthDay(""); setErrorMsg(""); }}>
                    <SelectTrigger className={cn("h-10 bg-black/50 border-white/10 text-white rounded-xl w-full text-sm", errorMsg && !birthMonth && "border-amber-500/50")}>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">{months.map(m => <SelectItem key={m} value={m}>{m.padStart(2, "0")}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={birthDay} onValueChange={(v) => { setBirthDay(v); setErrorMsg(""); }}>
                    <SelectTrigger className={cn("h-10 bg-black/50 border-white/10 text-white rounded-xl w-full text-sm", errorMsg && !birthDay && "border-amber-500/50")}>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">{days.map(d => <SelectItem key={d} value={d}>{d.padStart(2, "0")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Birth Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Birth Time Range <span className="text-amber-400">*</span>
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">Precise timing determines your ascendant sign.</p>
                <Select value={data.timeSlot} onValueChange={(v) => { setData(d => ({ ...d, timeSlot: v })); setErrorMsg(""); }}>
                  <SelectTrigger className={cn("h-12 bg-black/50 border-white/10 text-white rounded-xl w-full", errorMsg && !data.timeSlot && "border-amber-500/50")}>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot === "unknown" ? "I don't know my birth time" : slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Birth Location <span className="text-amber-400">*</span>
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">Birth location calibrates house positions.</p>
                <LocationAutocomplete
                  value={data.location}
                  onChange={(name: string, lat: number, lon: number) => {
                    setData(d => ({ ...d, location: name, lat, lon }));
                    setErrorMsg("");
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── Error Message ─── */}
        {errorMsg && (
          <div className="px-8 pb-3">
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 animate-in fade-in duration-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* ─── Footer Buttons ─── */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={onClickBack}
              className="flex-[1] h-12 rounded-xl border border-white/10 bg-transparent text-foreground text-sm font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onClickNext}
            className={cn(
              "h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-primary/90 flex items-center justify-center gap-2",
              step === 0 ? "w-full" : "flex-[2]"
            )}
          >
            {step === 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Generate My Blueprint
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
