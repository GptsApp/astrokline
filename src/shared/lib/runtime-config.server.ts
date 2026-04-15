import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse as parseDotenv } from 'dotenv';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { envConfigs } from '@/config';

import { isCloudflareWorker } from './env';

type CloudflareBindings = Record<string, unknown> & {
  DB?: unknown;
  GEMINI_API_KEY?: string;
};

let localDevVarsCache: Record<string, string> | null | undefined;

function getLocalDevVars(): Record<string, string> | null {
  if (localDevVarsCache !== undefined) {
    return localDevVarsCache;
  }

  const devVarsPath = join(process.cwd(), '.dev.vars');
  if (!existsSync(devVarsPath)) {
    localDevVarsCache = null;
    return localDevVarsCache;
  }

  try {
    localDevVarsCache = parseDotenv(readFileSync(devVarsPath, 'utf8'));
  } catch {
    localDevVarsCache = null;
  }

  return localDevVarsCache;
}

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

  const localDevValue = getLocalDevVars()?.[upperKey] ?? getLocalDevVars()?.[name];
  if (typeof localDevValue === 'string' && localDevValue.length > 0) {
    return localDevValue;
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