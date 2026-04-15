import { envConfigs } from '@/config';
import { defaultTheme } from '@/shared/blocks/common/theme';

type ThemeBlockModule = Record<string, any>;
type ThemeBlockLoader = () => Promise<ThemeBlockModule>;

const defaultThemeBlockLoaders: Record<string, ThemeBlockLoader> = {
  'astro-cta': () => import('@/themes/default/blocks/astro-cta'),
  'astro-faq': () => import('@/themes/default/blocks/astro-faq'),
  'astro-features': () => import('@/themes/default/blocks/astro-features'),
  'astro-hero': () => import('@/themes/default/blocks/astro-hero'),
  'astro-how-it-works': () => import('@/themes/default/blocks/astro-how-it-works'),
  'astro-kline-preview': () => import('@/themes/default/blocks/astro-kline-preview'),
  'astro-methodology': () => import('@/themes/default/blocks/astro-methodology'),
  'astro-pricing': () => import('@/themes/default/blocks/astro-pricing'),
  'astro-testimonials': () => import('@/themes/default/blocks/astro-testimonials'),
  'blog-detail': () => import('@/themes/default/blocks/blog-detail'),
  blog: () => import('@/themes/default/blocks/blog'),
  cta: () => import('@/themes/default/blocks/cta'),
  faq: () => import('@/themes/default/blocks/faq'),
  'features-accordion': () => import('@/themes/default/blocks/features-accordion'),
  'features-flow': () => import('@/themes/default/blocks/features-flow'),
  'features-list': () => import('@/themes/default/blocks/features-list'),
  'features-media': () => import('@/themes/default/blocks/features-media'),
  'features-step': () => import('@/themes/default/blocks/features-step'),
  features: () => import('@/themes/default/blocks/features'),
  footer: () => import('@/themes/default/blocks/footer'),
  header: () => import('@/themes/default/blocks/header'),
  hero: () => import('@/themes/default/blocks/hero'),
  index: () => import('@/themes/default/blocks/index'),
  logos: () => import('@/themes/default/blocks/logos'),
  'page-detail': () => import('@/themes/default/blocks/page-detail'),
  pricing: () => import('@/themes/default/blocks/pricing'),
  'showcases-flow': () => import('@/themes/default/blocks/showcases-flow'),
  showcases: () => import('@/themes/default/blocks/showcases'),
  stats: () => import('@/themes/default/blocks/stats'),
  subscribe: () => import('@/themes/default/blocks/subscribe'),
  testimonials: () => import('@/themes/default/blocks/testimonials'),
  'tool-audience': () => import('@/themes/default/blocks/tool-audience'),
  'tool-cross-links': () => import('@/themes/default/blocks/tool-cross-links'),
  'tool-features': () => import('@/themes/default/blocks/tool-features'),
  'tool-how-it-works': () => import('@/themes/default/blocks/tool-how-it-works'),
  'tool-showcase': () => import('@/themes/default/blocks/tool-showcase'),
  updates: () => import('@/themes/default/blocks/updates'),
};

/**
 * get active theme
 */
export function getActiveTheme(): string {
  const theme = envConfigs.theme as string;

  if (theme) {
    return theme;
  }

  return defaultTheme;
}

/**
 * load theme page
 */
export async function getThemePage(pageName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();

  try {
    // load theme page
    const pageModule = await import(`@/themes/${loadTheme}/pages/${pageName}`);
    return pageModule.default;
  } catch (error) {
    // fallback to default theme
    if (loadTheme !== defaultTheme) {
      const fallbackModule = await import(
        `@/themes/${defaultTheme}/pages/${pageName}`
      );
      return fallbackModule.default;
    }

    throw error;
  }
}

/**
 * load theme layout
 */
export async function getThemeLayout(layoutName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();

  try {
    // load theme layout
    const layoutModule = await import(
      `@/themes/${loadTheme}/layouts/${layoutName}`
    );
    return layoutModule.default;
  } catch (error) {
    // fallback to default theme
    if (loadTheme !== defaultTheme) {
      const fallbackModule = await import(
        `@/themes/${defaultTheme}/layouts/${layoutName}`
      );
      return fallbackModule.default;
    }

    throw error;
  }
}

/**
 * convert kebab-case to PascalCase
 */
function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * load theme block
 */
export async function getThemeBlock(blockName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();
  const pascalCaseName = kebabToPascalCase(blockName);

  if (loadTheme !== defaultTheme) {
    throw new Error(`Theme "${loadTheme}" is not available`);
  }

  const blockLoader = defaultThemeBlockLoaders[blockName];

  if (!blockLoader) {
    throw new Error(`Block "${blockName}" is not available in theme "${loadTheme}"`);
  }

  const blockModule = await blockLoader();
  const component =
    blockModule[pascalCaseName] || blockModule[blockName] || blockModule.default;

  if (!component) {
    throw new Error(`No valid export found in block "${blockName}"`);
  }

  return component;
}
