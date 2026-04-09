'use client';

import { User } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';

export function SidebarUserProfile({
  userName,
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const displayName = userName || 'User';
  const displayEmail = userEmail || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Link
      href="/settings/profile"
      className="flex items-center gap-3 border-t border-white/8 px-3 py-4 transition-colors hover:bg-white/5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-xs font-bold text-white/70">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/80">
          {displayName}
        </p>
        {displayEmail && (
          <p className="truncate text-[11px] text-white/35">{displayEmail}</p>
        )}
      </div>
    </Link>
  );
}
