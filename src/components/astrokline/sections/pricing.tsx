"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, LockKeyhole, CreditCard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSession } from "@/core/auth/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  tier: "FREE" | "PRO" | "LITE";
  productIdMonthly?: string;
  productIdAnnual?: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    period: "/mo",
    description: "See how accurate your past K-Line is.",
    features: [
      { text: "Past K-Line preview (future blurred)" },
      { text: "1 basic natal chart read" },
      { text: "Overall destiny score only" },
      { text: "Basic daily horoscope" },
      { text: "Sun, Moon & Rising analysis" },
      { text: "Community access" },
      { text: "Email support" },
    ],
    cta: "Try Now",
    tier: "FREE",
  },
  {
    name: "Pro",
    monthlyPrice: "$79.9",
    yearlyPrice: "$39.9",
    originalMonthlyPrice: "$99.9",
    originalYearlyPrice: "$79.9",
    yearlyPriceTotal: "$478.8/yr",
    period: "/mo",
    description: "Full cosmic intelligence. Career, Love, Wealth & Health — all dimensions.",
    features: [
      { text: "Full 10+ Year K-Line Unlocked", highlight: "10+ Year" },
      { text: "Career / Love / Wealth / Health tracks", highlight: "4 tracks" },
      { text: "Unlimited natal chart calculations", highlight: "Unlimited" },
      { text: "Real-time planetary transit alerts" },
      { text: "Priority AI + deep analysis reports" },
      { text: "HD PDF 'Life Book' export (50+ pages)", highlight: "50+ pages" },
      { text: "Unlimited AI Astrologer deep chat", highlight: "Unlimited" },
      { text: "Exclusive transit survival guides" },
      { text: "Personalized daily horoscope" },
      { text: "Career & Love dual-track K-Lines" },
      { text: "Monthly planetary transit alerts" },
      { text: "VIP priority support" },
    ],
    cta: "Buy Now",
    tier: "PRO",
    productIdMonthly: "premium-monthly",
    productIdAnnual: "premium-yearly",
  },
  {
    name: "Lite",
    monthlyPrice: "$39.9",
    yearlyPrice: "$19.9",
    originalMonthlyPrice: "$49.9",
    originalYearlyPrice: "$39.9",
    yearlyPriceTotal: "$238.8/yr",
    period: "/mo",
    description: "Unlock 1-2 years of your future K-Line trajectory.",
    features: [
      { text: "Past + 1-2 Year Future K-Line", highlight: "1-2 Year" },
      { text: "Career & Love dual-track K-Lines" },
      { text: "Unlimited natal chart calculations", highlight: "Unlimited" },
      { text: "Monthly planetary transit alerts" },
      { text: "AI-powered chart interpretation" },
      { text: "Personalized daily horoscope" },
      { text: "Sun, Moon & Rising deep analysis" },
      { text: "Overall destiny score + sub-scores" },
      { text: "Community access" },
      { text: "Priority support" },
    ],
    cta: "Buy Now",
    tier: "LITE",
    productIdMonthly: "standard-monthly",
    productIdAnnual: "standard-yearly",
  },
];

