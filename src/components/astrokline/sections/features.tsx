"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Features() {

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center md:text-left mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Astrology Chart That Maps Your <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FCDD73]">Destiny.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            See the invisible planetary forces shaping your journey. An elegant synthesis of<br className="hidden md:block"/>
            ancient natal chart wisdom and modern K-Line visualization.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px]">
          
          {/* Card 1: Top Left - Life Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="md:col-span-5 md:row-span-1 group relative rounded-3xl border border-white/5 bg-[#15131A] overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="p-8 pb-0 shrink-0 relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Full Life K-Line Overview</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                Not just daily horoscopes. A holistic astrology chart showing your life&apos;s peaks and valleys — mapping your cosmic energy across decades like a destiny stock chart.
              </p>
            </div>
            
            {/* Visual: Abstract Glowing Journey */}
            <div className="flex-1 mt-6 relative w-full overflow-hidden flex justify-center items-end opacity-80 group-hover:opacity-100 transition-opacity">
               <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
               <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                 <path d="M0,50 Q20,20 50,30 T100,10 L100,50 Z" fill="url(#glow-wave)" stroke="none" opacity="0.4" />
                 <path d="M0,50 Q20,20 50,30 T100,10" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                 <defs>
                   <linearGradient id="glow-wave" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
                     <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>
          </motion.div>

          {/* Card 2: Top Right - Turning Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:col-span-7 md:row-span-1 group relative rounded-3xl border border-white/5 bg-[#15131A] overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
            
            <div className="p-8 pb-0 relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Planetary Transit Navigator</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[400px]">
                Anticipate your most transformative moments with precision. Know exactly when a career breakthrough or a soulmate connection is written in your birth chart transits.
              </p>
            </div>
            
            {/* Visual: Timeline Nodes with emotional labels */}
            <div className="flex-1 w-full flex items-center justify-center p-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px] bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="relative w-full max-w-[500px] flex items-center justify-between">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2" />
                  
                  {/* Past Node */}
                  <div className="relative flex flex-col items-center gap-3">
                    <span className="text-[10px] uppercase font-mono text-white/40">2021</span>
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>

                  {/* Active Emotional Node */}
                  <div className="relative flex flex-col items-center gap-4 -translate-y-2">
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#8B7321]/20 border border-primary/30 text-xs font-semibold text-[#FCDD73] shadow-[0_0_20px_rgba(212,175,55,0.2)] whitespace-nowrap">
                      <Sparkles className="w-3 h-3 inline-block mr-1" /> Career Zenith
                    </div>
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_#D4AF37]">
                       <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                    <span className="text-xs font-mono text-primary font-bold">NOW</span>
                  </div>

                  {/* Future Node */}
                  <div className="relative flex flex-col items-center gap-3">
                    <span className="text-[10px] uppercase font-mono text-white/40">2026</span>
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                </div>
            </div>
          </motion.div>

          {/* Card 3: Bottom Left - Beyond 12 Signs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="md:col-span-7 md:row-span-1 group relative rounded-3xl border border-white/5 bg-[#15131A] overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
            
            <div className="p-8 pb-0 relative z-10 w-full text-left md:text-right md:ml-auto">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Beyond the 12 Zodiac Signs</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[400px] ml-auto shrink-0 md:text-right">
                You are more than your Sun sign. Your natal chart K-Line is calculated using your precise birth time and GPS coordinates, revealing an astrological signature entirely unique to you.
              </p>
            </div>
            
            {/* Visual: Celestial Connections */}
            <div className="flex-1 flex justify-center items-center relative overflow-hidden mt-8 md:mt-2">
               <div className="absolute inset-0 bg-primary/10 blur-[90px] rounded-full" />
               <div className="relative w-[300px] h-[150px] opacity-70 group-hover:opacity-100 transition-opacity scale-125 md:scale-150 transform translate-x-[-10%] md:translate-x-[-20%] md:translate-y-[20%]">
                 {/* Constellation-like lines */}
                 <svg className="w-full h-full" viewBox="0 0 300 150">
                    <path d="M50,100 L120,40 L180,80 L250,50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4"/>
                    <path d="M120,40 L150,120 L250,50" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1"/>
                    
                    {/* Stars/Planets */}
                    <circle cx="50" cy="100" r="3" fill="#FFF" opacity="0.5"/>
                    <circle cx="120" cy="40" r="5" fill="#D4AF37" className="animate-pulse shadow-[0_0_10px_#D4AF37]"/>
                    <circle cx="180" cy="80" r="2" fill="#FFF" opacity="0.3"/>
                    <circle cx="150" cy="120" r="4" fill="#FCDD73" opacity="0.8"/>
                    <circle cx="250" cy="50" r="3" fill="#FFF" opacity="0.6"/>
                    
                    {/* Concentric rings hinting at a birth chart */}
                    <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="1" strokeDasharray="2 6"/>
                    <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                 </svg>
               </div>
            </div>
          </motion.div>

          {/* Card 4: Bottom Right - AI Astrologer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="md:col-span-5 md:row-span-1 group relative rounded-3xl border border-white/5 bg-[#15131A] overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
            
            <div className="p-8 pb-0 relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-foreground">AI Astrology Engine</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                Swiss Ephemeris precision meets advanced AI — translating complex planetary transits into deeply authentic, crystal-clear astrology guidance.
              </p>
            </div>
            
            {/* Visual: Soft AI Message Bubble */}
            <div className="flex-1 w-full flex justify-center items-center relative z-10 px-6">
               <div className="relative w-full p-5 rounded-2xl bg-[#1A1820] border border-white/10 shadow-2xl group-hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7321] p-[1px] shrink-0 mt-1">
                       <div className="w-full h-full bg-[#1A1820] rounded-full flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                       </div>
                     </div>
                     <div className="space-y-3">
                       <div className="text-sm text-white/90 leading-relaxed font-medium">
                         &quot;The upcoming Jupiter transit brings profound emotional healing. It&apos;s time to finally let go of past weight.&quot;
                       </div>
                       <div className="flex gap-2">
                          <div className="h-1.5 w-16 bg-primary/40 rounded-full" />
                          <div className="h-1.5 w-8 bg-white/10 rounded-full" />
                       </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
