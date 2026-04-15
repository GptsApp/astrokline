'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  CheckCircle2,
  Compass,
  LoaderCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { z } from 'zod';

import { Heading } from '@/components/astrocurve/ui/heading';
import {
  clearSavedKlineResult,
  persistBirthData,
  type BirthData,
} from '@/components/astrocurve/ui/birth-info-context';
import { ScrollPicker } from '@/components/astrocurve/ui/scroll-picker';
import { useRouter } from '@/core/i18n/navigation';
import {
  buildNatalChartPayload,
  enrichBirthDataWithTimezone,
} from '@/lib/astrokline/birth-timezone';
import {
  deriveHouseReading,
  type DerivedHouseReading,
} from '@/lib/astrokline/house-calculator';
import type { House } from '@/lib/astrokline/houses-data';

const LocationAutocomplete = dynamic(
  () =>
    import('@/components/astrocurve/ui/location-autocomplete').then((module) => ({
      default: module.LocationAutocomplete,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 border border-white/10 bg-white/5 animate-pulse" />
    ),
  }
);

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

const formSchema = z.object({
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^\d{1,2}$/),
  day: z.string().regex(/^\d{1,2}$/),
  timeSlot: z.string().min(1),
  location: z.string().trim().min(2),
  lat: z.number(),
  lon: z.number(),
});

const natalChartResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    houses: z.array(
      z.object({
        house: z.number(),
        sign: z.string(),
        degree: z.number(),
      })
    ),
    planets: z.array(
      z.object({
        name: z.string(),
        sign: z.string(),
        signDegree: z.number(),
        house: z.number(),
        retrograde: z.boolean(),
      })
    ),
  }),
});

function getFormErrorMessage(result: ReturnType<typeof formSchema.safeParse>) {
  if (result.success) {
    return '';
  }

  return result.error.issues[0]?.message ?? 'Please complete all required fields.';
}

