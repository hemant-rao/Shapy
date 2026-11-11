import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTemplate } from '../packages/shapy-bg/scripts/build-template.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const checks = [];

const docs = [
  'README.md',
  'packages/shapy-bg/README.md',
  'packages/shapy-render/README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'docs/GETTING_STARTED.md',
  'docs/UNIQUENESS.md',
  'docs/AI_CONTEXT.md',
  'docs/SEED_STABILITY.md',
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

function collectTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectTargets(entry, targets));
  }
  return targets;
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

const pkgRel = 'packages/shapy-bg/package.json';
const pkg = JSON.parse(read(pkgRel));
const pkgDir = dirname(join(root, pkgRel));

checkGroup(`${pkgRel}: files, exports, and ./stickers export are valid`, () => {
  for (const entry of pkg.files || []) {
    if (!existsSync(join(pkgDir, entry))) {
      bad(`${pkgRel}: files entry missing: ${entry}`);
    }
  }

  const targets = [
    ...collectTargets(pkg.exports),
    ...collectTargets(pkg.types),
    ...collectTargets(pkg.main),
    ...collectTargets(pkg.module),
  ];

  for (const target of targets) {
    if (target.startsWith('./') && !existsSync(join(pkgDir, target))) {
      bad(`${pkgRel}: export target missing: ${target}`);
    }
  }

  if (!pkg.exports['./stickers']) bad(`${pkgRel}: missing ./stickers export`);
});

checkGroup(`${pkgRel}: author, funding, version, and license metadata are complete`, () => {
  const author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name;

  if (author !== 'Hemant Rao') bad(`${pkgRel}: author must be Hemant Rao`);
  if (pkg.funding?.url !== 'https://github.com/sponsors/hemant-rao') {
    bad(`${pkgRel}: funding must point to GitHub Sponsors`);
  }
  if (pkg.license !== 'MIT') bad(`${pkgRel}: license must be MIT`);
  if (pkg.version !== '1.0.0') {
    bad(`${pkgRel}: version must remain 1.0.0 until the owner publishes`);
  }
  if (!pkg.exports?.['./package.json']) {
    bad(`${pkgRel}: missing ./package.json export`);
  }
  if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    bad(`${pkgRel}: core package must stay zero-dependency`);
  }

  const lock = JSON.parse(read('package-lock.json'));
  if (lock.packages?.['packages/shapy-bg']?.version !== pkg.version) {
    bad('package-lock.json: packages/shapy-bg version does not match package.json');
  }
});

const renderPkgRel = 'packages/shapy-render/package.json';
const renderPkg = JSON.parse(read(renderPkgRel));
const renderPkgDir = dirname(join(root, renderPkgRel));

checkGroup(`${renderPkgRel}: metadata, exports, files, and dependencies are valid`, () => {
  const author = typeof renderPkg.author === 'string' ? renderPkg.author : renderPkg.author?.name;

  if (renderPkg.name !== 'shapy-render') bad(`${renderPkgRel}: name must be shapy-render`);
  if (renderPkg.version !== '1.0.0') {
    bad(`${renderPkgRel}: version must remain 1.0.0 until the owner publishes`);
  }
  if (author !== 'Hemant Rao') bad(`${renderPkgRel}: author must be Hemant Rao`);
  if (renderPkg.license !== 'MIT') bad(`${renderPkgRel}: license must be MIT`);
  if (renderPkg.funding?.url !== 'https://github.com/sponsors/hemant-rao') {
    bad(`${renderPkgRel}: funding must point to GitHub Sponsors`);
  }
  if (renderPkg.repository?.directory !== 'packages/shapy-render') {
    bad(`${renderPkgRel}: repository.directory must be packages/shapy-render`);
  }
  if (!renderPkg.bin?.['shapy-render']) bad(`${renderPkgRel}: missing shapy-render bin`);
  if (!renderPkg.dependencies?.playwright) bad(`${renderPkgRel}: playwright dependency is required`);
  if (!renderPkg.peerDependencies?.['shapy-bg']) {
    bad(`${renderPkgRel}: shapy-bg peer dependency is required`);
  }
  if (!renderPkg.exports?.['./package.json']) bad(`${renderPkgRel}: missing ./package.json export`);

  for (const entry of renderPkg.files || []) {
    if (!existsSync(join(renderPkgDir, entry))) {
      bad(`${renderPkgRel}: files entry missing: ${entry}`);
    }
  }

  const targets = [
    ...collectTargets(renderPkg.exports),
    ...collectTargets(renderPkg.types),
    ...collectTargets(renderPkg.main),
    ...collectTargets(renderPkg.bin),
  ];

  for (const target of targets) {
    if (target.startsWith('./') && !existsSync(join(renderPkgDir, target))) {
      bad(`${renderPkgRel}: export target missing: ${target}`);
    }
  }

  const lock = JSON.parse(read('package-lock.json'));
  if (lock.packages?.['packages/shapy-render']?.version !== renderPkg.version) {
    bad('package-lock.json: packages/shapy-render version does not match package.json');
  }
});

