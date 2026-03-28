'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

const PDFDownloadLinkDynamic = dynamic(
  () => import('./pdf-download-link'),
  { ssr: false, loading: () => <DownloadLoadingButton /> }
);

function DownloadLoadingButton() {
  return (
    <Button disabled className="w-full sm:w-auto h-14  bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Preparing PDF Engine...
    </Button>
  );
}

interface PremiumDownloadButtonProps {
  profile: UserProfile;
  klineData?: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
  tier?: string;
  onUpgradeClick?: () => void;
}

export function PremiumDownloadButton({ profile, klineData, transitDetails, tier = 'free', onUpgradeClick }: PremiumDownloadButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <DownloadLoadingButton />;

  if (tier !== 'PRO' && tier !== 'premium' && tier !== 'PREMIUM') {
    return (
      <Button 
        onClick={onUpgradeClick}
        className="flex h-14 w-full sm:w-auto items-center justify-center gap-2  bg-[#D4AF37] px-8 text-sm font-bold text-black transition-all hover:bg-[#F5EBBA]"
      >
        <Sparkles className="h-4 w-4" />
        UNLOCK 5-YEAR MASTER PLAN ($19.99 VALUE)
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="group relative w-full sm:w-auto"
    >
      <div className="absolute -inset-1  bg-[#D4AF37]/20 blur-md transition-all duration-700 opacity-0 group-hover:opacity-100" />
      <PDFDownloadLinkDynamic profile={profile} klineData={klineData} transitDetails={transitDetails} />
    </motion.div>
  );
}
