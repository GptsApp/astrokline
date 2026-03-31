'use client';

import React from 'react';
import { Home, Activity, TrendingUp, Calendar, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';

const TABS = [
  { id: 'home', icon: Home, label: 'Home', href: '/dashboard' },
  { id: 'kline', icon: Activity, label: 'K-Line', href: '/kline' },
  { id: 'energy', icon: TrendingUp, label: 'Energy', href: '/tools/energy' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', href: '/tools/calendar' },
  { id: 'me', icon: User, label: 'Me', href: '/settings/profile' },
];

export function MobileBottomTab() {
  const pathname = usePathname();

  // Determine active tab
  const getActiveTab = () => {
    // Strip locale prefix (e.g., /en/dashboard → /dashboard)
    const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/)/, '');

    if (cleanPath === '/dashboard' || cleanPath === '/dashboard/kline') return 'home';
    if (cleanPath === '/kline' || cleanPath.startsWith('/kline/')) return 'kline';
    if (cleanPath === '/tools/energy') return 'energy';
    if (cleanPath === '/tools/calendar') return 'calendar';
    if (cleanPath.startsWith('/settings')) return 'me';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-[#0a090d]/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-14 items-center justify-around">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
                isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'
              )}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