checkGroup('shapy-render reports the core engine version', () => {
  if (!/engineVersion:\s*applied\.engineVersion/.test(read('packages/shapy-render/src/index.js'))) {
    bad('packages/shapy-render/src/index.js does not return engineVersion');
  }
  if (!/engineVersion:\s*number/.test(read('packages/shapy-render/index.d.ts'))) {
    bad('packages/shapy-render/index.d.ts does not declare engineVersion');
  }
  if (!/engineVersion/.test(read('packages/shapy-render/README.md'))) {
    bad('packages/shapy-render/README.md does not document engineVersion');
  }
});

checkGroup('author, sponsor, and funding attribution is consistent', () => {
  const docsWithAttribution = [
    'README.md',
    'packages/shapy-bg/README.md',
    'packages/shapy-render/README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'CODE_OF_CONDUCT.md',
    'docs/GETTING_STARTED.md',
    'docs/UNIQUENESS.md',
    'docs/AI_CONTEXT.md',
  ];

  for (const doc of docsWithAttribution) {
    const text = read(doc);

    if (!/Hemant Rao/.test(text)) bad(`${doc}: missing author attribution`);
    if (!/Odio Book/.test(text)) bad(`${doc}: missing sponsor attribution`);
  }

  for (const readme of [
    'README.md',
    'packages/shapy-bg/README.md',
    'packages/shapy-render/README.md',
  ]) {
    if (!/https:\/\/github\.com\/sponsors\/hemant-rao/.test(read(readme))) {
      bad(`${readme}: missing GitHub Sponsors link`);
    }
  }

  for (const license of ['LICENSE', 'packages/shapy-bg/LICENSE', 'packages/shapy-render/LICENSE']) {
    if (!/Copyright \(c\) 2026 Hemant Rao/.test(read(license))) {
      bad(`${license}: copyright holder must be Hemant Rao`);
    }
  }

  if (!/github: \[hemant-rao\]/.test(read('.github/FUNDING.yml'))) {
    bad('.github/FUNDING.yml: missing GitHub Sponsors entry');
  }
});

const rendererSource = read('packages/shapy-bg/src/shapy-index.html');

checkGroup('examples/standalone.html matches the renderer source', () => {
  if (read('examples/standalone.html') !== rendererSource) {
    bad('examples/standalone.html is stale; run npm run build:template');
  }
});

checkGroup('packages/shapy-bg/src/shapy-template.js is current', () => {
  const template = read('packages/shapy-bg/src/shapy-template.js');

  if (template !== renderTemplate(rendererSource)) {
    bad('packages/shapy-bg/src/shapy-template.js is stale; run npm run build:template');
  }
});

const requiredFiles = [
  'README.md',
  'LICENSE',
  'AGENTS.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'docs/GETTING_STARTED.md',
  'docs/UNIQUENESS.md',
  'docs/AI_CONTEXT.md',
  'docs/SEED_STABILITY.md',
  '.github/FUNDING.yml',
  '.github/CODEOWNERS',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/workflows/ci.yml',
  'package.json',
  'package-lock.json',
  'tests/package.test.mjs',
  'tests/render.test.mjs',
  'tests/render.e2e.test.mjs',
  'examples/minimal.html',
  'examples/standalone.html',
  'apps/demo/package.json',
  'packages/shapy-bg/package.json',
  'packages/shapy-bg/src/seed.js',
  'packages/shapy-bg/src/stickers.js',
  'packages/shapy-bg/stickers.d.ts',
  'packages/shapy-render/package.json',
  'packages/shapy-render/src/index.js',
  'packages/shapy-render/src/ffmpeg.js',
  'packages/shapy-render/src/options.js',
  'packages/shapy-render/bin/shapy-render.js',
  'packages/shapy-render/index.d.ts',
  'packages/shapy-render/README.md',
  'packages/shapy-render/LICENSE',
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
  'packages/shapy-bg/README.md',
  'packages/shapy-render/README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'docs/GETTING_STARTED.md',
  'docs/UNIQUENESS.md',
  'docs/AI_CONTEXT.md',
  'docs/SEED_STABILITY.md',
];

