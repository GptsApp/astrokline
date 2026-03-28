'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3 } from 'lucide-react';

import dynamic from 'next/dynamic';

const InteractiveChart = dynamic(
  () => import('@/components/astrokline/kline/interactive-chart').then(m => m.InteractiveChart),
  { ssr: false, loading: () => <div className="h-[400px] w-full bg-foreground/5" /> }
);
import { MOCK_KLINE_DATA, MOCK_TRANSIT_DETAILS } from '@/lib/astrokline/mock-astrology-data';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { Heading } from '@/components/astrokline/ui/heading';

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
        'py-24 md:py-32 relative bg-background border-t border-foreground/10',
        section.className,
        className
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 flex flex-col items-center">
        
        {/* Minimal Header */}
        <div className="text-center mb-12 space-y-5">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-widest text-primary font-mono">
            <span className="h-px w-8 bg-primary"></span>
            <span>Live Preview</span>
            <span className="h-px w-8 bg-primary"></span>
          </div>
          
          <Heading level={2} variant="section" className="text-4xl md:text-5xl leading-[1.1]">
            {section.title || 'Your 100-Year Timing Curve.'}
          </Heading>
        </div>

        {/* Full-Width Chart — the hero of this section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.19, 1.0, 0.22, 1.0] }}
          className="w-full bg-card border border-foreground/5 p-4 sm:p-6"
        >
          <div className="pointer-events-auto min-h-[550px]">
            <InteractiveChart
              data={MOCK_KLINE_DATA}
              transitDetails={MOCK_TRANSIT_DETAILS}
              onNodeClick={(year) => setSelectedYear(year)}
              selectedYear={selectedYear}
              birthYear={1990}
              tier="PRO"
              isSimulation={true}
            />
          </div>
        </motion.div>

        {/* Single CTA */}
        <a href="#pricing" className="mt-8 text-primary hover:text-foreground transition-colors inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider relative group">
          Unlock the Live Engine
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
        </a>

      </div>
    </section>
  );
}
