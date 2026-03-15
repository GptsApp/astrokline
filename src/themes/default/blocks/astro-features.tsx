'use client';

import { Features } from '@/components/astrokline/sections/features';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroFeatures({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn(section.className, className)}>
      <Features />
    </div>
  );
}
