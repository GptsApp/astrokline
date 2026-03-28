'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { authClient, signIn } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { defaultLocale } from '@/config/locale';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAppContext } from '@/shared/contexts/app';

import { SocialProviders } from './social-providers';

export function SignInForm({
  callbackUrl = '/',
  className,
}: {
  callbackUrl: string;
  className?: string;
}) {
  const t = useTranslations('common.sign');
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { configs, isShowSignModal } = useAppContext();

  const isGoogleAuthEnabled = configs.google_auth_enabled === 'true';
  const isGithubAuthEnabled = configs.github_auth_enabled === 'true';
  const isEmailAuthEnabled =
    configs.email_auth_enabled !== 'false' ||
    (!isGoogleAuthEnabled && !isGithubAuthEnabled); // no social providers enabled, auto enable email auth

  if (callbackUrl) {
    if (
      locale !== defaultLocale &&
      callbackUrl.startsWith('/') &&
      !callbackUrl.startsWith(`/${locale}`)
    ) {
      callbackUrl = `/${locale}${callbackUrl}`;
    }
  }

  const base = locale !== defaultLocale ? `/${locale}` : '';
  const stripLocalePrefix = (path: string) => {
    if (!path?.startsWith('/')) return '/';
    if (locale === defaultLocale) return path;
    if (path === `/${locale}`) return '/';
    if (path.startsWith(`/${locale}/`))
      return path.slice(locale.length + 1) || '/';
    return path;
  };
  const normalizedCallbackUrl = stripLocalePrefix(callbackUrl || '/');
  const signUpHref =
    normalizedCallbackUrl && normalizedCallbackUrl !== '/'
      ? `/sign-up?callbackUrl=${encodeURIComponent(normalizedCallbackUrl)}`
      : '/sign-up';

  const handleSignIn = async () => {
    if (loading) {
      return;
    }

    if (!email || !password) {
      toast.error('email and password are required');
      return;
    }

    // Set loading immediately to avoid duplicate submits before request hooks fire.
    setLoading(true);

    try {
      await signIn.email(
        {
          email,
          password,
          callbackURL: callbackUrl,
        },
        {
          onRequest: () => {
            // loading is already set above; keep as no-op for safety
          },
          onResponse: () => {
            // Do NOT reset loading here; navigation may not have completed yet.
          },
          onSuccess: () => {
            router.push(normalizedCallbackUrl || '/');
            router.refresh();
          },
          onError: (e: any) => {
            const status = e?.error?.status;
            if (status === 403) {
              const verifyPath = `/verify-email?sent=1&email=${encodeURIComponent(
                email
              )}&callbackUrl=${encodeURIComponent(normalizedCallbackUrl)}`;

              // Keep the email link callback simple; verify page remains the waiting UI.
              void authClient.sendVerificationEmail({
                email,
                callbackURL: `${base}${normalizedCallbackUrl || '/'}`,
              });

              // i18n router will prefix locale automatically; do NOT include locale here.
              router.push(verifyPath);
              return;
            }

            toast.error(e?.error?.message || 'sign in failed');
            setLoading(false);
          },
        }
      );
    } catch (e: any) {
      toast.error(e?.message || 'sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className={`w-full md:max-w-md ${className}`}>
      <div className="grid gap-4">
        {isEmailAuthEnabled && (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSignIn();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email_title')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('email_placeholder')}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>

            <div className="grid gap-2">
              {/* <div className="flex items-center">
              <Label htmlFor="password">{t("password_title")}</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div> */}

              <Input
                id="password"
                type="password"
                placeholder={t('password_placeholder')}
                autoComplete="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              onClick={() => {
                setRememberMe(!rememberMe);
              }}
            />
            <Label htmlFor="remember">{t("remember_me_title")}</Label>
          </div> */}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <p> {t('sign_in_title')} </p>
              )}
            </Button>
          </form>
        )}

        <SocialProviders
          configs={configs}
          callbackUrl={callbackUrl || '/'}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
      {isEmailAuthEnabled && (
        <div className="flex w-full justify-center border-t border-white/10 pt-4 pb-2">
          <p className="text-center text-xs text-muted-foreground/60">
            {t('no_account')}
            {isShowSignModal ? (
              <button
                type="button"
                className="ml-1 cursor-pointer underline hover:text-primary transition-colors text-white/70"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).setAuthModalType) {
                    (window as any).setAuthModalType('sign-up');
                  }
                }}
              >
                {t('sign_up_title')}
              </button>
            ) : (
              <Link href={signUpHref} className="ml-1 underline">
                <span className="cursor-pointer hover:text-primary transition-colors text-white/70">
                  {t('sign_up_title')}
                </span>
              </Link>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
