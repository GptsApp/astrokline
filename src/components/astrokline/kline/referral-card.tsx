'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, Copy, Check, Users } from 'lucide-react';

export function ReferralCard() {
  const [data, setData] = useState<{ referralCode: string; shareUrl: string; totalReferred: number; bonusQuota: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kline/referral')
      .then(res => res.json())
      .then(res => { if (res.success) setData(res.data); })
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
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Gift className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Invite & Earn</h3>
          <p className="text-xs text-muted-foreground">+1 query for each friend who signs up</p>
        </div>
      </div>

      {/* Stats */}
      {data.totalReferred > 0 && (
        <div className="flex items-center gap-4 mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span><strong className="text-foreground">{data.totalReferred}</strong> referred</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <strong className="text-primary">+{data.bonusQuota}</strong> bonus queries
          </div>
        </div>
      )}

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-all"
      >
        {copied ? (
          <><Check className="w-4 h-4" /> Copied!</>
        ) : (
          <><Copy className="w-4 h-4" /> Copy Invite Link</>
        )}
      </button>
    </div>
  );
}
