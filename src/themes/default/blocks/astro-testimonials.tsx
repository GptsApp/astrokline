'use client';

import { Testimonials } from '@/components/astrokline/sections/testimonials';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function AstroTestimonials({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div className={cn(section.className, className)}>
      <Testimonials />
    </div>
  );
}
