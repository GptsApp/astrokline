'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

const PDFDownloadLinkDynamic = dynamic(
  () => import('./pdf-download-link'),
  { ssr: false, loading: () => <DownloadLoadingButton /> }
);

function DownloadLoadingButton() {
  return (
    <Button disabled className="w-full sm:w-auto h-14 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Preparing PDF Engine...
    </Button>
  );
}

interface PremiumDownloadButtonProps {
  profile: UserProfile;
  klineData?: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
}

export function PremiumDownloadButton({ profile, klineData, transitDetails }: PremiumDownloadButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <DownloadLoadingButton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="group relative w-full sm:w-auto"
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/40 to-[#D4AF37]/0 opacity-30 blur-md transition-all duration-700 group-hover:opacity-70 group-hover:duration-200" />
      <PDFDownloadLinkDynamic profile={profile} klineData={klineData} transitDetails={transitDetails} />
    </motion.div>
  );
}
