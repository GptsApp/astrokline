'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Gift, Users } from 'lucide-react';
import { Heading } from "@/components/astrokline/ui/heading";

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

  if (loading || !data) return null;

  return (
    <div className="to-primary/5  border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center border border-purple-500/20 bg-purple-500/10">
          <Gift className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <Heading level={3} className="text-foreground text-sm font-bold">Invite & Earn</Heading>
          <p className="text-muted-foreground text-xs">
            +1 query for each friend who signs up
          </p>
        </div>
      </div>

      {/* Stats */}
      {data.totalReferred > 0 && (
        <div className="mb-3 flex items-center gap-4  border border-white/5 bg-white/5 px-3 py-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            <span>
              <strong className="text-foreground">{data.totalReferred}</strong>{' '}
              referred
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            <strong className="text-primary">+{data.bonusQuota}</strong> bonus
            queries
          </div>
        </div>
      )}

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2  border border-purple-500/30 bg-purple-500/10 py-2.5 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/20"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" /> Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Copy Invite Link
          </>
        )}
      </button>
    </div>
  );
}
