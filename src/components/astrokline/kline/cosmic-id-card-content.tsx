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

function ElementBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-[9px] font-bold uppercase text-white/40">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden bg-white/5">
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-7 text-right font-mono text-[9px] text-white/30">{value}%</span>
    </div>
  );
}

export function CosmicIdCardContent({ profile, klineData, cardRef }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const tagline = `${profile.sun.sign} Sun · ${profile.moon.sign} Moon · ${profile.rising.sign} Rising`;
  const dominantElement = Object.entries(profile.elements).sort((a, b) => b[1] - a[1])[0];
  const currentYear = new Date().getFullYear();
  const currentScore = klineData.find((d) => d.year === currentYear)?.score ?? profile.overallAverageScore;

  useEffect(() => {
    if (qrRef.current) drawQRCode(qrRef.current, 'https://astrokline.com/kline', 64, '#D4AF37');
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0A0A14] via-[#0D0B18] to-[#0A0A14] p-5 shadow-[0_0_60px_rgba(212,175,55,0.05)]"
      style={{ width: '380px' }}
    >
      {/* Dot pattern bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
      />

      {/* Header: Logo + Brand */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AstroKline" className="h-6 w-6" />
          <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">Cosmic ID</span>
        </div>
        <span className="font-mono text-[8px] tracking-wider text-white/20 uppercase">AstroKline</span>
      </div>

      {/* Name & Tagline */}
      <div className="relative z-10 mb-4">
        <h3 className="font-serif text-xl font-bold text-white/95">{profile.name || 'Unknown Voyager'}</h3>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-[#D4AF37]/70">{tagline}</p>
      </div>

      {/* Big Three */}
      <div className="relative z-10 mb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'SUN', sign: profile.sun.sign, glyph: '☉', color: 'text-amber-400' },
          { label: 'MOON', sign: profile.moon.sign, glyph: '☽', color: 'text-blue-300' },
          { label: 'RISING', sign: profile.rising.sign, glyph: '↑', color: 'text-purple-400' },
        ].map((item) => (
          <div key={item.label} className="border border-white/5 bg-white/[0.02] p-2 text-center">
            <span className={`text-base ${item.color}`}>{item.glyph}</span>
            <p className="mt-0.5 text-[11px] font-bold text-white/90">{item.sign}</p>
            <p className="font-mono text-[7px] tracking-widest text-white/30 uppercase">{item.label}</p>
          </div>
        ))}
      </div>

      {/* K-Line Sparkline */}
      <div className="relative z-10 mb-4 border border-white/5 bg-white/[0.01] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-white/30 uppercase">100-Year K-Line</span>
          <span className="font-mono text-[10px] font-bold text-[#D4AF37]">{currentScore}</span>
        </div>
        <KlineSparkline data={klineData} width={340} height={50} />
      </div>

      {/* Elements */}
      <div className="relative z-10 mb-3 space-y-1">
        <ElementBar label="🔥" value={profile.elements.fire} color="#ef4444" />
        <ElementBar label="🌍" value={profile.elements.earth} color="#a3e635" />
        <ElementBar label="💨" value={profile.elements.air} color="#38bdf8" />
        <ElementBar label="💧" value={profile.elements.water} color="#818cf8" />
      </div>

      {/* Footer: Dominant + QR */}
      <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-3">
        <div>
          <p className="font-mono text-[7px] tracking-widest text-white/30 uppercase">Dominant</p>
          <p className="text-xs font-bold capitalize text-white/80">{dominantElement[0]} ({dominantElement[1]}%)</p>
          <p className="mt-1 font-mono text-[7px] tracking-widest text-white/30 uppercase">Born</p>
          <p className="text-xs font-bold text-white/80">{profile.birthDate}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <canvas ref={qrRef} className="h-14 w-14" />
          <span className="font-mono text-[6px] tracking-wider text-white/20 uppercase">Scan to try</span>
        </div>
      </div>

      {/* Watermark */}
      <div className="relative z-10 mt-3 border-t border-white/5 pt-2 text-center">
        <p className="font-mono text-[7px] tracking-[0.3em] text-white/15 uppercase">astrokline.com — see your next 100 years</p>
      </div>
    </div>
  );
}
