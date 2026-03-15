import postgres from 'postgres';

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const sql = postgres(url as string);

  try {
    const userResult = await sql`SELECT id FROM "user" WHERE email = 'support@astrokline.com'`;
    if (userResult.length === 0) {
      console.error("User not found");
      process.exit(1);
    }
    const userId = userResult[0].id;
    console.log("User id:", userId);

    const roleResult = await sql`SELECT id FROM "role" WHERE name = 'admin'`;
    if (roleResult.length === 0) {
      console.error("Role 'admin' not found");
      process.exit(1);
    }
    const roleId = roleResult[0].id;
    console.log("Role id:", roleId);

    // generate simple uuid or string for id
    const { randomUUID } = require('crypto');
    const id = randomUUID();

    await sql`INSERT INTO "user_role" (id, user_id, role_id, created_at, updated_at) VALUES (${id}, ${userId}, ${roleId}, NOW(), NOW()) ON CONFLICT DO NOTHING`;
    console.log("Role correctly assigned!");

  } catch (error) {
    console.error("DB error:", error);
  } finally {
    await sql.end();
  }
}

main();
