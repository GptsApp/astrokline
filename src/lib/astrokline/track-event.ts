/**
 * AstroKline Growth Funnel Event Tracking
 *
 * Supports Plausible (cloud or self-hosted) and Google Analytics.
 * Usage: trackEvent('hero_cta_click', { source: 'landing' })
 */

// All funnel event names for type safety
export type FunnelEvent =
  // Layer 1 – Hero
  | 'hero_cta_click'
  // Layer 2 – Birth Info Modal
  | 'birth_modal_open'
  | 'birth_modal_step_complete'
  | 'birth_modal_submit'
  | 'birth_modal_abandon'
  // Layer 3 – KLine Result
  | 'kline_result_loaded'
  | 'registration_nudge_shown'
  | 'registration_nudge_signup_click'
  | 'registration_nudge_dismiss'
  // Layer 4 – Premium Upgrade
  | 'premium_cta_click'
  | 'pricing_modal_open'
  | 'auth_gate_triggered'
  | 'share_to_unlock_clicked'
  // Layer 5 – Pricing / Checkout
  | 'pricing_plan_click'
  | 'pricing_checkout_resume'
  | 'checkout_initiated'
  // Layer 6 – Viral / Share
  | 'share_modal_open'
  | 'share_copy_text'
  | 'share_platform_click'
  | 'share_prompt_shown'
  | 'share_button_click'
  // Mobile
  | 'mobile_sticky_cta_click';

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Track a funnel event across all configured analytics providers.
 * Safe to call in SSR — silently no-ops when window is unavailable.
 */
export function trackEvent(
  event: FunnelEvent,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AK Track] ${event}`, props || '');
  }

  // Plausible (cloud or self-hosted)
  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', event, props);
  }
}
