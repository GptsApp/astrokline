import { config } from './src/config/db/schema.sqlite.ts';
import { db } from './src/core/db/index.ts';

async function main() {
  try {
    const configs = await db().select().from(config);
    console.log('Configs found:');
    configs
      .filter((c: any) => c.key.includes('creem'))
      .forEach((c: any) => console.log(c.key, c.value));
  } catch (e) {
    console.error(e);
  }
}
main();
