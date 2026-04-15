'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

/**
 * Generates fake "redacted" text blocks that hint at hidden content.
 * Each block is a gold-tinted bar of random width, creating a ████ effect.
 */
export function RedactedText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = useMemo(
    () =>
      Array.from({ length: lines }, (_, i) => {
        // Deterministic-ish widths that look natural
        const base = 40 + ((i * 37 + 13) % 55);
        return `${base}%`;
      }),
    [lines],
  );

  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {widths.map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="h-3.5 bg-[#D4AF37]/[0.08]"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

/**
 * A teaser block: 1-2 lines of real text followed by redacted blocks.
 * Used in locked AI reading modules to show "you almost see it".
 */
export function RedactedTeaser({
  previewText,
  redactedLines = 4,
  className,
}: {
  previewText?: string;
  redactedLines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {previewText && (
        <p className="text-sm leading-relaxed text-white/50">
          {previewText}
          <span className="text-white/20">…</span>
        </p>
      )}
      <RedactedText lines={redactedLines} />
    </div>
  );
}
