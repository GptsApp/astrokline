'use client';

import { Pricing } from '@/components/astrokline/sections/pricing';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroPricing({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn('astro-starfield', section.className, className)}>
      <Pricing />
    </div>
  );
}
