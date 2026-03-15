import postgres from 'postgres';

// Load env
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Creating user_kline table...');
  await sql`
    CREATE TABLE IF NOT EXISTS "user_kline" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "is_self" boolean NOT NULL DEFAULT false,
      "label" text NOT NULL DEFAULT '',
      "birth_date" text NOT NULL,
      "birth_time" text,
      "birth_place" text NOT NULL,
      "birth_lat" text,
      "birth_lng" text,
      "birth_hash" text NOT NULL,
      "kline_result" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log('✅ user_kline created');

  console.log('Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS "idx_user_kline_user_self" ON "user_kline" ("user_id", "is_self")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_user_kline_user_hash" ON "user_kline" ("user_id", "birth_hash")`;
  console.log('✅ indexes created');

  console.log('Creating user_kline_quota table...');
  await sql`
    CREATE TABLE IF NOT EXISTS "user_kline_quota" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
      "used_count" integer NOT NULL DEFAULT 0,
      "total_limit" integer NOT NULL DEFAULT 2,
      "period_start" timestamp DEFAULT now() NOT NULL,
      "period_end" timestamp,
      "lifetime_used" integer NOT NULL DEFAULT 0,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log('✅ user_kline_quota created');

  console.log('All done!');
  await sql.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
