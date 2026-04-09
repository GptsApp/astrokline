'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/astrokline/track-event';
import {
  AlertCircle,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SmartIcon } from '@/shared/blocks/common';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { getAvailablePaymentProviders } from '@/shared/blocks/payment/payment-providers';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAppContext } from '@/shared/contexts/app';
import { getCookie } from '@/shared/lib/cookie';
import {
  clearPaymentAttempt,
  getPaymentAttempt,
  savePaymentAttempt,
  updatePaymentAttemptStatus,
} from '@/shared/lib/payment-attempt';
import { cn } from '@/shared/lib/utils';
import { Subscription } from '@/shared/models/subscription';
import {
  PricingCurrency,
  PricingItem,
  Pricing as PricingType,
} from '@/shared/types/blocks/pricing';
import { authClient } from '@/core/auth/client';
import { User } from '@/shared/models/user';
import { Heading } from '@/components/astrokline/ui/heading';

import {
  getInitialPricingGroup,
  isCurrentPlanProduct,
} from './pricing-utils';

const PENDING_CHECKOUT_KEY = 'astrokline_pending_checkout_intent';
const PENDING_CHECKOUT_MAX_AGE_MS = 30 * 60 * 1000;
const SUPPORT_EMAIL = 'support@astrokline.com';

interface PendingCheckoutIntent {
  productId: string;
  currency: string;
  createdAt: number;
}

interface CheckoutProgressState {
  provider: string;
  productName: string;
  stage: 'preparing' | 'redirecting';
}

// Helper function to get all available currencies from a pricing item
function getCurrenciesFromItem(item: PricingItem | null): PricingCurrency[] {
  if (!item) return [];

  // Always include the default currency first
  const defaultCurrency: PricingCurrency = {
    currency: item.currency,
    amount: item.amount,
    price: item.price || '',
    original_price: item.original_price || '',
  };

  // Add additional currencies if available
  if (item.currencies && item.currencies.length > 0) {
    return [defaultCurrency, ...item.currencies];
  }

  return [defaultCurrency];
}

// Helper function to select initial currency based on locale
function getInitialCurrency(
  currencies: PricingCurrency[],
  locale: string,
  defaultCurrency: string
): string {
  if (currencies.length === 0) return defaultCurrency;

  // If locale is 'zh', prefer CNY
  if (locale === 'zh') {
    const cnyCurrency = currencies.find(
      (c) => c.currency.toLowerCase() === 'cny'
    );
    if (cnyCurrency) {
      return cnyCurrency.currency;
    }
  }

  // Otherwise return default currency
  return defaultCurrency;
}

function getDisplayedItemForCurrency(
  item: PricingItem,
  currency: string
): PricingItem {
  const currencies = getCurrenciesFromItem(item);
  const currencyData = currencies.find(
    (entry) => entry.currency.toLowerCase() === currency.toLowerCase()
  );

  if (!currencyData) {
    return item;
  }

  return {
    ...item,
    currency: currencyData.currency,
    amount: currencyData.amount,
    price: currencyData.price,
    original_price: currencyData.original_price,
    payment_product_id:
      currencyData.payment_product_id || item.payment_product_id,
    payment_providers: currencyData.payment_providers || item.payment_providers,
  };
}

function extractSessionUser(data: any): User | null {
  const user = data?.data?.user ?? data?.user ?? null;
  return user && typeof user === 'object' ? (user as User) : null;
}

function savePendingCheckoutIntent(intent: PendingCheckoutIntent) {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(intent));
}

function getPendingCheckoutIntent(): PendingCheckoutIntent | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PendingCheckoutIntent;
    if (
      !parsed?.productId ||
      !parsed?.currency ||
      !parsed?.createdAt ||
      Date.now() - parsed.createdAt > PENDING_CHECKOUT_MAX_AGE_MS
    ) {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    return null;
  }
}

function clearPendingCheckoutIntent() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
}

function formatCurrencyAmount(
  amountInMinorUnit: number,
  currency: string,
  locale: string
) {
  return new Intl.NumberFormat(locale || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInMinorUnit / 100);
}

