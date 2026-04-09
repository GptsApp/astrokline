Last Updated: 2026-04-07

# Executive Summary

I reviewed the latest uncommitted auth callback hardening changes with a release-blocker mindset, focusing on src/shared/lib/auth-callback.ts and all sign-in/sign-up/verify-email/social auth flows that consume callbackUrl.

High-confidence findings: 1 important issue.

I did not find a second high-confidence open redirect, locale-bypass, or encoded-leading-separator bypass in the reviewed flows.

# Critical Issues (must fix)

None.

# Important Improvements (should fix)

## Legitimate internal callback URLs with multiple query params are still broken in the unverified-email flow

Files:
- src/middleware.ts
- src/shared/blocks/sign/sign-in.tsx
- src/shared/blocks/sign/sign-in-form.tsx
- src/shared/blocks/sign/sign-up.tsx
- src/shared/blocks/sign/verify-email.tsx
- node_modules/better-auth/dist/api/index.mjs
- node_modules/better-auth/dist/shared/better-auth.CewjboYP.mjs

Why this matters:
- The new sanitization logic hardens path boundaries, but the unverified-email flow still passes callbackURL values containing raw query delimiters to better-auth.
- better-auth constructs the verification link by concatenating callbackURL directly into the verify-email query string instead of URL-encoding it.
- Any legitimate internal callbackUrl that contains '&' is truncated at the first additional query param when the user clicks the email link or resends verification.
- This creates a real client/server mismatch: the local waiting page preserves the full callbackUrl in its own UI query string, but the actual verification email redirect target does not.

Concrete regression scenario:
- Logged-out user requests /es/dashboard?tab=payments&page=2.
- middleware preserves that full internal URL as callbackUrl and sends the user to sign-in.
- On sign-in/sign-up for an unverified email, the UI calls sendVerificationEmail with callbackURL=/es/dashboard?tab=payments&page=2.
- better-auth generates /verify-email?token=...&callbackURL=/es/dashboard?tab=payments&page=2.
- The browser parses this as callbackURL=/es/dashboard?tab=payments plus a separate top-level page=2 param.
- After clicking the email or using resend, the user is redirected only to /es/dashboard?tab=payments, losing page=2 and any later parameters.

# Minor Suggestions (nice to have)

None.

# Architecture Considerations

- The new shared auth-callback helpers do appear to close the obvious open-redirect vectors through leading //, backslashes, and encoded leading separators.
- Social login appears safer than the email verification flow because better-auth stores callbackURL in server-side OAuth state instead of concatenating it into a query string.
- The remaining issue is not in locale prefix normalization itself; it is in the serialization boundary between app code and better-auth email verification URLs.

# Next Steps

1. Encode callbackURL before handing it to better-auth email verification flows, or constrain callbackUrl to a format that cannot contain raw '&'.
2. Re-test sign-in, sign-up, resend-verification, and verify-email continue flows with internal callback URLs that include multiple query params.
3. Keep the current path sanitization in place; I did not find a better fix that would replace it.
