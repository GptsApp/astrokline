'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { signUp } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAppContext } from '@/shared/contexts/app';
import {
  addLocalePrefix,
  buildVerifyEmailCallbackPath,
  sanitizeInternalCallbackPath,
  stripLocalePrefix,
} from '@/shared/lib/auth-callback';
import { buildSignUpEmailPayload } from '@/shared/lib/sign-up-email';

import { SocialProviders } from './social-providers';

export function SignUp({
  configs,
  callbackUrl = '/dashboard',
}: {
  configs: Record<string, string>;
  callbackUrl: string;
}) {
  const router = useRouter();
  const t = useTranslations('common.sign');
  const locale = useLocale();
  const { isShowSignModal } = useAppContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const isGoogleAuthEnabled = configs.google_auth_enabled === 'true';
  const isGithubAuthEnabled = configs.github_auth_enabled === 'true';
  const isEmailAuthEnabled =
    configs.email_auth_enabled !== 'false' ||
    (!isGoogleAuthEnabled && !isGithubAuthEnabled); // no social providers enabled, auto enable email auth
  const emailVerificationEnabled =
    configs.email_verification_enabled === 'true';

  const safeCallbackUrl = sanitizeInternalCallbackPath(callbackUrl || '/dashboard');
  const localizedCallbackUrl = addLocalePrefix(safeCallbackUrl, locale);
  const normalizedCallbackUrl = stripLocalePrefix(localizedCallbackUrl, locale);
  const verificationCallbackUrl = buildVerifyEmailCallbackPath(
    normalizedCallbackUrl,
    locale
  );
  const signInHref =
    normalizedCallbackUrl && normalizedCallbackUrl !== '/' && normalizedCallbackUrl !== '/dashboard'
      ? `/sign-in?callbackUrl=${encodeURIComponent(normalizedCallbackUrl)}`
      : '/sign-in';

  const reportAffiliate = ({
    userEmail,
    stripeCustomerId,
  }: {
    userEmail: string;
    stripeCustomerId?: string;
  }) => {
    if (typeof window === 'undefined' || !configs) {
      return;
    }

    const windowObject = window as any;

    if (configs.affonso_enabled === 'true' && windowObject.Affonso) {
      windowObject.Affonso.signup(userEmail);
    }

    if (configs.promotekit_enabled === 'true' && windowObject.promotekit) {
      windowObject.promotekit.refer(userEmail, stripeCustomerId);
    }
  };

  const handleSignUp = async () => {
    if (loading) {
      return;
    }

    if (!email || !password || !name) {
      toast.error('email, password and name are required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Set loading immediately to avoid duplicate submits before request hooks fire.
    setLoading(true);

    try {
      await signUp.email(
        buildSignUpEmailPayload({
          email,
          password,
          name,
          emailVerificationEnabled,
          verificationCallbackUrl,
        }),
        {
          onRequest: () => {
            // loading is already set above; keep as no-op for safety
          },
          onResponse: () => {
            // Do NOT reset loading here; navigation may not have completed yet.
          },
          onSuccess: () => {
            // report affiliate
            reportAffiliate({ userEmail: email });

            const emailVerificationEnabled =
              configs.email_verification_enabled === 'true';

            if (emailVerificationEnabled) {
              const verifyPath = `/verify-email?sent=1&email=${encodeURIComponent(
                email
              )}&callbackUrl=${encodeURIComponent(normalizedCallbackUrl)}`;

              // next/navigation router expects fully qualified path (including locale when non-default)
              router.push(verifyPath);
              return;
            }

            router.push(normalizedCallbackUrl || '/dashboard');
          },
          onError: (e: any) => {
            toast.error(e?.error?.message || 'sign up failed');
            setLoading(false);
          },
        }
      );
    } catch (e: any) {
      toast.error(e?.message || 'sign up failed');
      setLoading(false);
    }
  };

  // Password validation state
  const passwordValid = password.length >= 8;
  const showPasswordHint = passwordTouched && password.length > 0;

  return (
    <Card className={isShowSignModal ? "border-0 shadow-none bg-transparent" : "mx-auto w-full md:max-w-md"}>
      {!isShowSignModal && (
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            <h1>{t('sign_up_heading')}</h1>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            <h2>{t('sign_up_description')}</h2>
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid gap-4">
          {isEmailAuthEnabled && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSignUp();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name">{t('name_title')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('name_placeholder')}
                  required
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                />
              </div>

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
                {emailVerificationEnabled && (
                  <p className="text-xs text-amber-600">
                    {t('email_verification_hint')}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{t('password_title')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('password_placeholder')}
                  autoComplete="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                />
                {showPasswordHint && (
                  <p
                    className={`text-xs transition-colors ${passwordValid ? 'text-emerald-500' : 'text-amber-500'}`}
                  >
                    {passwordValid
                      ? '✓ Password strength OK'
                      : `Password must be at least 8 characters (${password.length}/8)`}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <p>{t('sign_up_button')}</p>
                )}
              </Button>
            </form>
          )}

          <SocialProviders
            configs={configs}
            callbackUrl={safeCallbackUrl}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      </CardContent>
      {isEmailAuthEnabled && (
        <CardFooter>
          <div className="flex w-full justify-center border-t border-white/10 pt-4 pb-2">
            <p className="text-center text-xs text-muted-foreground/60">
              {t('already_have_account')}
              {isShowSignModal ? (
                <button
                  type="button"
                  className="ml-1 cursor-pointer underline hover:text-primary transition-colors text-white/70"
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).setAuthModalType) {
                      (window as any).setAuthModalType('sign-in');
                    }
                  }}
                >
                  {t('sign_in_title')}
                </button>
              ) : (
                <Link href={signInHref} className="ml-1 underline">
                  <span className="cursor-pointer hover:text-primary transition-colors text-white/70">
                    {t('sign_in_title')}
                  </span>
                </Link>
              )}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
