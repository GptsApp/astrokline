'use client';

import { cn } from '@/shared/lib/utils';

interface ReportSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** Whether to show the top border divider (default: true) */
  divider?: boolean;
  /** Full-bleed mode — content stretches to viewport width (default: false) */
  fullBleed?: boolean;
}

/**
 * Unified section wrapper for the KLine report page.
 * Enforces consistent max-width (1024px), padding, and section dividers.
 */
export function ReportSection({
  id,
  children,
  className,
  divider = true,
  fullBleed = false,
}: ReportSectionProps) {
  if (fullBleed) {
    return (
      <section
        id={id}
        className={cn(divider && 'border-t border-white/[0.04]', className)}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      className={cn(
        'mx-auto max-w-5xl px-4 py-8 md:px-6',
        divider && 'border-t border-white/[0.04]',
        className
      )}
    >
      {children}
    </section>
  );
}
