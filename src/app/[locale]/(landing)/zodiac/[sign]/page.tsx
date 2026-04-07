import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { ZODIAC_SIGNS, ZodiacSign } from '@/lib/astrokline/zodiac-data';
import { envConfigs } from '@/config';
import { Heading } from "@/components/astrokline/ui/heading";

type Props = { params: Promise<{ sign: string }> };

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((z) => ({ sign: z.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sign } = await params;
  const z = ZODIAC_SIGNS.find((s) => s.slug === sign);
  if (!z) return {};
  const url = `${envConfigs.app_url}/zodiac/${z.slug}`;
  return {
    title: `${z.name} Birth Chart Reading & K-Line Forecast | AstroKline`,
    description: `Free ${z.name} (${z.dateRange}) birth chart K-Line reading. Discover ${z.name} career timing, relationship windows, and life turning points with AI astrology.`,
    keywords: `${z.slug} birth chart, ${z.slug} natal chart, ${z.slug} astrology, ${z.slug} horoscope, ${z.slug} K-Line, ${z.slug} career timing`,
    alternates: { canonical: url },
    openGraph: {
      title: `${z.name} ${z.symbol} Birth Chart K-Line — AstroKline`,
      description: z.description,
      url,
      type: 'article',
    },
  };
}

export default async function ZodiacPage({ params }: Props) {
  const { sign } = await params;
  const z = ZODIAC_SIGNS.find((s) => s.slug === sign);
  if (!z) notFound();
  return <ZodiacContent sign={z} />;
}

function ZodiacContent({ sign: z }: { sign: ZodiacSign }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${z.name} Birth Chart K-Line Reading`,
    description: z.description,
    author: { '@type': 'Organization', name: 'AstroKline' },
    publisher: { '@type': 'Organization', name: 'AstroKline' },
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5 pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/10 absolute top-16 left-1/2 h-80 w-80 -translate-x-1/2 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="text-7xl mb-4">{z.symbol}</p>
          <Heading level={1} className="text-4xl font-bold tracking-tight md:text-6xl">
            {z.name} Birth Chart
            <br />
            <span className="bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321] bg-clip-text text-transparent">
              K-Line Reading
            </span>
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/65 md:text-lg">
            {z.dateRange} · {z.element} · Ruled by {z.ruler}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/65">
            {z.description}
          </p>
        </div>
      </section>

      {/* K-Line Insight */}
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Heading level={2} className="mb-6 text-3xl font-bold">
            Your {z.name} K-Line Pattern
          </Heading>
          <div className=" border border-white/8 bg-[#111015] p-8">
            <p className="leading-8 text-white/70">{z.klineInsight}</p>
          </div>
        </div>
      </section>

      {/* Strengths & Challenges */}
      <section className="border-b border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className=" border border-white/8 bg-[#111015] p-7">
              <Heading level={3} className="mb-4 text-xl font-semibold text-emerald-400">
                {z.name} Strengths
              </Heading>
              <ul className="space-y-2">
                {z.strengths.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-white/70">
                    <span className="text-emerald-400">✦</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className=" border border-white/8 bg-[#111015] p-7">
              <Heading level={3} className="mb-4 text-xl font-semibold text-rose-400">
                {z.name} Challenges
              </Heading>
              <ul className="space-y-2">
                {z.challenges.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-white/70">
                    <span className="text-rose-400">◆</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Heading level={2} className="text-3xl font-bold md:text-4xl">
            See Your Personal {z.name} K-Line
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Enter your exact birth time and location to generate a K-Line
            specific to your natal chart — not just your Sun sign.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/kline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center  px-6 text-sm font-semibold"
            >
              Reveal My Stars ✨ →
            </Link>
            <Link
              href="/kline"
              className="inline-flex h-12 items-center  border border-white/10 px-6 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Explore the Full K-Line
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
