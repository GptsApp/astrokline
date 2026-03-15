'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { trackEvent } from '@/lib/astrokline/track-event';

interface RegistrationNudgeProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RegistrationNudge({ isVisible, onClose }: RegistrationNudgeProps) {
  const [show, setShow] = useState(false);

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
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500"
      style={{ animation: 'slideUp 0.5s ease-out' }}
    >
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="relative rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15)] p-6">
          {/* Close button */}
          <button
            onClick={() => {
              trackEvent('registration_nudge_dismiss');
              onClose();
            }}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Your cosmic blueprint disappears in 24h</h3>
          </div>

          {/* Benefits */}
          <ul className="text-sm text-muted-foreground space-y-1.5 mb-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              Sign up to keep your cosmic blueprint forever
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              Check 2 friends&apos; charts for free
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              Unlock personalized daily horoscope
            </li>
          </ul>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <a
              href="/sign-up"
              onClick={() => trackEvent('registration_nudge_signup_click')}
              className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold text-center hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Sign Up Free — Keep My K-Line
            </a>
            <a
              href="/sign-in"
              className="py-2.5 px-6 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all text-center"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
