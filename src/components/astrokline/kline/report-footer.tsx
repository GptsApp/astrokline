'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { trackEvent } from '@/lib/astrokline/track-event';
import { Download, Share2, Sparkles } from 'lucide-react';
import { Heading } from "@/components/astrokline/ui/heading";

export function ReportFooter({ profile }: { profile: UserProfile }) {
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  // Auto-prompt share after 30 seconds on page
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSharePrompt(true);
      trackEvent('share_prompt_shown');
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mt-24 flex w-full flex-col items-center border-t border-white/5 pt-16 pb-32 text-center">
      {/* Mystical Source Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37]/5 blur-[100px]" />

      <Sparkles className="mb-6 h-6 w-6 text-[#D4AF37] opacity-50" />

      <Heading level={2} className="mb-4 max-w-2xl font-serif text-2xl leading-relaxed tracking-tight text-white/90 md:text-3xl">
        &quot;The stars show the path. You choose the pace.&quot;
      </Heading>
      <p className="mb-12 font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
        — AstroKline
      </p>

      {/* Share / CTA Section */}
      <div className="group relative w-full max-w-md overflow-hidden  border border-white/10 bg-[#15131A]/80 p-8 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10">
          <div className="mb-6">
            <Heading level={3} className="mb-1 text-lg font-bold text-white">
              Keep Your Reading
            </Heading>
            <p className="text-sm leading-relaxed text-white/50 mt-2">
              Save your complete timing report or share your unique profile with someone you trust.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent('share_button_click', { action: 'download' });
                window.print();
              }}
              className="flex w-full items-center justify-center gap-2  bg-[#D4AF37] py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#FCDD73]"
            >
              <Download className="h-4 w-4" />
              <span>Save My Report</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                trackEvent('share_button_click', { action: 'share' });
                const shareData = {
                  title: 'My AstroKline Reading',
                  text: 'Check out my personalized timing curve on AstroKline!',
                  url: window.location.href,
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                } catch { /* user cancelled */ }
              }}
              className={`flex w-full items-center justify-center gap-2  border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white transition-colors hover:border-[#D4AF37]/50 hover:bg-[#111015]/80 ${
                showSharePrompt ? 'ring-[#D4AF37]/40 animate-pulse ring-2' : ''
              }`}
            >
              <Share2 className="h-4 w-4" />
              <span>Share With a Friend</span>
            </button>
            {showSharePrompt && (
              <p className="text-[#D4AF37] animate-in fade-in font-mono text-[10px] tracking-widest uppercase duration-500">
                Your friends might find this interesting too
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <p className="mt-16 max-w-2xl text-center font-mono text-[10px] leading-relaxed tracking-wide text-white/20">
        Disclaimer: AstroKline provides astrological insights for personal
        growth and self-reflection. Our readings are not a substitute for
        professional medical, legal, financial, or psychological advice.
        Astrology highlights tendencies and timing patterns — not fixed outcomes. You
        always retain free will.
      </p>
    </div>
  );
}
