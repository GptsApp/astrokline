"use client";

import { motion } from "framer-motion";
import { Calendar, Target, Sparkles, AlertCircle } from "lucide-react";

export function CurrentEnergy() {
  return (
    <div className="w-full space-y-8 py-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Current Time Guide</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* THIS MONTH */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="relative overflow-hidden bg-gradient-to-br from-[#15131A] to-[#111015] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl group"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
           
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                     <Calendar className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                     <span className="block text-sm font-semibold text-white/50 tracking-wider uppercase">This Month</span>
                     <span className="font-bold text-lg text-white">November 2024</span>
                   </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Action Required
                </div>
             </div>

             <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">The Career Crucible</h3>
             <p className="text-muted-foreground leading-relaxed text-[15px] mb-6">
               Mars transits your 10th house. Expect sudden pushback from authority figures and an intense drive to prove yourself. Do not shy away from conflict; use it to establish boundaries.
             </p>

             <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-white/90 font-medium">Focus on solitary deep work. Avoid launching products until the 15th.</p>
             </div>
           </div>
        </motion.div>

        {/* THIS YEAR */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.1 }}
           className="relative overflow-hidden bg-gradient-to-br from-[#15131A] to-[#111015] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl group"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:bg-[#D4AF37]/20 transition-colors" />
           
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                     <Target className="w-5 h-5 text-[#D4AF37]" />
                   </div>
                   <div>
                     <span className="block text-sm font-semibold text-white/50 tracking-wider uppercase">This Year</span>
                     <span className="font-bold text-lg text-white">Theme of 2024</span>
                   </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold">
                  Major Transit
                </div>
             </div>

             <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Shattering Old Structures</h3>
             <p className="text-muted-foreground leading-relaxed text-[15px] mb-6">
               Pluto enters your 2nd house of values and assets. The financial structures you relied on in the past decade are being fundamentally transformed. You are learning the true meaning of self-worth.
             </p>

             <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-sm text-white/90 font-medium">Do not cling to depreciating assets. Invest heavily in unshakeable personal skills.</p>
             </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
