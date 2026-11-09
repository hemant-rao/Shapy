import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', 'src', 'shapy-index.html');
const target = join(here, '..', 'src', 'shapy-template.js');

const html = readFileSync(source, 'utf8');
const escaped = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const output = `// AUTO-GENERATED from shapy-index.html. Do not edit by hand.\n// Run: node scripts/build-template.mjs\nexport const SHAPY_HTML = \`${escaped}\`;\n`;

writeFileSync(target, output, 'utf8');
console.log(`Wrote ${target} (${output.length} bytes)`);
