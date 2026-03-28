'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useAppContext } from '@/shared/contexts/app';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

import { SignInForm } from './sign-in-form';
import { SignUp } from './sign-up';
import { Sparkles, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function SignModal({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const t = useTranslations('common.sign');
  const { isShowSignModal, setIsShowSignModal, authModalType, setAuthModalType, configs } = useAppContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ensure window-level hack works for Sign In / Sign Up toggling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setAuthModalType = setAuthModalType;
    }
  }, [setAuthModalType]);

  const resolvedCallbackUrl = useMemo(() => {
    if (callbackUrl && callbackUrl !== '/') {
      return callbackUrl;
    }

    const query = searchParams.toString();
    return `${pathname || '/'}${query ? `?${query}` : ''}`;
  }, [callbackUrl, pathname, searchParams]);

  // Clean the drawer logic, use responsive full-screen dialog on mobile
  return (
    <Dialog open={isShowSignModal} onOpenChange={setIsShowSignModal}>
      <DialogContent 
        className="max-h-[90dvh] !gap-0 overflow-y-auto border-white/10 !bg-[#0D0B12] !p-0 sm:max-w-[480px]"
        showCloseButton={true}
      >
        {/* Glow Effects */}
        <div className="from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent opacity-50" />
        
        <DialogHeader className="relative z-10 px-6 pt-8 pb-2 text-center">
          <div className="bg-primary/10 border-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center border shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <DialogTitle className="text-foreground text-xl font-bold">
            {authModalType === 'sign-in' ? t('sign_in_title') : t('sign_up_title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-sm">
            {authModalType === 'sign-in' 
              ? t('sign_in_description') 
              : t('sign_up_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 px-6 pb-8 pt-4">
          {authModalType === 'sign-in' ? (
            <SignInForm callbackUrl={resolvedCallbackUrl} />
          ) : (
            <div className="relative -mx-4 sm:mx-0">
              <SignUp configs={configs} callbackUrl={resolvedCallbackUrl} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
