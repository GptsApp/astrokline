import postgres from 'postgres';

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const sql = postgres(url as string);

  try {
    await sql`UPDATE "user" SET "email_verified" = true WHERE email = 'support@astrokline.com'`;
    console.log('Email verified!');
  } catch (error) {
    console.error('DB error:', error);
  } finally {
    await sql.end();
  }
}

main();
