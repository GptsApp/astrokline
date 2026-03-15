'use client';

import { CTA } from '@/components/astrokline/sections/cta';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroCta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn(section.className, className)}>
      <CTA />
    </div>
  );
}
