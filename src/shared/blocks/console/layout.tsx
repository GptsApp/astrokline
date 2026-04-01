'use client';

import { ReactNode, useState } from 'react';

import { Link, usePathname } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { Nav } from '@/shared/types/blocks/common';

export function ConsoleLayout({
  title,
  description,
  nav,
  bottomNav,
  className,
  children,
}: {
  title?: string;
  description?: string;
  nav?: Nav;
  bottomNav?: Nav;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = nav?.items.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNavItems = (navItems: typeof filteredItems, isBottom = false) => (
    <nav
      className={`space-y-1 ${isBottom ? 'border-border mt-8 mt-auto border-t pt-4' : ''}`}
    >
      {navItems?.map((item, idx) => (
        <Link
          key={idx}
          href={item.url || ''}
          className={`flex items-center space-x-3  px-3 py-2 text-sm transition-colors ${
            item.is_active ||
            pathname.endsWith(item.url as string) ||
            item.url?.endsWith(pathname)
              ? 'bg-secondary text-secondary-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <SmartIcon name={item.icon as string} size={16} />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className={`bg-background min-h-screen ${className}`}>
      {/* Page Header (Mobile Only) */}
      <div className="border-border border-b md:hidden">
        <div className="container">
          <div className="flex items-center gap-4 py-4">
            {/* Mobile Menu Trigger */}
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
                <div className="flex-1 overflow-y-auto">
                  {renderNavItems(filteredItems)}
                </div>
                {bottomNav && renderNavItems(bottomNav.items, true)}
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
          <div className="sticky top-24 hidden h-[calc(100vh-6rem)] w-56 flex-shrink-0 flex-col md:flex pr-8 py-8">
            <div className="flex-1">
              {/* Navigation Menu */}
              {renderNavItems(filteredItems)}
            </div>

            {/* Bottom Navigation */}
            {bottomNav && renderNavItems(bottomNav.items, true)}
          </div>

          {/* Right Content Area with Divider and Distinct Background */}
          <div className="min-w-0 flex-1 border-l border-white/10 bg-[#0a090d] relative shadow-2xl">
            {/* Extremely subtle glow on the border */}
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
