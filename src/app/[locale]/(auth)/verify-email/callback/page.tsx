import { redirect } from '@/core/i18n/navigation';
import {
  sanitizeInternalCallbackPath,
  stripLocalePrefix,
} from '@/shared/lib/auth-callback';
import { getSignUser } from '@/shared/models/user';

export default async function VerifyEmailCallbackPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ next?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { next } = await searchParams;
  const { locale } = await params;
  const nextPath = stripLocalePrefix(
    sanitizeInternalCallbackPath(next),
    locale
  );

  const sessionUser = await getSignUser();
  if (sessionUser) {
    redirect({ href: nextPath || '/', locale });
  }

  const query = new URLSearchParams();
  query.set('callbackUrl', nextPath || '/');

  redirect({ href: `/verify-email?${query.toString()}`, locale });
}