"use client";

import { motion } from "framer-motion";
import { DestinyReading } from "@/lib/astrokline/mock-astrology-data";
import { Layers, Hourglass, ArrowRightCircle, Sparkles, Zap, Shield, Heart, Brain, Target, Eye, Clock, Leaf, Star } from "lucide-react";

interface CoreInsight {
  tag: string;
  text: string;
  match: number;
}

interface ExtendedReading extends DestinyReading {
  advice: DestinyReading['advice'] & {
    health?: string;
    timing?: string;
  };
  hiddenTalent?: {
    title: string;
    description: string;
    activationAdvice: string;
  };
  coreInsights?: CoreInsight[];
  cosmicQuote?: string;
}

interface Props {
  reading: ExtendedReading;
}

const tagIcons: Record<string, typeof Brain> = {
  "Core Pattern": Brain,
  "Hidden Gift": Eye,
  "Shadow Pattern": Heart,
  "Strategic Edge": Target,
  "Body Wisdom": Leaf,
};

export function ReadingSummary({ reading }: Props) {
  const insights: CoreInsight[] = reading.coreInsights || [];
  const cosmicQuote = reading.cosmicQuote || "You are not behind. You are precisely where a builder needs to be before their defining decade begins.";

  return (
    <div className="w-full space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
        <h2 className="text-2xl font-serif tracking-tight text-white/90">Cosmic Diagnosis</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
      </div>

      {/* ── HERO QUOTE ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative px-6 py-8 rounded-2xl bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-purple-500/5 border border-[#D4AF37]/20 overflow-hidden"
      >
        <div className="absolute top-4 left-6 text-5xl text-[#D4AF37]/10 font-serif leading-none">&ldquo;</div>
        <div className="absolute bottom-4 right-6 text-5xl text-[#D4AF37]/10 font-serif leading-none">&rdquo;</div>
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <blockquote className="relative z-10 text-lg md:text-xl font-serif text-white/90 leading-relaxed text-center max-w-3xl mx-auto">
          {cosmicQuote}
        </blockquote>
        <p className="relative z-10 text-center text-[10px] text-[#D4AF37] font-mono uppercase tracking-widest mt-3">
          Your Cosmic Truth
        </p>
      </motion.div>

      {/* ── PERSONAL INSIGHTS with match% ── */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-serif text-white/80">What The Stars See In You</h3>
            <span className="ml-auto text-[9px] font-mono text-white/25 uppercase tracking-widest">AI Precision</span>
          </div>
          
          {insights.map((insight, idx) => {
            const Icon = tagIcons[insight.tag] || Star;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group flex gap-3 p-4 rounded-xl bg-[#111015] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-colors">
                    <Icon className="w-4 h-4 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400/80">{insight.tag}</span>
                  <p className="text-sm text-white/70 leading-relaxed mt-0.5">{insight.text}</p>
                </div>
                <div className="shrink-0 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-base font-bold text-[#D4AF37] font-mono leading-none">{insight.match}%</span>
                  <span className="text-[7px] text-white/25 uppercase tracking-widest">match</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── HIDDEN TALENT ── */}
      {reading.hiddenTalent && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/15 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Hidden Talent</span>
            </div>
            <h4 className="text-lg font-serif text-white/90 mb-2">{reading.hiddenTalent.title}</h4>
            <p className="text-sm text-white/60 leading-relaxed mb-3">{reading.hiddenTalent.description}</p>
            <div className="px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1">How to Activate</p>
              <p className="text-sm text-white/80 leading-relaxed">{reading.hiddenTalent.activationAdvice}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3-CARD DIAGNOSIS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Structure */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-[#111015] border border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-[40px] group-hover:bg-yellow-500/10 transition-colors" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
               <Layers className="w-5 h-5 text-white/50" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">01</span>
            </div>
            <h3 className="text-lg font-serif text-white/90 mb-1">{reading.structure.title}</h3>
            <div className="text-[10px] font-mono text-[#D4AF37] mb-3">{reading.structure.element}</div>
            <p className="text-xs text-white/60 leading-relaxed mb-4 flex-1">{reading.structure.description}</p>
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">Core Vulnerability</p>
              <p className="text-xs text-white/80">{reading.structure.coreChallenge}</p>
            </div>
          </div>
        </motion.div>

        {/* Phase */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-[#111015] border border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
               <Hourglass className="w-5 h-5 text-white/50" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">02</span>
            </div>
            <h3 className="text-lg font-serif text-white/90 mb-3">{reading.phase.title}</h3>
            <div className="space-y-3 flex-1">
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-white/35 mb-0.5">Why you feel stuck</p>
                 <p className="text-xs text-white/60 leading-relaxed">{reading.phase.whyStuck}</p>
               </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 space-y-2">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Turning Point</p>
                 <p className="text-xs text-white font-bold">{reading.phase.turningPoint}</p>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: `${reading.phase.momentum}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-white/35">
                <span>Momentum</span>
                <span>{reading.phase.momentum}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action — with health + timing */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[50px] group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
               <ArrowRightCircle className="w-5 h-5 text-[#D4AF37]" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-black bg-[#D4AF37] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]">03</span>
            </div>
            <h3 className="text-lg font-serif text-white/90 mb-4">Strategic Directives</h3>
            <div className="space-y-3 flex-1">
               <AdviceItem icon={Zap} label="Career" color="text-rose-400" text={reading.advice.career} />
               <AdviceItem icon={Shield} label="Wealth" color="text-emerald-400" text={reading.advice.wealth} />
               <AdviceItem icon={Heart} label="Relationships" color="text-blue-400" text={reading.advice.relationships} />
               {reading.advice.health && (
                 <AdviceItem icon={Leaf} label="Health" color="text-teal-400" text={reading.advice.health} />
               )}
               {reading.advice.timing && (
                 <AdviceItem icon={Clock} label="Timing" color="text-[#D4AF37]" text={reading.advice.timing} />
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdviceItem({ icon: Icon, label, color, text }: { icon: typeof Zap; label: string; color: string; text: string }) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5"><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">{label}</p>
        <p className="text-xs text-white/80 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
