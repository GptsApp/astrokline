'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { useRouter } from '@/core/i18n/navigation';
import { trackEvent } from '@/lib/astrokline/track-event';

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { open } = useBirthInfoModal();
  const router = useRouter();

  // Only show on home page variants
  const isHomePage = pathname === '/' || pathname.endsWith('/en') || pathname.endsWith('/zh');

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      // Show when scrolled past the hero section
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  if (!isHomePage) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-center"
        >
          <button
            onClick={() => {
              trackEvent('mobile_sticky_cta_click');
              open((birthData) => {
                router.push('/kline');
              });
            }}
            className="w-full max-w-[400px] h-14 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_10px_40px_-10px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2 group relative overflow-hidden backdrop-blur-md border border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Sparkles className="w-5 h-5" />
            <span className="text-lg tracking-tight">Generate My K-Line</span>
            <ArrowRight className="w-5 h-5 ml-1 mt-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
