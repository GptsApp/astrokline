'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const FAQ = dynamic(
  () => import('@/components/astrokline/sections/faq').then(m => ({ default: m.FAQ })),
  { ssr: false, loading: () => <div className="min-h-[300px]" /> }
);

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
