'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { Button } from '@/shared/components/ui/button';

/* ─── Plan Data ─── */
interface PlanFeature {
  text: string;
  highlight?: string; // the part to render in gold
}

interface Plan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  originalMonthlyPrice?: string;
  originalYearlyPrice?: string;
  yearlyPriceTotal?: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  tier: 'FREE' | 'PRO' | 'LITE';
  productIdMonthly?: string;
  productIdAnnual?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    period: '/mo',
    description: 'Start free and keep your first chart.',
    features: [
      { text: 'Past K-Line preview (future blurred)' },
      { text: '1 basic natal chart read' },
      { text: 'Overall destiny score only' },
      { text: 'Core K-Line reading' },
      { text: 'Sun, Moon & Rising analysis' },
      { text: 'Community access' },
      { text: 'Email support' },
    ],
    cta: 'Start Free',
    tier: 'FREE',
  },
  {
    name: 'Lite',
    monthlyPrice: '$39.9',
    yearlyPrice: '$19.9',
    originalMonthlyPrice: '$49.9',
    originalYearlyPrice: '$39.9',
    yearlyPriceTotal: '$238.8/yr',
    period: '/mo',
    description: 'Unlock practical modules and save more reports.',
    features: [
      { text: 'Unlock Relationship Track: Foresee meeting points and crisis periods', highlight: 'Relationship Track' },
      { text: 'Personal Pitfall Guide: Monthly warnings to avoid wealth traps' },
      { text: 'Unlimited natal chart calculations', highlight: 'Unlimited' },
      { text: 'Past + 1-2 Year Future K-Line', highlight: '1-2 Year' },
      { text: 'AI-powered chart interpretation' },
      { text: 'Expanded K-Line interpretation' },
      { text: 'Sun, Moon & Rising deep analysis' },
      { text: 'Overall destiny score + sub-scores' },
      { text: 'Community access' },
      { text: 'Priority support' },
    ],
    cta: 'Choose Lite',
    tier: 'LITE',
    productIdMonthly: 'standard-monthly',
    productIdAnnual: 'standard-yearly',
  },
  {
    name: 'Pro',
    monthlyPrice: '$79.9',
    yearlyPrice: '$39.9',
    originalMonthlyPrice: '$99.9',
    originalYearlyPrice: '$79.9',
    yearlyPriceTotal: '$478.8/yr',
    period: '/mo',
    description:
      'Full detail, full dashboard, highest limits.',
    features: [
      { text: 'Unlock Wealth & Health Tracks: Full life-area coverage', highlight: '4 tracks' },
      { text: 'Full 10+ Year K-Line Unlocked', highlight: '10+ Year' },
      { text: 'Unlimited AI Astrologer deep chat: Ask specific life questions', highlight: 'Unlimited' },
      { text: 'Real-time planetary transit alerts' },
      { text: 'Priority AI + deep analysis reports' },
      { text: "HD PDF 'Life Book' export (50+ pages)", highlight: '50+ pages' },
      { text: 'Exclusive transit survival guides' },
      { text: 'Full premium K-Line interpretation' },
      { text: 'VIP priority support' },
    ],
    cta: 'Choose Pro',
    tier: 'PRO',
    productIdMonthly: 'premium-monthly',
    productIdAnnual: 'premium-yearly',
  },
];

