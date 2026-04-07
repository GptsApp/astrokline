'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { useRouter } from '@/core/i18n/navigation';
import { trackEvent } from '@/lib/astrokline/track-event';
import { cn } from '@/shared/lib/utils';

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { open } = useBirthInfoModal();
  const router = useRouter();

  const isHomePage = pathname === '/' || pathname.endsWith('/en') || pathname.endsWith('/zh');

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  if (!isHomePage) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-center transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <button
        onClick={() => {
          trackEvent('mobile_sticky_cta_click');
          open((birthData) => {
            router.push('/kline/result');
          });
        }}
        className="w-full max-w-[400px] h-14 bg-primary text-primary-foreground font-bold shadow-[0_10px_40px_-10px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2 group relative overflow-hidden backdrop-blur-md border border-primary/20"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-lg tracking-tight">Get My Risk-Control Map</span>
        <ArrowRight className="w-5 h-5 ml-1 mt-0.5" />
      </button>
    </div>
  );
}
