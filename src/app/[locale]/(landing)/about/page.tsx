import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AstroKline - The Science Behind Your Destiny K-Line',
  description: 'AstroKline combines NASA-grade Swiss Ephemeris calculations with AI-powered interpretation to create the world\'s first interactive destiny timeline visualization.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/70 mb-4 block">About Us</span>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white/90 mb-6 leading-tight">
            The Science Behind<br />Your Destiny K-Line
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
            We believe astrology should be built on real astronomy, interpreted with psychological depth, and delivered as an experience you can actually use.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-serif text-white/90 mb-8">Who Built This</h2>
          <div className="space-y-6 text-[15px] text-white/70 leading-relaxed">
            <p>
              AstroKline was born from a simple frustration: most astrology apps give you a paragraph about your Sun sign and call it a day. We wanted something that treats your birth chart with the precision it deserves — and presents it in a way that actually reveals the shape of your life.
            </p>
            <p>
              Behind the scenes is a team that combines <strong className="text-white/90">data science and cloud engineering</strong> with a deep respect for astrological tradition. Our astronomical calculations run on <strong className="text-white/90">Swiss Ephemeris (DE431)</strong> — the same dataset used by professional observatories — ensuring every planetary position is accurate to fractions of a degree.
            </p>
            <p>
              But numbers alone don&apos;t change lives. Our AI interpretation layer is trained to translate raw chart data into <strong className="text-white/90">psychologically grounded insights</strong> — not vague horoscope fluff, but precise observations about your behavioral patterns, timing windows, and growth edges.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-serif text-white/90 mb-8">What Makes AstroKline Different</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#111015] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-base font-bold text-white/90 mb-2">The K-Line Visualization</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                We invented the Destiny K-Line — an interactive timeline that maps your life&apos;s energy flow across decades. No other astrology tool shows you the shape of your entire life at a glance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111015] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>
              </div>
              <h3 className="text-base font-bold text-white/90 mb-2">NASA-Grade Precision</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Every chart is calculated using Swiss Ephemeris DE431 — the gold standard in astronomical computation. Placidus house system, True Node. No shortcuts, no rounding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111015] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <h3 className="text-base font-bold text-white/90 mb-2">AI + Psychology</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Our AI doesn&apos;t generate generic horoscopes. It analyzes your full chart — aspects, transits, progressions — and translates them into psychologically grounded, actionable guidance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111015] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-base font-bold text-white/90 mb-2">Privacy First</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Your birth data is yours. We don&apos;t sell it, share it, or use it for advertising. All calculations happen server-side with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Process */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-serif text-white/90 mb-8">Our Process</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">1</div>
              <div>
                <h3 className="text-base font-bold text-white/90 mb-1">Precise Astronomical Calculation</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your birth time and location are fed into Swiss Ephemeris to compute exact planetary positions, house cusps, aspects, and midpoints — down to arc-seconds of precision.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">2</div>
              <div>
                <h3 className="text-base font-bold text-white/90 mb-1">K-Line Algorithm</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Our proprietary algorithm maps major planetary transits (Saturn returns, Jupiter cycles, eclipses, nodal returns) into a continuous energy timeline that reveals the rhythm of your life.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">3</div>
              <div>
                <h3 className="text-base font-bold text-white/90 mb-1">AI-Powered Interpretation</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Only after the math is complete does our AI layer engage — translating raw astronomical data into clear, psychologically grounded insights about your personality, relationships, career, and timing.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">4</div>
              <div>
                <h3 className="text-base font-bold text-white/90 mb-1">Continuous Calibration</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  We continuously refine our interpretation models against real user feedback, ensuring that every reading gets smarter, more precise, and more useful over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-serif text-white/90 mb-4">Ready to See Your K-Line?</h2>
          <p className="text-sm text-white/50 mb-8 max-w-md mx-auto">
            It takes 30 seconds to enter your birth info. No credit card required. Your destiny timeline is waiting.
          </p>
          <a
            href="/kline"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-primary/90 transition-all hover:scale-105"
          >
            Reveal My K-Line
          </a>
        </div>
      </section>
    </div>
  );
}
