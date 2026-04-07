'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const CTA = dynamic(
  () => import('@/components/astrokline/sections/cta').then(m => ({ default: m.CTA })),
  { ssr: false, loading: () => <div className="min-h-[200px]" /> }
);

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
