'use client';

import { useEffect, useState } from 'react';
import { Activity, Plus } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';

const STORAGE_KEY = 'astrokline_recent_charts';
const MAX_RECENT = 5;

export interface RecentChartItem {
  id: string;
  label: string;
  sunSign?: string;
  viewedAt: number;
}

function loadRecentCharts(): RecentChartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function addRecentChart(item: Omit<RecentChartItem, 'viewedAt'>) {
  const items = loadRecentCharts().filter((i) => i.id !== item.id);
  items.unshift({ ...item, viewedAt: Date.now() });
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  }
}

export function RecentItems({
  onCreateChart,
}: {
  onCreateChart?: () => void;
}) {
  const [items, setItems] = useState<RecentChartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(loadRecentCharts());
  }, []);

  if (!mounted) return null;

  return (
    <div className="border-t border-white/8 pt-4">
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
          Recent
        </span>
        {onCreateChart && (
          <button
            type="button"
            onClick={onCreateChart}
            className="text-white/30 transition-colors hover:text-white/60"
            aria-label="Create new chart"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 pb-2 text-[11px] text-white/35 transition-colors hover:text-primary/70"
        >
          <Plus className="h-3 w-3" />
          <span>Create your first chart →</span>
        </Link>
      ) : (
        <nav className="space-y-0.5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/kline`}
              className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white/80"
            >
              <Activity className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span className="truncate">{item.label}</span>
              {item.sunSign && (
                <span className="ml-auto shrink-0 text-[10px] text-white/25">
                  {item.sunSign}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
