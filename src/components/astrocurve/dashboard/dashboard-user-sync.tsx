'use client';

import { useEffect, useRef } from 'react';

import { authClient, useSession } from '@/core/auth/client';
import { useAppContext } from '@/shared/contexts/app';
import { User } from '@/shared/models/user';

function extractSessionUser(data: any): User | null {
  const u = data?.user ?? data?.data?.user ?? null;
  return u && typeof u === 'object' ? (u as User) : null;
}

/**
 * Syncs the authenticated session user into AppContext on dashboard pages.
 * This ensures checkout and other user-dependent features work correctly.
 */
export function DashboardUserSync() {
  const { user, setUser, fetchUserInfo, setIsCheckSign } = useAppContext();
  const { data: session, isPending } = useSession();
  const didFallbackRef = useRef(false);

  const sessionUser = extractSessionUser(session);

  useEffect(() => {
    setIsCheckSign(isPending);
  }, [isPending, setIsCheckSign]);

  useEffect(() => {
    const currentUserId = user?.id;
    const sessionUserId = (sessionUser as any)?.id;

    if (sessionUser && sessionUserId !== currentUserId) {
      setUser(sessionUser);
      fetchUserInfo();
    }
  }, [sessionUser?.id, user?.id, setUser, fetchUserInfo, sessionUser]);

  // Fallback: if session cookie exists but useSession lags
  useEffect(() => {
    if (didFallbackRef.current || isPending || sessionUser || user) return;
    didFallbackRef.current = true;

    void (async () => {
      try {
        const res: any = await authClient.getSession();
        const fresh = extractSessionUser(res?.data ?? res);
        if (fresh?.id) {
          setUser(fresh);
          fetchUserInfo();
        }
      } catch {
        // ignore
      }
    })();
  }, [isPending, sessionUser, user, setUser, fetchUserInfo]);

  return null;
}
