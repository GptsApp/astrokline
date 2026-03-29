'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/astrokline/track-event';
import { Sparkles, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Heading } from "@/components/astrokline/ui/heading";
import { useAppContext } from '@/shared/contexts/app';

interface RegistrationNudgeProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RegistrationNudge({
  isVisible,
  onClose,
}: RegistrationNudgeProps) {
  const [show, setShow] = useState(false);
  const { setAuthModalType, setIsShowSignModal } = useAppContext();
  const authCallbackUrl = '/dashboard/kline';

  useEffect(() => {
    if (isVisible) {
      // Delay appearance for smooth animation
      const timer = setTimeout(() => {
        setShow(true);
        trackEvent('registration_nudge_shown');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className="animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 duration-500"
      style={{ animation: 'slideUp 0.5s ease-out' }}
    >
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <div className="border-primary/30 bg-background/95 relative  border p-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-xl">
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              trackEvent('registration_nudge_dismiss');
              onClose();
            }}
            className="text-muted-foreground hover:text-foreground absolute top-3 right-3 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="text-[#D4AF37] h-5 w-5" />
            <Heading level={3} className="text-foreground text-lg font-bold">
              Save Your Reading
            </Heading>
          </div>

          {/* Benefits */}
          <ul className="text-muted-foreground mb-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="bg-[#D4AF37] h-1.5 w-1.5 shrink-0" />
              Keep your timing curve saved permanently.
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-[#D4AF37] h-1.5 w-1.5 shrink-0" />
              Get notified before major shifts in your path.
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-[#D4AF37] h-1.5 w-1.5 shrink-0" />
              Compare your chart with a partner (1 free reading).
            </li>
          </ul>

          {/* CTA buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                trackEvent('registration_nudge_signup_click');
                setAuthModalType('sign-up');
                setIsShowSignModal(true);
              }}
              className="bg-[#D4AF37] text-black hover:bg-[#FCDD73] flex-1 py-2.5 text-center text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
            >
              Save My Reading
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalType('sign-in');
                setIsShowSignModal(true);
              }}
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 border px-6 py-2.5 text-center text-sm transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
