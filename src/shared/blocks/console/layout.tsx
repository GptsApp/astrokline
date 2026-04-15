'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronsLeft } from 'lucide-react';

import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { useCheckout } from '@/components/astrocurve/checkout/checkout-context';
import { OnboardingGuide, type OnboardingStep } from '@/components/astrocurve/dashboard/onboarding-guide';
import { SidebarUserProfile } from '@/components/astrocurve/dashboard/sidebar-user-profile';
import { SidebarLanguageSwitcher } from '@/components/astrocurve/dashboard/sidebar-language-switcher';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { getDashboardAccountLinks } from '@/shared/lib/admin-console';
import { cn } from '@/shared/lib/utils';
import { Nav, NavItem } from '@/shared/types/blocks/common';

const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'create_chart', label: 'Generate your first chart', href: '/dashboard', isComplete: false },
  { id: 'check_energy', label: 'Check your daily energy', href: '/dashboard/tools/energy', isComplete: false },
  { id: 'ask_chart', label: 'Ask your chart a question', href: '/dashboard/ask-chart', isComplete: false },
];

function isPathMatch(url: string, pathname: string): boolean {
  if (!url) return false;
  if (pathname === url || pathname.endsWith(url)) return true;
  if (url.endsWith(pathname)) return true;
  return false;
}

function parseNavUrl(url?: string) {
  const [pathname, hash] = (url || '').split('#');
  return {
    pathname,
    hash: hash ? `#${hash}` : '',
  };
}

function isItemActive(item: NavItem, pathname: string, currentHash = ''): boolean {
  if (item.is_active) return true;
  const { pathname: itemPathname, hash } = parseNavUrl(item.url as string | undefined);
  if (!itemPathname) return false;
  if (hash && isPathMatch(itemPathname, pathname)) {
    return currentHash === hash;
  }
  return isPathMatch(itemPathname, pathname);
}

function isGroupActive(item: NavItem, pathname: string, currentHash = ''): boolean {
  if (isItemActive(item, pathname, currentHash)) return true;
  return item.children?.some((child) => isItemActive(child, pathname, currentHash)) ?? false;
}

