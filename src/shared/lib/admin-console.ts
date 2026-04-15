import type { Setting } from '@/shared/services/settings';
import type { NavItem } from '@/shared/types/blocks/common';

export const CONFIGURED_SECRET_MASK = '***';
export const CONFIGURED_SECRET_HELP_TEXT =
  'Already configured in backend. Click to replace it, or leave *** unchanged.';

export function getSecretSettingNames(settings: Setting[]): string[] {
  return settings
    .filter((setting) => setting.type === 'password')
    .map((setting) => setting.name);
}

export function maskSecretSettingValues(
  configs: Record<string, string>,
  settings: Setting[]
): {
  maskedConfigs: Record<string, string>;
  maskedSecretNames: string[];
} {
  const maskedConfigs = { ...configs };
  const maskedSecretNames: string[] = [];

  for (const name of getSecretSettingNames(settings)) {
    const value = maskedConfigs[name];
    if (typeof value === 'string' && value.trim().length > 0) {
      maskedConfigs[name] = CONFIGURED_SECRET_MASK;
      maskedSecretNames.push(name);
    }
  }

  return {
    maskedConfigs,
    maskedSecretNames,
  };
}

export function isConfiguredSecretMask(value: unknown): boolean {
  return (
    typeof value === 'string' && value.trim() === CONFIGURED_SECRET_MASK
  );
}

export function getDashboardAccountLinks(canAccessAdmin: boolean): NavItem[] {
  const items: NavItem[] = [
    {
      title: 'Settings',
      url: '/dashboard/settings/profile',
      icon: 'Settings',
    },
    {
      title: 'Billing',
      url: '/dashboard/settings/billing',
      icon: 'CreditCard',
    },
  ];

  if (canAccessAdmin) {
    items.push({
      title: 'Admin',
      url: '/admin',
      icon: 'LayoutDashboard',
    });
  }

  return items;
}