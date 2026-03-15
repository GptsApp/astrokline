import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Creating user_referral table...');
  await sql`
    CREATE TABLE IF NOT EXISTS "user_referral" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "referrer_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "referred_id" text REFERENCES "user"("id") ON DELETE SET NULL,
      "referral_code" text NOT NULL,
      "status" text NOT NULL DEFAULT 'pending',
      "reward_granted" boolean NOT NULL DEFAULT false,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "idx_referral_code" ON "user_referral" ("referral_code")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_referrer_id" ON "user_referral" ("referrer_id")`;
  console.log('✅ Done');
  await sql.end();
}
main().catch(err => { console.error(err); process.exit(1); });
