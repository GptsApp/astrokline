'use client';

import { ArrowLeft } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';

export function ToolBreadcrumb({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}
