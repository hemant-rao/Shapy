import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createSeed } from '../packages/shapy/src/seed.js';
import {
  ALL_CORE_SHAPE_KEYS,
  CORE_SHAPE_KEYS,
  EMOJI_GROUP,
  SHAPE_GROUPS,
  getShapeLabel
} from '../packages/shapy/src/catalog.js';
import {
  STICKER_CATALOG,
  STICKER_REGISTRY,
  getRegistryData,
  registerStickers
} from '../packages/shapy/src/stickers.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');
const packageJson = JSON.parse(read('packages/shapy/package.json'));

test('createSeed returns unique 32-character hex seeds', () => {
  const seeds = new Set(Array.from({ length: 64 }, () => createSeed()));

  assert.equal(seeds.size, 64);
  for (const seed of seeds) assert.match(seed, /^[0-9a-f]{32}$/);
});

test('catalog counts and keys match the documented shape pool', () => {
  assert.deepEqual(
    SHAPE_GROUPS.map((group) => group.id),
    ['geometry', 'lines', 'organic']
  );
  assert.equal(CORE_SHAPE_KEYS.length, 40);
  assert.equal(EMOJI_GROUP.shapes.length, 29);
  assert.equal(ALL_CORE_SHAPE_KEYS.length, 69);

  const keys = [...CORE_SHAPE_KEYS, ...EMOJI_GROUP.shapes.map((shape) => shape.key)];

  assert.equal(new Set(keys).size, keys.length);
  for (const key of keys) assert.equal(typeof getShapeLabel(key), 'string');
  assert.equal(getShapeLabel('missing-key'), 'missing-key');
});

test('sticker registry is serializable and per-instance', () => {
  assert.equal(STICKER_CATALOG.length, 10);
  assert.equal(STICKER_REGISTRY.stickers.items.length, 10);
  assert.equal(new Set(STICKER_CATALOG.map((sticker) => sticker.key)).size, 10);

  for (const sticker of STICKER_CATALOG) {
    assert.ok(sticker.key);
    assert.ok(sticker.label);
    assert.ok(sticker.emoji || sticker.image || sticker.icon);
  }

  const parsed = JSON.parse(getRegistryData());
  assert.deepEqual(parsed, STICKER_REGISTRY);

  const element = {
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  const returned = registerStickers(element);

  assert.equal(returned, STICKER_REGISTRY);
  assert.equal(element.attributes['registry-data'], getRegistryData());
  assert.equal(globalThis.ShapyRegistry, undefined);
});

test('package metadata identifies the author, sponsor, and funding', () => {
  assert.equal(packageJson.name, 'shapy');
  assert.equal(packageJson.version, '1.0.0');
  assert.equal(packageJson.author.name, 'Hemant Rao');
  assert.equal(packageJson.author.url, 'https://github.com/hemant-rao');
  assert.equal(packageJson.funding.type, 'github');
  assert.equal(packageJson.funding.url, 'https://github.com/sponsors/hemant-rao');
  assert.equal(packageJson.license, 'MIT');
  assert.equal(packageJson.repository.url, 'git+https://github.com/hemant-rao/Shapy.git');
  assert.equal(packageJson.repository.directory, 'packages/shapy');
  assert.equal(packageJson.publishConfig.access, 'public');
  assert.ok(packageJson.exports['./package.json']);
});

test('package exports and files resolve inside the package', () => {
  const targets = [];
  const walk = (value) => {
    if (typeof value === 'string') targets.push(value);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };

  walk(packageJson.exports);

  for (const target of targets) {
    if (target.startsWith('./')) {
      assert.ok(existsSync(join(root, 'packages/shapy', target)), target);
    }
  }

  for (const file of packageJson.files) {
    assert.ok(existsSync(join(root, 'packages/shapy', file)), file);
  }
});

test('lockfile, changelog, and package version agree', () => {
  const lockfile = JSON.parse(read('package-lock.json'));

  assert.equal(lockfile.packages['packages/shapy'].version, packageJson.version);
  assert.match(read('CHANGELOG.md'), new RegExp(`## \\[${packageJson.version}\\]`));
});

test('documentation keeps one author and sponsor identity', () => {
  const docs = [
    'README.md',
    'packages/shapy/README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'CODE_OF_CONDUCT.md',
    'docs/AI_CONTEXT.md'
  ];

  for (const doc of docs) {
    const text = read(doc);

    assert.match(text, /Hemant Rao/, `${doc}: author`);
    assert.match(text, /Odio Book/, `${doc}: sponsor`);
    assert.match(text, /https:\/\/odiobook\.com/, `${doc}: sponsor link`);
    assert.match(
      text,
      /https:\/\/github\.com\/sponsors\/hemant-rao/,
      `${doc}: funding link`
    );
  }

  for (const license of ['LICENSE', 'packages/shapy/LICENSE']) {
    assert.match(read(license), /Copyright \(c\) 2026 Hemant Rao/, license);
  }

  assert.match(read('.github/FUNDING.yml'), /github: \[hemant-rao\]/);
});

test('community health files exist', () => {
  const files = [
    '.github/FUNDING.yml',
    '.github/CODEOWNERS',
    '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml',
    '.github/ISSUE_TEMPLATE/config.yml',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'CODE_OF_CONDUCT.md'
  ];

  for (const file of files) assert.ok(existsSync(join(root, file)), file);
});
