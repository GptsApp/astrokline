import { revalidateTag, unstable_cache } from 'next/cache';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { config } from '@/config/db/schema';
import {
  getAllSettingNames,
  publicSettingNames,
} from '@/shared/services/settings';

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
export type UpdateConfig = Partial<Omit<NewConfig, 'name'>>;

export type Configs = Record<string, string>;
export type GetAllConfigsOptions = {
  fresh?: boolean;
};

export const CACHE_TAG_CONFIGS = 'configs';

export async function saveConfigs(configs: Record<string, string>) {
  const configEntries = Object.entries(configs);
  const results: any[] = [];

  for (const [name, configValue] of configEntries) {
    const [upsertResult] = await db()
      .insert(config)
      .values({ name, value: configValue })
      .onConflictDoUpdate({
        target: config.name,
        set: { value: configValue },
      })
      .returning();

    results.push(upsertResult);
  }

  revalidateTag(CACHE_TAG_CONFIGS);

  return results;
}


export async function addConfig(newConfig: NewConfig) {
  const [result] = await db().insert(config).values(newConfig).returning();
  revalidateTag(CACHE_TAG_CONFIGS);

  return result;
}

async function loadConfigsFromDb(): Promise<Configs> {
  const configs: Record<string, string> = {};

  if (!envConfigs.database_url && !['d1', 'sqlite', 'turso'].includes(envConfigs.database_provider)) {
    return configs;
  }

  const result = await db().select().from(config);
  if (!result) {
    return configs;
  }

  for (const config of result) {
    configs[config.name] = config.value ?? '';
  }

  return configs;
}

export const getConfigs = unstable_cache(
  async (): Promise<Configs> => loadConfigsFromDb(),
  ['configs'],
  {
    revalidate: 3600,
    tags: [CACHE_TAG_CONFIGS],
  }
);

export async function getFreshConfigs(): Promise<Configs> {
  return loadConfigsFromDb();
}

export async function getAllConfigs(
  options: GetAllConfigsOptions = {}
): Promise<Configs> {
  let dbConfigs: Configs = {};

  // only get configs from db in server side
  if (typeof window === 'undefined' && (envConfigs.database_url || ['d1', 'sqlite', 'turso'].includes(envConfigs.database_provider))) {
    try {
      dbConfigs = options.fresh ? await getFreshConfigs() : await getConfigs();
    } catch (e) {
      console.log(`get configs from db failed:`, e);
      dbConfigs = {};
    }
  }

  const settingNames = await getAllSettingNames();
  settingNames.forEach((key) => {
    const upperKey = key.toUpperCase();
    const envValue = process.env[upperKey] ?? process.env[key];
    // Keep DB/admin settings as the source of truth and only backfill missing env-backed values.
    if ((dbConfigs[key] === undefined || dbConfigs[key] === '') && envValue) {
      dbConfigs[key] = envValue;
    }
  });

  const configs = {
    ...envConfigs,
    ...dbConfigs,
  };

  return configs;
}

export async function getPublicConfigs(): Promise<Configs> {
  const allConfigs = await getAllConfigs();

  const publicConfigs: Record<string, string> = {};

  // get public configs
  for (const key in allConfigs) {
    if (publicSettingNames.includes(key)) {
      publicConfigs[key] = String(allConfigs[key]);
    }
  }

  const configs = {
    ...publicConfigs,
  };

  return configs;
}
