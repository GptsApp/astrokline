'use client';

import dynamic from 'next/dynamic';

const Features = dynamic(
  () => import('@/components/astrokline/sections/features').then(m => m.Features)
);
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