checkGroup('current docs contain no stale layout or duplication instructions', () => {
  for (const doc of currentDocs) {
    const text = read(doc);

    if (
      /vue-demo\/|docs\/CHANGELOG|`shapy-bg\/src\/|`shapy-bg\/package\.json|`shapy-bg\/scripts\//.test(
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
    'packages/shapy-bg/src/index.js',
    'packages/shapy-bg/src/shapy-bg.js',
    'packages/shapy-bg/src/catalog.js',
    'packages/shapy-bg/src/stickers.js',
    'packages/shapy-render/src/index.js',
    'packages/shapy-render/src/ffmpeg.js',
    'packages/shapy-render/src/options.js',
    'packages/shapy-render/bin/shapy-render.js',
  ]) {
    const text = read(file);
    if (/\b(TODO|FIXME|XXX)\b/.test(text)) bad(`${file}: contains TODO/FIXME`);
    if (/\beval\s*\(|\bnew\s+Function\b/.test(text)) bad(`${file}: contains eval/new Function`);
  }
});

checkGroup('mount() examples pass an element', () => {
  for (const doc of ['README.md', 'packages/shapy-bg/README.md', 'docs/GETTING_STARTED.md']) {
    if (/\.mount\(['"]/.test(read(doc))) {
      bad(`${doc}: mount() example still uses a selector string`);
    }
  }
});

checkGroup('minimal example imports the package', () => {
  if (!/from\s+['"]shapy-bg['"]|import\s+['"]shapy-bg['"]/.test(read('examples/minimal.html'))) {
    bad('examples/minimal.html does not import shapy-bg');
  }
});

checkGroup('createSeed is exported and documented', () => {
  if (!/export\s*\{\s*createSeed\s*\}/.test(read('packages/shapy-bg/src/index.js'))) {
    bad('packages/shapy-bg/src/index.js does not export createSeed');
  }
  if (!/export function createSeed\(\)/.test(read('packages/shapy-bg/index.d.ts'))) {
    bad('packages/shapy-bg/index.d.ts does not declare createSeed');
  }
  for (const doc of ['README.md', 'packages/shapy-bg/README.md', 'docs/GETTING_STARTED.md']) {
    if (!/createSeed/.test(read(doc))) {
      bad(`${doc}: does not document createSeed`);
    }
  }
});

checkGroup('engine version and seek API are exported and documented', () => {
  if (!/export const SHAPY_ENGINE_VERSION\s*=\s*1/.test(read('packages/shapy-bg/src/index.js'))) {
    bad('packages/shapy-bg/src/index.js does not export SHAPY_ENGINE_VERSION = 1');
  }
  if (!/SHAPY_ENGINE_VERSION/.test(read('packages/shapy-bg/index.d.ts'))) {
    bad('packages/shapy-bg/index.d.ts does not declare SHAPY_ENGINE_VERSION');
  }
  for (const doc of ['README.md', 'packages/shapy-bg/README.md', 'docs/SEED_STABILITY.md']) {
    if (!/SHAPY_ENGINE_VERSION/.test(read(doc))) {
      bad(`${doc}: does not document SHAPY_ENGINE_VERSION`);
    }
  }
  if (!/seek\s*\(/.test(read('packages/shapy-bg/src/shapy-bg.js'))) {
    bad('packages/shapy-bg/src/shapy-bg.js does not expose seek()');
  }
});

console.log(checks.join('\n'));

if (problems.length) {
  console.error(`\n${problems.join('\n')}`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} repository checks passed.`);
