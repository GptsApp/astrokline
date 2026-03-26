import { getTranslations } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import { FormCard } from '@/shared/blocks/form';
import { PanelCard } from '@/shared/blocks/panel';
import { getUserInfo, UpdateUser, updateUser } from '@/shared/models/user';
import { Button as ButtonType } from '@/shared/types/blocks/common';
import { Form as FormType } from '@/shared/types/blocks/form';

export default async function SecurityPage() {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('settings.security');

  const form: FormType = {
    fields: [
      {
        name: 'email',
        title: t('fields.email'),
        type: 'email',
        attributes: { disabled: true },
      },
      {
        name: 'password',
        title: t('fields.password'),
        type: 'password',
        attributes: { type: 'password' },
        validation: { required: true },
      },
      {
        name: 'new_password',
        title: t('fields.new_password'),
        type: 'password',
        validation: { required: true },
      },
      {
        name: 'confirm_password',
        title: t('fields.confirm_password'),
        type: 'password',
        validation: { required: true },
      },
    ],
    data: user,
    passby: {
      user: user,
    },
    submit: {
      handler: async (data: FormData, passby: any) => {
        'use server';

        const { user } = passby;
        if (!user) {
          throw new Error('no auth');
        }

        const password = data.get('password') as string;
        if (!password?.trim()) {
          throw new Error('password is required');
        }

        const updatedUser: UpdateUser = {
          // password: password.trim(),
          // new_password: new_password.trim(),
          // confirm_password: confirm_password.trim(),
        };

        await updateUser(user.id, updatedUser);

        return {
          status: 'success',
          message: 'Profile updated',
          redirect_url: '/settings/profile',
        };
      },
      button: {
        title: t('reset_password.buttons.submit'),
      },
    },
  };

  const deleteAccountForm: FormType = {
    fields: [],
    data: {},
    passby: {
      user: user,
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
        buttons={[
          {
            title: t('reset_password.buttons.submit'),
            url: '/settings/security',
            target: '_self',
            variant: 'default',
            size: 'sm',
            icon: 'RiLockPasswordLine',
          },
        ]}
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
