'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Gift, Users, Target, Award, ArrowRight } from 'lucide-react';
import { Heading } from '@/components/astrokline/ui/heading';
import { cn } from '@/shared/lib/utils';

const MILESTONES = [
  { count: 3, label: 'Social Star', reward: 'Badge unlocked' },
  { count: 5, label: 'Power Inviter', reward: '+2 bonus queries' },
  { count: 10, label: 'Ambassador', reward: '7-day Lite trial' },
];

export function ReferralCard() {
  const [data, setData] = useState<{
    referralCode: string;
    shareUrl: string;
    totalReferred: number;
    bonusQuota: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kline/referral')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!data?.shareUrl) return;
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  const handleShare = useCallback(async () => {
    if (!data?.shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AstroKline — Your Cosmic Timing Map',
          text: 'Check out your personal K-Line reading — free!',
          url: data.shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  }, [data, handleCopy]);

  if (loading || !data) return null;

  const count = data.totalReferred;
  const nextMilestone = MILESTONES.find((m) => m.count > count) || MILESTONES[MILESTONES.length - 1];
  const progress = Math.min(100, (count / nextMilestone.count) * 100);
  const maxReached = count >= 10;

  return (
    <div className="border border-[#D4AF37]/20 bg-white/[0.02] p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative pulse line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center border border-[#D4AF37]/20 bg-[#D4AF37]/10">
          <Gift className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <div>
          <Heading level={3} className="text-lg font-serif tracking-wide text-white">Invite & Earn</Heading>
          <p className="mt-1 text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]/60">
            +1 query for each friend who joins
          </p>
        </div>
      </div>

      {/* Funnel Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="border border-white/10 bg-[#050505]/60 p-3 text-center">
          <div className="text-xl font-mono text-white mb-1">{count}</div>
          <div className="text-[9px] uppercase tracking-widest font-mono text-white/40">Joined</div>
        </div>
        <div className="border border-white/10 bg-[#050505]/60 p-3 text-center">
          <div className="text-xl font-mono text-[#D4AF37] mb-1">+{data.bonusQuota}</div>
          <div className="text-[9px] uppercase tracking-widest font-mono text-white/40">Earned</div>
        </div>
        <div className="border border-white/10 bg-[#050505]/60 p-3 text-center">
          <div className="text-xl font-mono text-white/60 mb-1">{Math.max(0, 10 - count)}</div>
          <div className="text-[9px] uppercase tracking-widest font-mono text-white/40">To Max</div>
        </div>
      </div>

      {/* Progress to next milestone */}
      {!maxReached && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]/60 flex items-center gap-1.5">
              <Target className="h-3 w-3" /> Next: {nextMilestone.label}
            </span>
            <span className="text-[10px] font-mono text-white/40">{count}/{nextMilestone.count}</span>
          </div>
          <div className="h-[2px] w-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#D4AF37] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] font-mono tracking-widest uppercase text-white/30 mt-2">{nextMilestone.reward}</p>
        </div>
      )}

      {/* Milestone badges */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {MILESTONES.map((m) => (
          <div
            key={m.count}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase border',
              count >= m.count
                ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-white/10 text-white/20'
            )}
          >
            <Award className="h-3 w-3" />
            {m.label}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-3 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] transition-all hover:bg-[#D4AF37]/20"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" /> Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy Link</>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 border border-white/20 bg-white/5 py-3 text-[10px] font-mono uppercase tracking-widest text-white/80 transition-all hover:bg-white/10 hover:border-white/40"
        >
          <ArrowRight className="h-3.5 w-3.5" /> Share
        </button>
      </div>
    </div>
  );
}
