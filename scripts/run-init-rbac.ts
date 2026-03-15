import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

try {
  console.log("Running init-rbac with explicit DATABASE_URL...");
  execSync('npx tsx scripts/init-rbac.ts', {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log("Running assign-role with explicitly set DATABASE_URL...");
  execSync('npx tsx scripts/assign-role.ts --email=support@astrokline.com --role=admin', {
    stdio: 'inherit',
    env: process.env
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
