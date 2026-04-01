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
    <div className="border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center border border-purple-500/20 bg-purple-500/10">
          <Gift className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <Heading level={3} className="text-foreground text-sm font-bold">Invite & Earn</Heading>
          <p className="text-muted-foreground text-xs">
            +1 query for each friend who joins
          </p>
        </div>
      </div>

      {/* Funnel Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="border border-white/5 bg-white/5 p-2.5 text-center">
          <div className="text-lg font-bold text-white">{count}</div>
          <div className="text-[10px] text-white/40">Joined</div>
        </div>
        <div className="border border-white/5 bg-white/5 p-2.5 text-center">
          <div className="text-lg font-bold text-primary">+{data.bonusQuota}</div>
          <div className="text-[10px] text-white/40">Earned</div>
        </div>
        <div className="border border-white/5 bg-white/5 p-2.5 text-center">
          <div className="text-lg font-bold text-purple-400">{Math.max(0, 10 - count)}</div>
          <div className="text-[10px] text-white/40">To Max</div>
        </div>
      </div>

      {/* Progress to next milestone */}
      {!maxReached && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Target className="h-3 w-3" /> Next: {nextMilestone.label}
            </span>
            <span className="text-[10px] text-white/40">{count}/{nextMilestone.count}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-1">{nextMilestone.reward}</p>
        </div>
      )}

      {/* Milestone badges */}
      <div className="mb-4 flex items-center gap-2">
        {MILESTONES.map((m) => (
          <div
            key={m.count}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-[10px] border',
              count >= m.count
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-white/5 text-white/20'
            )}
          >
            <Award className="h-3 w-3" />
            {m.label}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 border border-purple-500/30 bg-purple-500/10 py-2.5 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/20"
        >
          {copied ? (
            <><Check className="h-4 w-4" /> Copied!</>
          ) : (
            <><Copy className="h-4 w-4" /> Copy Link</>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 border border-primary/30 bg-primary/10 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
        >
          <ArrowRight className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  );
}
