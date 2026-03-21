'use client';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { Pricing as ThemePricing } from './pricing';

export function AstroPricing({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn('astro-starfield', section.className, className)}>
      <ThemePricing section={section as any} />
    </div>
  );
}
