"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Shield, Sparkles } from "lucide-react";
import { TransitEvent } from "@/lib/astrokline/mock-astrology-data";
import { cn } from "@/shared/lib/utils";

interface Props {
  transits: TransitEvent[];
}

const getAspectColor = (aspect: string) => {
  switch (aspect.toLowerCase()) {
    case "trine":
    case "sextile":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "square":
    case "opposition":
      return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    case "conjunction":
      return "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20";
    default:
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  }
};

const getThemeIcon = (theme: string) => {
  switch (theme.toLowerCase()) {
    case "career":
      return <Target className="w-5 h-5 text-blue-400" />;
    case "wealth":
      return <Zap className="w-5 h-5 text-yellow-500" />;
    case "growth":
      return <Sparkles className="w-5 h-5 text-purple-400" />;
    case "love":
      return <Shield className="w-5 h-5 text-rose-400" />;
    default:
      return <Zap className="w-5 h-5 text-white/50" />;
  }
};

export function TransitAspects({ transits }: Props) {
  if (!transits || transits.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-serif text-white/90">Current Transits</h3>
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Orb &lt; 2°</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {transits.map((transit, index) => (
          <motion.div
            key={transit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative flex flex-col gap-4 p-5 rounded-2xl bg-[#111015]/80 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300"
          >
            {/* Top row: Theme & Aspect Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5 shadow-inner">
                  {getThemeIcon(transit.theme)}
                </div>
                <span className="text-sm font-semibold text-white/80">{transit.theme}</span>
              </div>
              <div className="flex items-center gap-2">
                {transit.phase && (
                  <span className={cn(
                    "text-[10px] font-mono font-bold uppercase tracking-widest",
                    transit.phase === "Applying" ? "text-primary" :
                    transit.phase === "Exact" ? "text-white/90" : "text-white/40"
                  )}>
                    {transit.phase === "Applying" ? "Applying ↗" :
                     transit.phase === "Exact" ? "Exact ●" : "Separating ↘"}
                  </span>
                )}
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
                    getAspectColor(transit.aspect)
                  )}
                >
                  {transit.aspect}
                </span>
              </div>
            </div>

            {/* The Actual Transit Formula */}
            <div className="flex items-center justify-between py-2 border-y border-white/5 my-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-serif text-white/90">Transit {transit.planet}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/50">Natal Object</span>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <h4 className="text-base font-bold text-white/90 mb-2">{transit.title}</h4>
              <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                {transit.description}
              </p>
              
              {/* Strategic Advice */}
              <div className="mt-auto pt-4 border-t border-white/5">
                <p className="text-xs font-medium text-[#D4AF37]/90 leading-relaxed">
                  <span className="font-bold uppercase tracking-widest text-[#D4AF37] mr-2 text-[10px]">Strategy</span>
                  {transit.advice}
                </p>
              </div>
            </div>

            {/* Intensity Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-black/40 rounded-b-2xl overflow-hidden">
               <div 
                 className={cn(
                   "h-full transition-all duration-1000",
                   transit.impactScore >= 8 ? "bg-rose-500" :
                   transit.impactScore >= 5 ? "bg-yellow-500" : "bg-blue-500"
                 )}
                 style={{ width: `${(transit.impactScore / 10) * 100}%` }}
               />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
