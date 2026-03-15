"use client";

import { motion } from "framer-motion";
import { Moon, Sparkles, Navigation, Info } from "lucide-react";

interface Props {
  className?: string;
  phaseName?: string;
  illumination?: number; // 0 to 100
  moonSign?: string;
  advice?: string;
  nextFullMoon?: string;
  nextNewMoon?: string;
}

export function MoonPhaseCard({
  className,
  phaseName = "Waxing Crescent",
  illumination = 35,
  moonSign = "Taurus",
  advice = "Gather resources and lay strong foundations. The energy is slowly building up towards manifestation.",
  nextFullMoon = "April 23",
  nextNewMoon = "May 8",
}: Props) {
  // Translate illumination to a visual phase
  // Very rough approximation for visual SVG masking
  const phaseOffset = (illumination / 100) * 100;
  
  return (
    <div className={`relative flex flex-col p-6 rounded-3xl bg-[#0B0A0F]/90 backdrop-blur-xl border border-white/[0.08] overflow-hidden ${className}`}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
              Current Lunar Phase
            </span>
          </div>
          <h3 className="text-2xl font-serif text-white tracking-tight">
            {phaseName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-sm font-medium text-white/60">
              Moon in {moonSign}
            </span>
          </div>
        </div>

        {/* The 3D CSS / SVG Moon Visualization */}
        <div className="relative w-24 h-24 shrink-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          {/* Base Moon Context (Dark/New Moon Base) */}
          <div className="absolute inset-0 rounded-full bg-[#111015] border border-white/10 overflow-hidden">
             
             {/* Illumination Overlay - Using a trick with gradient and masking based on % */}
             <div 
                className="absolute inset-0 bg-gradient-to-tr from-slate-200 via-white to-slate-100 transition-all duration-1000"
                style={{
                  clipPath: illumination > 50 
                    ? `circle(50% at 50% 50%)` // simplification for now
                    : `polygon(0 ${100 - phaseOffset * 2}%, 100% 0, 100% 100%, 0 100%)`, // just a mock mask
                  opacity: illumination / 100
                }}
             />

             {/* Crater details (static overlay) */}
             <div className="absolute inset-0 opacity-20 mix-blend-multiply">
               <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <circle cx="30" cy="40" r="12" fill="currentColor" className="text-black" />
                 <circle cx="65" cy="25" r="8" fill="currentColor" className="text-black" />
                 <circle cx="50" cy="70" r="15" fill="currentColor" className="text-black" />
                 <circle cx="80" cy="60" r="6" fill="currentColor" className="text-black" />
               </svg>
             </div>

             {/* Inner Sphere Shadow for 3D effect */}
             <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Illumination Bar */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between text-xs text-white/50 font-medium">
          <span>Illumination</span>
          <span>{illumination}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${illumination}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full"
          />
        </div>
      </div>

      {/* Astro Implications */}
      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/80 leading-relaxed font-medium">
            {advice}
          </p>
        </div>
      </div>

      {/* Upcoming Phases */}
      <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/30">Next New Moon</span>
          <span className="text-sm font-medium text-white/70">{nextNewMoon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/30">Next Full Moon</span>
          <span className="text-sm font-medium text-white/70">{nextFullMoon}</span>
        </div>
      </div>

    </div>
  );
}
