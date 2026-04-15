"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Clock, Cpu, ArrowUpRight, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/astrocurve/ui/heading";

export function Features() {
  const t = useTranslations("pages.index.page.sections.features");
  return (
    <section id="features" aria-labelledby="features-heading" data-testid="features-section" className="py-32 bg-[#050505] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-white/80 text-sm font-medium mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t("engine")}</span>
          </motion.div>
          <Heading
            level={2}
            as={motion.h2}
            variant="section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6"
            id="features-heading"
          >
            {t("title1")} <br className="hidden md:block"/>
            <span className="text-primary italic font-light">{t("title2")}</span>
          </Heading>
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
            className="md:col-span-7 group relative  border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col"
            role="article"
            aria-label={t("card1.title")}        
            data-testid="feature-card-kline"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="p-10 pb-0 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10  bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="flex items-end gap-[3px] h-4">
                    <div className="w-1 h-3 bg-primary group-hover:h-4 transition-all duration-300"/>
                    <div className="w-1 h-2 bg-primary/70 group-hover:h-3 transition-all duration-300 delay-75"/>
                    <div className="w-1 h-4 bg-primary/40 group-hover:h-2 transition-all duration-300 delay-150"/>
                  </div>
                </div>
                <Heading level={3} className="mb-2">{t("card1.title")}</Heading>
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

                    <path d="M0,140 C 100,140 150,200 250,170 C 350,140 400,60 550,60 C 700,60 750,160 850,160 C 950,160 980,80 1000,80 L1000,200 L0,200 Z" fill="url(#kline-area)" />
                    <path d="M0,140 C 100,140 150,200 250,170 C 350,140 400,60 550,60 C 700,60 750,160 850,160 C 950,160 980,80 1000,80" fill="none" stroke="#D4AF37" strokeWidth="2.5" filter="url(#glow-gold)" />
                  </svg>
                  
                  {/* Perfect Circle HTML Dot (Prevents SVG stretching) */}
                  <div className="absolute left-[55%] top-[30%] w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full border-2 border-primary bg-[#121115] shadow-[0_0_12px_#D4AF37] z-10" />
                  
                  {/* Floating tooltip */}
                  <motion.div 
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10px] left-[55%] -translate-x-1/2 bg-[#1A1820] border border-primary/30 text-white px-4 py-2  text-xs font-bold shadow-2xl z-20 backdrop-blur-md flex items-center gap-2"
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
            className="md:col-span-5 group relative  border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col px-8 pt-10"
            role="article"
            aria-label={t("card2.title")}
            data-testid="feature-card-transit"
          >

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                 <Clock className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
              </div>
              <Heading level={3} className="mb-2">{t("card2.title")}</Heading>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("card2.desc")}
            </p>
            
            <div className="flex-1 w-full relative flex items-start justify-center pt-8">
               <div className="w-full space-y-4 font-mono z-10">
                 {/* High-end Transit Log 1 */}
                 <div className="w-full border border-white/10 bg-black/60 p-5 relative group-hover:border-primary/40 transition-colors shadow-2xl backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />
                    <div className="flex justify-between items-end mb-3">
                       <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("card2.items.0.time")}</div>
                       <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5">SYNC_MATCH</div>
                    </div>
                    <div className="text-sm font-bold text-white mb-3 font-sans tracking-wide">{t("card2.items.0.title")}</div>
                    <div className="w-full h-[1px] bg-white/10 mb-3" />
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="text-white/40 tracking-widest uppercase">Force Vector</span>
                       <span className="text-emerald-400 font-bold">{t("card2.items.0.stat")}</span>
                    </div>
                 </div>
                 
                 {/* High-end Transit Log 2 */}
                 <div className="w-full border border-white/10 bg-black/60 p-5 relative opacity-50 group-hover:opacity-100 group-hover:border-rose-500/40 transition-all duration-500 shadow-2xl backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />
                    <div className="flex justify-between items-end mb-3">
                       <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("card2.items.1.time", { year: 2026 })}</div>
                       <div className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5">CRITICAL_NODE</div>
                    </div>
                    <div className="text-sm font-bold text-white mb-3 font-sans tracking-wide">{t("card2.items.1.title")}</div>
                    <div className="w-full h-[1px] bg-white/10 mb-3" />
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="text-white/40 tracking-widest uppercase">Force Vector</span>
                       <span className="text-rose-400 font-bold">{t("card2.items.1.stat")}</span>
                    </div>
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
            className="md:col-span-5 group relative  border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col p-10 pr-0"
            role="article"
            aria-label={t("card3.title")}
            data-testid="feature-card-ai"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
            <div className="relative z-10 pr-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                   <Brain className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
                </div>
                <Heading level={3} className="mb-2">{t("card3.title")}</Heading>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                {t("card3.desc")}
              </p>
            </div>
            
            {/* Realistically Mocked Terminal CLI */}
            <div className="flex-1 mt-6 relative w-[130%] bg-[#080808] border-t border-l border-white/10 p-6 pt-[52px] shadow-inner overflow-hidden font-mono flex flex-col">
               <div className="absolute top-0 left-0 w-full h-8 bg-[#111] border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="ml-4 text-[9px] text-white/30 tracking-widest">astro-context-engine — bash</span>
               </div>
               
               <div className="flex-1 space-y-5 relative z-10">
                 <div className="text-xs text-white/60">
                   <span className="text-primary mr-2">❯</span> 
                   <span className="text-white">./jupiter-engine</span> <span className="text-emerald-400">--decode</span> <span className="opacity-50">"Saturn Core"</span>
                 </div>
                 <div className="text-[11px] leading-relaxed text-emerald-400/90 pl-3 border-l-2 border-emerald-500/30 py-1 bg-emerald-500/5">
                   <div className="mb-2 text-primary font-bold uppercase tracking-widest">[{t("card3.badge")}]</div>
                   <div className="text-white/80 font-sans text-sm tracking-wide">
                     "{t("card3.quote")}"
                   </div>
                 </div>
                 <div className="text-xs text-white/50 animate-pulse">
                   <span className="text-primary mr-2">❯</span> _
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Card 4: Bottom Right - Astronomical Precision */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-7 group relative  border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col p-10 pr-0 pb-0"
            role="article"
            aria-label={t("card4.title")}
            data-testid="feature-card-precision"
          >
            <div className="max-w-[400px] relative z-10 pr-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                   <Cpu className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
                </div>
                <Heading level={3} className="mb-2">{t("card4.title")}</Heading>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                {t("card4.desc")}
              </p>
            </div>
            
            {/* Visual: Polished Astrological Wheel / Tech Mesh */}
            <div className="flex-1 relative w-full h-[250px] overflow-hidden border-t border-l border-white/10 bg-[#080808] shadow-inner group-hover:border-primary/20 transition-colors">
               
               {/* Fixed Tactical Grid */}
               <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
               
               <div className="absolute top-1/2 left-[60%] -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px]">
                 <svg 
                   viewBox="0 0 200 200" className="w-full h-full opacity-50 group-hover:opacity-80 transition-opacity animate-[spin_120s_linear_infinite]"
                 >
                   {/* Multiple concentric geometric circles */}
                   <circle cx="100" cy="100" r="90" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="3 6" />
                   <circle cx="100" cy="100" r="75" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
                   <circle cx="100" cy="100" r="60" fill="none" stroke="#D4AF37" strokeWidth="0.3" />
                   
                   {/* Crosshairs & Orbital lines */}
                   <path d="M100,0 L100,200 M0,100 L200,100" stroke="#FFF" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 4"/>
                   {[45, 135].map(deg => (
                     <line key={deg} x1="100" y1="10" x2="100" y2="190" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" transform={`rotate(${deg} 100 100)`} />
                   ))}

                   {/* Techy Zodiac Slice Marks */}
                   <path d="M100,10 L100,25 M100,175 L100,190" stroke="#D4AF37" strokeWidth="2" />
                   <path d="M10,100 L25,100 M175,100 L190,100" stroke="#D4AF37" strokeWidth="2" />
                   
                   {/* Planetary bodies */}
                   <circle cx="160" cy="50" r="3" fill="#FFF" className="drop-shadow-[0_0_8px_#FFF]" />
                   <circle cx="30" cy="80" r="4" fill="#D4AF37" className="drop-shadow-[0_0_10px_#D4AF37]" />
                   <circle cx="120" cy="170" r="2.5" fill="#FCDD73" />
                 </svg>
                 
                 {/* Floating Data Panels */}
                 <div className="absolute top-[20%] right-[30%] bg-[#0A0A0A] border-l-2 border-primary/80 px-3 py-2 font-mono shadow-2xl">
                    <div className="text-[9px] text-primary/60 mb-0.5 tracking-widest uppercase">{t("card4.data1_label")}</div>
                    <div className="text-xs text-white tracking-widest">{t("card4.data1_val")}</div>
                 </div>
                 <div className="absolute bottom-[25%] left-[20%] bg-[#0A0A0A] border-l-2 border-rose-500/80 px-3 py-2 font-mono shadow-2xl">
                    <div className="text-[9px] text-rose-400/60 mb-0.5 tracking-widest uppercase">{t("card4.data2_label")}</div>
                    <div className="text-xs text-white tracking-widest">{t("card4.data2_val")}</div>
                 </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
