import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createClient } from '@libsql/client';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';

import { envConfigs } from '@/config';
import { isCloudflareWorker } from '@/shared/lib/env';

// SQLite/libsql singleton (only used when DB_SINGLETON_ENABLED === 'true' and not in Workers)
let sqliteDbInstance: ReturnType<typeof drizzleLibsql> | null = null;

// get sqlite db instance (works for local sqlite file:..., turso/libsql://..., and Cloudflare D1)
export function getSqliteDb() {
  // In Cloudflare Workers with D1 provider, use the D1 binding directly
  if (isCloudflareWorker && envConfigs.database_provider === 'd1') {
    const { env }: { env: any } = getCloudflareContext();
    if (env?.DB) {
      return drizzleD1(env.DB);
    }
  }

  const databaseUrl = envConfigs.database_url;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // custom options
  const options: Record<string, string> = {};
  if (envConfigs.database_auth_token) {
    options.authToken = envConfigs.database_auth_token;
  }

  // In Cloudflare Workers, create new connection each time (avoid cross-request state)
  if (isCloudflareWorker) {
    const client = createClient({
      url: databaseUrl,
      ...options,
    });
    return drizzleLibsql({ client });
  }

  // Singleton mode: reuse existing instance
  if (envConfigs.db_singleton_enabled === 'true') {
    if (sqliteDbInstance) return sqliteDbInstance;

    const client = createClient({
      url: databaseUrl,
      ...options,
    });
    sqliteDbInstance = drizzleLibsql({ client });
    return sqliteDbInstance;
  }

  // Non-singleton mode: create new connection each time
  const client = createClient({
    url: databaseUrl,
    ...options,
  });
  return drizzleLibsql({ client });
}
