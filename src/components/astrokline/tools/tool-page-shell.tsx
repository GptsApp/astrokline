'use client';

import React from 'react';
import {
  TrendingUp,
  Users,
  ArrowRight,
  ChevronDown,
  Lock,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useAppContext } from '@/shared/contexts/app';
import { Link } from '@/core/i18n/navigation';
import { EnergyTool } from './energy-tool';
import { CompatibilityTool } from './compatibility-tool';

const TOOL_ICONS: Record<string, React.ReactNode> = {
  energy: <TrendingUp className="h-6 w-6" />,
  compatibility: <Users className="h-6 w-6" />,
};

interface Feature {
  title: string;
  description: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface ToolPageShellProps {
  toolId: string;
  toolTitle: string;
  toolDescription: string;
  tier: string;
  hasKlineData: boolean;
  klineResult?: unknown;
  seoHeadline: string;
  seoSubline: string;
  features: Feature[];
  faqs: FAQ[];
}

export function ToolPageShell({
  toolId,
  toolTitle,
  toolDescription,
  tier,
  hasKlineData,
  klineResult,
  seoHeadline,
  seoSubline,
  features,
  faqs,
}: ToolPageShellProps) {
  const isGuest = tier === 'GUEST';

  if (isGuest) {
    return (
      <GuestLanding
        toolId={toolId}
        toolTitle={toolTitle}
        seoHeadline={seoHeadline}
        seoSubline={seoSubline}
        features={features}
        faqs={faqs}
      />
    );
  }

  if (!hasKlineData) {
    return (
      <NoKlineState toolTitle={toolTitle} toolDescription={toolDescription} />
    );
  }

  return (
    <ToolContent
      toolId={toolId}
      toolTitle={toolTitle}
      toolDescription={toolDescription}
      tier={tier}
      klineResult={klineResult}
    />
  );
}

/* ── Guest SEO Landing Page ── */
function GuestLanding({
  toolId,
  toolTitle,
  seoHeadline,
  seoSubline,
  features,
  faqs,
}: {
  toolId: string;
  toolTitle: string;
  seoHeadline: string;
  seoSubline: string;
  features: Feature[];
  faqs: FAQ[];
}) {
  const { setIsShowSignModal } = useAppContext();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            {TOOL_ICONS[toolId]}
            <span>{toolTitle}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {seoHeadline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {seoSubline}
          </p>
          <div className="mt-10">
            <button
              onClick={() => setIsShowSignModal(true)}
              className="inline-flex items-center gap-2 bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Start Free — See Your {toolTitle}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            What You Get
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="border border-border/50 bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview (blurred mock) */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            See It In Action
          </h2>
          <p className="mt-3 text-muted-foreground">
            Here&apos;s what your personalized {toolTitle.toLowerCase()} looks like
          </p>
          <div className="relative mt-8 overflow-hidden border border-border/50 bg-card">
            <div className="p-8 blur-[6px] select-none pointer-events-none opacity-60">
              <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 bg-muted" />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
              <div className="text-center">
                <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-lg font-semibold text-foreground">
                  Sign in to unlock your personalized view
                </p>
                <button
                  onClick={() => setIsShowSignModal(true)}
                  className="mt-4 bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-border/50 bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-foreground">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to See Your {toolTitle}?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free to start. No credit card required.
          </p>
          <button
            onClick={() => setIsShowSignModal(true)}
            className="mt-8 inline-flex items-center gap-2 bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02]"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── No K-Line Data State ── */
function NoKlineState({
  toolTitle,
  toolDescription,
}: {
  toolTitle: string;
  toolDescription: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-primary/10">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{toolTitle}</h1>
        <p className="mt-3 text-muted-foreground">{toolDescription}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          Generate your K-Line first to unlock this tool.
        </p>
        <Link
          href="/kline"
          className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
        >
          Generate K-Line
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ── Logged-in Tool Content — routes to real components ── */
function ToolContent({
  toolId,
  toolTitle,
  toolDescription,
  tier,
  klineResult,
}: {
  toolId: string;
  toolTitle: string;
  toolDescription: string;
  tier: string;
  klineResult?: unknown;
}) {
  if (toolId === 'energy') {
    return <EnergyTool tier={tier} klineResult={klineResult} />;
  }
  if (toolId === 'compatibility') {
    return <CompatibilityTool tier={tier} klineResult={klineResult} />;
  }
  return null;
}