/* ─── Payment Icons ─── */
function PaymentIcons() {
  const icons = [
    { name: "Visa", src: "/images/pay/visa.png" },
    { name: "Mastercard", src: "/images/pay/mastercard.png" },
    { name: "USDC", src: "/images/pay/usdc.png" },
    { name: "USDT", src: "/images/pay/usdt.png" },
  ];
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-muted-foreground/70 text-sm">
        <ShieldCheck className="w-4 h-4" />
        <span>Pay safely and securely with</span>
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {icons.map((icon) => (
          <div
            key={icon.name}
            className="h-10 w-16 rounded-lg bg-white flex items-center justify-center"
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

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      setSelectedPlan(planId);

      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: planId,
          currency: "USD",
          locale: "en",
        }),
      });

      if (!response.ok) throw new Error("Checkout request failed");
      const { code, data, message } = await response.json();
      if (code !== 0) throw new Error(message);

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error("Payment initialization failed:", e);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const currentPlanId = (plan: Plan) =>
    isAnnual ? plan.productIdAnnual : plan.productIdMonthly;

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* ── Ambient glow ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 10%, rgba(168,85,247,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Plans & Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Choose the depth of your astrology chart reading. From a birth chart
            preview, to a comprehensive K-Line blueprint of your cosmic destiny.
          </p>

          {/* ── Pill Switcher ── */}
          <div className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/10 p-1 backdrop-blur-sm whitespace-nowrap">
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative rounded-full px-6 py-1.5 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                !isAnnual
                  ? "bg-white text-black shadow-lg"
                  : "text-muted-foreground hover:text-white/80"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${!isAnnual ? 'bg-primary' : 'border border-muted-foreground/40'}`}>
                {!isAnnual && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </span>
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative rounded-full px-6 py-1.5 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                isAnnual
                  ? "bg-white text-black shadow-lg"
                  : "text-muted-foreground hover:text-white/80"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isAnnual ? 'bg-primary' : 'border border-muted-foreground/40'}`}>
                {isAnnual && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </span>
              Yearly
              <span
                className="text-xs font-bold text-emerald-500"
              >
                Save up to 50%
              </span>
            </button>
          </div>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, i) => {
            const isPro = plan.tier === "PRO";
            const isFree = plan.tier === "FREE";
            const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const originalPrice = isAnnual ? plan.originalYearlyPrice : plan.originalMonthlyPrice;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
                className="relative cursor-pointer group"
              >
                {/* Gradient border wrapper for Pro card */}
                {isPro && (
                  <div
                    className="absolute -inset-[2px] rounded-3xl z-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4AF37 0%, #F5D060 25%, #B8860B 50%, #F5D060 75%, #D4AF37 100%)",
                      backgroundSize: "300% 300%",
                      animation: "gradient-shift 4s ease infinite",
                    }}
                  />
                )}

                {/* "Limited Offer" badge */}
                {isPro && (
                  <div className="absolute -top-3 right-6 z-20">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-red-500/25">
                      🔥 Limited Offer
                    </div>
                  </div>
                )}

                <div
                  className={`relative z-10 rounded-3xl p-8 flex flex-col h-full transition-all duration-300 ${
                    isPro
                      ? "bg-[#0f0d14]"
                      : "bg-[#0f0d14] border border-white/[0.06] group-hover:border-white/20 group-hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.15)]"
                  }`}
                >
                  {/* Plan name */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-1 flex items-baseline gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isAnnual ? "annual" : "monthly"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl font-black text-foreground"
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
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* Billing note */}
                  {!isFree && (
                    <p className="text-xs text-muted-foreground/60 mb-6">
                      {isAnnual
                        ? `Billed annually (${plan.yearlyPriceTotal})`
                        : "Billed monthly"}
                    </p>
                  )}
                  {isFree && <div className="mb-6" />}

                  {/* CTA Button */}
                  {isFree ? (
                    <Button
                      onClick={() => {
                        if (!session) {
                          router.push("/sign-in");
                        } else {
                          router.push("/daily");
                        }
                      }}
                      className="w-full h-12 rounded-xl font-semibold bg-white/[0.08] text-foreground hover:bg-white/[0.14] border border-white/[0.08] transition-all mb-8"
                    >
                      {plan.cta}
                    </Button>
                  ) : isPro ? (
                    <Button
                      onClick={() => {
                        if (!session) {
                          router.push("/sign-in");
                        } else {
                          handleCheckout(currentPlanId(plan)!);
                        }
                      }}
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all flex items-center justify-center gap-2 mb-8 border-0"
                    >
                      {isLoading &&
                        selectedPlan === currentPlanId(plan) && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      {plan.cta}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (!session) {
                          router.push("/sign-in");
                        } else {
                          handleCheckout(currentPlanId(plan)!);
                        }
                      }}
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl font-semibold bg-white/[0.08] text-foreground hover:bg-white/[0.14] border border-white/[0.08] transition-all flex items-center justify-center gap-2 mb-8"
                    >
                      {isLoading &&
                        selectedPlan === currentPlanId(plan) && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      {plan.cta}
                    </Button>
                  )}

                  {/* Features list */}
                  <ul className="space-y-3.5 flex-1">
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm leading-snug"
                      >
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-foreground/80">
                          {feature.highlight
                            ? renderHighlightedText(feature.text, feature.highlight)
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
        <div className="mt-16 max-w-3xl mx-auto">
          {/* Payment Icons */}
          <div className="mb-8">
            <PaymentIcons />
          </div>

          {/* Security badges */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-muted-foreground/80 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-5 h-5 text-emerald-500/70" />
              <span className="text-sm font-medium">
                Bank-level 256-bit encryption
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500/70" />
              <span className="text-sm font-medium">
                Safe & Secure Checkout
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500/70" />
              <span className="text-sm font-medium">
                Crypto & Card Payments
              </span>
            </div>
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
      <span className="text-[#D4AF37] font-semibold">{highlight}</span>
      {after}
    </>
  );
}
