import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import {
  CONFIGURED_SECRET_HELP_TEXT,
  getSecretSettingNames,
  isConfiguredSecretMask,
  maskSecretSettingValues,
} from '@/shared/lib/admin-console';
import { getAllConfigs, saveConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';
import {
  getSettingGroups,
  getSettings,
  getSettingTabs,
} from '@/shared/services/settings';
import { Crumb } from '@/shared/types/blocks/common';
import { Form as FormType } from '@/shared/types/blocks/form';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string; tab: string }>;
}) {
  const { locale, tab } = await params;
  setRequestLocale(locale);

  // Check if user has permission to read settings
  await requirePermission({
    code: PERMISSIONS.SETTINGS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const configs = await getAllConfigs();

  const settingGroups = await getSettingGroups();
  const settings = await getSettings();
  const { maskedConfigs, maskedSecretNames } = maskSecretSettingValues(
    configs,
    settings
  );
  const maskedSecretNameSet = new Set(maskedSecretNames);

  const t = await getTranslations('admin.settings');

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/admin' },
    { title: t('edit.crumbs.settings'), is_active: true },
  ];

  const tabs = await getSettingTabs(tab ?? 'auth');

  const handleSubmit = async (data: FormData, passby: any) => {
    'use server';

    try {
      await requirePermission({
        code: PERMISSIONS.SETTINGS_WRITE,
        redirectUrl: '/admin/no-permission',
        locale,
      });

      const user = await getUserInfo();

      if (!user) {
        throw new Error('no auth');
      }

      // Only save fields from the form submission, not all configs
      const secretSettingNames = new Set(
        getSecretSettingNames(await getSettings())
      );
      const formConfigs: Record<string, string> = {};
      data.forEach((value, name) => {
        const stringValue = value as string;

        if (
          secretSettingNames.has(name) &&
          isConfiguredSecretMask(stringValue)
        ) {
          return;
        }

        formConfigs[name] = stringValue;
      });

      await saveConfigs(formConfigs);

      return {
        status: 'success',
        message: 'Settings updated',
      };
    } catch (e: any) {
      console.error('Failed to save settings:', e);
      return {
        status: 'error',
        message: e?.message || 'Failed to save settings',
      };
    }
  };

  let forms: FormType[] = [];

  settingGroups.forEach((group) => {
    if (group.tab !== tab) {
      return;
    }

    forms.push({
      title: group.title,
      description: group.description,
      fields: settings
        .filter((setting) => setting.group === group.name)
        .map((setting) => {
          const isMaskedSecret = maskedSecretNameSet.has(setting.name);

          return {
            name: setting.name,
            title: setting.title,
            type: setting.type as any,
            placeholder: setting.placeholder,
            group: setting.group,
            options: setting.options,
            tip: [
              setting.tip,
              isMaskedSecret ? CONFIGURED_SECRET_HELP_TEXT : null,
            ]
              .filter(Boolean)
              .join(' '),
            value: setting.value,
            attributes: setting.attributes,
          };
        }),
      passby: {
        provider: group.name,
        tab: group.tab,
      },
      data: maskedConfigs,
      submit: {
        button: {
          title: t('edit.buttons.submit'),
        },
        handler: handleSubmit as any,
      },
    });
  });

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} tabs={tabs} />
        {forms.map((form) => (
          <FormCard
            key={form.title}
            title={form.title}
            description={form.description}
            form={form}
            className="mb-8 md:max-w-xl"
            defaultCollapsed={false}
            collapsible={true}
          />
        ))}
      </Main>
    </>
  );
}
