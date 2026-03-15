"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Info, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ChartSettingsProps {
  className?: string;
}

export function ChartSettingsPanel({ className }: ChartSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zodiac, setZodiac] = useState("Tropical");
  const [houseSystem, setHouseSystem] = useState("Placidus");
  const [orbs, setOrbs] = useState("Default");

  return (
    <div className={cn("w-full bg-[#0A0A0F]/50 border-b border-white/5 backdrop-blur-md", className)}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-3 text-xs font-mono font-medium text-white/50 hover:text-white/80 transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Chart Settings</span>
          <span className="text-white/20 px-1">•</span>
          <span className="text-primary/70">{zodiac}</span>
          <span className="text-white/20">/</span>
          <span className="text-primary/70">{houseSystem}</span>
          <span className="text-white/20">/</span>
          <span className="text-primary/70">{orbs} Orbs</span>
          
          <ChevronDown
            className={cn("w-3.5 h-3.5 ml-1 transition-transform duration-300", isOpen && "rotate-180")}
          />
        </button>

        {/* Expandable Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Zodiac System */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/70">
                      Zodiac System
                    </label>
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-lg">
                    {["Tropical", "Sidereal"].map((sys) => (
                       <button
                         key={sys}
                         onClick={() => setZodiac(sys)}
                         className={cn(
                           "flex-1 text-xs py-1.5 rounded-md font-medium transition-all",
                           zodiac === sys
                             ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm border border-[#D4AF37]/30"
                             : "text-white/40 hover:text-white/60"
                         )}
                       >
                         {sys}
                       </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    Tropical (Seasonal) vs. Sidereal (Constellational)
                  </p>
                </div>

                {/* House System */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/70">
                      House System
                    </label>
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-lg">
                    {["Placidus", "Whole Sign", "Koch"].map((sys) => (
                       <button
                         key={sys}
                         onClick={() => setHouseSystem(sys)}
                         className={cn(
                           "flex-1 text-xs py-1.5 rounded-md font-medium transition-all",
                           houseSystem === sys
                             ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm border border-[#D4AF37]/30"
                             : "text-white/40 hover:text-white/60"
                         )}
                       >
                         {sys}
                       </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    Algorithm for dividing the sky into 12 sectors.
                  </p>
                </div>

                {/* Aspect Orbs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/70">
                      Aspect Orbs
                    </label>
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-lg">
                    {["Strict", "Default", "Wide"].map((sys) => (
                       <button
                         key={sys}
                         onClick={() => setOrbs(sys)}
                         className={cn(
                           "flex-1 text-xs py-1.5 rounded-md font-medium transition-all",
                           orbs === sys
                             ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm border border-[#D4AF37]/30"
                             : "text-white/40 hover:text-white/60"
                         )}
                       >
                         {sys}
                       </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    Tolerance range for angular planetary connections.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
