import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({ path: '.env.development' });

export default {
  schema: './src/config/db/schema.postgres.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
} satisfies Config;
