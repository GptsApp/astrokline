'use client';

import { useState } from 'react';
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
          
          <Heading level={2} variant="section">
            {section.title || 'Your Life Timeline — 100 Years at a Glance.'}
          </Heading>
        </div>

        {/* Full-Width Chart */}
        <div
          className="w-full bg-card border border-foreground/5 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
          style={{ animationDelay: '200ms' }}
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
        </div>

        {/* Single CTA */}
        <a href="#pricing" className="mt-8 text-primary hover:text-foreground transition-colors inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider relative group">
          See My Full Timeline →
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
        </a>

      </div>
    </section>
  );
}