export function HouseCalculator({ house }: { house: House }) {
  const router = useRouter();
  const currentYear = Math.max(new Date().getFullYear(), 2026);

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [timeSlot, setTimeSlot] = useState('unknown');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reading, setReading] = useState<DerivedHouseReading | null>(null);
  const [submittedBirthData, setSubmittedBirthData] = useState<BirthData | null>(
    null
  );

  const years = useMemo(
    () => Array.from({ length: 102 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => String(index + 1)),
    []
  );
  const maxDay = useMemo(() => {
    if (!birthYear || !birthMonth) {
      return 31;
    }

    return new Date(Number(birthYear), Number(birthMonth), 0).getDate();
  }, [birthMonth, birthYear]);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, index) => String(index + 1)),
    [maxDay]
  );

  useEffect(() => {
    if (birthDay && Number(birthDay) > maxDay) {
      setBirthDay('');
    }
  }, [birthDay, maxDay]);

  const handleCalculate = async () => {
    const validation = formSchema.safeParse({
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      timeSlot,
      location,
      lat,
      lon,
    });

    if (!validation.success) {
      setErrorMsg(getFormErrorMessage(validation));
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const birthData: BirthData = enrichBirthDataWithTimezone({
      name: '',
      gender: '',
      date: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(
        2,
        '0'
      )}`,
      timeSlot,
      location: location.trim(),
      lat,
      lon,
    });

    try {
      const response = await fetch('/api/astrology/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildNatalChartPayload(birthData)),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'We could not calculate your house yet.');
      }

      const parsedPayload = natalChartResponseSchema.safeParse(payload);

      if (!parsedPayload.success) {
        throw new Error('The house result was incomplete. Please try again.');
      }

      setSubmittedBirthData(birthData);
      setReading(deriveHouseReading(house, parsedPayload.data.data));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not calculate your house yet.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFullChart = () => {
    if (!submittedBirthData) {
      return;
    }

    persistBirthData({
      ...submittedBirthData,
      name: submittedBirthData.name || `${house.name} visitor`,
    });
    clearSavedKlineResult();
    router.push('/kline');
  };

  return (
    <div className="space-y-5">
      <div className="border border-white/10 bg-black/70 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-mono">
              Free Calculator
            </p>
            <Heading level={3} className="mt-2 text-2xl text-white">
              Find Your {house.name} Sign
            </Heading>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Enter your birth date, time, and city to see which sign rules your{' '}
              {house.name} and which natal planets live there.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
            <Compass className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45 font-mono">
              Birth Date
            </p>
            <div className="grid grid-cols-3 gap-3">
              <ScrollPicker
                items={years.map((year) => ({ value: year, label: year }))}
                value={birthYear}
                onChange={(value) => {
                  setBirthYear(value);
                  setErrorMsg('');
                }}
                placeholder="YYYY"
              />
              <ScrollPicker
                items={months.map((month) => ({
                  value: month,
                  label: month.padStart(2, '0'),
                }))}
                value={birthMonth}
                onChange={(value) => {
                  setBirthMonth(value);
                  setErrorMsg('');
                }}
                placeholder="MM"
                loop={true}
              />
              <ScrollPicker
                items={days.map((day) => ({
                  value: day,
                  label: day.padStart(2, '0'),
                }))}
                value={birthDay}
                onChange={(value) => {
                  setBirthDay(value);
                  setErrorMsg('');
                }}
                placeholder="DD"
                loop={true}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45 font-mono">
              Birth Time
            </p>
            <ScrollPicker
              items={TIME_SLOTS.map((slot) => ({
                value: slot,
                label: slot === 'unknown' ? "I don't know" : slot,
              }))}
              value={timeSlot}
              onChange={(value) => {
                setTimeSlot(value);
                setErrorMsg('');
              }}
              placeholder="Select a time"
              visibleCount={3}
              loop={true}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-white/45">
              Exact birth time matters more for houses than for sun-sign astrology.
              If you pick "I don't know", we use 12:00 PM as an approximation.
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45 font-mono">
              Birth City
            </p>
            <LocationAutocomplete
              value={location}
              onChange={(name: string, latitude: number, longitude: number) => {
                setLocation(name);
                setLat(latitude);
                setLon(longitude);
                setErrorMsg('');
              }}
            />
          </div>

          {errorMsg ? (
            <div className="border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {errorMsg}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCalculate}
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-3 bg-primary px-5 text-sm font-bold uppercase tracking-[0.2em] text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isSubmitting ? 'Calculating...' : `Calculate My ${house.name}`}
          </button>
        </div>
      </div>

      {reading ? (
        <div className="border border-primary/20 bg-[#0A0A0A] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary/75 font-mono">
                Your Result
              </p>
              <Heading level={3} className="mt-2 text-2xl text-white">
                {reading.headline}
              </Heading>
            </div>
            <div className="flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 font-mono">
                House Sign
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {reading.cuspSign}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Cusp at {reading.cuspDegree.toFixed(2)} degrees
              </p>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 font-mono">
                Ruling Planet
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {reading.rulingPlanet}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Track this planet for timing clues.
              </p>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 font-mono">
                Planets Here
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {reading.planetsInHouse.length}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {reading.planetsInHouse.length
                  ? reading.planetsInHouse.map((planet) => planet.name).join(', ')
                  : 'No natal planets in this house'}
              </p>
            </div>
          </div>

          <div className="mt-5 border border-white/10 bg-white/[0.02] p-5">
            <p className="text-base leading-7 text-white/80">{reading.summary}</p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              {reading.activationNote}
            </p>
            {timeSlot === 'unknown' ? (
              <p className="mt-3 text-sm leading-6 text-amber-300/80">
                Because you selected an unknown birth time, your house cusp can shift
                if your exact birth time is far from noon.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border border-emerald-400/15 bg-emerald-400/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300 font-mono">
                Best Uses Of This House
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                {reading.opportunities.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-rose-400/15 bg-rose-400/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-rose-300 font-mono">
                Common Friction
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                {reading.cautions.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-rose-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border border-white/10 bg-white/[0.02] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Want the full chart, timing map, and life timeline?
              </p>
              <p className="mt-1 text-sm text-white/55">
                We can carry these birth details into the full AstroCurve reading.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenFullChart}
              className="flex h-12 items-center justify-center gap-2 border border-primary/30 bg-primary/10 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              <MapPin className="h-4 w-4" />
              Open Full Life Timeline
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}