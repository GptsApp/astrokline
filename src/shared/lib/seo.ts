import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

const MAX_META_TITLE_LENGTH = 60;
const MAX_META_DESCRIPTION_LENGTH = 155;

// get metadata for page component
export function getMetadata(
  options: {
    title?: string;
    description?: string;
    keywords?: string;
    metadataKey?: string;
    canonicalUrl?: string; // relative path or full url
    imageUrl?: string;
    appName?: string;
    noIndex?: boolean;
  } = {}
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    setRequestLocale(locale);

    // passed metadata
    const passedMetadata = {
      title: options.title,
      description: options.description,
      keywords: options.keywords,
    };

    // default metadata
    const defaultMetadata = await getTranslatedMetadata(
      defaultMetadataKey,
      locale
    );

    // translated metadata
    let translatedMetadata: any = {};
    if (options.metadataKey) {
      translatedMetadata = await getTranslatedMetadata(
        options.metadataKey,
        locale
      );
    }

    // canonical url
    const canonicalUrl = await getCanonicalUrl(
      options.canonicalUrl || '',
      locale || ''
    );

    let finalTitle =
      passedMetadata.title || translatedMetadata.title || defaultMetadata.title;
    let finalDescription =
      passedMetadata.description ||
      translatedMetadata.description ||
      defaultMetadata.description;

    // image url
    let imageUrl = options.imageUrl || envConfigs.app_preview_image;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${envConfigs.app_url}${imageUrl}`;
    }

    // app name
    let appName = options.appName;
    if (!appName) {
      appName = envConfigs.app_name || 'AstroCurve';
    }

    if (finalTitle && finalTitle.length < 25 && !finalTitle.includes(appName)) {
      finalTitle = `${finalTitle} | ${appName}`;
    }

    finalTitle = clampMetaText(finalTitle, MAX_META_TITLE_LENGTH);
    finalDescription = clampMetaText(
      finalDescription,
      MAX_META_DESCRIPTION_LENGTH
    );

    return {
      title: finalTitle,
      description: finalDescription,
      keywords:
        passedMetadata.keywords ||
        translatedMetadata.keywords ||
        defaultMetadata.keywords,
      alternates: {
        canonical: canonicalUrl,
        languages: locales.reduce((acc: Record<string, string>, l: string) => {
          const path = options.canonicalUrl || '';
          const prefix = l === defaultLocale ? '' : `/${l}`;
          acc[l] = `${envConfigs.app_url}${prefix}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '') || '/';
          
          // x-default should point to default language equivalent
          if (l === defaultLocale) {
             acc['x-default'] = acc[l];
          }
          return acc;
        }, {}),
      },

      openGraph: {
        type: 'website',
        locale: locale,
        url: canonicalUrl,
        title: finalTitle,
        description: finalDescription,
        siteName: appName,
        images: [imageUrl.toString()],
      },

      twitter: {
        card: 'summary_large_image',
        title: finalTitle,
        description: finalDescription,
        images: [imageUrl.toString()],
        site: envConfigs.app_url,
      },

      robots: {
        index: options.noIndex ? false : true,
        follow: options.noIndex ? false : true,
      },
    };
  };
}

function clampMetaText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const ellipsis = '...';

  if (!normalized || normalized.length <= maxLength) {
    return normalized;
  }

  const targetLength = Math.max(maxLength - ellipsis.length, 0);

  if (targetLength === 0) {
    return ellipsis.slice(0, maxLength);
  }

  const truncated = normalized.slice(0, targetLength + 1);
  const boundary = truncated.lastIndexOf(' ');
  const cutIndex =
    boundary > Math.floor(targetLength * 0.6) ? boundary : targetLength;
  const safeText = truncated.slice(0, cutIndex).replace(/[\s,;:!?-]+$/g, '');

  return `${safeText || normalized.slice(0, targetLength)}${ellipsis}`;
}

const defaultMetadataKey = 'common.metadata';

async function getTranslatedMetadata(metadataKey: string, locale: string) {
  setRequestLocale(locale);
  const t = await getTranslations(metadataKey);

  return {
    title: t.has('title') ? t('title') : '',
    description: t.has('description') ? t('description') : '',
    keywords: t.has('keywords') ? t('keywords') : '',
  };
}

async function getCanonicalUrl(canonicalUrl: string, locale: string) {
  if (!canonicalUrl) {
    canonicalUrl = '/';
  }

  if (!canonicalUrl.startsWith('http')) {
    // relative path
    if (!canonicalUrl.startsWith('/')) {
      canonicalUrl = `/${canonicalUrl}`;
    }

    canonicalUrl = `${envConfigs.app_url}${
      !locale || locale === defaultLocale ? '' : `/${locale}`
    }${canonicalUrl}`;

    if (locale !== defaultLocale && canonicalUrl.endsWith('/')) {
      canonicalUrl = canonicalUrl.slice(0, -1);
    }
  }

  return canonicalUrl;
}
