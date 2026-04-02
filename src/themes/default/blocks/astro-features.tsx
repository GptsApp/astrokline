'use client';

import dynamic from 'next/dynamic';

const ProductShowcase = dynamic(
  () => import('@/components/astrokline/sections/product-showcase').then(m => m.ProductShowcase)
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
      <ProductShowcase />
    </div>
  );
}
