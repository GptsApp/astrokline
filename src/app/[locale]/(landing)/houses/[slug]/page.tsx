import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Star, Activity, Sparkles, AlertTriangle } from 'lucide-react';

import { ASTROLOGY_HOUSES, House } from '@/lib/astrokline/houses-data';
import { envConfigs } from '@/config';
import { Heading } from "@/components/astrokline/ui/heading";
import { InlineBirthForm } from '@/components/astrokline/ui/inline-birth-form';
import { cn } from '@/shared/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return ASTROLOGY_HOUSES.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const h = ASTROLOGY_HOUSES.find((s) => s.slug === slug);
  if (!h) return {};
  const url = `${envConfigs.app_url}/houses/${h.slug}`;
  return {
    title: `${h.name} Astrology | Understanding the 12 Houses in Astrology`,
    description: `What does the ${h.name} represent? Learn about the astrology houses and how to track their live planetary transits using the predictive Astrokline chart.`,
    keywords: `${h.slug} astrology, astrology houses, 1st-12th house astrology, predictive astrology, vedic astrology calculator, ${h.keyword} astrology`,
    alternates: { canonical: url },
    openGraph: {
      title: `${h.name} (${h.keyword}) in Astrology — AstroKline`,
      description: h.description,
      url,
      type: 'article',
    },
  };
}

export default async function HousePage({ params }: Props) {
  const { slug } = await params;
  const h = ASTROLOGY_HOUSES.find((s) => s.slug === slug);
  if (!h) notFound();
  return <HouseContent house={h} />;
}

// Server-side pure CSS animation wrappers for instant display
function FadeInText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("animate-in fade-in duration-1000 fill-mode-both", className)} style={{ animationDelay: '200ms' }}>
      {children}
    </p>
  );
}

function FadeInStats({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both", className)} style={{ animationDelay: '300ms' }}>
      {children}
    </div>
  );
}

