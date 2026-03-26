import { getAuth } from '../src/core/auth';

async function main() {
  try {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const name = process.env.ADMIN_BOOTSTRAP_NAME || 'Admin';

    if (!email || !password) {
      throw new Error(
        'ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set'
      );
    }

    const auth = await getAuth();
    console.log('Checking if user exists...');
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    console.log('Registration result:', res);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
