"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { UserProfile, PlanetPlacement } from "@/lib/astrokline/mock-astrology-data";
import { Clock, Compass, Sun, Moon, ArrowUp, Activity, Binary, ChevronDown, ChevronUp } from "lucide-react";
import { AstrologyChartWheel } from "./astrology-chart-wheel";
import { PlanetaryGrid } from "./planetary-grid";
import { SocialShareModal } from "../ui/social-share-modal";

interface Props {
  profile: UserProfile;
}

const formatPosition = (planet: PlanetPlacement) => {
  return `${planet.degree}°${planet.minute.toString().padStart(2, '0')}' ${planet.sign}`;
};

export function ChartHero({ profile }: Props) {
  const [showCoordinates, setShowCoordinates] = useState(false);
  return (
    <section className="relative w-full overflow-hidden pt-3 pb-2">
      <div className="max-w-7xl mx-auto px-3 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-0 rounded-2xl bg-[#111015]/90 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* subtle background glow */}
          <div className="absolute top-0 right-1/4 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#D4AF37]/5 rounded-full blur-[60px] pointer-events-none" />

          {/* TWO COLUMN: Identity + Chart — compact */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 relative z-10 w-full p-3 md:p-4 items-start">
            
            {/* LEFT COLUMN: Data & Identity */}
            <div className="lg:col-span-6 flex flex-col gap-2 w-full">
              {/* Identity Block — compact */}
              <div className="flex items-center gap-4 w-full">
                <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37] to-purple-800 p-[2px] shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center border border-black overflow-hidden relative">
                      <span className="text-xl font-bold text-white relative z-10">{profile.name.charAt(0)}</span>
                  </div>
                </div>
                
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-white/90">{profile.name}</h1>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/10 border border-white/5 text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3" /> LP {profile.lifePathNumber}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <span className="text-white/70">{profile.birthDate} | {profile.birthTime}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      <Compass className="w-3 h-3 text-purple-400" />
                      <span className="text-white/70">{profile.birthLocation}</span>
                    </div>
                  </div>

                  <SocialShareModal profile={profile} source="kline" />
                </div>
              </div>

              {/* Big 3 — compact row cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                {/* Sun */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Sun className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Sun</span>
                      <span className="text-[9px] text-yellow-500/70 font-mono">H{profile.sun.house}</span>
                    </div>
                    <p className="text-base font-serif text-white/90 leading-tight">{profile.sun.sign}</p>
                    <p className="text-[10px] font-mono text-white/40">{formatPosition(profile.sun)}</p>
                  </div>
                </div>

                {/* Moon */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Moon</span>
                      <span className="text-[9px] text-blue-400/70 font-mono">H{profile.moon.house}</span>
                    </div>
                    <p className="text-base font-serif text-white/90 leading-tight">{profile.moon.sign}</p>
                    <p className="text-[10px] font-mono text-white/40">{formatPosition(profile.moon)}</p>
                  </div>
                </div>

                {/* Rising */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <ArrowUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">ASC</span>
                      <span className="text-[9px] text-purple-400/70 font-mono">H{profile.rising.house}</span>
                    </div>
                    <p className="text-base font-serif text-white/90 leading-tight">{profile.rising.sign}</p>
                    <p className="text-[10px] font-mono text-white/40">{formatPosition(profile.rising)}</p>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row: Elements + Modalities + Tech Tags — single compact line */}
              <div className="flex flex-wrap items-center gap-2 w-full">
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-[10px] font-mono">
                  <span className="text-white/30 font-bold">EL</span>
                  <span className="text-rose-500">{profile.elements.fire}%</span>
                  <span className="text-[#D4AF37]">{profile.elements.earth}%</span>
                  <span className="text-blue-400">{profile.elements.air}%</span>
                  <span className="text-blue-600">{profile.elements.water}%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-[10px] font-mono text-white/60">
                  <span className="text-white/30 font-bold">MOD</span>
                  <span>C{profile.modalities.cardinal}%</span>
                  <span>F{profile.modalities.fixed}%</span>
                  <span>M{profile.modalities.mutable}%</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-white/20">
                  <Binary className="w-3 h-3" />
                  <span>DE431 · Placidus · True N.</span>
                </div>
              </div>
            </div> {/* END LEFT COL */}

            {/* RIGHT COLUMN: Astrology Wheel */}
            <div className="lg:col-span-6 flex items-center justify-center lg:pl-2">
               <div className="w-full max-w-[300px] lg:max-w-[360px] aspect-square">
                  <AstrologyChartWheel planets={profile.planets || []} rising={profile.rising} size={500} className="w-full h-full" />
               </div>
            </div>
          </div>
          
          {/* INTEGRATED: Natal Coordinates — collapsible, default collapsed */}
          {profile.planets && profile.planets.length > 0 && (
            <div className="border-t border-white/5">
              <button
                onClick={() => setShowCoordinates(!showCoordinates)}
                className="w-full flex items-center justify-between px-5 py-3 text-[11px] font-mono text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors"
              >
                <span>Natal Coordinates ({profile.planets.length} bodies)</span>
                {showCoordinates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showCoordinates && (
                <PlanetaryGrid planets={profile.planets} className="rounded-none border-0 bg-transparent" compact />
              )}
            </div>
          )}
          
        </motion.div>
      </div>
    </section>
  );
}
