'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { UserProfile, DestinyScorePoint } from '@/lib/astrokline/mock-astrology-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Sparkles, X, Trophy } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CosmicIdCardContent } from './cosmic-id-card-content';

interface Props {
  profile: UserProfile;
  klineData: DestinyScorePoint[];
}

function scoreToPercentile(score: number): number {
  if (score >= 90) return 97 + (score % 3);
  if (score >= 80) return 85 + Math.floor((score - 80) * 1.2);
  if (score >= 65) return 60 + Math.floor((score - 65) * 1.5);
  return 30 + Math.floor(score * 0.4);
}

export function CosmicIdCard({ profile, klineData }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [shareUrl, setShareUrl] = useState<string>('https://astrokline.com/kline');
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch actual referral url for viral sharing
  useEffect(() => {
    fetch('/api/kline/referral')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.shareUrl) {
          setShareUrl(res.data.shareUrl);
        }
      })
      .catch(() => {});
  }, []);

  const powerScore = profile.overallAverageScore || 84;
  const topPct = 100 - scoreToPercentile(powerScore);

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current || isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const el = cardRef.current;
      
      // Fixed card dimensions — must match cosmic-id-card-content.tsx
      const CARD_WIDTH = 380;
      
      const canvas = await html2canvas(el, {
        backgroundColor: '#08080F',
        scale: 3,
        useCORS: true,
        logging: false,
        // Use fixed width, let height be auto-calculated from content
        width: CARD_WIDTH,
        windowWidth: CARD_WIDTH + 40,
        onclone: (doc) => {
          const cloned = doc.querySelector('[data-cosmic-card]') as HTMLElement;
          if (cloned) {
            // Reset ALL layout constraints that modal might impose
            cloned.style.width = `${CARD_WIDTH}px`;
            cloned.style.minWidth = `${CARD_WIDTH}px`;
            cloned.style.maxWidth = `${CARD_WIDTH}px`;
            cloned.style.overflow = 'visible';
            cloned.style.position = 'relative';
            cloned.style.transform = 'none';
            cloned.style.maxHeight = 'none';
            // Ensure parent containers don't clip
            let parent = cloned.parentElement;
            while (parent) {
              parent.style.overflow = 'visible';
              parent.style.maxHeight = 'none';
              parent.style.transform = 'none';
              parent = parent.parentElement;
            }
          }
        },
      });
      const link = document.createElement('a');
      link.download = `cosmic-power-${topPct}pct.png`;
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
  }, [isSaving, topPct]);

  const handleShare = useCallback(async () => {
    const text = `✨ My Cosmic Power Score: ${powerScore} — Top ${topPct}% of all charts!\n${profile.sun.sign} ☉ · ${profile.moon.sign} ☽ · ${profile.rising.sign} ↑\nDiscover yours:`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: `Cosmic Power: Top ${topPct}%`, text, url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }, [profile, powerScore, topPct, shareUrl]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group mx-auto flex w-full max-w-md items-center gap-4 border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] p-5 transition-all hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/[0.06] hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
      >
        <div className="flex h-12 w-12 items-center justify-center border border-[#D4AF37]/30 bg-[#D4AF37]/10">
          <Trophy className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white/90">Your Cosmic Power: Top {topPct}%</p>
          <p className="mt-0.5 text-xs text-white/40">See your ranking card & share it</p>
        </div>
        <span className="font-mono text-lg text-[#D4AF37]/50 group-hover:text-[#D4AF37]">→</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
      >
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-6 right-6 z-[110] rounded-full bg-white/10 p-2 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex max-h-[90vh] flex-col items-center overflow-y-auto overflow-x-hidden"
        >
          <CosmicIdCardContent profile={profile} klineData={klineData} cardRef={cardRef} shareUrl={shareUrl} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 max-w-[380px] text-center">
            <p className="text-sm text-white/60">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#D4AF37]" />
              Your cosmic power surpasses <span className="font-bold text-[#D4AF37]">{100 - topPct}%</span> of all charts analyzed.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-3 flex w-full max-w-[380px] gap-3">
            <button
              onClick={handleSaveImage}
              disabled={isSaving}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 border py-3 text-xs font-bold transition-all',
                saveStatus === 'saved' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/5 text-white/70 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]',
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
                shareStatus === 'copied' ? 'border border-green-500/30 bg-green-500/10 text-green-400' : 'border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20'
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
