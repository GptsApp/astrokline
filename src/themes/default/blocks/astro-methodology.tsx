'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const MethodologyBadge = dynamic(
  () => import('@/components/astrocurve/sections/methodology-badge').then(m => ({ default: m.MethodologyBadge })),
  { ssr: false, loading: () => <div className="min-h-[400px]" /> }
);

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
