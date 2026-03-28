import Link from 'next/link';
import { Metadata } from 'next';

import { envConfigs } from '@/config';
import { Heading } from "@/components/astrokline/ui/heading";

const aboutUrl = `${envConfigs.app_url}/about`;

export const metadata: Metadata = {
  title: 'About AstroKline | AI Astrology, Birth Chart Timing, and K-Line Forecasts',
  description:
    'Learn how AstroKline turns birth chart data, Swiss Ephemeris calculations, and AI interpretation into a practical astrology timing map for career, money, and relationships.',
  keywords: [
    'about astrokline',
    'ai astrology',
    'birth chart reading',
    'natal chart analysis',
    'astrology timing',
    'astrology k line',
    'destiny chart',
    'swiss ephemeris astrology',
  ],
  alternates: {
    canonical: aboutUrl,
  },
  openGraph: {
    title: 'About AstroKline',
    description:
      'AstroKline combines Swiss Ephemeris precision, astrology timing logic, and AI interpretation to turn birth charts into a practical K-Line forecast.',
    url: aboutUrl,
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About AstroKline',
  url: aboutUrl,
  description:
    'About AstroKline, an AI astrology platform that converts birth chart timing into a readable K-Line forecast.',
  mainEntity: {
    '@type': 'Organization',
    name: 'AstroKline',
    url: envConfigs.app_url,
    sameAs: [envConfigs.app_url],
    description:
      'AstroKline is an astrology software product focused on birth chart timing, long-cycle analysis, and AI-powered interpretation.',
  },
};

const principles = [
  {
    title: 'Astronomy Before Interpretation',
    description:
      'We start with exact birth-chart calculation, not generic sign-based copy. AstroKline uses Swiss Ephemeris data so the underlying planetary positions are precise before any interpretation begins.',
  },
  {
    title: 'Timing Beats Vague Inspiration',
    description:
      'Most astrology content tells users what they are. We focus on when pressure rises, when momentum improves, and when turning points are likely to matter.',
  },
  {
    title: 'Readable Output Matters',
    description:
      'A birth chart can be accurate and still be unusable. The K-Line format exists to make complex transit and cycle data readable at a glance.',
  },
  {
    title: 'Privacy Is Product Quality',
    description:
      'Birth data is sensitive. We treat data protection as a product requirement, not a note hidden at the bottom of the page.',
  },
];

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section className="relative overflow-hidden border-b border-white/5 pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/10 absolute top-16 left-1/2 h-80 w-80 -translate-x-1/2 blur-[120px]" />
          <div className="absolute right-10 bottom-0 h-56 w-56 bg-emerald-500/5 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="text-primary/70 mb-4 font-mono text-xs tracking-[0.3em] uppercase">
            About AstroKline
          </p>
          <Heading level={1} className="mx-auto max-w-3xl text-4xl leading-tight font-bold tracking-tight md:text-6xl">
            A Practical Astrology Product Built Around Timing, Not Fluff
          </Heading>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
            AstroKline was created for people who want more than a generic
            horoscope. We built a system that turns birth chart data into a
            readable timing map, so users can understand momentum, friction,
            and turning points across life, work, money, and relationships.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 py-16">
        <article className="mx-auto max-w-4xl px-6">
          <div className="prose prose-invert prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 max-w-none">
            <Heading level={2}>Why AstroKline Exists</Heading>
            <p>
              The internet is full of astrology content, but most of it is not
              useful when a person is trying to make a real decision. A generic
              horoscope can be entertaining, yet it rarely answers the harder
              questions: when a risky period is likely to peak, when pressure
              starts to ease, and when a strong career or relationship window
              becomes more likely.
            </p>
            <p>
              AstroKline was built to answer those questions. We wanted an
              astrology tool that respects the complexity of a natal chart while
              still giving users an interface they can understand in seconds.
              That is why the product centers on the K-Line, a long-range visual
              forecast that translates chart structure and cycle timing into a
              clear directional curve.
            </p>

            <Heading level={2}>What AstroKline Actually Does</Heading>
            <p>
              AstroKline combines three layers of work. The first layer is
              astronomical calculation. The second layer is timing logic based on
              long-cycle astrology and planetary interaction. The third layer is
              AI interpretation that turns raw chart output into readable
              language.
            </p>
            <p>
              In practice, this means a user can enter birth data and get more
              than a static birth chart. They can see a forward-looking
              structure: stronger windows, weaker windows, major reversals, and
              periods that deserve patience instead of force. That is why users
              come to AstroKline for far more than entertainment. They use it
              for career planning, relationship timing, self-reflection, and
              timing calibration.
            </p>

            <Heading level={2}>Why We Use Swiss Ephemeris</Heading>
            <p>
              Accuracy starts with the underlying chart. AstroKline relies on
              Swiss Ephemeris because it is one of the most trusted astronomical
              engines available for astrology software. When a platform claims
              to deliver a personalized birth chart reading, that claim is weak
              unless the planetary positions are calculated correctly.
            </p>
            <p>
              Using a serious ephemeris does not automatically make an astrology
              product valuable, but it removes a major source of noise. It means
              the later interpretation layer begins with reliable coordinates
              instead of shortcuts or low-precision approximations.
            </p>

            <Heading level={2}>What Makes the K-Line Different</Heading>
            <p>
              The K-Line is the core idea behind AstroKline. Traditional chart
              reports often overwhelm users with symbols, houses, aspects, and
              dense text. We wanted a format that preserved depth while making
              patterns visible. The K-Line solves that by translating timing
              stress and timing support into a clear line of movement.
            </p>
            <p>
              Instead of reading ten separate passages and trying to mentally
              merge them, the user sees a visual summary first. That summary can
              then be explored in detail through the full chart and AI reading.
              People search for terms like birth chart timeline, astrology
              timing chart, and AI natal chart reading. AstroKline is designed
              to satisfy that intent directly.
            </p>

            <Heading level={2}>Our Editorial Standard for AI Astrology</Heading>
            <p>
              AI can make astrology more readable, but it also creates a risk of
              generic output. AstroKline is not built to produce vague feel-good
              text. The interpretation layer is meant to stay anchored to chart
              structure, timing logic, and user context.
            </p>
            <p>
              That means we care about specificity. If the chart suggests a
              period of compression, the language should reflect compression. If
              the cycle suggests expansion, the output should explain what kind
              of expansion is more likely and where caution still matters. Our
              goal is not to inflate certainty. It is to improve usefulness.
            </p>

            <Heading level={2}>Who AstroKline Is For</Heading>
            <p>
              AstroKline is for users who want a practical astrology workflow.
              Some are astrology beginners who need a clearer starting point.
              Others already know natal chart basics and want a better way to
              understand timing. Many are professionals, founders, creatives, or
              people navigating uncertainty who want one dashboard that turns
              symbolism into decision support.
            </p>
            <p>
              It is not a substitute for medical, legal, or financial advice.
              It is a timing and reflection tool. Used correctly, it helps users
              frame seasons of action, restraint, review, and recovery with more
              structure than mainstream horoscope content provides.
            </p>

            <Heading level={2}>What We Believe About Privacy</Heading>
            <p>
              Birth data is intimate. A platform that asks for someone&apos;s
              birth time, birthplace, and personal profile should handle that
              data responsibly. We treat privacy as a product requirement. That
              is also why our public pages link clearly to our{' '}
              <Link href="/privacy-policy" className="text-primary no-underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                href="/terms-of-service"
                className="text-primary no-underline"
              >
                Terms of Service
              </Link>
              .
            </p>

            <Heading level={2}>Where To Start</Heading>
            <p>
              If you want to understand AstroKline in practice, the fastest path
              is to view a sample{' '}
              <Link href="/kline" className="text-primary no-underline">
                K-Line reading
              </Link>
              , and compare plan depth on the{' '}
              <Link href="/pricing" className="text-primary no-underline">
                pricing page
              </Link>
              . That gives a clearer picture than any slogan can.
            </p>
            <p>
              AstroKline exists to make astrology timing usable. That is the
              product standard we work against, and it is the reason this
              company, this page, and this software exist.
            </p>
          </div>
        </article>
      </section>

      <section className="border-b border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <Heading level={2} className="mb-8 text-3xl font-bold tracking-tight">
            The Principles Behind the Product
          </Heading>
          <div className="grid gap-6 md:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item.title}
                className=" border border-white/8 bg-[#111015] p-7"
              >
                <Heading level={3} className="mb-3 text-xl font-semibold text-white/90">
                  {item.title}
                </Heading>
                <p className="leading-7 text-white/65">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Heading level={2} className="text-3xl font-bold tracking-tight md:text-4xl">
            Read Your Timing With More Structure
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/65">
            Start with the K-Line if you want to see how AstroKline turns birth
            chart data into something practical and readable.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/kline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center justify-center  px-6 text-sm font-semibold"
            >
              Explore the K-Line
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center  border border-white/10 px-6 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
