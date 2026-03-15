"use client";

import { motion } from "framer-motion";
import { Heart, Briefcase, Coins, Activity, Lock, Sparkles, Navigation, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { MysticalBorder } from "@/components/astrokline/ui/mystical-border";

const DAILY_WEATHER_DATA = [
  {
    id: "love",
    title: "Love & Connections",
    icon: Heart,
    score: 92,
    color: "from-pink-500/20 to-rose-500/5",
    accent: "text-pink-400",
    accentBg: "bg-pink-500/10",
    transit: "Venus 120° Mars",
    theme: "Magnetic Attraction",
    summary: "Your aura is exceptionally charismatic today. A powerful trine between Venus and Mars activates your relationship sector, making this an ideal time for deep connections.",
    advice: "Express your feelings openly but avoid rushing commitments. A surprise encounter around evening could be significant.",
    isLocked: false,
    energyStatus: "GREEN",
  },
  {
    id: "career",
    title: "Career & Ambition",
    icon: Briefcase,
    score: 85,
    color: "from-blue-500/20 to-cyan-500/5",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    transit: "Mercury in 10th House",
    theme: "Strategic Visibility",
    summary: "Professional communication flows effortlessly. With Mercury illuminating your career zone, superiors are highly receptive to your innovative ideas.",
    advice: "Pitch that concept you've been working on. Schedule important meetings before 3 PM for maximum impact.",
    isLocked: false,
    energyStatus: "GREEN",
  },
  {
    id: "wealth",
    title: "Wealth & Assets",
    icon: Coins,
    score: 45,
    color: "from-emerald-500/20 to-teal-500/5",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    transit: "Saturn Square Sun",
    theme: "Financial Prudence",
    summary: "Cosmic weather demands strict financial discipline today. Saturn's restrictive influence suggests delays in expected returns or unexpected necessary expenses.",
    advice: "Halt all speculative investments. Focus instead on budgeting, reviewing subscriptions, and long-term asset structuring.",
    isLocked: true, // Mocking user Tier logic
    energyStatus: "RED",
  },
  {
    id: "health",
    title: "Physical & Mental Vitality",
    icon: Activity,
    score: 70,
    color: "from-purple-500/20 to-violet-500/5",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    transit: "Moon Square Neptune",
    theme: "Energy Conservation",
    summary: "Physical stamina is adequate, but mental fog is highly likely due to Neptunian haze. Your empathic output may drain your core reserves today.",
    advice: "Prioritize grounding exercises like walking in nature. Swap high-intensity interval training for restorative yoga or meditation.",
    isLocked: true, // Mocking user Tier logic
    energyStatus: "AMBER",
  }
];

interface DailyTarotCardsProps {
  userTier?: "FREE" | "PRO" | "PREMIUM";
}

export function DailyTarotCards({ userTier = "FREE" }: DailyTarotCardsProps) {
  const hasProAccess = userTier === "PRO" || userTier === "PREMIUM";

  // Override locked state based on props
  const cards = DAILY_WEATHER_DATA.map(card => ({
    ...card,
    isLocked: !hasProAccess && (card.id === "wealth" || card.id === "health")
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl mx-auto px-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group flex"
          >
            <MysticalBorder
              className={cn(
                "w-full bg-black/40 backdrop-blur-xl border border-white/5 transition-all duration-500 flex flex-col",
                !card.isLocked && "hover:bg-white/[0.03] hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]"
              )}
            >
              {/* Ambient Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-b opacity-40 pointer-events-none transition-opacity duration-500",
                card.color,
                "group-hover:opacity-60"
              )} />

              <div className="relative z-20 p-6 flex flex-col h-full gap-5">
                
                {/* Header: Icon + Score */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center",
                      card.accentBg, card.accent
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {!card.isLocked ? (
                    <div className="text-5xl font-serif font-bold text-white leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] tracking-tighter">
                      {card.score}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <Lock className="w-4 h-4 text-white/30 mb-1" />
                      <span className="text-4xl font-serif font-bold text-white/10 leading-none tracking-tighter">--</span>
                    </div>
                  )}
                </div>
                {/* Title & Theme */}
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-serif tracking-tight text-white leading-snug mb-1">
                      {card.title}
                    </h3>
                    
                    {/* Traffic Light Energy Status */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/10 shrink-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full shadow-[0_0_8px]",
                        card.energyStatus === "GREEN" ? "bg-emerald-500 shadow-emerald-500/50" :
                        card.energyStatus === "AMBER" ? "bg-amber-500 shadow-amber-500/50" :
                        "bg-red-500 shadow-red-500/50"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold tracking-wider",
                        card.energyStatus === "GREEN" ? "text-emerald-400" :
                        card.energyStatus === "AMBER" ? "text-amber-400" :
                        "text-red-400"
                      )}>
                        {card.energyStatus}
                      </span>
                    </div>
                  </div>
                  {!card.isLocked && (
                    <div className="flex items-center gap-2 mt-1">
                       <span className={cn("text-xs font-mono tracking-wider uppercase", card.accent)}>
                         {card.theme}
                       </span>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />

                {/* Content Area */}
                {!card.isLocked ? (
                  <div className="flex flex-col gap-4 flex-grow">
                    
                    {/* Transit Data */}
                    <div className="flex items-center gap-2 text-xs font-medium text-white/70 bg-white/5 w-fit px-2.5 py-1 rounded-md border border-white/5">
                      <Sparkles className="w-3 h-3 text-primary/70" />
                      {card.transit}
                    </div>

                    {/* AI Summary */}
                    <p className="text-sm text-white/70 leading-relaxed">
                      {card.summary}
                    </p>

                    {/* Action Advice */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-start gap-2">
                        <Navigation className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-white/90 leading-relaxed font-medium">
                          <span className="text-primary/80 mr-1">Guidance:</span>
                          {card.advice}
                        </p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-grow flex flex-col justify-center relative group/lock overflow-hidden rounded-xl">
                    {/* Fake Blurred Content */}
                    <div className="flex flex-col gap-4 opacity-30 blur-[6px] select-none pointer-events-none transition-all duration-700 group-hover/lock:blur-[8px] group-hover/lock:opacity-20 absolute inset-0 pt-2">
                       <div className="w-fit px-2.5 py-1 rounded-md border border-white/5 bg-white/5 text-xs text-transparent">Transit: Mars Trine Pluto</div>
                       <div className="space-y-2">
                         <div className="h-2.5 bg-white/80 rounded w-[90%]" />
                         <div className="h-2.5 bg-white/80 rounded w-[70%]" />
                         <div className="h-2.5 bg-white/80 rounded w-[85%]" />
                       </div>
                       <div className="mt-auto flex items-start gap-2 pt-2 border-t border-white/5">
                         <div className="w-3.5 h-3.5 rounded-full bg-white/80 shrink-0" />
                         <div className="h-2.5 bg-white/80 rounded w-full" />
                       </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-2">
                       <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)] mb-3 group-hover/lock:scale-110 transition-transform">
                         <Lock className="w-4 h-4 text-primary" />
                       </div>
                       <p className="text-xs text-white/60 leading-relaxed mb-4">
                         Unlock premium transit data and AI guidance for this dimension.
                       </p>
                       <a href="/#pricing" className="w-full relative overflow-hidden group/btn flex items-center justify-center bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full px-4 py-2.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                         <span className="text-xs font-bold text-primary group-hover/btn:scale-105 transition-transform">
                           Unlock Now
                         </span>
                       </a>
                    </div>
                  </div>
                )}
              </div>
            </MysticalBorder>
          </motion.div>
        );
      })}
    </div>
  );
}
