import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Compass, Orbit, ShieldAlert, Sparkles } from 'lucide-react';

import { StructuredFaqSection } from '@/components/astrokline/content/structured-faq-section';
import { HouseCalculator } from '@/components/astrokline/houses/house-calculator';
import { Heading } from '@/components/astrokline/ui/heading';
import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import { ASTROLOGY_HOUSES, House } from '@/lib/astrokline/houses-data';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return ASTROLOGY_HOUSES.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const h = ASTROLOGY_HOUSES.find((s) => s.slug === slug);
  if (!h) return {};
  const url = `${envConfigs.app_url}/houses/${h.slug}`;
  const houseName = h.name.toLowerCase();
  return {
    title: `${h.name} Meaning + Free Calculator | AstroKline`,
    description: `Use the free ${h.name} calculator to see which sign rules your ${houseName}, which planets fall there, and what it means for ${h.keyword.toLowerCase()} in astrology.`,
    keywords: `${houseName} meaning, ${houseName} calculator, ${houseName} astrology, what does the ${houseName} mean, ${h.keyword.toLowerCase()} astrology`,
    alternates: { canonical: url },
    openGraph: {
      title: `${h.name} Meaning and Calculator`,
      description: `Find your ${houseName} sign, ruling planet, and natal planets with AstroKline's free calculator.`,
      url,
      type: 'website',
    },
  };
}

export default async function HousePage({ params }: Props) {
  const { slug } = await params;
  const h = ASTROLOGY_HOUSES.find((s) => s.slug === slug);
  if (!h) notFound();
  return <HouseContent house={h} />;
}

function normalizeTimingLanguage(text: string) {
  return text.replaceAll('kline', 'life curve');
}

