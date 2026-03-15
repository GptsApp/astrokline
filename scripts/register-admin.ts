import { getAuth } from '../src/core/auth';
import { db } from '../src/core/db';
import { user } from '../src/config/db/schema'; // adjust if needed
import { Headers } from 'node-fetch'; // or use native Headers

async function main() {
  try {
    const auth = await getAuth();
    console.log("Checking if user exists...");
    // better-auth uses its own API, but we can also use drizzle
    const res = await auth.api.signUpEmail({
      body: {
        email: 'support@astrokline.com',
        password: 'ak141516oo',
        name: 'Admin'
      }
    });
    console.log("Registration result:", res);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
