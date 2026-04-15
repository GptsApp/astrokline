export type CheckoutSource =
  | 'general'
  | 'ask_chart'
  | 'ask_chart_failure'
  | 'ask_chart_limit'
  | 'hero_deck_upgrade'
  | 'diagnosis_preview'
  | 'unlock_5_year_plan'
  | 'yearly_energy'
  | 'synastry'
  | 'chart_future_unlock'
  | 'depth_badge_click'
  | 'proof_layer_open'
  | 'module_followup_cta'
  | 'validator'
  | 'quota_modal';

interface CheckoutContextCopy {
  eyebrow: string;
  title: string;
  description: string;
}

const DEFAULT_COPY: Record<'lite' | 'pro', CheckoutContextCopy> = {
  lite: {
    eyebrow: 'Keep the reading going',
    title: 'Upgrade to Lite',
    description: 'Unlock practical AI reading, saved chart history, and limited Ask Chart follow-ups after the first useful answer lands.',
  },
  pro: {
    eyebrow: 'Go deeper on this chart',
    title: 'Upgrade to Pro',
    description: 'Unlock deeper chart layers, unlimited Ask Chart continuation, and advanced timing intelligence when the thread becomes high-value.',
  },
};

const CONTEXT_COPY: Partial<Record<CheckoutSource, Record<'lite' | 'pro', CheckoutContextCopy>>> = {
  ask_chart: {
    lite: {
      eyebrow: 'Keep this conversation going',
      title: 'Unlock Lite chart chat',
      description: 'Continue with personalized AI reading and limited Ask Chart follow-ups once your question becomes actionable.',
    },
    pro: {
      eyebrow: 'Go beyond the first answer',
      title: 'Unlock Pro chart chat',
      description: 'Continue with unlimited chart questions and deeper timing layers when one answer turns into an ongoing thread.',
    },
  },
  ask_chart_failure: {
    lite: {
      eyebrow: 'Unlock what this answer was opening',
      title: 'Continue with Lite',
      description: 'You already found a meaningful question. Lite unlocks the next layer of personalized reading instead of stopping at the preview.',
    },
    pro: {
      eyebrow: 'Continue the deeper logic',
      title: 'Unlock Pro continuation',
      description: 'This thread is pushing into deeper chart logic. Pro unlocks advanced layers and ongoing analysis instead of cutting the answer short.',
    },
  },
  ask_chart_limit: {
    lite: {
      eyebrow: 'You reached the point where follow-ups matter',
      title: 'Keep asking with Lite',
      description: 'Lite keeps the conversation going with personalized chart chat and practical modules after the first useful answer.',
    },
    pro: {
      eyebrow: 'This thread wants more room',
      title: 'Continue this thread with Pro',
      description: 'Pro removes Ask Chart limits and unlocks deeper timing intelligence for high-value follow-up questions.',
    },
  },
  hero_deck_upgrade: {
    lite: {
      eyebrow: 'Keep the reading moving',
      title: 'Unlock Lite reading flow',
      description: 'Continue from the main result with practical AI reading, saved history, and Ask Chart follow-ups once the overview becomes useful.',
    },
    pro: {
      eyebrow: 'Take the reading deeper',
      title: 'Unlock Pro reading depth',
      description: 'Move beyond the summary with deeper chart layers, advanced timing, and unlimited continuation once the main answer matters.',
    },
  },
  diagnosis_preview: {
    lite: {
      eyebrow: 'See the full diagnosis behind the teaser',
      title: 'Unlock Lite diagnosis',
      description: 'Turn the preview into a usable reading with the practical AI modules that explain timing, work, love, and repeating patterns.',
    },
    pro: {
      eyebrow: 'See the full diagnosis stack',
      title: 'Unlock Pro diagnosis depth',
      description: 'Go past the preview into deeper chart logic, advanced timing, and the higher-resolution layers behind recurring patterns.',
    },
  },
  unlock_5_year_plan: {
    lite: {
      eyebrow: 'See what is coming next',
      title: 'Unlock your 5-year plan',
      description: 'Open the next-window reading for love, career, and money timing once the current chapter already makes sense.',
    },
    pro: {
      eyebrow: 'See the full long-range timing map',
      title: 'Unlock Pro future timing',
      description: 'Use deeper timing intelligence and advanced chart layers to understand how the next major windows actually change.',
    },
  },
  yearly_energy: {
    lite: {
      eyebrow: 'Unlock the next timing window',
      title: 'Unlock yearly energy timing',
      description: 'See the practical timing layer that explains where your current year sits, what opens next, and which turns need more care.',
    },
    pro: {
      eyebrow: 'Unlock advanced timing intelligence',
      title: 'Unlock Pro timing layers',
      description: 'Go beyond the visible curve with deeper timing analysis, advanced chart layers, and more precise future windows.',
    },
  },
  synastry: {
    lite: {
      eyebrow: 'Compare your chart with someone important',
      title: 'Unlock chart compatibility',
      description: 'See where the connection flows, where friction appears, and what the relationship pattern actually asks of you.',
    },
    pro: {
      eyebrow: 'Unlock deeper relationship analysis',
      title: 'Unlock Pro compatibility depth',
      description: 'Go beyond the first chemistry read with deeper timing, advanced chart layers, and more precise relationship logic.',
    },
  },
  chart_future_unlock: {
    lite: {
      eyebrow: 'See the rest of your timeline',
      title: 'Unlock your full future map',
      description: 'Open the hidden side of the life curve so you can see where your next windows rise, stall, or peak.',
    },
    pro: {
      eyebrow: 'Unlock your deepest future timing',
      title: 'Unlock Pro future intelligence',
      description: 'Go beyond the visible map with advanced timing layers, deeper chart logic, and more precise long-range windows.',
    },
  },
  depth_badge_click: {
    lite: {
      eyebrow: 'Unlock a deeper reading layer',
      title: 'Continue with Lite',
      description: 'See more than the surface answer with the practical AI reading and follow-up prompts that make the chart usable.',
    },
    pro: {
      eyebrow: 'Unlock the deeper chart layers',
      title: 'Continue with Pro depth',
      description: 'Go beyond the preview with advanced timing, deeper chart logic, and unlimited continuation once the depth layer matters.',
    },
  },
  proof_layer_open: {
    lite: {
      eyebrow: 'See why the answer matters',
      title: 'Unlock Lite proof context',
      description: 'Lite gives you more personalized interpretation so the answer feels usable, not just decorative.',
    },
    pro: {
      eyebrow: 'See the deeper logic behind the answer',
      title: 'Unlock Pro proof layers',
      description: 'Pro unlocks advanced timing, deeper chart evidence, and ongoing chart chat when you want proof instead of a summary.',
    },
  },
  module_followup_cta: {
    lite: {
      eyebrow: 'Keep going from this module',
      title: 'Unlock Lite follow-ups',
      description: 'Continue from the answer you just read with personalized AI follow-ups and practical next-step guidance.',
    },
    pro: {
      eyebrow: 'Unlock the advanced module layers',
      title: 'Continue with Pro follow-ups',
      description: 'Use advanced timing, D9-style deeper layers, and unlimited continuation when this module becomes important.',
    },
  },
  validator: {
    lite: {
      eyebrow: 'Unlock proof-backed validation',
      title: 'Unlock deeper validation',
      description: 'Compare your reading against real life events with more timing context and deeper chart logic.',
    },
    pro: {
      eyebrow: 'Verify this reading against your real past',
      title: 'Unlock Pro chart validation',
      description: 'Use proof-backed transits, deeper timing logic, and higher-confidence validation to test the reading against real events.',
    },
  },
  quota_modal: {
    lite: {
      eyebrow: 'Unlock more chart work',
      title: 'Upgrade to Lite',
      description: 'Move beyond the free limit and keep building practical chart value with more AI reading and chart history.',
    },
    pro: {
      eyebrow: 'Unlock your full chart workflow',
      title: 'Upgrade to Pro',
      description: 'Remove limits and keep going with deeper chart tools, unlimited follow-ups, and advanced timing intelligence.',
    },
  },
};

export function normalizeCheckoutSource(source?: string): CheckoutSource {
  switch (source) {
    case 'ask_chart':
    case 'ask_chart_failure':
    case 'ask_chart_limit':
    case 'hero_deck_upgrade':
    case 'diagnosis_preview':
    case 'unlock_5_year_plan':
    case 'yearly_energy':
    case 'synastry':
    case 'chart_future_unlock':
    case 'depth_badge_click':
    case 'proof_layer_open':
    case 'module_followup_cta':
    case 'validator':
    case 'quota_modal':
      return source;
    default:
      return 'general';
  }
}

export function getCheckoutContextCopy(
  tier: 'lite' | 'pro',
  source?: CheckoutSource
): CheckoutContextCopy {
  return CONTEXT_COPY[source || 'general']?.[tier] ?? DEFAULT_COPY[tier];
}