/* ─── Payment Icons ─── */
function PaymentIcons() {
  const icons = [
    { name: 'Visa', src: '/images/pay/visa.webp' },
    { name: 'Mastercard', src: '/images/pay/mastercard.webp' },
    { name: 'USDC', src: '/images/pay/usdc.webp' },
    { name: 'USDT', src: '/images/pay/usdt.webp' },
  ];
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-muted-foreground/70 flex items-center gap-2 text-sm">
        <ShieldCheck className="h-4 w-4" />
        <span>Pay safely and securely with</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {icons.map((icon) => (
          <div
            key={icon.name}
            className="flex h-10 w-16 items-center justify-center rounded-lg bg-white"
          >
            <img
              src={icon.src}
              alt={icon.name}
              className="h-6 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Pricing Component ─── */
export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const signInHref =
    pathname && pathname !== '/'
      ? `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
      : '/sign-in';

  const handleCheckout = async (planId: string) => {
    if (!session) {
      router.push(signInHref);
      return;
    }

    try {
      setIsLoading(true);
      setSelectedPlan(planId);

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: planId,
          currency: 'USD',
          locale,
        }),
      });

      if (!response.ok) throw new Error('Checkout request failed');
      const { code, data, message } = await response.json();
      if (message === 'no auth, please sign in') {
        router.push(signInHref);
        return;
      }
      if (code !== 0) throw new Error(message);

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error('Payment initialization failed:', e);
      toast.error(
        e instanceof Error ? e.message : 'Payment initialization failed'
      );
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const currentPlanId = (plan: Plan) =>
    isAnnual ? plan.productIdAnnual : plan.productIdMonthly;

  return (
    <section
      id="pricing"
      className="bg-background relative overflow-hidden py-24"
    >
      {/* ── Ambient glow ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 10%, rgba(168,85,247,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* ── Header ── */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            Plans & Pricing
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-lg">
            Choose the depth of your astrology chart reading. From a birth chart
            preview, to a comprehensive K-Line blueprint of your cosmic destiny.
          </p>

          {/* Social proof for pricing */}
          <div className="text-muted-foreground/70 mb-10 flex flex-wrap justify-center gap-4 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              342 people viewing plans right now
            </span>
            <span className="hidden sm:inline">·</span>
            <span>1,247 upgraded this week</span>
          </div>

          {/* ── Pill Switcher ── */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] p-1 whitespace-nowrap backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`relative flex items-center gap-2 rounded-full px-6 py-1.5 text-sm font-semibold transition-all duration-300 ${
                !isAnnual
                  ? 'bg-white text-black shadow-lg'
                  : 'text-muted-foreground hover:text-white/80'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${!isAnnual ? 'bg-primary' : 'border-muted-foreground/40 border'}`}
              >
                {!isAnnual && (
                  <Check className="text-primary-foreground h-2.5 w-2.5" />
                )}
              </span>
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`relative flex items-center gap-2 rounded-full px-6 py-1.5 text-sm font-semibold transition-all duration-300 ${
                isAnnual
                  ? 'bg-white text-black shadow-lg'
                  : 'text-muted-foreground hover:text-white/80'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${isAnnual ? 'bg-primary' : 'border-muted-foreground/40 border'}`}
              >
                {isAnnual && (
                  <Check className="text-primary-foreground h-2.5 w-2.5" />
                )}
              </span>
              Yearly
              <span className="text-xs font-bold text-emerald-500">
                Save up to 50%
              </span>
            </button>
          </div>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="mx-auto grid max-w-6xl items-start gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan) => {
            const isPro = plan.tier === 'PRO';
            const isLite = plan.tier === 'LITE';
            const isFree = plan.tier === 'FREE';
            const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const originalPrice = isAnnual
              ? plan.originalYearlyPrice
              : plan.originalMonthlyPrice;
            const periodLabel = plan.period;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 400, damping: 20 },
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
                className="group relative cursor-pointer"
              >
                {/* Gradient border wrapper for Pro card */}
                {isPro && (
                  <div
                    className="absolute -inset-[2px] z-0 rounded-3xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #D4AF37 0%, #F5D060 25%, #B8860B 50%, #F5D060 75%, #D4AF37 100%)',
                      backgroundSize: '300% 300%',
                      animation: 'gradient-shift 4s ease infinite',
                    }}
                  />
                )}

                {/* "Limited Offer" badge for Pro */}
                {isPro && (
                  <div className="absolute -top-3 right-6 z-20">
                    <div className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/25">
                      🔥 Limited Offer
                    </div>
                  </div>
                )}

                {/* "Most Popular" badge for Lite */}
                {isLite && (
                  <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                {/* Dynamic promotion banner for Pro */}
                {isPro && (
                  <div className="absolute -top-12 left-0 right-0 z-30 flex justify-center w-full">
                    <div className="animate-pulse whitespace-nowrap rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold text-rose-200 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                      🔥 Your chart shows high volatility. Unlock full guide.
                    </div>
                  </div>
                )}

                <div
                  className={`relative z-10 flex h-full flex-col rounded-3xl p-8 transition-all duration-300 ${
                    isPro
                      ? 'bg-[#0f0d14]'
                      : isLite
                        ? 'border border-emerald-500/20 bg-[#0f0d14] group-hover:border-emerald-500/40 group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]'
                        : 'border border-white/[0.06] bg-[#0f0d14] group-hover:border-white/20 group-hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.15)]'
                  }`}
                >
                  {/* Plan name */}
                  <h3 className="text-foreground mb-2 text-xl font-bold">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-1 flex items-baseline gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isAnnual ? 'annual' : 'monthly'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-foreground text-4xl font-black"
                      >
                        {price}
                      </motion.span>
                    </AnimatePresence>
                    {originalPrice && (
                      <span className="text-muted-foreground/50 text-lg line-through">
                        {originalPrice}
                      </span>
                    )}
                    {plan.period && (
                      <span className="text-muted-foreground text-base">
                        {periodLabel}
                      </span>
                    )}
                  </div>

                  {/* Billing note */}
                  {!isFree && (
                    <p className="text-muted-foreground/60 mb-6 text-xs">
                      {isAnnual
                        ? `Billed annually (${plan.yearlyPriceTotal})`
                        : 'Billed monthly'}
                    </p>
                  )}
                  {isFree && <div className="mb-6" />}

                  {/* CTA Button */}
                  {isFree ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (!session) {
                          router.push(signInHref);
                        } else {
                          router.push('/kline');
                        }
                      }}
                      className="text-foreground mb-8 h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.08] font-semibold transition-all hover:bg-white/[0.14]"
                    >
                      {plan.cta}
                    </Button>
                  ) : isPro ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (!session) {
                          router.push(signInHref);
                        } else {
                          handleCheckout(currentPlanId(plan)!);
                        }
                      }}
                      disabled={isLoading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-0 font-semibold shadow-[0_0_20px_-5px_var(--primary)] transition-all"
                    >
                      {isLoading && selectedPlan === currentPlanId(plan) && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {plan.cta}
                    </Button>
                  ) : isLite ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (!session) {
                          router.push(signInHref);
                        } else {
                          handleCheckout(currentPlanId(plan)!);
                        }
                      }}
                      disabled={isLoading}
                      className="mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-0 bg-emerald-600 font-semibold text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-500"
                    >
                      {isLoading && selectedPlan === currentPlanId(plan) && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Get Started — Most Popular
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        if (!session) {
                          router.push(signInHref);
                        } else {
                          handleCheckout(currentPlanId(plan)!);
                        }
                      }}
                      disabled={isLoading}
                      className="text-foreground mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.08] font-semibold transition-all hover:bg-white/[0.14]"
                    >
                      {isLoading && selectedPlan === currentPlanId(plan) && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {plan.cta}
                    </Button>
                  )}

                  {/* Features list */}
                  <ul className="flex-1 space-y-3.5">
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm leading-snug"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="text-foreground/80">
                          {feature.highlight
                            ? renderHighlightedText(
                                feature.text,
                                feature.highlight
                              )
                            : feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom Trust Signals ── */}
        <div className="mx-auto mt-16 max-w-3xl">
          {/* Money-back guarantee */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-emerald-400">
                  7-Day Money-Back Guarantee
                </p>
                <p className="text-muted-foreground text-xs">
                  Not satisfied? Full refund, no questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Icons */}
          <div className="mb-8">
            <PaymentIcons />
          </div>

          {/* Security badges */}
          <div className="text-muted-foreground/80 flex flex-col items-center justify-center gap-8 border-t border-white/5 pt-8 md:flex-row">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-emerald-500/70" />
              <span className="text-sm font-medium">
                Bank-level 256-bit encryption
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500/70" />
              <span className="text-sm font-medium">
                Safe & Secure Checkout
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500/70" />
              <span className="text-sm font-medium">
                Crypto & Card Payments
              </span>
            </div>
          </div>

          {/* FAQ quick link */}
          <div className="mt-8 text-center">
            <a
              href="#faq"
              className="text-muted-foreground/60 hover:text-primary font-mono text-sm transition-colors"
            >
              Have questions? Check our FAQ →
            </a>
          </div>
        </div>
      </div>

      {/* Gradient border animation keyframes */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  );
}

/* ─── Helper: Highlight key values in gold ─── */
function renderHighlightedText(text: string, highlight: string) {
  const index = text.indexOf(highlight);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const after = text.slice(index + highlight.length);

  return (
    <>
      {before}
      <span className="font-semibold text-[#D4AF37]">{highlight}</span>
      {after}
    </>
  );
}
