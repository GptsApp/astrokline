'use client';

import { useState } from 'react';
import { LocationAutocomplete } from '@/components/astrokline/ui/location-autocomplete';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Star,
  User,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { persistBirthData } from '@/components/astrokline/ui/birth-info-context';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useTranslations } from 'next-intl';
import { Heading } from "@/components/astrokline/ui/heading";

function toTimeSlot(rawTime?: string) {
  if (!rawTime) return 'unknown';
  const [hours] = rawTime.split(':').map(Number);
  if (Number.isNaN(hours)) return 'unknown';

  const start = hours.toString().padStart(2, '0');
  const end = (hours + 1).toString().padStart(2, '0');
  return `${start}:00-${end}:00`;
}

export function Hero() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('page.sections.hero');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lon: number | null;
  }>({
    lat: null,
    lon: null,
  });

  return (
    <section aria-label="Birth chart K-Line generator" className="bg-background relative flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background Glow & Particles */}
      <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 opacity-60 blur-[120px]" />

      {/* Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/textures/noise.svg')] opacity-20 mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 border px-3 py-1 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>{t('badge')}</span>
          </div>

          <Heading level={1} className="mb-6 bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-4xl leading-tight font-bold tracking-tight text-transparent md:text-6xl">
            {t('title1')}
            <br />
            <span className="bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321] bg-clip-text text-transparent">
              {t('title2')}
            </span>
          </Heading>

          <p className="text-muted-foreground mb-8 max-w-xl text-base leading-relaxed md:text-lg">
            {t('description')}
          </p>

          {/* Dynamic Social Proof & Urgency */}
          <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="inline-flex animate-pulse items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
              <span className="inline-block h-2 w-2 bg-emerald-400" />
              <span>{t('announcement.title')}</span>
            </div>
            <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400">
              🔥 <span>{t('announcement.subtitle')}</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex -space-x-4">
              <img
                className="border-background z-30 h-10 w-10 border-2"
                src="https://i.pravatar.cc/100?img=11"
                alt="User 1"
              />
              <img
                className="border-background z-20 h-10 w-10 border-2"
                src="https://i.pravatar.cc/100?img=32"
                alt="User 2"
              />
              <img
                className="border-background z-10 h-10 w-10 border-2"
                src="https://i.pravatar.cc/100?img=53"
                alt="User 3"
              />
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-white text-white" />
                ))}
              </div>
              <span 
                className="text-foreground/80 text-sm font-medium"
                dangerouslySetInnerHTML={{ __html: t('social_proof.readers') }} 
              />
            </div>
          </div>

          {/* Quick Questions Teaser */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {[
              t('questions.q1'),
              t('questions.q2'),
              t('questions.q3'),
            ].map((q, i) => (
              <span key={i} className="-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {q}
              </span>
            ))}
          </div>

          {/* Quick Trial Module (Google AI Studio Style Glassmorphism Form) */}
          <div className="group relative mt-4 w-full max-w-5xl">
            {/* Base Glass Backdrop */}
            <div className="absolute inset-0 z-0  bg-[#0A0A0A]/40 shadow-2xl backdrop-blur-2xl" />

            {/* Ambient Noise and Inner Glow */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden ">
              <div className="from-primary/10 to-primary/10 absolute inset-0 bg-gradient-to-r via-transparent opacity-30" />
              <div className="absolute inset-0 bg-[url('/textures/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Static Border (Visible when light is not passing) */}
            <div className="pointer-events-none absolute inset-0 z-10  border border-white/5" />

            {/* The Animated AI Studio Edge Light (Masked specifically to the border) */}
            <div
              className="pointer-events-none absolute inset-[-1px] z-20 overflow-hidden -[17px]"
              style={{
                padding: '1.5px', // Defines the thickness of the glow border
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            >
              <motion.div
                className="absolute top-1/2 left-1/2 h-[2000px] w-[2000px] origin-center -translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 75%, rgba(212,175,55,0.2) 85%, rgba(252,221,115,1) 100%)',
                }}
              />
            </div>

            {/* Form Content (Unmasked to allow autocomplete dropdown overflow) */}
            <div className="relative z-30 overflow-visible p-6 md:p-8">
              <form
                aria-label="Generate your birth chart K-Line"
                data-testid="hero-kline-form"
                className="grid grid-cols-1 items-end gap-4 overflow-visible md:grid-cols-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (
                    form.elements.namedItem('name') as HTMLInputElement
                  )?.value;
                  const dob = (
                    form.elements.namedItem('dob') as HTMLInputElement
                  )?.value;
                  const time = (
                    form.elements.namedItem('time') as HTMLInputElement
                  )?.value;

                  if (
                    name &&
                    dob &&
                    location &&
                    coordinates.lat !== null &&
                    coordinates.lon !== null
                  ) {
                    persistBirthData({
                      name,
                      gender: '',
                      date: dob,
                      timeSlot: toTimeSlot(time),
                      location,
                      lat: coordinates.lat,
                      lon: coordinates.lon,
                    });
                  }

                  if (!session) {
                    router.push(
                      `/sign-in?callbackUrl=${encodeURIComponent('/kline')}`
                    );
                  } else {
                    router.push('/kline');
                  }
                }}
              >
                <div className="space-y-2 text-left md:col-span-1">
                  <Label
                    htmlFor="name"
                    className="text-muted-foreground ml-1 font-mono text-xs"
                  >
                    Name
                  </Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      autoComplete="given-name"
                      aria-label="Your first name"
                      data-testid="hero-input-name"
                      placeholder="E.g. Elon"
                      className="focus-visible:ring-primary/50 h-11  border-white/10 bg-black/50 pl-9 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left md:col-span-1">
                  <Label
                    htmlFor="dob"
                    className="text-muted-foreground ml-1 font-mono text-xs"
                  >
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      autoComplete="bday"
                      aria-label="Date of birth"
                      data-testid="hero-input-dob"
                      className="focus-visible:ring-primary/50 h-11  border-white/10 bg-black/50 pl-9 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:filter"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left md:col-span-1">
                  <Label
                    htmlFor="time"
                    className="text-muted-foreground ml-1 font-mono text-xs"
                  >
                    Time (Optional)
                  </Label>
                  <div className="relative">
                    <Clock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      aria-label="Birth time, optional"
                      data-testid="hero-input-time"
                      className="focus-visible:ring-primary/50 h-11  border-white/10 bg-black/50 pl-9 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:filter"
                    />
                  </div>
                </div>

                <div className="relative space-y-2 text-left md:col-span-1">
                  <Label
                    htmlFor="location"
                    className="text-muted-foreground ml-1 font-mono text-xs"
                  >
                    City of Birth
                  </Label>
                  <div className="relative">
                    <LocationAutocomplete
                      value={location}
                      onChange={(displayName, lat, lon) => {
                        setLocation(displayName);
                        setCoordinates({ lat, lon });
                      }}
                    />
                  </div>
                </div>

                <div className="h-[44px] md:col-span-1">
                  <Button
                    type="submit"
                    data-testid="hero-submit-kline"
                    data-ai-action="generate-kline"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full  px-4 font-bold whitespace-nowrap shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:shadow-[0_0_30px_-5px_var(--primary)]"
                  >
                    Generate My K-Line
                    <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
