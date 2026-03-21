'use client';

import React, { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface MysticalBorderProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean; // If true, border glows brighter
}

export function MysticalBorder({
  children,
  className,
  isActive = false,
}: MysticalBorderProps) {
  return (
    <div
      className={cn('group relative overflow-hidden rounded-2xl', className)}
    >
      {/* Background and children content */}
      <div className="relative z-10 h-full w-full">{children}</div>

      {/* SVG Mystical Overlay - Pointer events none so it doesn't block clicks */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft gold glow filter for active state */}
            <filter
              id="mystical-glow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g
            stroke={isActive ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)'}
            strokeWidth="1"
            fill="none"
            className="transition-all duration-700 ease-in-out group-hover:stroke-[rgba(212,175,55,0.6)]"
            filter={isActive ? 'url(#mystical-glow)' : ''}
          >
            {/* Outer Box */}
            <rect x="2%" y="2%" width="96%" height="96%" rx="16" />

            {/* Inner Thin Box */}
            <rect
              x="4%"
              y="4%"
              width="92%"
              height="92%"
              rx="12"
              strokeWidth="0.5"
              strokeOpacity="0.7"
            />

            {/* Minimal Corner Flourishes using standard percentage lines instead of complex calc() paths */}
            {/* Top Left */}
            <line x1="2%" y1="10%" x2="2%" y2="15%" />
            <line x1="10%" y1="2%" x2="15%" y2="2%" />

            {/* Top Right */}
            <line x1="98%" y1="10%" x2="98%" y2="15%" />
            <line x1="85%" y1="2%" x2="90%" y2="2%" />

            {/* Bottom Left */}
            <line x1="2%" y1="85%" x2="2%" y2="90%" />
            <line x1="10%" y1="98%" x2="15%" y2="98%" />

            {/* Bottom Right */}
            <line x1="98%" y1="85%" x2="98%" y2="90%" />
            <line x1="85%" y1="98%" x2="90%" y2="98%" />
          </g>
        </svg>
      </div>
    </div>
  );
}
