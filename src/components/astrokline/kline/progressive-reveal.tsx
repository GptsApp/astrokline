"use client";

import { cn } from "@/shared/lib/utils";
import { Sparkles } from "lucide-react";

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
    <div className={cn("relative overflow-hidden", className)}>
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
      <div className="relative z-10 -mt-16 pt-20 pb-8 flex flex-col items-center gap-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-white/60 text-center max-w-sm">
          Unlock the full analysis to see your complete cosmic blueprint.
        </p>
        <button
          onClick={onUpgrade}
          className="px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)]"
        >
          Unlock Full Report
        </button>
      </div>
    </div>
  );
}
