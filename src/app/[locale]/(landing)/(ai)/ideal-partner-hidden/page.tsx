import { UpgradeBanner } from '@/components/astrokline/shared/upgrade-banner';
import { IDEAL_PARTNER_SEO_CONTENT } from '@/lib/astrokline/ideal-partner-seo-data';
import { Heart, Sparkles } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { IdealPartnerGenerator } from '@/shared/blocks/generator/ideal-partner';
import { getMetadata } from '@/shared/lib/seo';
import {
  AstroFaq,
  ToolAudience,
  ToolCrossLinks,
  ToolFeatures,
  ToolHowItWorks,
} from '@/themes/default/blocks';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'ai.ideal-partner.metadata',
  canonicalUrl: '/ideal-partner',
});

export default async function IdealPartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('ai.ideal-partner');

  return (
    <div className="bg-background astro-starfield min-h-screen">
      <div className="pt-28 pb-16">
        {/* HERO SECTION */}
        <div className="mx-auto mb-12 max-w-7xl px-6 text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
            <Heart className="h-4 w-4" />
            <span>AI Cosmic Matchmaker</span>
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-6xl">
            Stop Guessing Your Type.
            <br />
            <span className="bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321] bg-clip-text text-transparent">
              Generate Your Cosmic Soulmate.
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-base leading-relaxed md:text-lg">
            {t.raw('page.description') ||
              'We analyze your 7th House, Venus, and Mars placements to construct the psychological profile and physical avatar of your astrologically ideal partner.'}
          </p>
        </div>

        {/* INTERACTIVE TOOL */}
        <section id="tool" className="relative z-20 mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#15131A]/80 shadow-2xl backdrop-blur-xl">
            {/* Inner Glow */}
            <div className="from-primary/10 to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />
            <IdealPartnerGenerator srOnlyTitle={t.raw('generator.title')} />
          </div>
        </section>
      </div>

      {/* ---------------- SEO LANDING PAGE BLOCKS ---------------- */}

      {/* 1. How It Works */}
      <ToolHowItWorks
        section={IDEAL_PARTNER_SEO_CONTENT.howItWorks}
        className="pt-24"
      />

      {/* 2. Feature Deep Dive */}
      <ToolFeatures section={IDEAL_PARTNER_SEO_CONTENT.features} />

      {/* 3. Target Audience / Use Cases */}
      <ToolAudience section={IDEAL_PARTNER_SEO_CONTENT.audience} />

      {/* 4. Upgrade CTA Banner */}
      <div className="py-24">
        <UpgradeBanner context="ideal-partner" />
      </div>

      {/* 5. Cross-Links to other tools */}
      <ToolCrossLinks />

      {/* 6. Tool-Specific FAQ */}
      <AstroFaq section={{ id: 'faq' }} className="!pt-0 pb-24" />
    </div>
  );
}
