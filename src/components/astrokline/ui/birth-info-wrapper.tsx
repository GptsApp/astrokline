"use client";

import { ReactNode } from "react";
import { BirthInfoProvider } from "@/components/astrokline/ui/birth-info-context";
import { BirthInfoModal } from "@/components/astrokline/ui/birth-info-modal";

export function BirthInfoWrapper({ children }: { children: ReactNode }) {
  return (
    <BirthInfoProvider>
      {children}
      <BirthInfoModal />
    </BirthInfoProvider>
  );
}
