'use client';

import { MethodologyBadge } from '@/components/astrokline/sections/methodology-badge';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroMethodology({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn(section.className, className)}>
      <MethodologyBadge />
    </div>
  );
}
