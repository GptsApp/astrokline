'use client';

import { useEffect, useRef } from 'react';
import type { UserProfile, DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';
import { drawQRCode } from '@/lib/astrokline/qrcode';
import { KlineSparkline } from './kline-sparkline';

interface Props {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

/** Deterministic percentile from a score (looks real but is cosmetic) */
function scoreToPercentile(score: number): number {
  if (score >= 90) return 97 + (score % 3);
  if (score >= 80) return 85 + Math.floor((score - 80) * 1.2);
  if (score >= 65) return 60 + Math.floor((score - 65) * 1.5);
  return 30 + Math.floor(score * 0.4);
}

function RankBadge({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = scoreToPercentile(score);
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] font-bold text-white/90">{score}</span>
        <span className="font-mono text-[9px] text-white/30">·</span>
        <span className="font-mono text-[9px] font-bold" style={{ color }}>Top {100 - pct}%</span>
      </div>
    </div>
  );
}

export function CosmicIdCardContent({ profile, klineData, cardRef }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const tagline = `${profile.sun.sign} ☉ · ${profile.moon.sign} ☽ · ${profile.rising.sign} ↑`;

  // Cosmic Power Score = overall average
  const powerScore = profile.overallAverageScore || 84;
  const topPct = 100 - scoreToPercentile(powerScore);
  const currentYear = new Date().getFullYear();
  const peakScore = Math.max(...klineData.map(d => d.score));
  const peakYear = klineData.find(d => d.score === peakScore)?.year ?? currentYear;

  // Dimension scores from profile elements (simulate from data)
  const dims = [
    { label: 'Career', score: Math.min(99, powerScore + 8), color: '#D4AF37' },
    { label: 'Wealth', score: Math.min(99, powerScore + 3), color: '#22c55e' },
    { label: 'Love', score: Math.max(40, powerScore - 5), color: '#f43f5e' },
    { label: 'Health', score: Math.max(45, powerScore - 2), color: '#38bdf8' },
  ];

  useEffect(() => {
    if (qrRef.current) drawQRCode(qrRef.current, 'https://astrokline.com/kline', 56, '#D4AF37');
  }, []);

  return (
    <div
      ref={cardRef}
      data-cosmic-card
      className="relative overflow-hidden border border-[#D4AF37]/20 bg-[#08080F] shadow-[0_0_80px_rgba(212,175,55,0.08)]"
      style={{ width: '380px' }}
    >
      {/* Glow effect top */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-60 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[60px]" />
      {/* Dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AstroKline" className="h-5 w-5" />
          <span className="font-mono text-[8px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Cosmic ID</span>
        </div>
        <span className="font-mono text-[7px] tracking-wider text-white/15 uppercase">AstroKline.com</span>
      </div>

      {/* Cosmic Power Score — THE BIG NUMBER */}
      <div className="relative z-10 px-5 pt-6 pb-4 text-center">
        <p className="mb-1 font-mono text-[8px] font-bold tracking-[0.4em] text-white/30 uppercase">Cosmic Power Score</p>
        <div className="relative inline-block">
          <span className="font-serif text-6xl font-bold text-[#D4AF37]" style={{ textShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
            {powerScore}
          </span>
        </div>
        <div className="mt-1.5 inline-flex items-center gap-1.5 border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-1">
          <span className="font-mono text-[10px] font-bold text-[#D4AF37]">★ Top {topPct}%</span>
          <span className="font-mono text-[9px] text-white/30">of all cosmic charts</span>
        </div>
      </div>

      {/* Identity Row — privacy-safe */}
      <div className="relative z-10 mx-5 flex items-center justify-between border-t border-white/5 py-3">
        <div>
          <p className="text-sm font-bold text-white/90">{(profile.name || 'Voyager').charAt(0).toUpperCase()}***</p>
          <p className="font-mono text-[9px] tracking-wide text-[#D4AF37]/60">{tagline}</p>
        </div>
        <span className="font-mono text-[9px] text-white/20">{profile.sun.sign} Season</span>
      </div>

      {/* K-Line Sparkline */}
      <div className="relative z-10 mx-5 border border-white/5 bg-white/[0.01] p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[7px] font-bold tracking-[0.2em] text-white/25 uppercase">100-Year Destiny Curve</span>
          <span className="font-mono text-[9px] text-white/40">Peak <span className="font-bold text-[#D4AF37]">{peakScore}</span> · {peakYear}</span>
        </div>
        <KlineSparkline data={klineData} width={340} height={45} />
      </div>

      {/* Dimension Rankings — the viral hook */}
      <div className="relative z-10 mx-5 mt-3 space-y-0.5">
        {dims.map(d => <RankBadge key={d.label} {...d} />)}
      </div>

      {/* Footer: QR + brand */}
      <div className="relative z-10 mx-5 mt-3 flex items-end justify-between border-t border-white/5 pt-3 pb-4">
        <div>
          <p className="font-mono text-[7px] tracking-[0.3em] text-white/15 uppercase">Discover your cosmic power</p>
          <p className="mt-0.5 font-mono text-[8px] font-bold tracking-wider text-[#D4AF37]/40">astrokline.com/kline</p>
        </div>
        <canvas ref={qrRef} className="h-12 w-12 opacity-70" />
      </div>
    </div>
  );
}
