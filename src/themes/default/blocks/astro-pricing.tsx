'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const ThemePricing = dynamic(
  () => import('./pricing').then(m => ({ default: m.Pricing })),
  { ssr: false, loading: () => <div className="min-h-[500px]" /> }
);

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
