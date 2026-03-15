import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Adding share_token and is_public to user_kline...');
  await sql`ALTER TABLE "user_kline" ADD COLUMN IF NOT EXISTS "share_token" text`;
  await sql`ALTER TABLE "user_kline" ADD COLUMN IF NOT EXISTS "is_public" boolean NOT NULL DEFAULT false`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_user_kline_share_token" ON "user_kline" ("share_token") WHERE "share_token" IS NOT NULL`;
  console.log('✅ Done');
  await sql.end();
}
main().catch(err => { console.error(err); process.exit(1); });
