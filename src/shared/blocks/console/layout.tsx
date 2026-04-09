'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { OnboardingGuide, type OnboardingStep } from '@/components/astrokline/dashboard/onboarding-guide';
import { RecentItems } from '@/components/astrokline/dashboard/recent-items';
import { SidebarUserProfile } from '@/components/astrokline/dashboard/sidebar-user-profile';
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

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isItemActive(item, pathname);
  return (
    <Link
      href={item.url || ''}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-secondary text-secondary-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {item.icon && <SmartIcon name={item.icon as string} size={16} />}
      <span className="flex-1">{item.title}</span>
      {item.badge && (
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-primary/70 border border-primary/20 px-1.5 py-0.5 bg-primary/5">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isGroupActive(item, pathname);
  const [expanded, setExpanded] = useState(active);

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

function SidebarNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item, idx) =>
        item.children && item.children.length > 0 ? (
          <NavGroup key={idx} item={item} pathname={pathname} />
        ) : (
          <NavLink key={idx} item={item} pathname={pathname} />
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
  hasChart,
  hasAskedChart,
  onNavigate,
  onCreateChart,
}: {
  filteredItems: NavItem[];
  bottomNav?: Nav;
  pathname: string;
  userName?: string;
  userEmail?: string;
  hasChart?: boolean;
  hasAskedChart?: boolean;
  onNavigate?: (href: string) => void;
  onCreateChart?: () => void;
}) {
  return (
    <>
      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={filteredItems} pathname={pathname} />

        {/* Recent charts */}
        <div className="mt-6">
          <RecentItems onCreateChart={onCreateChart} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex-shrink-0">
        {/* Onboarding guide */}
        <OnboardingGuide
          steps={DEFAULT_ONBOARDING_STEPS}
          hasChart={hasChart ?? false}
          hasAskedChart={hasAskedChart ?? false}
          onNavigate={onNavigate}
        />

        {/* Bottom nav links */}
        {bottomNav && (
          <nav className="space-y-0.5 border-t border-white/8 pt-3 mt-3">
            {bottomNav.items.map((item, idx) => (
              <NavLink key={idx} item={item} pathname={pathname} />
            ))}
          </nav>
        )}

        {/* User profile */}
        <SidebarUserProfile userName={userName} userEmail={userEmail} />
      </div>
    </>
  );
}

export function ConsoleLayout({
  title,
  description,
  nav,
  bottomNav,
  className,
  children,
  userName,
  userEmail,
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
  hasChart?: boolean;
  hasAskedChart?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredItems = nav?.items ?? [];

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <div className={cn('bg-background min-h-screen', className)}>
      {/* Page Header (Mobile Only) */}
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

      {/* Main Content */}
      <div className="container max-w-7xl">
        <div className="flex min-h-screen">
          {/* Left Sidebar (Desktop) */}
          <div className="sticky top-24 hidden h-[calc(100vh-6rem)] w-56 flex-shrink-0 flex-col md:flex pr-4 py-8">
            <SidebarContent
              filteredItems={filteredItems}
              bottomNav={bottomNav}
              pathname={pathname}
              userName={userName}
              userEmail={userEmail}
              hasChart={hasChart}
              hasAskedChart={hasAskedChart}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Right Content Area with Divider and Distinct Background */}
          <div className="min-w-0 flex-1 border-l border-white/10 bg-[#0a090d] relative shadow-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
            <div className="p-4 md:p-10 lg:p-12 min-h-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