function HouseContent({ house: h }: { house: House }) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${h.name} Meaning + Free Calculator`,
    description: `Learn what the ${h.name} means and calculate your own ${h.name} sign and planets.`,
    author: { '@type': 'Organization', name: 'AstroKline' },
    publisher: { '@type': 'Organization', name: 'AstroKline' },
  };

  const faqItems = [
    {
      question: `What does the ${h.name} mean in astrology?`,
      answer: `${h.description} In practice, the ${h.name} shows how ${h.keyword.toLowerCase()} works in real life, not just in textbook definitions.`,
    },
    {
      question: `How do I know what sign rules my ${h.name}?`,
      answer: `You need your birth date, birth place, and ideally your exact birth time. The house calculator above uses those details to calculate the sign on the cusp of your ${h.name}.`,
    },
    {
      question: `Can I still use the ${h.name} calculator if I do not know my exact birth time?`,
      answer: `Yes, but the result is approximate. Houses shift with birth time, so an unknown time can move the cusp sign or planets between neighboring houses.`,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const relatedHouses = ASTROLOGY_HOUSES.filter((house) => house.slug !== h.slug);
  const timingCopy = normalizeTimingLanguage(h.klineInsight);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section className="relative overflow-hidden border-b border-white/5 pt-24 pb-20 lg:pt-32 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:42px_42px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Free {h.name} Calculator
            </div>

            <Heading level={1} className="mt-6 max-w-3xl text-5xl md:text-7xl lg:text-[5.5rem]">
              Understand Your {h.name} Before You Commit To A Full Reading
            </Heading>

            <Heading level={2} className="sr-only">
              {h.name} meaning and free astrology calculator
            </Heading>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {h.description} This page is intentionally utility-first: it explains the house, lets you calculate your own placement, and keeps the full AstroKline funnel optional.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="border border-white/10 bg-white/[0.02] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                  You will get
                </p>
                <p className="mt-3 text-lg font-semibold text-white/90">
                  House sign and natal planets
                </p>
              </div>
              <div className="border border-white/10 bg-white/[0.02] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                  Natural ruler
                </p>
                <p className="mt-3 text-lg font-semibold text-white/90">
                  {h.ruler}
                </p>
              </div>
              <div className="border border-white/10 bg-white/[0.02] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                  Why time matters
                </p>
                <p className="mt-3 text-lg font-semibold text-white/90">
                  House cusps shift with birth time
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/houses"
                className="inline-flex h-12 items-center border border-white/10 px-6 text-sm font-semibold text-white/80 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Browse All 12 Houses
              </Link>
              <Link
                href="/kline"
                className="inline-flex h-12 items-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.01] hover:bg-primary/90"
              >
                Open Full Life Curve
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/10 bg-[#111015] p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                  <Compass className="h-4 w-4" />
                </div>
                <Heading level={3} className="text-2xl md:text-3xl">
                  What this house rules
                </Heading>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  {h.keyword} is the practical theme. This is the area of life where {h.name.toLowerCase()} symbolism becomes visible in day-to-day decisions.
                </p>
              </div>

              <div className="border border-white/10 bg-[#111015] p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                  <Orbit className="h-4 w-4" />
                </div>
                <Heading level={3} className="text-2xl md:text-3xl">
                  Where it connects to timing
                </Heading>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  {timingCopy}
                </p>
              </div>
            </div>

            <HouseCalculator house={h} />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-white/10 bg-[#111015] p-8">
            <Heading level={2} variant="section" className="mb-4 text-3xl md:text-4xl">
              Read {h.name} With Real-Life Context
            </Heading>
            <p className="text-base leading-8 text-muted-foreground">
              Search intent on house pages is usually practical. People want a plain-English explanation, a fast way to see their own placement, and a clear sense of whether exact birth time changes the answer.
            </p>
            <div className="mt-6 border-l-2 border-primary pl-4 text-sm leading-7 text-white/65">
              If you are near a birth-time boundary, the sign on the cusp or the planets inside the house can shift. That is why AstroKline now treats birthplace and birth-time precision as part of the calculation, not decorative form fields.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-emerald-500/20 bg-emerald-500/[0.06] p-6">
              <Heading level={3} className="text-2xl text-emerald-100">
                Healthy Expression
              </Heading>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-emerald-50/80">
                {h.strengths.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-emerald-300">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-rose-500/20 bg-rose-500/[0.06] p-6">
              <Heading level={3} className="text-2xl text-rose-100">
                Shadow Pattern
              </Heading>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-rose-50/80">
                {h.challenges.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-rose-300">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-white/10 bg-[#111015] p-6 md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <Heading level={3} className="text-2xl md:text-3xl">
                    What this page should do before it sells anything
                  </Heading>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    House pages exist to answer narrow intent first. The user should leave with a clear meaning, a calculated placement, and a sensible next step. The full Life Curve is the upgrade path, not the opening move.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StructuredFaqSection
        title={<>Frequently Asked <span className="text-primary italic font-light">Questions</span></>}
        description={`These are the questions users usually have when they search for "${h.name.toLowerCase()} meaning" or try to calculate their own placement.`}
        items={faqItems}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Heading level={2} variant="section" className="mb-4 text-3xl md:text-4xl">
                Explore The Rest Of The Houses
              </Heading>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Users studying one house usually need the full 1st-to-12th-house framework soon after. The hub page gives them that broader map, and the full Life Curve gives them timing.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/houses"
                className="inline-flex h-12 items-center border border-white/10 px-6 text-sm font-semibold text-white/80 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Open Houses Hub
              </Link>
              <Link
                href="/kline"
                className="inline-flex h-12 items-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.01] hover:bg-primary/90"
              >
                Continue To My Life Curve
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedHouses.map((house) => (
              <Link
                key={house.slug}
                href={`/houses/${house.slug}`}
                className="group border border-white/10 bg-[#111015] p-5 transition-all hover:border-primary/30 hover:bg-white/[0.03]"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                  {house.ruler}
                </p>
                <Heading level={3} className="mt-3 text-2xl md:text-3xl">
                  {house.name}
                </Heading>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  {house.keyword}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
