'use client';

import { FAQ } from '@/components/astrokline/sections/faq';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroFaq({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn(section.className, className)}>
      <FAQ />
    </div>
  );
}
