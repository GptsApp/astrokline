'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import { Heading } from '@/components/astrokline/ui/heading';
import {
  ProductShowcaseCard,
  type ProductFeature,
} from './product-showcase-card';
import { DailyMockup } from './mockups/daily-mockup';

import { EnergyMockup } from './mockups/energy-mockup';
import { CompatibilityMockup } from './mockups/compatibility-mockup';

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
  return (
    <section
      id="features"
      aria-labelledby="product-showcase-heading"
      className="relative overflow-hidden bg-[#050505] py-28 md:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center md:mb-28"
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

        <div className="space-y-24 md:space-y-36">
          {FEATURES.map((feature, i) => (
            <ProductShowcaseCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
