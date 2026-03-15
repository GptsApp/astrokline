import { Next30DaysGuidance } from "@/lib/astrokline/mock-astrology-data";
import { CheckCircle2, XCircle, MoonStar } from "lucide-react";

export function Next30Days({ data }: { data: Next30DaysGuidance }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10">
        <h2 className="text-3xl font-serif tracking-tight text-white/90">The Next 30 Days</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* DOs Card */}
        <div className="bg-[#15131A] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
               <CheckCircle2 className="w-4 h-4 text-emerald-400" />
             </div>
             <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Action List (Go)</h3>
          </div>
          <ul className="space-y-4">
            {data.dos.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                 <span className="text-emerald-500/50 font-mono text-xs mt-1">{(i+1).toString().padStart(2, '0')}</span>
                 <p className="text-white/80 text-sm leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* DONTs Card */}
        <div className="bg-[#15131A] border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-400 transition-colors" />
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
               <XCircle className="w-4 h-4 text-rose-400" />
             </div>
             <h3 className="text-rose-400 font-bold uppercase tracking-widest text-sm">Danger Zone (Stop)</h3>
          </div>
          <ul className="space-y-4">
            {data.donts.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                 <span className="text-rose-500/50 font-mono text-xs mt-1">{(i+1).toString().padStart(2, '0')}</span>
                 <p className="text-white/80 text-sm leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

       <div className="mt-4 flex items-center gap-2 text-xs text-white/40 font-mono justify-center">
          <MoonStar className="w-3 h-3" />
          <span>Current Lunar Phase: {data.moonPhase} &bull; Astrological Weather: {data.theme}</span>
       </div>
    </div>
  );
}
