'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { PremiumPDFDocument } from './premium-pdf-document';
import type { UserProfile, DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

interface PDFDownloadLinkProps {
  profile: UserProfile;
  klineData?: DestinyScorePoint[];
  transitDetails?: Record<number, TransitEvent[]>;
}

export default function MyPDFDownloadLink({ profile, klineData, transitDetails }: PDFDownloadLinkProps) {
  return (
    <PDFDownloadLink
      document={<PremiumPDFDocument profile={profile} klineData={klineData} transitDetails={transitDetails} />}
      fileName={`AstroKline_Deep_Report_${profile.name || 'User'}.pdf`}
      className="relative flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#1A1713] to-[#0A0A0F] px-8 text-sm font-bold text-[#F4E1A1] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/30 transition-all hover:ring-[#D4AF37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]"
    >
      {/* react-pdf's children function provides the loading state of the blob */}
      {({ blob, url, loading, error }) => (
        loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
            RENDERING PDF MASTER PLAN...
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
  );
}
