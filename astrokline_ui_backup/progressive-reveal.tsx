'use client';

import { Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface Props {
  children: React.ReactNode;
  /** Percentage of content height to show before fading (0-100) */
  revealPercent?: number;
  onUpgrade?: () => void;
  className?: string;
}

/**
 * Shows a percentage of children content, then fades to a gradient
 * mask with an "Unlock" CTA. Replaces hard-lock premium gates.
 */
export function ProgressiveReveal({
  children,
  revealPercent = 40,
  onUpgrade,
  className,
}: Props) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Content — fully rendered but masked */}
      <div
        className="pointer-events-none select-none"
        style={{
          maxHeight: `${revealPercent}vh`,
          WebkitMaskImage: `linear-gradient(to bottom, black 50%, transparent 100%)`,
          maskImage: `linear-gradient(to bottom, black 50%, transparent 100%)`,
        }}
      >
        {children}
      </div>

      {/* CTA overlay at the bottom */}
      <div className="from-background via-background/90 relative z-10 -mt-16 flex flex-col items-center gap-4 bg-gradient-to-t to-transparent pt-20 pb-8">
        <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center border">
          <Sparkles className="text-primary h-5 w-5" />
        </div>
        <p className="max-w-sm text-center text-sm text-white/60">
          Unlock the full analysis to see your complete cosmic blueprint.
        </p>
        <button
          type="button"
          onClick={onUpgrade}
          className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 border px-6 py-2.5 text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all hover:scale-105"
        >
          Unlock Full Report
        </button>
      </div>
    </div>
  );
}
