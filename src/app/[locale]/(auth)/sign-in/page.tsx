import { getTranslations } from 'next-intl/server';

import { redirect } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import { SignIn } from '@/shared/blocks/sign/sign-in';
import {
  sanitizeInternalCallbackPath,
  stripLocalePrefix,
} from '@/shared/lib/auth-callback';
import { getPublicConfigs } from '@/shared/models/config';
import { getSignUser } from '@/shared/models/user';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations('common');

  return {
    title: `${t('sign.sign_in_title')} - ${t('metadata.title')}`,
    alternates: {
      canonical:
        locale !== defaultLocale
          ? `${envConfigs.app_url}/${locale}/sign-in`
          : `${envConfigs.app_url}/sign-in`,
    },
  };
}

export default async function SignInPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    email?: string;
    verified?: string;
  }>;
  params: Promise<{ locale: string }>;
}) {
  const { callbackUrl, email } = await searchParams;
  const { locale } = await params;
  const safeCallbackUrl = sanitizeInternalCallbackPath(callbackUrl);

  // If user is already signed in, don't show sign-in form again.
  const sessionUser = await getSignUser();
  if (sessionUser) {
    const target = stripLocalePrefix(safeCallbackUrl, locale);
    redirect({ href: target || '/dashboard', locale });
  }

  const configs = await getPublicConfigs();

  return (
    <SignIn
      configs={configs}
      callbackUrl={safeCallbackUrl}
      defaultEmail={email || ''}
    />
  );
}
