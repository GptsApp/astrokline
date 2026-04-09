'use client';

import { Crown, Sparkles, User } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';

type UserTier = 'FREE' | 'STANDARD' | 'PREMIUM';

const TIER_CONFIG: Record<UserTier, {
  label: string;
  icon: typeof Crown;
  className: string;
  badgeClassName: string;
}> = {
  FREE: {
    label: 'Free',
    icon: User,
    className: 'text-white/40 border-white/10 bg-white/3',
    badgeClassName: 'text-white/40 border-white/10 bg-white/3',
  },
  STANDARD: {
    label: 'Lite',
    icon: Sparkles,
    className: 'text-sky-300/90 border-sky-400/25 bg-sky-400/8',
    badgeClassName: 'text-sky-300 border-sky-400/30 bg-gradient-to-r from-sky-400/10 to-cyan-400/10',
  },
  PREMIUM: {
    label: 'Pro',
    icon: Crown,
    className: 'text-amber-300/90 border-amber-400/30 bg-amber-400/8',
    badgeClassName: 'text-amber-300 border-amber-400/30 bg-gradient-to-r from-amber-400/15 to-yellow-300/10',
  },
};

export function SidebarUserProfile({
  userName,
  userEmail,
  userTier = 'FREE',
}: {
  userName?: string;
  userEmail?: string;
  userTier?: UserTier;
}) {
  const displayName = userName || 'User';
  const displayEmail = userEmail || '';
  const initial = displayName.charAt(0).toUpperCase();
  const tierConfig = TIER_CONFIG[userTier];
  const TierIcon = tierConfig.icon;

  return (
    <Link
      href="/settings/profile"
      className="flex items-center gap-3 border-t border-white/8 px-3 py-4 transition-colors hover:bg-white/5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-xs font-bold text-white/70">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white/80">
            {displayName}
          </p>
          <span className={cn(
            'inline-flex items-center gap-1 shrink-0 rounded-sm border px-1.5 py-[1px] text-[10px] font-semibold tracking-wide',
            tierConfig.badgeClassName,
          )}>
            <TierIcon className="h-2.5 w-2.5" />
            {tierConfig.label}
          </span>
        </div>
        {displayEmail && (
          <p className="truncate text-[11px] text-white/35">{displayEmail}</p>
        )}
      </div>
    </Link>
  );
}
