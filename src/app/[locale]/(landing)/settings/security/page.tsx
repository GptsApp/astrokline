import { redirect } from '@/core/i18n/navigation';
import { getTranslations } from 'next-intl/server';

import { PanelCard } from '@/shared/blocks/panel';
import { FormCard } from '@/shared/blocks/form';
import { getUserInfo } from '@/shared/models/user';
import { Form as FormType } from '@/shared/types/blocks/form';

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUserInfo();
  if (!user) {
    redirect({ href: '/sign-in', locale });
  }
  const currentUser = user!;

  const t = await getTranslations('settings.security');

  const deleteAccountForm: FormType = {
    fields: [],
    data: {},
    passby: {
      user: currentUser,
    },
    submit: {
      handler: async (data: FormData, passby: any) => {
        'use server';

        const { user } = passby;
        if (!user) {
          throw new Error('no auth');
        }

        const { db } = await import('@/core/db');
        const { user: userSchema } = await import('@/config/db/schema');
        const { eq } = await import('drizzle-orm');

        // GDPR data erasure
        await db().delete(userSchema).where(eq(userSchema.id, user.id));

        return {
          status: 'success',
          message: 'Account and all data deleted permanently',
          redirect_url: '/sign-in',
        };
      },
      button: {
        title: t('delete_account.buttons.submit'),
        variant: 'destructive',
      },
    },
  };

  return (
    <div className="space-y-8">
      <PanelCard
        title={t('reset_password.title')}
        description={t('reset_password.description')}
        content={t('reset_password.tip')}
        className="max-w-md"
      />
      <FormCard
        title={t('delete_account.title')}
        description={t('delete_account.description')}
        form={deleteAccountForm}
      />
    </div>
  );
}