function getDisplayPricingMeta(item: PricingItem, locale: string) {
  if (item.interval === 'year' && item.amount > 0) {
    return {
      price: formatCurrencyAmount(item.amount / 12, item.currency, locale),
      originalPrice: item.original_price,
      unit: '/ month',
      tip: `Billed yearly at ${formatCurrencyAmount(item.amount, item.currency, locale)}`,
    };
  }

  return {
    price: item.price,
    originalPrice: item.original_price,
    unit: item.unit,
    tip: item.tip,
  };
}

export function Pricing({
  section,
  className,
  currentSubscription,
}: {
  section: PricingType;
  className?: string;
  currentSubscription?: Subscription;
}) {
  const locale = useLocale();
  const t = useTranslations('pages.pricing.messages');
  const searchParams = useSearchParams();

  const {
    user,
    setUser,
    isCheckSign,
    isShowSignModal,
    setIsShowSignModal,
    setIsShowPaymentModal,
    configs,
  } = useAppContext();

  const [resolvedCurrentSubscription, setResolvedCurrentSubscription] =
    useState(currentSubscription);

  const [group, setGroup] = useState(() =>
    getInitialPricingGroup(
      section.items,
      section.groups,
      currentSubscription?.productId
    )
  );

  // current pricing item
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [checkoutProgress, setCheckoutProgress] =
    useState<CheckoutProgressState | null>(null);
  const [paymentAttempt, setPaymentAttempt] = useState(() =>
    getPaymentAttempt()
  );
  const [hasMounted, setHasMounted] = useState(false);

  // Currency state management for each item
  // Store selected currency and displayed item for each product_id
  const [itemCurrencies, setItemCurrencies] = useState<
    Record<string, { selectedCurrency: string; displayedItem: PricingItem }>
  >({});

  const activePricingItem = useMemo(() => {
    if (pricingItem) {
      return pricingItem;
    }

    if (!productId || !section.items?.length) {
      return null;
    }

    const item = section.items.find((entry) => entry.product_id === productId);
    if (!item) {
      return null;
    }

    return itemCurrencies[productId]?.displayedItem || item;
  }, [itemCurrencies, pricingItem, productId, section.items]);

  const paymentStatus = searchParams.get('payment');
  const paymentOrderNo = searchParams.get('order_no');

  // Robust timeout: independently track mount time to force-unlock buttons
  // even if auth session check never resolves
  const [canStartCheckout, setCanStartCheckout] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // If auth check resolves quickly, this will be overridden
    // If it hangs, force-unlock after 2 seconds
    const timer = setTimeout(() => {
      setCanStartCheckout(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Also unlock immediately when auth check completes
  useEffect(() => {
    if (hasMounted && !isCheckSign) {
      setCanStartCheckout(true);
    }
  }, [hasMounted, isCheckSign]);

  useEffect(() => {
    setResolvedCurrentSubscription(currentSubscription);
  }, [currentSubscription]);

  const resolveSignedInUser = useCallback(async () => {
    if (user?.id) {
      return user;
    }

    try {
      const session = await authClient.getSession();
      const sessionUser = extractSessionUser(session);
      if (sessionUser?.id) {
        setUser(sessionUser);
        return sessionUser;
      }
    } catch {
      // best-effort only
    }

    return null;
  }, [setUser, user]);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentSubscription = async () => {
      const sessionUser = await resolveSignedInUser();
      if (!sessionUser?.id) {
        return;
      }

      try {
        const response = await fetch('/api/user/current-subscription', {
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!cancelled && payload?.code === 0) {
          setResolvedCurrentSubscription(payload.data || undefined);
        }
      } catch {
        // best-effort only
      }
    };

    void loadCurrentSubscription();

    return () => {
      cancelled = true;
    };
  }, [resolveSignedInUser]);

  useEffect(() => {
    const nextGroup = getInitialPricingGroup(
      section.items,
      section.groups,
      resolvedCurrentSubscription?.productId
    );

    if (nextGroup) {
      setGroup(nextGroup);
    }
  }, [resolvedCurrentSubscription?.productId, section.groups, section.items]);

  const getPreferredProvider = useCallback(
    (item: PricingItem) => {
      const availableProviders = getAvailablePaymentProviders(configs, item);
      if (availableProviders.length === 1) {
        return availableProviders[0];
      }

      if (
        configs.default_payment_provider === 'creem' &&
        availableProviders.includes('creem')
      ) {
        return 'creem';
      }

      return null;
    },
    [configs]
  );

  // Initialize currency states for all items
  useEffect(() => {
    if (section.items && section.items.length > 0) {
      const initialCurrencyStates: Record<
        string,
        { selectedCurrency: string; displayedItem: PricingItem }
      > = {};

      section.items.forEach((item) => {
        const currencies = getCurrenciesFromItem(item);
        const selectedCurrency = getInitialCurrency(
          currencies,
          locale,
          item.currency
        );

        // Create displayed item with selected currency
        const currencyData = currencies.find(
          (c) => c.currency.toLowerCase() === selectedCurrency.toLowerCase()
        );

        const displayedItem = currencyData
          ? {
              ...item,
              currency: currencyData.currency,
              amount: currencyData.amount,
              price: currencyData.price,
              original_price: currencyData.original_price,
              // Override with currency-specific payment settings if available
              payment_product_id:
                currencyData.payment_product_id || item.payment_product_id,
              payment_providers:
                currencyData.payment_providers || item.payment_providers,
            }
          : item;

        initialCurrencyStates[item.product_id] = {
          selectedCurrency,
          displayedItem,
        };
      });

      setItemCurrencies(initialCurrencyStates);
    }
  }, [section.items, locale]);

  // Handler for currency change
  const handleCurrencyChange = (productId: string, currency: string) => {
    const item = section.items?.find((i) => i.product_id === productId);
    if (!item) return;

    const displayedItem = getDisplayedItemForCurrency(item, currency);

    setItemCurrencies((prev) => ({
      ...prev,
      [productId]: {
        selectedCurrency: displayedItem.currency,
        displayedItem,
      },
    }));
  };

  const handlePayment = async (item: PricingItem) => {
    const displayedItem =
      itemCurrencies[item.product_id]?.displayedItem || item;

    const signedInUser = await resolveSignedInUser();
    if (!signedInUser) {
      savePendingCheckoutIntent({
        productId: item.product_id,
        currency: displayedItem.currency,
        createdAt: Date.now(),
      });
      setIsShowSignModal(true);
      return;
    }

    trackEvent('pricing_plan_click', { plan: item.product_id });

    const preferredProvider = getPreferredProvider(displayedItem);

    if (preferredProvider) {
      void handleCheckout(displayedItem, preferredProvider);
      return;
    }

    if (configs.select_payment_enabled === 'true') {
      setProductId(displayedItem.product_id);
      setPricingItem(displayedItem);
      setIsShowPaymentModal(true);
    } else {
      handleCheckout(displayedItem, configs.default_payment_provider);
    }
  };

  const getAffiliateMetadata = ({
    paymentProvider,
  }: {
    paymentProvider: string;
  }) => {
    const affiliateMetadata: Record<string, string> = {};

    // get Affonso referral
    if (
      configs.affonso_enabled === 'true' &&
      ['stripe', 'creem'].includes(paymentProvider)
    ) {
      const affonsoReferral = getCookie('affonso_referral') || '';
      affiliateMetadata.affonso_referral = affonsoReferral;
    }

    // get PromoteKit referral
    if (
      configs.promotekit_enabled === 'true' &&
      ['stripe'].includes(paymentProvider)
    ) {
      const promotekitReferral =
        typeof window !== 'undefined' && (window as any).promotekit_referral
          ? (window as any).promotekit_referral
          : getCookie('promotekit_referral') || '';
      affiliateMetadata.promotekit_referral = promotekitReferral;
    }

    return affiliateMetadata;
  };

  const handleCheckout = useCallback(
    async (item: PricingItem, paymentProvider?: string) => {
      let redirectedToCheckout = false;

      try {
        const signedInUser = await resolveSignedInUser();
        if (!signedInUser) {
          savePendingCheckoutIntent({
            productId: item.product_id,
            currency: item.currency,
            createdAt: Date.now(),
          });
          setIsShowSignModal(true);
          return;
        }

        const affiliateMetadata = getAffiliateMetadata({
          paymentProvider: paymentProvider || '',
        });

        const params = {
          product_id: item.product_id,
          currency: item.currency,
          locale: locale || 'en',
          payment_provider: paymentProvider || '',
          metadata: affiliateMetadata,
        };

        setIsLoading(true);
        setProductId(item.product_id);
        setCheckoutProgress({
          provider: paymentProvider || configs.default_payment_provider || 'checkout',
          productName: item.title || 'your plan',
          stage: 'preparing',
        });

        const response = await fetch('/api/payment/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        trackEvent('checkout_initiated', {
          plan: item.product_id,
          provider: paymentProvider || 'default',
        });

        if (response.status === 401) {
          savePendingCheckoutIntent({
            productId: item.product_id,
            currency: item.currency,
            createdAt: Date.now(),
          });
          setIsLoading(false);
          setProductId(null);
          setPricingItem(null);
          setIsShowSignModal(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }

        const { code, message, data } = await response.json();
        if (code !== 0) {
          throw new Error(message);
        }

        const { checkoutUrl, orderNo, provider, productName, currency } = data;
        if (!checkoutUrl) {
          throw new Error('checkout url not found');
        }

        savePaymentAttempt({
          orderNo: orderNo || '',
          productId: item.product_id,
          productName: productName || item.title,
          currency: currency || item.currency,
          provider: provider || paymentProvider || configs.default_payment_provider || 'checkout',
          checkoutUrl,
          createdAt: Date.now(),
          status: 'redirecting',
        });
        setPaymentAttempt(getPaymentAttempt());
        setCheckoutProgress({
          provider: provider || paymentProvider || 'checkout',
          productName: productName || item.title,
          stage: 'redirecting',
        });
        redirectedToCheckout = true;
        window.location.assign(checkoutUrl);
      } catch (e: any) {
        console.log('checkout failed: ', e);
        toast.error(
          'Checkout failed. If Creem asked for a mobile number, enter it in the secure form and try again. You can also contact support@astrokline.com.'
        );

        setIsLoading(false);
        setProductId(null);
        setCheckoutProgress(null);
      }
      finally {
        if (!redirectedToCheckout) {
          setIsLoading(false);
          setProductId(null);
          setCheckoutProgress(null);
        }
      }
    },
    [
      configs.default_payment_provider,
      locale,
      resolveSignedInUser,
      setIsShowSignModal,
    ]
  );

  useEffect(() => {
    if (section.items) {
      const featuredItem = section.items.find((i) => i.is_featured);
      setProductId(featuredItem?.product_id || section.items[0]?.product_id);
      setIsLoading(false);
    }
  }, [section.items]);

  useEffect(() => {
    if (
      isShowSignModal ||
      !user ||
      !section.items?.length ||
      Object.keys(itemCurrencies).length < 1
    ) {
      return;
    }

    const pendingIntent = getPendingCheckoutIntent();
    if (!pendingIntent) {
      return;
    }

    const item = section.items.find(
      (entry) => entry.product_id === pendingIntent.productId
    );
    if (!item) {
      clearPendingCheckoutIntent();
      return;
    }

    const displayedItem = getDisplayedItemForCurrency(
      item,
      pendingIntent.currency
    );

    setItemCurrencies((prev) => ({
      ...prev,
      [item.product_id]: {
        selectedCurrency: displayedItem.currency,
        displayedItem,
      },
    }));

    setProductId(item.product_id);
    clearPendingCheckoutIntent();
    trackEvent('pricing_checkout_resume', { plan: item.product_id });

    const preferredProvider = getPreferredProvider(displayedItem);

    if (preferredProvider) {
      void handleCheckout(displayedItem, preferredProvider);
      return;
    }

    if (configs.select_payment_enabled === 'true') {
      setPricingItem(displayedItem);
      setIsShowPaymentModal(true);
      return;
    }

    void handleCheckout(displayedItem, configs.default_payment_provider);
  }, [
    configs.default_payment_provider,
    configs.select_payment_enabled,
    handleCheckout,
    isShowSignModal,
    itemCurrencies,
    section.items,
    setIsShowPaymentModal,
    user,
  ]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      clearPaymentAttempt();
      setPaymentAttempt(null);
      setCheckoutProgress(null);
      return;
    }

    if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      updatePaymentAttemptStatus(paymentStatus);
      setPaymentAttempt(getPaymentAttempt());
      setCheckoutProgress(null);
      setIsLoading(false);
      setProductId(null);
      return;
    }

    const existingAttempt = getPaymentAttempt();
    if (existingAttempt?.status === 'redirecting') {
      updatePaymentAttemptStatus('pending');
      setPaymentAttempt(getPaymentAttempt());
      return;
    }

    setPaymentAttempt(existingAttempt);
  }, [paymentStatus]);

  const retryPayment = useCallback(() => {
    if (!paymentAttempt || !section.items?.length) {
      return;
    }

    const item = section.items.find(
      (entry) => entry.product_id === paymentAttempt.productId
    );
    if (!item) {
      return;
    }

    const displayedItem = getDisplayedItemForCurrency(item, paymentAttempt.currency);
    void handleCheckout(displayedItem, paymentAttempt.provider);
  }, [handleCheckout, paymentAttempt, section.items]);

  return (
    <section
      id={section.id}
      className={cn('py-24 md:py-36', section.className, className)}
      >
        <div className="relative z-10 mx-auto mb-12 px-4 text-center md:px-8">
        {paymentStatus === 'cancelled' || paymentStatus === 'failed' ? (
          <div className="mx-auto mb-8 max-w-3xl  border border-amber-500/20 bg-amber-500/10 p-5 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  {paymentStatus === 'cancelled'
                    ? 'Checkout was not completed.'
                    : 'Payment did not go through.'}
                </div>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  {paymentStatus === 'cancelled'
                    ? 'You can restart the same checkout now. If Creem showed an error, asked for a mobile number, or the page closed unexpectedly, retry below.'
                    : 'Please try again. If Creem asked for a mobile number, enter it inside the secure checkout form before paying. If the problem continues, email support@astrokline.com and include your order number.'}
                </p>
                {paymentOrderNo ? (
                  <p className="mt-2 text-xs font-mono tracking-wide text-white/50">
                    Order: {paymentOrderNo}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" onClick={retryPayment}>
                    Retry Payment
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href={`mailto:${SUPPORT_EMAIL}?subject=AstroKline payment help${paymentOrderNo ? ` - ${paymentOrderNo}` : ''}`}>
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!paymentStatus && paymentAttempt?.status === 'pending' ? (
          <div className="mx-auto mb-8 max-w-3xl  border border-sky-500/20 bg-sky-500/10 p-5 text-left">
            <div className="flex items-start gap-3">
              <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  Your checkout is still in progress.
                </div>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Finish the payment in {paymentAttempt.provider} or restart the checkout here if that page expired. Some Creem checkouts ask for a mobile number before the payment can complete.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" asChild>
                    <a href={paymentAttempt.checkoutUrl}>Continue Checkout</a>
                  </Button>
                  <Button type="button" variant="outline" onClick={retryPayment}>
                    Restart Checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {section.sr_only_title && (
          <h2 className="sr-only">{section.sr_only_title}</h2>
        )}

        {section.title && (
          <Heading level={2} variant="section" className="mb-6 text-pretty">
            {section.title}
          </Heading>
        )}
        <p className="text-muted-foreground mx-auto mb-4 max-w-xl lg:max-w-none lg:text-lg">
          {section.description}
        </p>
      </div>

      <div className="container">
        {checkoutProgress ? (
          <div className="mx-auto mb-10 max-w-2xl  border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-semibold">
                {checkoutProgress.stage === 'preparing'
                  ? 'Preparing secure checkout...'
                  : 'Redirecting to secure checkout...'}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              {checkoutProgress.stage === 'preparing'
                ? `This can take a few seconds for ${checkoutProgress.productName}. Keep this tab open.`
                : `Opening ${checkoutProgress.provider} for ${checkoutProgress.productName}. Keep this tab open.`}
            </p>
            {checkoutProgress.provider === 'creem' ? (
              <p className="mt-2 text-xs text-white/50">
                Creem may localize the payment form to the browser language. You
                can switch the language inside checkout if needed. Some Creem
                checkouts also ask for a mobile number inside the secure form
                before payment can complete.
              </p>
            ) : null}
          </div>
        ) : null}

        {section.groups && section.groups.length === 2 ? (
          <div className="mx-auto mt-8 mb-16 flex w-full flex-wrap items-center justify-center gap-5">
            <span
              className={cn(
                'cursor-pointer text-base transition-colors select-none',
                group === section.groups[0].name
                  ? 'font-medium text-white'
                  : 'text-white/40 hover:text-white/70'
              )}
              onClick={() => setGroup(section.groups![0].name || '')}
            >
              {section.groups[0].title}
            </span>

            {/* Custom Toggle Switch matching screenshot */}
            <div
              className="relative flex h-7 w-12 cursor-pointer items-center p-[3px] transition-colors"
              style={{ backgroundColor: '#d4af37' }}
              onClick={() => {
                setGroup((prev) =>
                  prev === section.groups![0].name
                    ? section.groups![1].name!
                    : section.groups![0].name!
                );
              }}
            >
              {/* Switch Thumb */}
              <div
                className="aspect-square h-full bg-[#1f1d19] shadow-md"
                style={{
                  transform: `translateX(${
                    group === section.groups[0].name ? 0 : 20
                  }px)`,
                  transition: 'transform 180ms ease-out',
                }}
              />
            </div>

            <div
              className="relative flex cursor-pointer items-center gap-1.5 select-none"
              onClick={() => setGroup(section.groups![1].name || '')}
            >
              <span
                className={cn(
                  'text-base transition-colors',
                  group === section.groups[1].name
                    ? 'font-medium text-white'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {section.groups[1].title}
              </span>

              {section.groups[1].label && (
                <span className="relative -top-3 border border-[#d4af37]/20 bg-[#d4af37]/10 px-2 py-[2px] text-[10px] font-bold tracking-wide whitespace-nowrap text-[#d4af37] shadow-sm sm:text-xs">
                  {section.groups[1].label}
                </span>
              )}
            </div>
          </div>
        ) : (
          section.groups &&
          section.groups.length > 0 && (
            <div className="mx-auto mt-8 mb-16 flex w-full justify-center md:max-w-lg">
              <Tabs value={group} onValueChange={setGroup} className="">
                <TabsList>
                  {section.groups.map((item, i) => {
                    return (
                      <TabsTrigger key={i} value={item.name || ''}>
                        {item.title}
                        {item.label && (
                          <Badge className="ml-2">{item.label}</Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          )
        )}

        <div
          className={`mx-auto mt-0 grid w-full gap-6 md:grid-cols-${
            section.items?.filter((item) => !item.group || item.group === group)
              ?.length
          }`}
        >
          {section.items?.map((item: PricingItem, idx) => {
            if (item.group && item.group !== group) {
              return null;
            }

            let isCurrentPlan = false;
            if (
              isCurrentPlanProduct(
                resolvedCurrentSubscription?.productId,
                item.product_id
              )
            ) {
              isCurrentPlan = true;
            }

            // Get currency state for this item
            const currencyState = itemCurrencies[item.product_id];
            const displayedItem = currencyState?.displayedItem || item;
            const selectedCurrency =
              currencyState?.selectedCurrency || item.currency;
            const currencies = getCurrenciesFromItem(item);
            const pricingMeta = getDisplayPricingMeta(displayedItem, locale);

            return (
              <Card
                key={idx}
                className={cn(
                  'relative transition-all duration-300 hover:-translate-y-2',
                  item.is_featured
                    ? 'border-[#d4af37] bg-gradient-to-b from-[#d4af37]/5 to-transparent shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                    : 'hover:border-white/20 hover:bg-white/[0.02] hover:shadow-2xl'
                )}
              >
                {item.label && (
                  <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center bg-[#d4af37]/10 px-3 py-1 text-xs font-bold text-[#d4af37] ring-1 ring-[#d4af37]/30 ring-offset-1 ring-offset-[#111] ring-inset">
                    {item.label}
                  </span>
                )}

                <CardHeader>
                  <CardTitle className="font-medium">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                  </CardTitle>

                  <div className="my-3 flex items-baseline gap-2">
                    {pricingMeta.originalPrice && (
                      <span className="text-muted-foreground text-sm line-through">
                        {pricingMeta.originalPrice}
                      </span>
                    )}

                    <div className="my-3 block text-2xl font-semibold">
                      <span
                        className={
                          item.is_featured
                            ? 'text-[#d4af37]'
                            : 'text-foreground'
                        }
                      >
                        {pricingMeta.price}
                      </span>{' '}
                      {pricingMeta.unit ? (
                        <span className="text-muted-foreground text-sm font-normal">
                          {pricingMeta.unit}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>

                    {currencies.length > 1 && (
                      <Select
                        value={selectedCurrency}
                        onValueChange={(currency) =>
                          handleCurrencyChange(item.product_id, currency)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="border-muted-foreground/30 bg-background/50 h-6 min-w-[60px] px-2 text-xs"
                        >
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem
                              key={currency.currency}
                              value={currency.currency}
                              className="text-xs"
                            >
                              {currency.currency.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                  {pricingMeta.tip && (
                    <span className="text-muted-foreground text-sm">
                      {pricingMeta.tip}
                    </span>
                  )}

                  {isCurrentPlan ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 h-9 w-full px-4 py-2"
                      disabled
                    >
                      <span className="hidden text-sm md:block">
                        {t('current_plan')}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handlePayment(item)}
                      disabled={isLoading || !canStartCheckout}
                      className={cn(
                        'focus-visible:ring-ring inline-flex items-center justify-center gap-2  text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                        'mt-4 h-10 w-full px-4 py-2',
                        item.is_featured
                          ? 'border-none bg-gradient-to-r from-[#e5c147] to-[#c5a028] font-semibold text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)] hover:opacity-90'
                          : 'border border-white/10 bg-[#181614] text-white/80 hover:border-white/30 hover:bg-[#22201d] hover:text-white'
                      )}
                    >
                      {isLoading && item.product_id === productId ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span className="block">{t('processing')}</span>
                        </>
                      ) : !canStartCheckout ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span className="block">Loading...</span>
                        </>
                      ) : (
                        <>
                          {item.button?.icon && (
                            <SmartIcon
                              name={item.button?.icon as string}
                              className="size-4"
                            />
                          )}
                          <span className="block">{item.button?.title}</span>
                        </>
                      )}
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <hr className="border-dashed" />

                  {item.features_title && (
                    <p className="text-sm font-medium">{item.features_title}</p>
                  )}
                  <ul className="list-outside space-y-3 text-sm">
                    {item.features?.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trust Elements */}
      <div className="container mt-12">
        {/* Money-back guarantee */}
        <div className="text-muted-foreground mb-8 flex items-center justify-center gap-2 text-sm">
          <ShieldCheck className="text-primary h-5 w-5" />
          <span className="font-medium">
            7-Day Money-Back Guarantee · Secure Checkout · Cancel Anytime
          </span>
        </div>

        {/* Product trust facts */}
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/50 font-mono">
          <span>Swiss Ephemeris DE431</span>
          <span className="hidden sm:inline">·</span>
          <span>NASA JPL Planetary Data</span>
          <span className="hidden sm:inline">·</span>
          <span>Arcsecond Precision</span>
        </div>
      </div>

      <PaymentModal
        isLoading={isLoading}
        pricingItem={activePricingItem}
        onCheckout={(item, paymentProvider) =>
          handleCheckout(item, paymentProvider)
        }
      />
    </section>
  );
}
