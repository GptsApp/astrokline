'use client';

import { useCallback, useRef, useState } from 'react';
import type { UserProfile, DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Sparkles, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CosmicIdCardContent } from './cosmic-id-card-content';

interface Props {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
}

const SHARE_QUOTES = [
  '✨ Your cosmic blueprint is one-of-a-kind. Share it with the universe.',
  '🌟 Only 0.001% of humans share your exact natal fingerprint.',
  '🔥 Your friends deserve to know their destiny too. Show them the way.',
  '💫 The stars aligned just for you. Let the world see your chart.',
];

export function CosmicIdCard({ profile, klineData }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const cardRef = useRef<HTMLDivElement>(null);

  const quote = SHARE_QUOTES[Math.floor(profile.birthDate.charCodeAt(0) % SHARE_QUOTES.length)];

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current || isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0A14',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `cosmic-id-${profile.name || 'card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, profile.name]);

  const handleShare = useCallback(async () => {
    const text = `✨ My Cosmic ID: ${profile.sun.sign} ☉ · ${profile.moon.sign} ☽ · ${profile.rising.sign} ↑\nDiscover yours at astrokline.com/kline`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Cosmic ID', text, url: 'https://astrokline.com/kline' });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }, [profile]);

  // Trigger button (inline in result page)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group mx-auto flex w-full max-w-md items-center gap-4 border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] p-5 transition-all hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/[0.06] hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
      >
        <div className="flex h-12 w-12 items-center justify-center border border-[#D4AF37]/30 bg-[#D4AF37]/10">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white/90">View My Cosmic ID</p>
          <p className="mt-0.5 text-xs text-white/40">Your shareable cosmic identity card with K-Line</p>
        </div>
        <span className="font-mono text-lg text-[#D4AF37]/50 group-hover:text-[#D4AF37]">→</span>
      </button>
    );
  }

  // Modal overlay
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex max-h-[90vh] flex-col items-center overflow-y-auto"
        >
          {/* Close */}
          <button onClick={() => setIsOpen(false)} className="absolute -top-2 -right-2 z-10 rounded-full bg-white/10 p-1.5 text-white/50 hover:text-white">
            <X className="h-4 w-4" />
          </button>

          {/* The Card */}
          <CosmicIdCardContent profile={profile} klineData={klineData} cardRef={cardRef} />

          {/* Share Incentive */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 max-w-[380px] text-center"
          >
            <p className="text-sm leading-relaxed text-white/60">{quote}</p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex w-full max-w-[380px] gap-3"
          >
            <button
              onClick={handleSaveImage}
              disabled={isSaving}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 border py-3 text-xs font-bold transition-all',
                saveStatus === 'saved'
                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]',
                isSaving && 'opacity-50'
              )}
            >
              <Download className="h-4 w-4" />
              {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Image'}
            </button>
            <button
              onClick={handleShare}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold transition-all',
                shareStatus === 'copied'
                  ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                  : 'border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20'
              )}
            >
              <Share2 className="h-4 w-4" />
              {shareStatus === 'copied' ? 'Copied!' : 'Share'}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
