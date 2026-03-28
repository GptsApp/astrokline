'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface AstroWheelProps {
  data?: any;
  width?: number;
  height?: number;
  className?: string;
}

// Minimal dummy data to show an intricate chart if no real coords are passed
const DUMMY_DATA = {
  planets: {
    Sun: [0],
    Moon: [120],
    Mercury: [15],
    Venus: [320],
    Mars: [45],
    Jupiter: [180],
    Saturn: [200],
    Uranus: [280],
    Neptune: [300],
    Pluto: [110],
  },
  cusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
};

export function AstroWheel({
  data = DUMMY_DATA,
  width = 600,
  height = 600,
  className,
}: AstroWheelProps) {
  const containerId = useRef(
    `astro-wheel-${Math.random().toString(36).substr(2, 9)}`
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function initChart() {
      try {
        // Dynamically import the library since it relies on window/DOM globals
        const astrology = (await import('@astrodraw/astrochart')).default;

        if (!isSubscribed) return;

        const el = document.getElementById(containerId.current);
        if (!el || typeof window === 'undefined') return;

        el.innerHTML = '';

        // Customize AstroChart for the dark/gold luxury theme
        const settings = {
          COLOR_BACKGROUND: 'transparent',
          POINTS_COLOR: '#D4AF37',
          SIGNS_COLOR: '#D4AF37',
          MARGIN: 40,
          PADDING: 20,
          ID_CHART: containerId.current + '-svg',
          // Removing garish element colors, relying on stroke
          COLOR_FIRE: 'transparent',
          COLOR_EARTH: 'transparent',
          COLOR_AIR: 'transparent',
          COLOR_WATER: 'transparent',
        };

        // Mutate global setting object (astrochart requirement)
        Object.assign(astrology, settings);

        const chart = new (astrology as any).Chart(
          containerId.current,
          width,
          height
        );

        // This will inject raw SVG into the container
        chart.radix(data);

        // Add a subtle glow filter to the SVG natively
        const svgElement = el.querySelector('svg');
        if (svgElement) {
          svgElement.style.filter =
            'drop-shadow(0px 0px 10px rgba(212,175,55,0.3))';
          svgElement.classList.add('animate-in', 'fade-in', 'duration-1000');
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to render AstroWheel:', err);
        if (isSubscribed) {
          setHasError(true);
          setIsLoaded(true);
        }
      }
    }

    initChart();

    return () => {
      isSubscribed = false;
    };
  }, [data, width, height]);

  return (
    <div
      className={cn(
        'relative mx-auto flex aspect-square w-full max-w-[600px] items-center justify-center',
        className
      )}
    >
      {!isLoaded && !hasError && (
        <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}
      {hasError ? (
        <div className="text-muted-foreground bg-primary/5 border-primary/20 absolute inset-0 flex items-center justify-center border">
          <p className="text-sm">Chart rendering unavailable</p>
        </div>
      ) : (
        <div id={containerId.current} className="h-full w-full" />
      )}
    </div>
  );
}
