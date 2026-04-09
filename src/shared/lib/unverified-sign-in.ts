interface BuildVerifyEmailPathOptions {
  sent?: boolean;
  resend?: boolean;
}

export function buildVerifyEmailPath(
  email: string,
  normalizedCallbackUrl: string,
  options: BuildVerifyEmailPathOptions = {}
) {
  const query = new URLSearchParams();

  if (options.sent) {
    query.set('sent', '1');
  }

  if (options.resend) {
    query.set('resend', '1');
  }

  query.set('email', email);
  query.set('callbackUrl', normalizedCallbackUrl);

  return `/verify-email?${query.toString()}`;
}