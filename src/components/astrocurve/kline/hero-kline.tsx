import { KlinePreviewChart } from '@/themes/default/blocks/astro-kline-preview';
import { BorderGlow } from '@/components/astrocurve/ui/border-glow';
import { ZodiacIcon } from '@/components/icons';

const ZODIAC_SIGNS = [
  { sign: 'aries', label: 'Aries' },
  { sign: 'taurus', label: 'Taurus' },
  { sign: 'gemini', label: 'Gemini' },
  { sign: 'cancer', label: 'Cancer' },
  { sign: 'leo', label: 'Leo' },
  { sign: 'virgo', label: 'Virgo' },
  { sign: 'libra', label: 'Libra' },
  { sign: 'scorpio', label: 'Scorpio' },
  { sign: 'sagittarius', label: 'Sagittarius' },
  { sign: 'capricorn', label: 'Capricorn' },
  { sign: 'aquarius', label: 'Aquarius' },
  { sign: 'pisces', label: 'Pisces' },
] as const;

function ZodiacMarquee() {
  const items = [...ZODIAC_SIGNS, ...ZODIAC_SIGNS]; // duplicate for seamless loop
  return (
    <div className="relative mt-5 overflow-hidden py-2" aria-hidden="true">

      <div
        className="flex w-max gap-8 animate-[marquee_20s_linear_infinite]"
      >
        {items.map(({ sign, label }, i) => (
          <div key={`${sign}-${i}`} className="flex items-center gap-2 shrink-0">
            <ZodiacIcon sign={sign} size={24} />
            <span className="text-xs font-mono uppercase tracking-widest text-white/70">{label}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Hero K-Line — renders the static preview chart in the hero area
 * with entrance animation and zodiac marquee.
 */
export function HeroKline() {
  return (
    <div className="relative w-full animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both [animation-delay:300ms]">
      <BorderGlow
        borderRadius={12}
        edgeSensitivity={13}
        glowIntensity={2.2}
        glowRadius={61}
        animated
        backgroundColor="#0A0A0A"
        colors={['#8B5CF6', '#EC4899', '#38BDF8']}
      >
        <KlinePreviewChart compact className="max-w-none rounded-xl bg-transparent shadow-none px-6 py-6 md:px-8 md:py-8" />
      </BorderGlow>

      {/* Zodiac sign marquee */}
      <ZodiacMarquee />
      {/* Trust logos */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-4 pt-4 border-t border-white/10">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs font-medium">Powered by</span>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gem-g)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gem-r)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gem-y)"/><defs><linearGradient gradientUnits="userSpaceOnUse" id="gem-g" x1="7" x2="11" y1="15.5" y2="12"><stop stopColor="#08B962"/><stop offset="1" stopColor="#08B962" stopOpacity="0"/></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="gem-r" x1="8" x2="11.5" y1="5.5" y2="11"><stop stopColor="#F94543"/><stop offset="1" stopColor="#F94543" stopOpacity="0"/></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="gem-y" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stopColor="#FABC12"/><stop offset=".46" stopColor="#FABC12" stopOpacity="0"/></linearGradient></defs></svg>
          <span className="text-xs font-medium">Google Gemini AI</span>
        </span>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="#60A5FA" strokeWidth="1.5"/><ellipse cx="12" cy="12" rx="11" ry="4.5" stroke="#60A5FA" strokeWidth="1" transform="rotate(-30 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4.5" stroke="#60A5FA" strokeWidth="1" transform="rotate(30 12 12)"/><circle cx="12" cy="12" r="1.5" fill="#60A5FA"/></svg>
          <span className="text-xs font-medium">NASA JPL Horizons</span>
        </span>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10.5" stroke="#D4AF37" strokeWidth="1" fill="none"/><circle cx="12" cy="12" r="7.5" stroke="#D4AF37" strokeWidth="0.7" fill="none"/><line x1="12" y1="1" x2="12" y2="23" stroke="#D4AF37" strokeWidth="0.5"/><line x1="1" y1="12" x2="23" y2="12" stroke="#D4AF37" strokeWidth="0.5"/><line x1="4.2" y1="4.2" x2="19.8" y2="19.8" stroke="#D4AF37" strokeWidth="0.4"/><line x1="19.8" y1="4.2" x2="4.2" y2="19.8" stroke="#D4AF37" strokeWidth="0.4"/><circle cx="12" cy="12" r="1.5" fill="#D4AF37"/></svg>
          <span className="text-xs font-medium">Swiss Ephemeris</span>
        </span>
      </div>
    </div>
  );
}
