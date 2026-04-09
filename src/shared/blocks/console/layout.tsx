'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { OnboardingGuide, type OnboardingStep } from '@/components/astrokline/dashboard/onboarding-guide';
import { RecentItems } from '@/components/astrokline/dashboard/recent-items';
import { SidebarUserProfile } from '@/components/astrokline/dashboard/sidebar-user-profile';
import { SidebarLanguageSwitcher } from '@/components/astrokline/dashboard/sidebar-language-switcher';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { Nav, NavItem } from '@/shared/types/blocks/common';

const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'create_chart', label: 'Generate your first chart', href: '/dashboard', isComplete: false },
  { id: 'check_energy', label: 'Check your daily energy', href: '/dashboard/tools/energy', isComplete: false },
  { id: 'ask_chart', label: 'Ask your chart a question', href: '/dashboard/ask-chart', isComplete: false },
];

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.is_active) return true;
  const url = item.url as string;
  if (!url) return false;
  if (pathname === url || pathname.endsWith(url)) return true;
  if (url.endsWith(pathname)) return true;
  return false;
}

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (isItemActive(item, pathname)) return true;
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false;
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed?: boolean }) {
  const active = isItemActive(item, pathname);
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

function NavGroup({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed?: boolean }) {
  const active = isGroupActive(item, pathname);
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
            <NavLink key={idx} item={child} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarNav({ items, pathname, collapsed }: { items: NavItem[]; pathname: string; collapsed?: boolean }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item, idx) =>
        item.children && item.children.length > 0 ? (
          <NavGroup key={idx} item={item} pathname={pathname} collapsed={collapsed} />
        ) : (
          <NavLink key={idx} item={item} pathname={pathname} collapsed={collapsed} />
        )
      )}
    </nav>
  );
}

function SidebarContent({
  filteredItems,
  bottomNav,
  pathname,
  userName,
  userEmail,
  userTier,
  hasChart,
  hasAskedChart,
  onNavigate,
  onCreateChart,
  collapsed,
}: {
  filteredItems: NavItem[];
  bottomNav?: Nav;
  pathname: string;
  userName?: string;
  userEmail?: string;
  userTier?: string;
  hasChart?: boolean;
  hasAskedChart?: boolean;
  onNavigate?: (href: string) => void;
  onCreateChart?: () => void;
  collapsed?: boolean;
}) {
  return (
    <>
      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={filteredItems} pathname={pathname} collapsed={collapsed} />

        {/* Recent charts - hide when collapsed */}
        {!collapsed && (
          <div className="mt-6">
            <RecentItems onCreateChart={onCreateChart} />
          </div>
        )}
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
          <NavLink
            item={{ title: 'Settings', url: '/settings/profile', icon: 'Settings' }}
            pathname={pathname}
            collapsed={collapsed}
          />
        </nav>

        {/* Language switcher */}
        <SidebarLanguageSwitcher collapsed={collapsed} />

        {/* Upgrade CTA for free users - hide when collapsed */}
        {userTier === 'FREE' && !collapsed && (
          <Link
            href="/pricing"
            className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-sm border border-primary/30 bg-gradient-to-r from-primary/10 to-amber-400/5 px-3 py-2 text-xs font-medium text-primary transition-all hover:border-primary/50 hover:from-primary/15 hover:to-amber-400/10"
          >
            <SmartIcon name="Zap" size={14} />
            <span>Upgrade to Pro</span>
          </Link>
        )}
        {userTier === 'FREE' && collapsed && (
          <Link
            href="/pricing"
            title="Upgrade to Pro"
            className="flex items-center justify-center py-2.5 text-primary transition-colors hover:bg-secondary/50"
          >
            <SmartIcon name="Zap" size={16} />
          </Link>
        )}

        {/* User profile */}
        {!collapsed ? (
          <SidebarUserProfile userName={userName} userEmail={userEmail} userTier={userTier as any} />
        ) : (
          <div className="flex justify-center py-3 border-t border-white/8 mt-3">
            <Link href="/settings/profile" title={userName || userEmail}>
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

const SIDEBAR_COLLAPSED_KEY = 'astro_sidebar_collapsed';
const SIDEBAR_WIDTH = 224; // w-56 = 14rem = 224px
const SIDEBAR_COLLAPSED_WIDTH = 56; // w-14 = 3.5rem = 56px

export function ConsoleLayout({
  title,
  description,
  nav,
  bottomNav,
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

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === '1') setCollapsed(true);
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

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className={cn('bg-background min-h-screen', className)}>
      {/* Mobile Header */}
      <div className="border-border border-b md:hidden">
        <div className="container">
          <div className="flex items-center gap-4 py-4">
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
                  <SheetTitle>{title || 'Menu'}</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  filteredItems={filteredItems}
                  bottomNav={bottomNav}
                  pathname={pathname}
                  userName={userName}
                  userEmail={userEmail}
                  userTier={userTier}
                  hasChart={hasChart}
                  hasAskedChart={hasAskedChart}
                  onNavigate={handleNavigate}
                />
              </SheetContent>
            </Sheet>

            <span className="text-foreground text-lg font-semibold">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Left Sidebar (Desktop) */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col border-r border-white/8 bg-background z-40 transition-[width] duration-200"
        style={{ width: sidebarWidth }}
      >
        {/* Sidebar header with collapse toggle */}
        <div className={cn(
          'flex items-center h-14 border-b border-white/8 flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between px-4'
        )}>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">{title}</span>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col flex-1 overflow-hidden py-4">
          <SidebarContent
            filteredItems={filteredItems}
            bottomNav={bottomNav}
            pathname={pathname}
            userName={userName}
            userEmail={userEmail}
            userTier={userTier}
            hasChart={hasChart}
            hasAskedChart={hasAskedChart}
            onNavigate={handleNavigate}
            collapsed={collapsed}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className="transition-[margin-left] duration-200 md:ml-0"
        style={{ marginLeft: typeof window !== 'undefined' ? undefined : 0 }}
      >
        <div
          className="hidden md:block"
          style={{ marginLeft: sidebarWidth }}
        >
          <div className="min-h-screen border-l border-white/10 bg-[#0a090d] relative shadow-2xl">
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
