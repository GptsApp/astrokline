'use client';

import { useEffect } from 'react';

import { deleteCookie, getCookie } from '@/shared/lib/cookie';

const REFERRAL_COOKIE = 'ak_ref';

export function ReferralClaim() {
  useEffect(() => {
    const referralCode = getCookie(REFERRAL_COOKIE);
    if (!referralCode) return;

    const decodedReferralCode = decodeURIComponent(referralCode);
    if (!decodedReferralCode) return;

    let cancelled = false;

    const claimReferral = async () => {
      try {
        const response = await fetch('/api/referral/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: decodedReferralCode }),
        });

        if (!response.ok) return;

        const result = await response.json();
        if (!cancelled && result.success) {
          deleteCookie(REFERRAL_COOKIE);
        }
      } catch {
        // best-effort only
      }
    };

    void claimReferral();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
