import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('pricing page remains dynamic because it renders current subscription state', () => {
  const filePath = join(
    process.cwd(),
    'src/app/[locale]/(landing)/pricing/page.tsx'
  );
  const source = readFileSync(filePath, 'utf8');

  assert.match(source, /export const dynamic = 'force-dynamic';/);
});