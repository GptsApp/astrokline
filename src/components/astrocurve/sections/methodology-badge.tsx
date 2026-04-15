'use client';

import { Heading } from "@/components/astrocurve/ui/heading";

import { motion } from 'framer-motion';
import {
  Clock,
  Compass,
  Database,
  LayoutGrid,
  MapPin,
  Target,
} from 'lucide-react';

const methodItems = [
  {
    icon: Database,
    label: 'Swiss Ephemeris',
    detail: 'Arcsecond-precision planetary positions (DE431)',
  },
  {
    icon: Compass,
    label: 'Tropical Zodiac',
    detail: 'Western standard, season-aligned system',
  },
  {
    icon: LayoutGrid,
    label: 'Placidus Houses',
    detail: 'Most widely adopted house system globally',
  },
  {
    icon: Target,
    label: 'Applying / Separating',
    detail: 'Full aspect phase distinction with configurable orbs',
  },
  {
    icon: Clock,
    label: 'DST-Aware',
    detail: 'Full historical timezone & daylight saving support',
  },
  {
    icon: MapPin,
    label: 'GPS-Precise',
    detail: 'Geocentric calculation with exact birth coordinates',
  },
];

export function MethodologyBadge() {
  return (
    <section
      id="methodology"
      className="bg-background relative overflow-hidden py-20"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-primary/70 mb-3 font-mono text-xs tracking-[0.3em] uppercase">
            Built on Real Astronomy
          </p>
          <Heading level={2} variant="section" className="mb-3">
            Trusted{' '}
            <span className="text-primary italic font-light">Methodology.</span>
          </Heading>
          <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed">
            AstroCurve uses the same astronomical precision trusted by
            astrologers worldwide. Every calculation is transparent, exact,
            and verifiable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
        >
          {methodItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="group hover:border-primary/20 relative  border border-white/5 bg-[#15131A] p-5 transition-all duration-300"
            >
              <div className="from-primary/5 absolute inset-0  bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="bg-primary/10 border-primary/20 flex h-9 w-9 items-center justify-center  border">
                  <item.icon className="text-primary h-4 w-4" />
                </div>
                <div>
                  <Heading level={3} className="mb-1 text-white/90">
                    {item.label}
                  </Heading>
                  <p className="text-[11px] leading-relaxed text-white/40">
                    {item.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand Stance Statement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 mx-auto max-w-2xl  border border-white/5 bg-white/[0.02] p-6 text-center"
        >
          <p className="text-sm leading-relaxed text-white/50 italic">
            &quot;We don&apos;t manufacture fortune anxiety. We don&apos;t tell you Mercury retrograde
            will ruin your week. We show you the actual geometry of your chart —
            and let you decide what it means for your life.&quot;
          </p>
          <p className="mt-3 font-mono text-[10px] tracking-widest text-primary/40 uppercase">
            The AstroCurve Philosophy
          </p>
        </motion.div>

        {/* Authority Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 space-y-6 text-center"
        >
          <p className="font-mono text-xs tracking-wider text-white/20">
            Aligned with OPA & ISAR professional standards
          </p>
          <a
            href="#pricing"
            className="text-foreground hover:border-primary/20 inline-flex items-center gap-2  border border-white/[0.08] bg-white/[0.06] px-6 py-2.5 text-sm font-medium transition-all hover:bg-white/[0.12]"
          >
            See our precision in action →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
