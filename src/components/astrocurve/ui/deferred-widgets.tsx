'use client';

import dynamic from 'next/dynamic';

const MobileStickyCta = dynamic(
  () => import('@/components/astrocurve/ui/mobile-sticky-cta').then(m => ({ default: m.MobileStickyCta })),
  { ssr: false }
);

export function DeferredWidgets() {
  return (
    <>
      <MobileStickyCta />
    </>
  );
}