function NavLink({
  item,
  pathname,
  currentHash,
  collapsed,
  onHashNavigate,
}: {
  item: NavItem;
  pathname: string;
  currentHash?: string;
  collapsed?: boolean;
  onHashNavigate?: (hash: string) => void;
}) {
  const active = isItemActive(item, pathname, currentHash);
  const { pathname: itemPathname, hash } = parseNavUrl(item.url as string | undefined);

  if (hash && isPathMatch(itemPathname, pathname)) {
    return (
      <button
        type="button"
        title={collapsed ? item.title : undefined}
        onClick={() => {
          const targetId = hash.slice(1);
          const target = document.getElementById(targetId);
          const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;

          window.history.pushState(null, '', nextUrl);
          onHashNavigate?.(hash);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className={cn(
          'flex w-full items-center text-sm transition-colors',
          collapsed ? 'justify-center px-2 py-2.5' : 'space-x-3 px-3 py-2',
          active
            ? 'bg-secondary text-secondary-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        {item.icon && <SmartIcon name={item.icon as string} size={16} />}
        {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-primary/70 border border-primary/20 px-1.5 py-0.5 bg-primary/5">
            {item.badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <Link
      href={item.url || ''}
      title={collapsed ? item.title : undefined}
      className={cn(
        'flex items-center text-sm transition-colors',
        collapsed ? 'justify-center px-2 py-2.5' : 'space-x-3 px-3 py-2',
        active
          ? 'bg-secondary text-secondary-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {item.icon && <SmartIcon name={item.icon as string} size={16} />}
      {!collapsed && <span className="flex-1">{item.title}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-primary/70 border border-primary/20 px-1.5 py-0.5 bg-primary/5">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroup({
  item,
  pathname,
  currentHash,
  collapsed,
  onHashNavigate,
}: {
  item: NavItem;
  pathname: string;
  currentHash?: string;
  collapsed?: boolean;
  onHashNavigate?: (hash: string) => void;
}) {
  const active = isGroupActive(item, pathname, currentHash);
  const [expanded, setExpanded] = useState(active);

  // In collapsed mode, just show the icon as a link to the group's first url
  if (collapsed) {
    return (
      <Link
        href={item.url || item.children?.[0]?.url || ''}
        title={item.title}
        className={cn(
          'flex items-center justify-center px-2 py-2.5 text-sm transition-colors',
          active
            ? 'bg-secondary text-secondary-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        {item.icon && <SmartIcon name={item.icon as string} size={16} />}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'flex w-full items-center space-x-3 px-3 py-2 text-sm transition-colors',
          active
            ? 'text-secondary-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        {item.icon && <SmartIcon name={item.icon as string} size={16} />}
        <span className="flex-1 text-left">{item.title}</span>
        {item.badge && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary/70 border border-primary/20 px-1.5 py-0.5 bg-primary/5">
            {item.badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-white/30 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>
      {expanded && item.children && (
        <div className="ml-5 border-l border-white/8 space-y-0.5 py-1">
          {item.children.map((child, idx) => (
            <NavLink
              key={idx}
              item={child}
              pathname={pathname}
              currentHash={currentHash}
              onHashNavigate={onHashNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarNav({
  items,
  pathname,
  currentHash,
  collapsed,
  onHashNavigate,
}: {
  items: NavItem[];
  pathname: string;
  currentHash?: string;
  collapsed?: boolean;
  onHashNavigate?: (hash: string) => void;
}) {
  return (
    <nav className="space-y-0.5">
      {items.map((item, idx) =>
        item.children && item.children.length > 0 ? (
          <NavGroup
            key={idx}
            item={item}
            pathname={pathname}
            currentHash={currentHash}
            collapsed={collapsed}
            onHashNavigate={onHashNavigate}
          />
        ) : (
          <NavLink
            key={idx}
            item={item}
            pathname={pathname}
            currentHash={currentHash}
            collapsed={collapsed}
            onHashNavigate={onHashNavigate}
          />
        )
      )}
    </nav>
  );
}

function SidebarContent({
  filteredItems,
  accountLinks,
  pathname,
  currentHash,
  userName,
  userEmail,
  userTier,
  hasChart,
  hasAskedChart,
  onNavigate,
  onHashNavigate,
  collapsed,
}: {
  filteredItems: NavItem[];
  accountLinks?: NavItem[];
  bottomNav?: Nav;
  pathname: string;
  currentHash?: string;
  userName?: string;
  userEmail?: string;
  userTier?: string;
  hasChart?: boolean;
  hasAskedChart?: boolean;
  // eslint-disable-next-line no-unused-vars
  onNavigate?: (...args: [string]) => void;
  onHashNavigate?: (hash: string) => void;
  onCreateChart?: () => void;
  collapsed?: boolean;
}) {
  const quickLinks =
    accountLinks && accountLinks.length > 0
      ? accountLinks
      : getDashboardAccountLinks(false);

  return (
    <>
      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNav
          items={filteredItems}
          pathname={pathname}
          currentHash={currentHash}
          collapsed={collapsed}
          onHashNavigate={onHashNavigate}
        />
      </div>

      {/* Bottom section */}
      <div className="flex-shrink-0">
        {/* Onboarding guide - hide when collapsed */}
        {!collapsed && (
          <OnboardingGuide
            steps={DEFAULT_ONBOARDING_STEPS}
            hasChart={hasChart ?? false}
            hasAskedChart={hasAskedChart ?? false}
            onNavigate={onNavigate}
          />
        )}

        {/* Single Settings entry */}
        <nav className={cn('space-y-0.5 border-t border-white/8 pt-3 mt-3', collapsed && 'px-0')}>
          {quickLinks.map((item) => (
            <NavLink
              key={item.url || item.title}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Language switcher */}
        <SidebarLanguageSwitcher collapsed={collapsed} />

        {/* Upgrade CTA for free users - hide when collapsed */}
        {userTier === 'FREE' && !collapsed && (
          <UpgradeButton collapsed={false} />
        )}
        {userTier === 'FREE' && collapsed && (
          <UpgradeButton collapsed={true} />
        )}

        {/* User profile */}
        {!collapsed ? (
          <SidebarUserProfile userName={userName} userEmail={userEmail} userTier={userTier as any} />
        ) : (
          <div className="flex justify-center py-3 border-t border-white/8 mt-3">
            <Link href="/dashboard/settings/profile" title={userName || userEmail}>
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                {(userName || userEmail || '?')[0].toUpperCase()}
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function UpgradeButton({ collapsed }: { collapsed: boolean }) {
  const { openCheckout } = useCheckout();
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => openCheckout('pro')}
        title="Upgrade to Pro"
        className="flex items-center justify-center py-2.5 text-primary transition-colors hover:bg-secondary/50"
      >
        <SmartIcon name="Zap" size={16} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openCheckout('pro')}
      className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-sm border border-primary/30 bg-gradient-to-r from-primary/10 to-amber-400/5 px-3 py-2 text-xs font-medium text-primary transition-all hover:border-primary/50 hover:from-primary/15 hover:to-amber-400/10"
    >
      <SmartIcon name="Zap" size={14} />
      <span>Upgrade to Pro</span>
    </button>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'astro_sidebar_collapsed';

export function ConsoleLayout({
  nav,
  bottomNav,
  accountLinks,
  className,
  children,
  userName,
  userEmail,
  userTier,
  hasChart,
  hasAskedChart,
}: {
  title?: string;
  description?: string;
  nav?: Nav;
  bottomNav?: Nav;
  accountLinks?: NavItem[];
  className?: string;
  children: ReactNode;
  userName?: string;
  userEmail?: string;
  userTier?: string;
  hasChart?: boolean;
  hasAskedChart?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    setIsClientMounted(true);
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === '1') setCollapsed(true);

    const syncHash = () => setCurrentHash(window.location.hash);

    syncHash();
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);

    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  };

  const filteredItems = nav?.items ?? [];

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <div className={cn('bg-background min-h-screen', className)}>
      {/* Mobile Header */}
      <div className="border-border border-b md:hidden">
        <div className="container">
          <div className="flex items-center gap-4 py-4">
            {isClientMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SmartIcon name="Menu" size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex h-full w-64 flex-col px-4"
                >
                  <SheetHeader className="mb-4 flex-shrink-0 px-0">
                    <SheetTitle>
                      <span className="flex items-center gap-2">
                        <Image src="/images/astrocurve-logo.webp" alt="" width={24} height={24} className="h-auto w-auto shrink-0" />
                        <span>AstroCurve</span>
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <SidebarContent
                    filteredItems={filteredItems}
                    accountLinks={accountLinks}
                    bottomNav={bottomNav}
                    pathname={pathname}
                    currentHash={currentHash}
                    userName={userName}
                    userEmail={userEmail}
                    userTier={userTier}
                    hasChart={hasChart}
                    hasAskedChart={hasAskedChart}
                    onNavigate={handleNavigate}
                    onHashNavigate={setCurrentHash}
                  />
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="outline" size="icon" disabled aria-hidden="true" tabIndex={-1}>
                <SmartIcon name="Menu" size={20} />
              </Button>
            )}

            <span className="text-foreground text-lg font-semibold flex items-center gap-2">
              <Image src="/images/astrocurve-logo.webp" alt="" width={24} height={24} className="h-auto w-auto shrink-0" />
              AstroCurve
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Left Sidebar (Desktop) */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/8 bg-background transition-[width] duration-200 md:flex',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Sidebar header with collapse toggle */}
        <div className={cn(
          'flex items-center h-14 border-b border-white/8 flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between px-4'
        )}>
          {!collapsed && (
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground truncate">
              <Image src="/images/astrocurve-logo.webp" alt="AstroCurve" width={22} height={22} className="h-auto w-auto shrink-0" />
              AstroCurve
            </span>
          )}
          {collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              title="Expand sidebar"
            >
              <Image src="/images/astrocurve-logo.webp" alt="AstroCurve" width={22} height={22} className="h-auto w-auto shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronsLeft size={16} />
            </button>
          )}
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col flex-1 overflow-hidden py-4">
          <SidebarContent
            filteredItems={filteredItems}
            accountLinks={accountLinks}
            bottomNav={bottomNav}
            pathname={pathname}
            currentHash={currentHash}
            userName={userName}
            userEmail={userEmail}
            userTier={userTier}
            hasChart={hasChart}
            hasAskedChart={hasAskedChart}
            onNavigate={handleNavigate}
            onHashNavigate={setCurrentHash}
            collapsed={collapsed}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="transition-[margin-left] duration-200 md:ml-0">
        <div
          className={cn('hidden md:block', collapsed ? 'md:ml-14' : 'md:ml-56')}
        >
          <div className="min-h-screen border-l border-white/10 bg-[#0a090d] relative z-10 shadow-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
            <div className="p-4 md:p-10 lg:p-12 min-h-full">
              {children}
            </div>
          </div>
        </div>
        {/* Mobile content */}
        <div className="md:hidden">
          <div className="p-4 min-h-screen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
