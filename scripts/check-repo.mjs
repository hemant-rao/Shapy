import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTemplate } from '../packages/shapy/scripts/build-template.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const checks = [];

const docs = [
  'README.md',
  'packages/shapy/README.md',
  'AGENTS.md',
  'docs/GETTING_STARTED.md',
  'docs/UNIQUENESS.md',
  'docs/AI_CONTEXT.md',
  'CHANGELOG.md',
];

function ok(message) {
  checks.push(`PASS: ${message}`);
}

function bad(message) {
  problems.push(`FAIL: ${message}`);
}

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

function checkGroup(message, fn) {
  const before = problems.length;
  fn();
  if (problems.length === before) ok(message);
}

function withoutFences(text) {
  return text.replace(/^```[\s\S]*?^```/gm, '');
}

for (const doc of docs) {
  const text = withoutFences(read(doc));
  const links = [...text.matchAll(/\[[^\]]*\]\((\.[^)#]+)(?:#[^)]*)?\)/g)].map(
    (match) => match[1],
  );

  checkGroup(`${doc}: relative links resolve`, () => {
    for (const link of links) {
      const target = resolve(root, dirname(doc), link);
      if (!existsSync(target)) {
        bad(`${doc}: missing relative link target ${link}`);
      }
    }
  });
}

for (const doc of docs) {
  const fences = (read(doc).match(/^```/gm) || []).length;
  if (fences % 2 !== 0) bad(`${doc}: odd number of code fences (${fences})`);
  else ok(`${doc}: code fences balanced (${fences})`);
}

const pkgRel = 'packages/shapy/package.json';
const pkg = JSON.parse(read(pkgRel));
const pkgDir = dirname(join(root, pkgRel));

checkGroup(`${pkgRel}: files, exports, and ./stickers export are valid`, () => {
  for (const entry of pkg.files || []) {
    if (!existsSync(join(pkgDir, entry))) {
      bad(`${pkgRel}: files entry missing: ${entry}`);
    }
  }

  const targets = [];
  const walk = (value) => {
    if (typeof value === 'string') targets.push(value);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };

  walk(pkg.exports);
  walk(pkg.types);
  walk(pkg.main);
  walk(pkg.module);

  for (const target of targets) {
    if (target.startsWith('./') && !existsSync(join(pkgDir, target))) {
      bad(`${pkgRel}: export target missing: ${target}`);
    }
  }

  if (!pkg.exports['./stickers']) bad(`${pkgRel}: missing ./stickers export`);
});

const rendererSource = read('packages/shapy/src/shapy-index.html');

checkGroup('examples/standalone.html matches the renderer source', () => {
  if (read('examples/standalone.html') !== rendererSource) {
    bad('examples/standalone.html is stale; run npm run build:template');
  }
});

checkGroup('packages/shapy/src/shapy-template.js is current', () => {
  const template = read('packages/shapy/src/shapy-template.js');

  if (template !== renderTemplate(rendererSource)) {
    bad('packages/shapy/src/shapy-template.js is stale; run npm run build:template');
  }
});

const requiredFiles = [
  'README.md',
  'LICENSE',
  'AGENTS.md',
  'CHANGELOG.md',
  'docs/GETTING_STARTED.md',
  'docs/UNIQUENESS.md',
  'docs/AI_CONTEXT.md',
  '.github/workflows/ci.yml',
  'package.json',
  'package-lock.json',
  'examples/minimal.html',
  'examples/standalone.html',
  'apps/demo/package.json',
  'packages/shapy/package.json',
  'packages/shapy/src/seed.js',
  'packages/shapy/src/stickers.js',
  'packages/shapy/stickers.d.ts',
  'scripts/sync-standalone.mjs',
  'scripts/check-repo.mjs',
];

checkGroup('required files exist', () => {
  for (const file of requiredFiles) {
    if (!existsSync(join(root, file))) bad(`missing required file: ${file}`);
  }
});

const currentDocs = [
  'README.md',
  'packages/shapy/README.md',
  'AGENTS.md',
  'docs/GETTING_STARTED.md',
  'docs/UNIQUENESS.md',
  'docs/AI_CONTEXT.md',
];

checkGroup('current docs contain no stale layout or duplication instructions', () => {
  for (const doc of currentDocs) {
    const text = read(doc);

    if (
      /vue-demo\/|docs\/CHANGELOG|`shapy\/src\/|`shapy\/package\.json|`shapy\/scripts\//.test(
        text,
      )
    ) {
      bad(`${doc}: references the old layout`);
    }
    if (
      /two renderer sources|byte-identical|mirror every renderer|updated in parallel/.test(
        text,
      )
    ) {
      bad(`${doc}: still describes manual renderer duplication`);
    }
    if (/shapy-stickers|publish:stickers|pack:stickers/.test(text)) {
      bad(`${doc}: references the removed sticker package`);
    }
  }
});

checkGroup('docs contain no machine-specific paths or token-like strings', () => {
  for (const doc of docs) {
    const text = read(doc);
    if (/C:\\Users\\|F:\\Project\\|gho_|npm_[A-Za-z0-9]{20,}|mrhrao/.test(text)) {
      bad(`${doc}: contains a machine-specific path or secret-like text`);
    }
  }
});

checkGroup('package sources contain no TODO/FIXME or eval/new Function', () => {
  for (const file of [
    'packages/shapy/src/index.js',
    'packages/shapy/src/shapy-bg.js',
    'packages/shapy/src/catalog.js',
    'packages/shapy/src/stickers.js',
  ]) {
    const text = read(file);
    if (/\b(TODO|FIXME|XXX)\b/.test(text)) bad(`${file}: contains TODO/FIXME`);
    if (/\beval\s*\(|\bnew\s+Function\b/.test(text)) bad(`${file}: contains eval/new Function`);
  }
});

checkGroup('mount() examples pass an element', () => {
  for (const doc of ['README.md', 'packages/shapy/README.md', 'docs/GETTING_STARTED.md']) {
    if (/\.mount\(['"]/.test(read(doc))) {
      bad(`${doc}: mount() example still uses a selector string`);
    }
  }
});

checkGroup('minimal example imports the package', () => {
  if (!/from\s+['"]shapy['"]|import\s+['"]shapy['"]/.test(read('examples/minimal.html'))) {
    bad('examples/minimal.html does not import shapy');
  }
});

checkGroup('createSeed is exported and documented', () => {
  if (!/export\s*\{\s*createSeed\s*\}/.test(read('packages/shapy/src/index.js'))) {
    bad('packages/shapy/src/index.js does not export createSeed');
  }
  if (!/export function createSeed\(\)/.test(read('packages/shapy/index.d.ts'))) {
    bad('packages/shapy/index.d.ts does not declare createSeed');
  }
  for (const doc of ['README.md', 'packages/shapy/README.md', 'docs/GETTING_STARTED.md']) {
    if (!/createSeed/.test(read(doc))) {
      bad(`${doc}: does not document createSeed`);
    }
  }
});

console.log(checks.join('\n'));

if (problems.length) {
  console.error(`\n${problems.join('\n')}`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} repository checks passed.`);
