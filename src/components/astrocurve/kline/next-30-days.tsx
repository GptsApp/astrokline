import { Next30DaysGuidance } from '@/lib/astrokline/mock-astrology-data';
import { CheckCircle2, MoonStar, XCircle } from 'lucide-react';
import { Heading } from "@/components/astrocurve/ui/heading";

export function Next30Days({ data }: { data: Next30DaysGuidance }) {
  return (
    <div className="w-full">
      <div className="mb-10 flex items-center gap-3">
        <Heading level={2} className="font-serif text-3xl tracking-tight text-white/90">
          The Next 30 Days
        </Heading>
        <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div className="relative grid gap-6 md:grid-cols-2">
        {/* Glow behind */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[150%] w-full -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37]/5 blur-[100px]" />

        {/* DOs Card */}
        <div className="group relative overflow-hidden  border border-emerald-500/20 bg-[#15131A] p-6 transition-colors hover:border-emerald-500/40">
          <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500/50 transition-colors group-hover:bg-emerald-400" />
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <Heading level={3} className="text-sm font-bold tracking-widest text-emerald-400 uppercase">
              Action List (Go)
            </Heading>
          </div>
          <ul className="space-y-4">
            {data.dos.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 font-mono text-xs text-emerald-500/50">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-white/80">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* DONTs Card */}
        <div className="group relative overflow-hidden  border border-rose-500/20 bg-[#15131A] p-6 transition-colors hover:border-rose-500/40">
          <div className="absolute top-0 right-0 h-full w-1 bg-rose-500/50 transition-colors group-hover:bg-rose-400" />
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-rose-500/10">
              <XCircle className="h-4 w-4 text-rose-400" />
            </div>
            <Heading level={3} className="text-sm font-bold tracking-widest text-rose-400 uppercase">
              Danger Zone (Stop)
            </Heading>
          </div>
          <ul className="space-y-4">
            {data.donts.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 font-mono text-xs text-rose-500/50">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-white/80">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-white/40">
        <MoonStar className="h-3 w-3" />
        <span>
          Current Lunar Phase: {data.moonPhase} &bull; Astrological Weather:{' '}
          {data.theme}
        </span>
      </div>
    </div>
  );
}
