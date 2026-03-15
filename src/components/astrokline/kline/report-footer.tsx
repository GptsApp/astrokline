'use client';

import { useState, useEffect } from 'react';
import { Share2, Download, Sparkles } from "lucide-react";
import { UserProfile } from "@/lib/astrokline/mock-astrology-data";
import { trackEvent } from '@/lib/astrokline/track-event';

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
    <div className="w-full mt-24 pb-32 border-t border-white/5 pt-16 relative flex flex-col items-center text-center">
      {/* Mystical Source Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Sparkles className="w-6 h-6 text-[#D4AF37] mb-6 opacity-50" />
      
      <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-white/90 mb-4 max-w-2xl leading-relaxed">
        &quot;Your chart is not a life sentence, it is an architectural blueprint. The stars incline, they do not bind.&quot;
      </h2>
      <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em] mb-12">
        — AstroKline Core Ephemeris
      </p>

      {/* Share / CTA Section */}
      <div className="bg-[#15131A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-md w-full relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="mb-6">
             <h3 className="text-white font-medium mb-1">Your Cosmic Blueprint is ready</h3>
             <p className="text-sm text-white/50">Save {profile.name}&apos;s detailed energetic profile to your device or share it with trusted confidants.</p>
          </div>

          <div className="flex flex-col gap-3">
             <button
               onClick={() => trackEvent('share_button_click', { action: 'download' })}
               className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black hover:bg-[#FCDD73] transition-colors py-3.5 rounded-xl font-medium text-sm"
             >
                <Download className="w-4 h-4" />
                <span>Save High-Res Blueprint</span>
             </button>
             <button
               onClick={() => trackEvent('share_button_click', { action: 'share' })}
               className={`w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white transition-colors py-3.5 rounded-xl font-medium text-sm border border-white/10 hover:border-white/20 ${
                 showSharePrompt ? 'animate-pulse ring-2 ring-primary/40' : ''
               }`}
             >
                <Share2 className="w-4 h-4" />
                <span>Share My Destiny Pattern</span>
             </button>
             {showSharePrompt && (
               <p className="text-xs text-primary/80 animate-in fade-in duration-500">
                 Your K-Line is exceptional — share it with friends!
               </p>
             )}
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <p className="mt-16 max-w-2xl text-[10px] leading-relaxed text-white/20 font-mono tracking-wide text-center">
        Disclaimer: AstroKline provides astrological insights for entertainment and self-reflection purposes only. Our readings do not constitute professional medical, legal, financial, or psychological advice. Astrology reveals tendencies and potentials — not fixed outcomes. You always retain free will.
      </p>
    </div>
  );
}
