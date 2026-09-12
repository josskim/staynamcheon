import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Vercel sets NODE_ENV=production during builds; React's act exists only in test/dev.
// Scope the override to the isolated test subprocess, never to the application build.
const files = readdirSync(new URL('.', import.meta.url)).filter(name => name.endsWith('.test.mjs')).sort();
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files.map(name => `tests/${name}`)], {
  stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test' },
});
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
