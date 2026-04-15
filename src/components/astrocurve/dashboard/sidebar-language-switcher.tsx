'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { usePathname, useRouter } from '@/core/i18n/navigation';
import { localeNames, locales } from '@/config/locale';
import { cacheSet } from '@/shared/lib/cache';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';

const LOCALE_DETECTED_KEY = 'astro_locale_detected';

function detectBrowserLocale(): string | null {
  if (typeof navigator === 'undefined') return null;
  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();
  if (locales.includes(langCode)) return langCode;
  return null;
}

export function SidebarLanguageSwitcher({ collapsed }: { collapsed?: boolean }) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const handleSwitch = (value: string) => {
    if (value !== currentLocale) {
      cacheSet('locale', value);
      const query = searchParams?.toString?.() ?? '';
      const href = query ? `${pathname}?${query}` : pathname;
      router.push(href, { locale: value });
    }
  };

  useEffect(() => {
    setMounted(true);

    // Browser language detection - only prompt once
    const alreadyDetected = localStorage.getItem(LOCALE_DETECTED_KEY);
    if (alreadyDetected) return;

    const detectedLocale = detectBrowserLocale();
    if (detectedLocale && detectedLocale !== currentLocale) {
      localStorage.setItem(LOCALE_DETECTED_KEY, '1');
      const detectedName = localeNames[detectedLocale] || detectedLocale;
      toast(`Switch to ${detectedName}?`, {
        description: `We detected your browser language is ${detectedName}.`,
        action: {
          label: 'Switch',
          onClick: () => handleSwitch(detectedLocale),
        },
        duration: 8000,
      });
    } else {
      localStorage.setItem(LOCALE_DETECTED_KEY, '1');
    }
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        'flex items-center text-sm text-muted-foreground px-3 py-2',
        collapsed && 'justify-center px-0'
      )}>
        <Globe size={16} />
        {!collapsed && <span className="ml-3">{localeNames[currentLocale]}</span>}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/50 px-3 py-2',
            collapsed && 'justify-center px-0'
          )}
        >
          <Globe size={16} />
          {!collapsed && (
            <>
              <span className="ml-3 flex-1 text-left" translate="no">{localeNames[currentLocale]}</span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={collapsed ? 'start' : 'end'} side="right" className="min-w-[140px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleSwitch(locale)}
            className="flex items-center justify-between"
          >
            <span translate="no">{localeNames[locale]}</span>
            {locale === currentLocale && <Check size={14} className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
