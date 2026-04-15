'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import { Heading } from '@/components/astrocurve/ui/heading';
import { cn } from '@/shared/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { DailyMockup } from './mockups/daily-mockup';

import { EnergyMockup } from './mockups/energy-mockup';
import { CompatibilityMockup } from './mockups/compatibility-mockup';

interface ProductFeature {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  title: string;
  description: string;
  benefits: string[];
  mockup: ReactNode;
  cta: string;
  ctaHref: string;
  reversed?: boolean;
}

const FEATURES: ProductFeature[] = [
  {
    icon: CalendarDays,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10',
    label: 'Daily Guidance',
    title: 'Know Exactly What\nEach Day Holds.',
    description:
      'Get a personalized daily energy score based on real planetary transits through your natal chart. See what to do, what to avoid, and when your peak hours arrive.',
    benefits: [
      'Daily energy score with actionable Do / Don\'t lists',
      'Ancient Vedic timing wisdom — daily lunar guidance',
      'Peak / Neutral / Low hour windows for optimal timing',
    ],
    mockup: <DailyMockup />,
    cta: 'See Today\'s Guidance →',
    ctaHref: '#pricing',
  },

  {
    icon: TrendingUp,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
    label: 'Energy Forecast',
    title: 'Plan Your Year\nMonth by Month.',
    description:
      'See how each month of the year scores based on your personal planetary transits. Expand any month to reveal the ruling planet, theme, and personal insight — so you know when to push and when to pause.',
    benefits: [
      '12-month energy timeline with animated score bars',
      'Ruling planet + thematic insight for each month',
      'Free users see 3 months; upgrade unlocks the full year',
    ],
    mockup: <EnergyMockup />,
    cta: 'View Energy Timeline',
    ctaHref: '#pricing',
    reversed: true,
  },
  {
    icon: Users,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-400/10',
    label: 'Compatibility',
    title: 'Decode Any\nRelationship.',
    description:
      'Enter a partner\'s birth data and we compare planetary aspects across both charts. Get a multi-dimensional score covering romance, communication, shared values, and tension points.',
    benefits: [
      'Real birth chart comparison — not generic zodiac matching',
      'Four-dimension breakdown with narrative insights',
      'Works for romantic, business, or any partnership',
    ],
    mockup: <CompatibilityMockup />,
    cta: 'Check Compatibility',
    ctaHref: '#pricing',
  },
];

export function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % FEATURES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const feature = FEATURES[active];
  const Icon = feature.icon;

  return (
    <section
      id="features"
      aria-labelledby="product-showcase-heading"
      className="relative overflow-hidden bg-background py-24 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center md:mb-20"
        >
          <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>What You Get</span>
          </div>
          <Heading
            level={2}
            variant="section"
            id="product-showcase-heading"
            className="mb-6"
          >
            Everything You Need to{' '}
            <br className="hidden md:block" />
            <span className="text-primary italic font-light">
              Master Your Timeline.
            </span>
          </Heading>
          <p className="mx-auto max-w-2xl text-base text-white/50 leading-relaxed md:text-lg">
            Three essential insights to help you navigate
            love, timing, and self-discovery.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative h-[480px] md:h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute inset-0 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 items-center"
            >
              {/* Mockup */}
              <div className="relative max-h-[320px] overflow-hidden">
                <div className={cn('absolute -inset-4 blur-3xl opacity-15 pointer-events-none', feature.iconBg)} />
                <div className="relative">{feature.mockup}</div>
              </div>
              {/* Text */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center border', feature.iconBg, feature.iconColor.replace('text-', 'border-') + '/30')}>
                    <Icon className={cn('h-5 w-5', feature.iconColor)} />
                  </div>
                  <span className={cn('text-[10px] font-mono uppercase tracking-[0.2em]', feature.iconColor)}>{feature.label}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-[1.15] whitespace-pre-line">{feature.title}</h3>
                <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md">{feature.description}</p>
                <ul className="space-y-2.5">
                  {feature.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0', feature.iconColor.replace('text-', 'bg-'))} />
                      {b}
                    </li>
                  ))}
                </ul>
                <a href={feature.ctaHref} className={cn('inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] mt-1', feature.iconColor)}>
                  {feature.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="mt-10 flex justify-center gap-3">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-3 min-h-[24px] min-w-[24px] rounded-full transition-all duration-300',
                active === i ? 'w-8 bg-primary' : 'w-3 bg-white/20 hover:bg-white/30'
              )}
              aria-label={`Feature ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
