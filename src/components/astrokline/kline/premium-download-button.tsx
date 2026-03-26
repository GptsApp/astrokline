'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

// Dynamically import PDFDownloadLink to prevent SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <DownloadLoadingButton /> }
);

// We need to also dynamically import the document if it contains PDF components
// But passing the component directly works since PDFDownloadLink handles it inside.
import { PremiumPDFDocument } from './premium-pdf-document';

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
      className="relative group w-full sm:w-auto"
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/40 to-[#D4AF37]/0 opacity-30 blur-md transition-all duration-700 group-hover:opacity-70 group-hover:duration-200" />
      
      <PDFDownloadLink
        document={<PremiumPDFDocument profile={profile} klineData={klineData} transitDetails={transitDetails} />}
        fileName={`AstroKline_Deep_Report_${profile.name || 'User'}.pdf`}
        className="relative flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#1A1713] to-[#0A0A0F] px-8 text-sm font-bold text-[#F4E1A1] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/30 transition-all hover:ring-[#D4AF37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]"
      >
        {({ blob, url, loading, error }) => (
          loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
              RENDERING 25-PAGE REPORT...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              UNLOCK PDF FULL REPORT ($19.99 VALUE)
              <Download className="ml-1 h-4 w-4 opacity-70" />
            </>
          )
        )}
      </PDFDownloadLink>
    </motion.div>
  );
}
