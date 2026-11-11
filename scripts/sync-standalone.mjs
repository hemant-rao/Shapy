import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'packages', 'shapy-bg', 'src', 'shapy-index.html');
const target = join(root, 'examples', 'standalone.html');

copyFileSync(source, target);
console.log('Synced examples/standalone.html from packages/shapy-bg/src/shapy-index.html');
