import { ArrowRight, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

import { Heading } from '@/components/astrocurve/ui/heading';

import {
  StructuredFaqSection,
  type StructuredFaqItem,
} from './structured-faq-section';

type HubLink = {
  href: string;
  label: string;
};

type HubStat = {
  label: string;
  value: string;
};

type HubCard = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
};

interface ContentHubShellProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: HubLink;
  secondaryCta?: HubLink;
  stats?: HubStat[];
  cardsTitle: string;
  cardsDescription: string;
  cards: HubCard[];
  pathTitle?: string;
  pathSteps?: string[];
  faqTitle?: React.ReactNode;
  faqDescription?: string;
  faqs?: StructuredFaqItem[];
}

export function ContentHubShell({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  stats = [],
  cardsTitle,
  cardsDescription,
  cards,
  pathTitle,
  pathSteps = [],
  faqTitle,
  faqDescription,
  faqs = [],
}: ContentHubShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:36px_36px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>

            <Heading level={1} className="mt-6 max-w-4xl text-5xl md:text-7xl lg:text-[5.5rem]">
              {title}
            </Heading>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={primaryCta.href}
                className="inline-flex h-12 items-center gap-2 bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.01] hover:bg-primary/90"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex h-12 items-center border border-white/10 px-6 text-sm font-semibold text-white/80 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>

            {stats.length ? (
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-white/10 bg-white/[0.02] p-5"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white/90">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <Heading level={2} variant="section" className="mb-4">
              {cardsTitle}
            </Heading>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {cardsDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group border border-white/10 bg-[#111015] p-6 transition-all hover:border-primary/30 hover:bg-white/[0.03]"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                  {card.eyebrow}
                </p>
                <Heading level={3} className="mt-3 text-2xl md:text-3xl">
                  {card.title}
                </Heading>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  {card.description}
                </p>
                {card.meta ? (
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                    {card.meta}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {pathSteps.length ? (
        <section className="border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <Heading level={2} variant="section" className="mb-4">
                {pathTitle}
              </Heading>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Public pages should explain the gradient clearly instead of making users guess where they go next.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {pathSteps.map((step, index) => (
                <div key={step} className="border border-white/10 bg-[#0C0B10] p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                    Step 0{index + 1}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white/90">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <StructuredFaqSection
          title={faqTitle ?? 'Frequently Asked Questions'}
          description={faqDescription}
          items={faqs}
        />
      ) : null}
    </main>
  );
}