import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { getMetadata } from '@/shared/lib/seo';
import { getLocalPage } from '@/shared/models/post';

export const revalidate = 3600;

// dynamic page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // metadata values
  let title = '';
  let description = '';

  // 1. try to get static page metadata from content/pages/**/*.mdx
  const staticPageSlug = typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug
  if (staticPageSlug.includes('.')) {
    return;
  }

  const canonicalUrl = `/${staticPageSlug}`;
  let foundMetadata = false;

  // 2. get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });
  if (staticPage) {
    title = staticPage.title || '';
    description = staticPage.description || '';
    foundMetadata = true;
  }

  // 3. static page not found, try dynamic json
  if (!foundMetadata) {
    const dynamicPageSlug = typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';
    const messageKey = `pages.${dynamicPageSlug}`;
    
    try {
       const t = await getTranslations({ locale, namespace: messageKey });
       if (t.has('metadata')) {
         title = t.raw('metadata.title');
         description = t.raw('metadata.description');
         foundMetadata = true;
       }
    } catch (e) {
       // translation not found, continue
    }
  }

  // 4. fallback to common metadata
  if (!foundMetadata) {
    const tc = await getTranslations({ locale, namespace: 'common.metadata' });
    title = tc.has('title') ? tc('title') : '';
    description = tc.has('description') ? tc('description') : '';
  }

  const generateDynamicMetadata = getMetadata({
    title,
    description,
    canonicalUrl,
  });

  return await generateDynamicMetadata({ params: Promise.resolve({ locale }) });
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // 1. try to get static page from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug
  if (staticPageSlug.includes('.')) {
    return notFound();
  }

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page
  if (staticPage) {
    const Page = await getThemePage('static-page');

    return <Page locale={locale} post={staticPage} />;
  }

  // 2. static page not found
  // try to get dynamic page content from
  // src/config/locale/messages/{locale}/pages/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  const messageKey = `pages.${dynamicPageSlug}`;

  try {
    const t = await getTranslations({ locale, namespace: messageKey });

    // return dynamic page
    if (t.has('page')) {
      const Page = await getThemePage('dynamic-page');
      return <Page locale={locale} page={t.raw('page')} />;
    }
  } catch (error) {
    // ignore error if translation not found
    return notFound();
  }

  // 3. page not found
  return notFound();
}
