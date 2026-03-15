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
    <nav className={`space-y-1 ${isBottom ? 'mt-auto pt-4 border-t border-border mt-8' : ''}`}>
      {navItems?.map((item, idx) => (
        <Link
          key={idx}
          href={item.url || ''}
          className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors ${
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
              <SheetContent side="left" className="w-64 px-4 flex flex-col h-full">
                <SheetHeader className="mb-4 px-0 flex-shrink-0">
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
      <div className="container">
        <div className="flex flex-wrap gap-8 py-8">
          {/* Left Sidebar (Desktop) */}
          <div className="hidden w-48 flex-shrink-0 md:flex flex-col min-h-[calc(100vh-10rem)] sticky top-24">
            {/* Search Box (Commented out) */}
            
            <div className="flex-1">
              {/* Navigation Menu */}
              {renderNavItems(filteredItems)}
            </div>

            {/* Bottom Navigation */}
            {bottomNav && renderNavItems(bottomNav.items, true)}
          </div>

          {/* Right Content Area */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
