import { getTranslations, setRequestLocale } from 'next-intl/server';
import { IdealPartnerGenerator } from '@/shared/blocks/generator/ideal-partner';
import { getMetadata } from '@/shared/lib/seo';
import {
  ToolFeatures,
  ToolHowItWorks,
  ToolAudience,
  ToolCrossLinks,
  AstroFaq
} from '@/themes/default/blocks';
import { IDEAL_PARTNER_SEO_CONTENT } from '@/lib/astrokline/ideal-partner-seo-data';
import { UpgradeBanner } from '@/components/astrokline/shared/upgrade-banner';
import { Sparkles, Heart } from 'lucide-react';

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
    <div className="min-h-screen bg-background astro-starfield">
      <div className="pt-28 pb-16">
        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            <span>AI Cosmic Matchmaker</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Stop Guessing Your Type.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321]">
              Generate Your Cosmic Soulmate.
            </span>
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground mx-auto mb-12 leading-relaxed">
            {t.raw('page.description') || "We analyze your 7th House, Venus, and Mars placements to construct the psychological profile and physical avatar of your astrologically ideal partner."}
          </p>
        </div>

        {/* INTERACTIVE TOOL */}
        <section id="tool" className="relative z-20 max-w-5xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#15131A]/80 backdrop-blur-xl">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <IdealPartnerGenerator srOnlyTitle={t.raw('generator.title')} />
          </div>
        </section>
      </div>

      {/* ---------------- SEO LANDING PAGE BLOCKS ---------------- */}

      {/* 1. How It Works */}
      <ToolHowItWorks section={IDEAL_PARTNER_SEO_CONTENT.howItWorks} className="pt-24" />

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
      <AstroFaq section={{ id: "faq" }} className="!pt-0 pb-24" />
      
    </div>
  );
}
