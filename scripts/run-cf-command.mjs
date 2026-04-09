import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { parse } from 'dotenv';
import { z } from 'zod';

const commandSchema = z.enum(['preview', 'deploy', 'upload']);

const commandArgs = {
  preview: ['preview', '--config', 'wrangler.toml'],
  deploy: ['deploy', '--config', 'wrangler.toml'],
  upload: ['upload', '--config', 'wrangler.toml'],
};

function readEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return {};
  }

  return parse(readFileSync(filePath));
}

function getFirstNonEmptyValue(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function buildCloudflareEnv() {
  const localEnv = readEnvFile('.env.local');
  const productionEnv = readEnvFile('.env.production');
  const mergedEnv = { ...process.env };

  const keys = new Set([
    ...Object.keys(localEnv),
    ...Object.keys(productionEnv),
  ]);

  for (const key of keys) {
    const resolvedValue = getFirstNonEmptyValue(
      process.env[key],
      productionEnv[key],
      localEnv[key]
    );

    if (resolvedValue !== undefined) {
      mergedEnv[key] = resolvedValue;
    }
  }

  return mergedEnv;
}

function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`
        )
      );
    });
  });
}

async function main() {
  try {
    const command = commandSchema.parse(process.argv[2]);
    const env = buildCloudflareEnv();

    await runCommand('opennextjs-cloudflare', ['build'], env);
    await runCommand('opennextjs-cloudflare', commandArgs[command], env);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();