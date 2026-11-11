import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', 'src', 'shapy-index.html');
const target = join(here, '..', 'src', 'shapy-template.js');

export function renderTemplate(html) {
  const escaped = html
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  return `// AUTO-GENERATED from shapy-index.html. Do not edit by hand.\n// Run: node scripts/build-template.mjs\nexport const SHAPY_HTML = \`${escaped}\`;\n`;
}

export function buildTemplate() {
  const html = readFileSync(source, 'utf8');
  const output = renderTemplate(html);
  writeFileSync(target, output, 'utf8');
  console.log(`Wrote ${target} (${output.length} bytes)`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  buildTemplate();
}
