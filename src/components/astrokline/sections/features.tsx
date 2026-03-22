"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Clock, Cpu, ArrowUpRight, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export function Features() {
  const t = useTranslations("pages.index.page.sections.features");
  return (
    <section id="features" className="py-32 bg-[#0A0A0A] relative overflow-hidden">
      {/* Deep Background Ambience */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[180px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t("engine")}</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight text-white"
          >
            {t("title1")} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FCDD73] to-[#8B7321]">{t("title2")}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            {t("description")}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-[420px]">
          
          {/* Card 1: Top Left - Full Life Timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-7 group relative rounded-3xl border border-white/10 bg-[#121115] overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="p-10 pb-0 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="flex items-end gap-[3px] h-4">
                    <div className="w-1 h-3 bg-primary rounded-full group-hover:h-4 transition-all duration-300"/>
                    <div className="w-1 h-2 bg-primary/70 rounded-full group-hover:h-3 transition-all duration-300 delay-75"/>
                    <div className="w-1 h-4 bg-primary/40 rounded-full group-hover:h-2 transition-all duration-300 delay-150"/>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">{t("card1.title")}</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[400px]">
                {t("card1.desc")}
              </p>
            </div>
            
            {/* Realistically Mocked Chart UI */}
            <div className="flex-1 mt-6 relative w-full overflow-hidden flex items-end px-10">
                <div className="absolute inset-x-0 bottom-0 h-[250px] bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black)" }} />
                <div className="w-[120%] h-[200px] relative -left-[10%] opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:-translate-y-2">
                  <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="kline-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    
                    {/* Grid Lines */}
                    {[40, 80, 120, 160].map(y => (
                      <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    ))}

                    <path d="M0,150 Q150,180 250,90 T550,60 T800,140 T1000,40 L1000,200 L0,200 Z" fill="url(#kline-area)" />
                    <path d="M0,150 Q150,180 250,90 T550,60 T800,140 T1000,40" fill="none" stroke="#D4AF37" strokeWidth="4" filter="url(#glow-gold)" />
                    
                    {/* Highlight Dot */}
                    <circle cx="550" cy="60" r="8" fill="#121115" stroke="#D4AF37" strokeWidth="3" />
                  </svg>
                  {/* Floating tooltip */}
                  <motion.div 
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10px] left-[55%] -translate-x-1/2 bg-[#1A1820] border border-primary/30 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl z-20 backdrop-blur-md flex items-center gap-2"
                  >
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" /> {t("card1.tooltip")}
                  </motion.div>
                </div>
            </div>
          </motion.div>

          {/* Card 2: Top Right - Core Transit Navigation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-5 group relative rounded-3xl border border-white/10 bg-[#121115] overflow-hidden flex flex-col items-center text-center px-8 pt-10"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
            
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
               <Clock className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t("card2.title")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("card2.desc")}
            </p>
            
            <div className="flex-1 w-full relative flex items-center justify-center -mb-8">
               <div className="w-full max-w-[320px] space-y-4">
                 {/* Transit Card 1 */}
                 <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm group-hover:border-white/20 transition-all group-hover:scale-[1.02] relative shadow-lg">
                   <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                     <Sparkles className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div className="text-left flex-1">
                     <div className="text-sm font-bold text-white mb-0.5">{t("card2.items.0.title")}</div>
                     <div className="text-xs text-white/50">{t("card2.items.0.time")}</div>
                   </div>
                   <div className="text-emerald-400 text-xs font-mono font-bold">{t("card2.items.0.stat")}</div>
                 </div>
                 
                 {/* Transit Card 2 */}
                 <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm group-hover:border-white/20 transition-all duration-500 delay-75 group-hover:scale-[1.02] relative shadow-lg opacity-60 group-hover:opacity-100">
                   <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                     <Shield className="w-5 h-5 text-rose-400" />
                   </div>
                   <div className="text-left flex-1">
                     <div className="text-sm font-bold text-white mb-0.5">{t("card2.items.1.title")}</div>
                     <div className="text-xs text-white/50">{t("card2.items.1.time", { year: 2026 })}</div>
                   </div>
                   <div className="text-rose-400 text-xs font-mono font-bold">{t("card2.items.1.stat")}</div>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Card 3: Bottom Left - AI Engine */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-5 group relative rounded-3xl border border-white/10 bg-[#121115] overflow-hidden flex flex-col p-10 pr-0"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
            <div className="relative z-10 pr-10">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                 <Brain className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t("card3.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                {t("card3.desc")}
              </p>
            </div>
            
            {/* Realistically Mocked Chat Interface */}
            <div className="flex-1 mt-6 relative w-[130%] bg-black/40 border-t border-l border-white/10 rounded-tl-3xl p-8 pb-0 pt-10 flex flex-col gap-4 shadow-inner">
               <div className="bg-[#1A1820] border border-white/10 p-5 rounded-2xl rounded-tl-sm self-start max-w-[85%] shadow-xl shadow-black/50 relative">
                 <div className="absolute -top-3 left-4 bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                   {t("card3.badge")}
                 </div>
                 <p className="text-sm leading-relaxed text-white/90">
                   {t("card3.quote")}
                 </p>
               </div>
            </div>
          </motion.div>

          {/* Card 4: Bottom Right - Astronomical Precision */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-7 group relative rounded-3xl border border-white/10 bg-[#121115] overflow-hidden flex flex-col p-10 pr-0 pb-0"
          >
            <div className="max-w-[400px] relative z-10 pr-10">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                 <Cpu className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t("card4.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                {t("card4.desc")}
              </p>
            </div>
            
            {/* Visual: Polished Astrological Wheel / Tech Mesh */}
            <div className="flex-1 relative w-full h-[250px] overflow-hidden rounded-tl-2xl border-t border-l border-white/10 bg-black/40 shadow-inner group-hover:border-primary/20 transition-colors">
               <div className="absolute top-1/2 left-[60%] -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px]">
                 <motion.svg 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                   viewBox="0 0 200 200" className="w-full h-full opacity-40 group-hover:opacity-60 transition-opacity"
                 >
                   {/* Multiple concentric geometric circles */}
                   <circle cx="100" cy="100" r="90" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 4" />
                   <circle cx="100" cy="100" r="75" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
                   <circle cx="100" cy="100" r="60" fill="none" stroke="#D4AF37" strokeWidth="0.2" />
                   
                   {/* Orbital lines and planetary nodes */}
                   {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                     <line key={deg} x1="100" y1="10" x2="100" y2="190" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" transform={`rotate(${deg} 100 100)`} />
                   ))}

                   {/* Techy Zodiac Slice Marks */}
                   <path d="M100,10 L100,25 M100,175 L100,190" stroke="#D4AF37" strokeWidth="2" />
                   <path d="M10,100 L25,100 M175,100 L190,100" stroke="#D4AF37" strokeWidth="2" />
                   
                   {/* Planetary bodies */}
                   <circle cx="160" cy="50" r="3" fill="#FFF" className="drop-shadow-[0_0_8px_#FFF]" />
                   <circle cx="30" cy="80" r="4" fill="#D4AF37" className="drop-shadow-[0_0_10px_#D4AF37]" />
                   <circle cx="120" cy="170" r="2" fill="#FCDD73" />
                 </motion.svg>
                 
                 {/* Floating Data Panels */}
                 <div className="absolute top-[20%] right-[30%] bg-black/80 border border-white/10 backdrop-blur-md px-3 py-2 rounded-lg text-[10px] font-mono text-white/80 shadow-2xl">
                    <span className="text-primary pr-2">{t("card4.data1_label")}</span>
                    {t("card4.data1_val")}
                 </div>
                 <div className="absolute bottom-[30%] left-[20%] bg-black/80 border border-white/10 backdrop-blur-md px-3 py-2 rounded-lg text-[10px] font-mono text-white/80 shadow-2xl">
                    <span className="text-rose-400 pr-2">{t("card4.data2_label")}</span>
                    {t("card4.data2_val")}
                 </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
