import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';

import { envConfigs } from '@/config';

import { isCloudflareWorker } from './env';

type CloudflareBindings = Record<string, unknown> & {
  DB?: unknown;
  GEMINI_API_KEY?: string;
};

function getCloudflareBindings(): CloudflareBindings | null {
  if (!isCloudflareWorker) {
    return null;
  }

  try {
    const cloudflareContext = getCloudflareContext() as unknown as {
      env?: CloudflareBindings;
    };
    return cloudflareContext.env ?? null;
  } catch {
    return null;
  }
}

export function getRuntimeConfigValue(name: string): string {
  const upperKey = name.toUpperCase();
  const processValue = process.env[upperKey] ?? process.env[name];

  if (typeof processValue === 'string' && processValue.length > 0) {
    return processValue;
  }

  const cloudflareBindings = getCloudflareBindings();
  const bindingValue =
    cloudflareBindings?.[upperKey] ?? cloudflareBindings?.[name];

  return typeof bindingValue === 'string' ? bindingValue : '';
}

export function hasRuntimeDatabase(): boolean {
  if (envConfigs.database_provider === 'd1') {
    return Boolean(getCloudflareBindings()?.DB) || getRuntimeConfigValue('DATABASE_URL').length > 0;
  }

  return getRuntimeConfigValue('DATABASE_URL').length > 0;
}

export function getRuntimeGeminiApiKey(): string {
  return getRuntimeConfigValue('GEMINI_API_KEY');
}