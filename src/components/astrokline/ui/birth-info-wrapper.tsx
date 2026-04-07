'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { BirthInfoProvider } from '@/components/astrokline/ui/birth-info-context';

const BirthInfoModal = dynamic(
  () => import('@/components/astrokline/ui/birth-info-modal').then(m => ({ default: m.BirthInfoModal })),
  { ssr: false }
);

export function BirthInfoWrapper({ children }: { children: ReactNode }) {
  return (
    <BirthInfoProvider>
      {children}
      <BirthInfoModal />
    </BirthInfoProvider>
  );
}
