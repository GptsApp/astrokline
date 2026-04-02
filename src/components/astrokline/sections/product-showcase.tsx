'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  TrendingUp,
  Activity,
  Users,
  Sparkles,
} from 'lucide-react';
import { Heading } from '@/components/astrokline/ui/heading';
import {
  ProductShowcaseCard,
  type ProductFeature,
} from './product-showcase-card';

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
      'Vedic Panchang integration — Nakshatra, Tithi & Tara Bala',
      'Peak / Neutral / Low hour windows for optimal timing',
    ],
    image: '/images/landing-daily-horoscope.png',
    cta: 'See Today\'s Guidance →',
    ctaHref: '#pricing',
  },
  {
    icon: Activity,
    iconColor: 'text-[#D4AF37]',
    iconBg: 'bg-[#D4AF37]/10',
    label: 'Astro K-Line',
    title: 'Your Entire Life,\nOne Strategic Curve.',
    description:
      'We map 100 years of planetary transits against your birth chart and render it as a K-Line — the same visual language used in financial markets. See your peak decades, challenging years, and optimal action windows at a glance.',
    benefits: [
      '100-year timeline with candlestick-style visualization',
      'AI-powered narrative for every major transit period',
      'Exportable PDF dossier with deep personality analysis',
    ],
    image: '/images/landing-kline-chart.png',
    cta: 'Generate My K-Line — Free',
    ctaHref: '#pricing',
    reversed: true,
  },
  {
    icon: TrendingUp,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
    label: 'Energy Forecast',
    title: 'Plan Your Year\nMonth by Month.',
    description:
      'See how each month of the year scores based on your personal planetary transits. Expand any month to reveal the ruling planet, theme, and strategic insight — so you know when to push and when to pause.',
    benefits: [
      '12-month energy timeline with animated score bars',
      'Ruling planet + thematic insight for each month',
      'Free users see 3 months; upgrade unlocks the full year',
    ],
    image: '/images/landing-energy-forecast.png',
    cta: 'View Energy Timeline',
    ctaHref: '#pricing',
  },
  {
    icon: Users,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-400/10',
    label: 'Compatibility',
    title: 'Decode Any\nRelationship.',
    description:
      'Enter a partner\'s birth data and our synastry engine compares planetary aspects across both charts. Get a multi-dimensional score covering romance, communication, shared values, and tension points.',
    benefits: [
      'Real synastry analysis — not generic sign matching',
      'Four-dimension breakdown with narrative insights',
      'Works for romantic, business, or any partnership',
    ],
    image: '/images/landing-compatibility-check.png',
    cta: 'Check Compatibility',
    ctaHref: '#pricing',
    reversed: true,
  },
];

export function ProductShowcase() {
  return (
    <section
      id="features"
      aria-labelledby="product-showcase-heading"
      className="relative overflow-hidden bg-[#050505] py-28 md:py-36"
    >
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section Header */}
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
            id="product-showcase-heading"
            className="mb-6 text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl"
          >
            Everything You Need to{' '}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#FCDD73] to-[#8B7321] bg-clip-text text-transparent">
              Master Your Timeline.
            </span>
          </Heading>
          <p className="mx-auto max-w-2xl text-base text-white/50 leading-relaxed md:text-lg">
            Four powerful tools, one unified dashboard. Each backed by
            real planetary data and professional-grade astronomical
            calculations.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="space-y-24 md:space-y-36">
          {FEATURES.map((feature, i) => (
            <ProductShowcaseCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
