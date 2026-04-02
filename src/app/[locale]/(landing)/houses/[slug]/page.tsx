import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { ASTROLOGY_HOUSES, House } from '@/lib/astrokline/houses-data';
import { envConfigs } from '@/config';
import { Heading } from "@/components/astrokline/ui/heading";

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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5 pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/10 absolute top-16 left-1/2 h-80 w-80 -translate-x-1/2 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="text-xl mb-4 font-mono tracking-widest text-primary uppercase">{h.keyword}</p>
          {/* Dynamic H1 catching the high volume SEO search */}
          <Heading level={1} className="text-4xl font-bold tracking-tight md:text-6xl">
            The Ultimate Guide to the
            <br />
            <span className="bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321] bg-clip-text text-transparent">
              {h.name} in Astrology
            </span>
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/65 md:text-lg">
            Naturally ruled by {h.ruler}
          </p>
          {/* H2 for semantic indexing */}
          <Heading level={2} className="sr-only">What Does the {h.name} Represent in Your Chart?</Heading>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/65">
            {h.description}
          </p>
        </div>
      </section>

      {/* Trojan Horse / K-Line Conversion Insight */}
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Heading level={2} className="mb-6 text-3xl font-bold">
            See Your Live {h.name} Transits on the K-Line
          </Heading>
          <Heading level={4} className="mb-4 text-xl text-primary font-medium">
            Don't Just Read Your Chart—Watch It Over Time
          </Heading>
          <div className="border border-white/8 bg-[#111015] p-8">
            <p className="leading-8 text-white/70">{h.klineInsight}</p>
          </div>
        </div>
      </section>

      {/* Strengths & Challenges */}
      <section className="border-b border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Heading level={2} className="mb-8 text-3xl font-bold text-center">
            Planets in the {h.name} and Their Meaning
          </Heading>
          <div className="grid gap-6 md:grid-cols-2">
            <div className=" border border-white/8 bg-[#111015] p-7">
              <Heading level={3} className="mb-4 text-xl font-semibold text-emerald-400">
                Positive Expressions
              </Heading>
              <ul className="space-y-2">
                {h.strengths.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-white/70">
                    <span className="text-emerald-400">✦</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className=" border border-white/8 bg-[#111015] p-7">
              <Heading level={3} className="mb-4 text-xl font-semibold text-rose-400">
                Friction Points
              </Heading>
              <ul className="space-y-2">
                {h.challenges.map((c) => (
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
            Visualize Your Predictive Astrology Chart
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Reading about the {h.name} is just the beginning. Enter your birth time and let our Vedic astrology calculator generate your personalized predictive K-Line.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/kline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center px-6 text-sm font-semibold"
            >
              Generate My Transit Calculator Free →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center border border-white/10 px-6 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Explore Astrokline Pro
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
