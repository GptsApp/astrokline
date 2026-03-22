'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sparkles } from 'lucide-react';

import { InteractiveChart } from '@/components/astrokline/kline/interactive-chart';
import { MOCK_KLINE_DATA, MOCK_TRANSIT_DETAILS } from '@/lib/astrokline/mock-astrology-data';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroKlinePreview({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  return (
    <section
      id={section.id || 'kline-preview'}
      className={cn(
        'py-24 relative border-y border-foreground/5',
        section.className,
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>{section.label || 'Interactive Destiny Tracker'}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {section.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {section.description}
          </p>
        </div>

        {/* Professional Chart Simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl rounded-2xl md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden group pb-8 bg-transparent"
        >
          <div className="pointer-events-auto">
            <InteractiveChart
              data={MOCK_KLINE_DATA}
              transitDetails={MOCK_TRANSIT_DETAILS}
              onNodeClick={(year) => setSelectedYear(year)}
              selectedYear={selectedYear}
              birthYear={1990}
              tier="GUEST"
            />
          </div>

          {/* Blurred Future Zone Overlay */}
          <div className="absolute top-14 bottom-10 right-0 w-[25%] z-30 pointer-events-none">
            <div className="absolute inset-0 backdrop-blur-[6px] bg-gradient-to-l from-background/80 via-background/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <a
                href="#pricing"
                className="px-4 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-primary/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all whitespace-nowrap"
              >
                Unlock Future
              </a>
            </div>
          </div>
        </motion.div>

        {/* Below-chart CTA */}
        <p className="text-center text-sm text-muted-foreground/50 font-mono mt-6">
          Your past is validated. <a href="#pricing" className="text-primary font-semibold hover:underline">Unlock your future K-Line →</a>
        </p>
      </div>
    </section>
  );
}
