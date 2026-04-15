import React from 'react';
import dynamic from 'next/dynamic';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '@/config/locale';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { AstroHero } from '@/themes/default/blocks/astro-hero';

// Lazy-load below-fold sections to reduce initial JS bundle
const AstroCta = dynamic(() => import('@/themes/default/blocks/astro-cta').then(m => ({ default: m.AstroCta })));
const AstroFaq = dynamic(() => import('@/themes/default/blocks/astro-faq').then(m => ({ default: m.AstroFaq })));
const AstroFeatures = dynamic(() => import('@/themes/default/blocks/astro-features').then(m => ({ default: m.AstroFeatures })));
const AstroHowItWorks = dynamic(() => import('@/themes/default/blocks/astro-how-it-works').then(m => ({ default: m.AstroHowItWorks })));
const AstroKlinePreview = dynamic(() => import('@/themes/default/blocks/astro-kline-preview').then(m => ({ default: m.AstroKlinePreview })));
const AstroMethodology = dynamic(() => import('@/themes/default/blocks/astro-methodology').then(m => ({ default: m.AstroMethodology })));
const AstroPricing = dynamic(() => import('@/themes/default/blocks/astro-pricing').then(m => ({ default: m.AstroPricing })));
const AstroTestimonials = dynamic(() => import('@/themes/default/blocks/astro-testimonials').then(m => ({ default: m.AstroTestimonials })));

type LandingSection = NonNullable<DynamicPage['sections']>[string];

const homepageBlockRenderers: Record<
  string,
  (section: LandingSection, key: string) => React.ReactNode
> = {
  'astro-cta': (section, key) => <AstroCta key={key} section={section} />,
  'astro-faq': (section, key) => <AstroFaq key={key} section={section} />,
  'astro-features': (section, key) => (
    <AstroFeatures key={key} section={section} />
  ),
  'astro-hero': (section, key) => <AstroHero key={key} section={section} />,
  'astro-how-it-works': (section, key) => (
    <AstroHowItWorks key={key} section={section} />
  ),
  'astro-kline-preview': (section, key) => (
    <AstroKlinePreview key={key} section={section} />
  ),
  'astro-methodology': (section, key) => (
    <AstroMethodology key={key} section={section} />
  ),
  'astro-pricing': (section, key) => (
    <AstroPricing key={key} section={section} />
  ),
  'astro-testimonials': (section, key) => (
    <AstroTestimonials key={key} section={section} />
  ),
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'common.metadata', // use the common metadata which is robust for index
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  // get page data
  const page: DynamicPage = t.raw('page');

  return (
    <>
      {page.title && !page.sections?.hero && <h1 className="sr-only">{page.title}</h1>}
      {(() => {
        let prevBlockName = '';
        return page.show_sections?.reduce<React.ReactNode[]>((acc, sectionKey, idx) => {
        const section = page.sections?.[sectionKey];

        if (!section || section.disabled === true) {
          return acc;
        }

        const blockName = section.block || section.id || sectionKey;
        const blockRenderer = homepageBlockRenderers[blockName];

        if (!blockRenderer) return acc;

        // Add divider before each section except the first rendered one and after hero
        if (acc.length > 0 && prevBlockName !== 'astro-hero') {
          acc.push(
            <div
              key={`divider-${sectionKey}`}
              className="w-full"
            >
              <div className="h-[2px] bg-border/60" />
            </div>,
          );
        }

        acc.push(blockRenderer(section, sectionKey));
        prevBlockName = blockName;
        return acc;
      }, []);
      })()}
      {/* TAAFT verification badge - homepage only */}
      <div className="flex justify-center py-4">
        {/* eslint-disable-next-line react/jsx-no-target-blank */}
        <a
          href="https://theresanaiforthat.com/ai/astrocurve/?ref=featured&v=540468"
          target="_blank"
          rel="nofollow noopener"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={80}
            height={20}
            loading="lazy"
            decoding="async"
            src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"
            alt="Featured on There's An AI For That"
          />
        </a>
      </div>
    </>
  );
}
