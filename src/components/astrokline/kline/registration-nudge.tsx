'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/astrokline/track-event';
import { Sparkles, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

interface RegistrationNudgeProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RegistrationNudge({
  isVisible,
  onClose,
}: RegistrationNudgeProps) {
  const [show, setShow] = useState(false);
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
        <div className="border-primary/30 bg-background/95 relative rounded-2xl border p-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-xl">
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
            <Sparkles className="text-primary h-5 w-5" />
            <h3 className="text-foreground text-lg font-bold">
              Your cosmic blueprint disappears in 24h
            </h3>
          </div>

          {/* Benefits */}
          <ul className="text-muted-foreground mb-4 space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
              Sign up to keep your cosmic blueprint forever
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
              Check 2 friends&apos; charts for free
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
              Unlock personalized daily horoscope
            </li>
          </ul>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <Link
              href={{
                pathname: '/sign-up',
                query: { callbackUrl: authCallbackUrl },
              }}
              onClick={() => trackEvent('registration_nudge_signup_click')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-full py-2.5 text-center text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
            >
              Sign Up Free — Keep My K-Line
            </Link>
            <Link
              href={{
                pathname: '/sign-in',
                query: { callbackUrl: authCallbackUrl },
              }}
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 rounded-full border px-6 py-2.5 text-center text-sm transition-all"
            >
              Sign In
            </Link>
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
