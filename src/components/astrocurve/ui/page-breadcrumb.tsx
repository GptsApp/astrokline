'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useLocale } from 'next-intl';

// Route name dictionary for smart mapping
const ROUTE_NAMES: Record<string, Record<string, string>> = {
  kline: { en: 'Life Curve', zh: '命运曲线' },
  settings: { en: 'Settings', zh: 'Settings' },
  pricing: { en: 'Pricing', zh: 'Pricing' },
  faq: { en: 'FAQ', zh: 'FAQ' },
  dashboard: { en: 'Dashboard', zh: 'Dashboard' },
  activity: { en: 'Activity', zh: 'Activity' },
};

export function PageBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname() || '';
  const locale = useLocale();

  // Filter out empty segments and the locale segment (e.g. /zh/kline -> ['kline'])
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((seg) => seg !== locale);

  if (segments.length === 0) {
    return null; // Don't show breadcrumb on homepage
  }

  return (
    <div
      className={`text-foreground/60 flex items-center space-x-2 text-sm ${className || ''}`}
    >
      <Link
        href="/"
        className="hover:text-foreground flex items-center transition-colors"
      >
        <Home className="size-4" />
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        // Build the href for this segment
        const href = `/${locale}/` + segments.slice(0, index + 1).join('/');

        // Lookup display name
        const displayKey = segment.toLowerCase();
        const displayDict = ROUTE_NAMES[displayKey];
        const displayName = displayDict
          ? displayDict[locale] || displayDict['en']
          : segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="size-4 opacity-50" />

            {isLast ? (
              <span className="text-foreground font-medium">{displayName}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