function HouseContent({ house: h }: { house: House }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `The Essential Guide to the ${h.name} in Astrology`,
    description: h.description,
    author: { '@type': 'Organization', name: 'AstroKline' },
    publisher: { '@type': 'Organization', name: 'AstroKline' },
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero Section with Contextual Form Hook */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-28">
        {/* Impeccable Background Base */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 h-80 w-80 bg-primary/10 blur-[120px] pointer-events-none opacity-50" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-12 xl:gap-24">
            
            {/* Left Column: Semantic Titles & NASA Stats */}
            <div className="flex-1 w-full lg:w-[45%] max-w-2xl space-y-8 pt-4 xl:pt-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
                  {h.keyword}
                </span>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-mono">
                  Ruled by {h.ruler}
                </span>
              </div>

              <Heading level={1} className="text-5xl md:text-6xl lg:text-[70px] xl:whitespace-nowrap flex flex-col tracking-tighter leading-[1]">
                <span className="block opacity-95">
                  The Complete
                </span>
                <span className="block italic mt-1 pt-1 text-primary font-light">
                  {h.name} Guide
                </span>
              </Heading>

              {/* H2 logically supporting the page's search intent but visually acting as a subtitle */}
              <Heading level={2} className="sr-only">What Does the {h.name} Represent in Astrology?</Heading>

              <FadeInText className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light border-l-2 border-primary pl-6 max-w-lg">
                {h.description}
              </FadeInText>

              {/* Trust Evidence Bar natively baked into the Hero */}
              <FadeInStats className="flex flex-wrap border-y border-white/10 py-6 mt-8 items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Powered by</span>
                  <span className="text-sm font-bold text-foreground font-mono tracking-wide">NASA Data</span>
                </div>
                <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Approach</span>
                  <span className="text-sm font-bold text-primary flex items-center gap-1.5 font-mono tracking-wide">
                    <Activity className="h-3.5 w-3.5" /> Vedic + Western
                  </span>
                </div>
                <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Precision</span>
                  <span className="text-sm font-bold text-foreground font-mono tracking-wide">Swiss Ephemeris</span>
                </div>
              </FadeInStats>
            </div>

            {/* Right Column: The "Trojan Horse" Conversion Form */}
            <div className="w-full lg:w-[55%] xl:w-[540px] relative z-20 shrink-0 pt-4 lg:pt-8 xl:pr-12">
              <FadeInStats>
                <div className="relative w-full group">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-primary/50 z-30" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-primary/50 z-30" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-primary/50 z-30" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-primary/50 z-30" />
                  <div className="w-full border border-white/10 bg-[#050505]/90 shadow-2xl relative overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 relative z-10" />
                    <div className="p-8 relative z-10">
                      <div className="mb-6 flex flex-col justify-start">
                        <Heading level={3} variant="card" className="font-semibold text-2xl mb-2 text-white">
                          What is in YOUR {h.name}?
                        </Heading>
                        <p className="text-muted-foreground text-sm font-light leading-relaxed">
                          Enter your exact birth time. We calculate your {h.name} placements and reveal how its active transits shape your personal timeline.
                        </p>
                      </div>
                      <InlineBirthForm />
                    </div>
                  </div>
                </div>
              </FadeInStats>
            </div>

          </div>
        </div>
      </section>

      {/* Bento Box Layout for Deep Data */}
      <section className="bg-white/[0.01] border-y border-white/5 py-24 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Heading level={2} className="text-3xl lg:text-4xl font-bold mb-12 text-center md:text-left">
            Planetary Weather: <span className="text-primary italic font-light">The {h.name}</span>
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: K-Line Insight (Colspan 2) */}
            <div className="md:col-span-2 border border-white/10 bg-[#08080A] p-8 md:p-10 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity className="w-32 h-32" />
              </div>
              <Heading level={3} className="text-2xl font-semibold mb-2 text-white/90">
                Transits & K-Line Volatility
              </Heading>
              <h4 className="text-primary text-sm uppercase tracking-widest font-mono mb-6">Cosmic Insight</h4>
              <p className="text-muted-foreground text-lg font-light leading-relaxed relative z-10 max-w-2xl">
                {h.klineInsight}
              </p>
            </div>

            {/* Bento 2: Core Identity Box */}
            <div className="border border-white/10 bg-[#08080A] p-8 flex flex-col justify-center items-center text-center">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                 <Star className="w-6 h-6 text-primary" />
               </div>
               <Heading level={3} className="text-xl font-medium text-white mb-2">{h.keyword}</Heading>
               <p className="text-muted-foreground text-sm font-light">
                 The undisputed domain of your chart representing {h.keyword.toLowerCase()} and ruled by the energy of {h.ruler}.
               </p>
            </div>

            {/* Bento 3: Strengths Card */}
            <div className="border border-white/10 bg-gradient-to-br from-[#08080A] to-emerald-950/20 p-8 md:p-10 group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-md">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <Heading level={3} className="text-xl font-semibold text-emerald-100">
                  Momentum Triggers
                </Heading>
              </div>
              <ul className="space-y-4">
                {h.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-muted-foreground font-light group-hover:text-emerald-100/70 transition-colors">
                    <span className="text-emerald-500/50 mt-1">✦</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Bento 4: Friction Points Card */}
            <div className="md:col-span-2 border border-white/10 bg-gradient-to-bl from-[#08080A] to-rose-950/20 p-8 md:p-10 group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-rose-500/10 rounded-md">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <Heading level={3} className="text-xl font-semibold text-rose-100">
                  Friction & Shadow Transits
                </Heading>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {h.challenges.map((c) => (
                  <div key={c} className="flex items-start gap-3 text-muted-foreground font-light border-l border-rose-500/20 pl-4 py-1">
                     {c}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <Heading level={2} className="text-3xl font-bold md:text-5xl mb-6">
            Ready to track your <span className="text-primary italic font-light">{h.name}</span>?
          </Heading>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg font-light mb-10">
            Stop reading generic descriptions. See exactly which planets are in your {h.name} and track their live transits on your dynamic K-Line.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/kline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-14 items-center px-8 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105"
            >
              Reveal My Chart ✨ →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-14 items-center border border-white/20 px-8 text-base font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              Explore Astrokline Pro
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
