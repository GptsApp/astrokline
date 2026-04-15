export type MarketingPlanTier = 'FREE' | 'LITE' | 'PRO';
export type MarketingCheckoutTier = 'lite' | 'pro';

interface PlanEntitlement {
  title: string;
  shortDescription: string;
  features: string[];
  upgradeCardDescription: string;
  comparisonHighlight: string;
  quotaModalDescription: string;
}

export const PLAN_ENTITLEMENTS: Record<MarketingPlanTier, PlanEntitlement> = {
  FREE: {
    title: 'Free',
    shortDescription:
      'Get your first chart free: full life curve, destiny score, and a lightweight preview of what is ahead.',
    features: [
      'Full 100-year life curve',
      'Overall destiny score and year-by-year trend overview',
      'Cosmic ID card and shareable profile',
      '1 chart generation for life',
      'Basic compatibility tool and 3-month energy preview',
    ],
    upgradeCardDescription:
      'Full life curve + destiny score + 1 lifetime chart + compatibility preview',
    comparisonHighlight: '100-year curve + 1 lifetime chart',
    quotaModalDescription:
      'Full life curve, Cosmic ID, 1 lifetime chart, and compatibility preview',
  },
  LITE: {
    title: 'Lite',
    shortDescription:
      'Unlock the practical layer: AI reading, full-year energy timing, saved reports, and monthly chart chat.',
    features: [
      'Everything in Free',
      '7-section AI reading for career, money, love, health, timing, marriage, and core summary',
      '30-day action calendar and full 12-month energy forecast',
      'Ask Your Chart: 3 AI questions per month',
      '5 chart generations per month',
      'Save charts, dashboard history, and PDF export',
    ],
    upgradeCardDescription:
      '7 AI modules + 30-day calendar + 12-month forecast + 3 Ask Your Chart messages/mo + 5 charts/mo + PDF export',
    comparisonHighlight: '7 AI modules + 5 charts/mo + PDF export',
    quotaModalDescription:
      '5 chart generations/month + 7 AI reading modules + Ask Your Chart 3x/month + PDF export',
  },
  PRO: {
    title: 'Pro',
    shortDescription:
      'Unlock the complete dossier: all advanced AI modules, unlimited chart chat, Pro timing tools, and full exports.',
    features: [
      'Everything in Lite',
      '17-section AI dossier including karma, family, children, spirituality, leadership, lifestyle, and caution zones',
      'Unlimited Ask Your Chart conversations and unlimited chart generations',
      'Best Hours, Time Travel, Life Radar, Destiny Reading, and Next 30 Days',
      'Jaimini deep-analysis mode and advanced transit intelligence',
      'HD PDF Life Book export (50+ pages)',
    ],
    upgradeCardDescription:
      '17 AI modules + unlimited Ask Your Chart + unlimited charts + Best Hours + Time Travel + Life Radar + Jaimini + HD PDF export',
    comparisonHighlight: '17 AI modules + unlimited charts + chart chat',
    quotaModalDescription:
      'Unlimited chart generations + unlimited Ask Your Chart + Pro timing tools + Jaimini mode',
  },
};

export const CHECKOUT_TIER_COPY: Record<MarketingCheckoutTier, PlanEntitlement> = {
  lite: PLAN_ENTITLEMENTS.LITE,
  pro: PLAN_ENTITLEMENTS.PRO,
};