'use client';

import dynamic from 'next/dynamic';

const Testimonials = dynamic(
  () => import('@/components/astrokline/sections/testimonials').then(m => m.Testimonials)
);
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
