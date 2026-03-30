'use client';

import { useCallback, useRef, useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Download, Share2, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  profile: UserProfile;
}

function ElementBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden bg-white/5">
        <div className="h-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-7 text-right font-mono text-[9px] text-white/30">{value}%</span>
    </div>
  );
}

export function CosmicIdCard({ profile }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const dominantElement = Object.entries(profile.elements).sort((a, b) => b[1] - a[1])[0];
  const ruling = profile.planets?.find(p => p.name === 'Sun');

  // Generate a cosmic tagline from the big three
  const tagline = `${profile.sun.sign} Sun · ${profile.moon.sign} Moon · ${profile.rising.sign} Rising`;

  const handleExportImage = useCallback(async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      // Use browser print as fallback - prompt user to screenshot
      const text = `✨ ${profile.name || 'My'} Cosmic ID\n☉ ${profile.sun.sign} Sun\n☽ ${profile.moon.sign} Moon\n↑ ${profile.rising.sign} Rising\n\n🔥 Fire ${profile.elements.fire}% · 🌍 Earth ${profile.elements.earth}%\n💨 Air ${profile.elements.air}% · 💧 Water ${profile.elements.water}%\n\nDiscover yours → astrokline.com/kline`;
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, profile]);

  const handleShare = useCallback(async () => {
    const text = `✨ My Cosmic ID: ${profile.sun.sign} ☉ · ${profile.moon.sign} ☽ · ${profile.rising.sign} ↑\nDiscover yours at astrokline.com`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Cosmic ID', text, url: 'https://astrokline.com/kline' });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }, [profile]);

  return (
    <div className="mx-auto w-full max-w-md">
      {/* ── The Card ── */}
      <div
        ref={cardRef}
        className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0A0A14] via-[#0D0B18] to-[#0A0A14] p-6 shadow-[0_0_60px_rgba(212,175,55,0.05)]"
      >
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Header */}
        <div className="relative z-10 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
              Cosmic ID
            </span>
          </div>
          <span className="font-mono text-[8px] tracking-wider text-white/20 uppercase">
            AstroKline
          </span>
        </div>

        {/* Name & Tagline */}
        <div className="relative z-10 mb-6">
          <h3 className="font-serif text-2xl font-bold text-white/95">
            {profile.name || 'Unknown Voyager'}
          </h3>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-[#D4AF37]/70">
            {tagline}
          </p>
        </div>

        {/* Big Three Grid */}
        <div className="relative z-10 mb-5 grid grid-cols-3 gap-3">
          {[
            { label: 'SUN', sign: profile.sun.sign, glyph: '☉', color: 'text-amber-400' },
            { label: 'MOON', sign: profile.moon.sign, glyph: '☽', color: 'text-blue-300' },
            { label: 'RISING', sign: profile.rising.sign, glyph: '↑', color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.label} className="border border-white/5 bg-white/[0.02] p-3 text-center">
              <span className={cn('text-lg', item.color)}>{item.glyph}</span>
              <p className="mt-1 text-xs font-bold text-white/90">{item.sign}</p>
              <p className="font-mono text-[8px] tracking-widest text-white/30 uppercase">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Element Distribution */}
        <div className="relative z-10 space-y-1.5">
          <p className="mb-2 font-mono text-[8px] font-bold tracking-[0.2em] text-white/30 uppercase">
            Elemental Balance
          </p>
          <ElementBar label="🔥" value={profile.elements.fire} color="#ef4444" />
          <ElementBar label="🌍" value={profile.elements.earth} color="#a3e635" />
          <ElementBar label="💨" value={profile.elements.air} color="#38bdf8" />
          <ElementBar label="💧" value={profile.elements.water} color="#818cf8" />
        </div>

        {/* Dominant Element Badge */}
        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <p className="font-mono text-[8px] tracking-widest text-white/30 uppercase">Dominant</p>
            <p className="text-xs font-bold capitalize text-white/80">{dominantElement[0]} ({dominantElement[1]}%)</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[8px] tracking-widest text-white/30 uppercase">Born</p>
            <p className="text-xs font-bold text-white/80">{profile.birthDate}</p>
          </div>
        </div>

        {/* Watermark */}
        <div className="relative z-10 mt-4 border-t border-white/5 pt-3 text-center">
          <p className="font-mono text-[7px] tracking-[0.3em] text-white/15 uppercase">
            astrokline.com — see your next 100 years
          </p>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex flex-1 items-center justify-center gap-2 border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/70 transition-all hover:border-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {isExporting ? 'Exporting...' : 'Save Image'}
        </button>
        <button
          onClick={handleShare}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all',
            shareStatus === 'copied'
              ? 'border border-green-500/30 bg-green-500/10 text-green-400'
              : 'border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20'
          )}
        >
          <Share2 className="h-3.5 w-3.5" />
          {shareStatus === 'copied' ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  );
}
