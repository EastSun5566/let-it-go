import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'let-it-go-package-'));
const compiler = join(projectRoot, 'node_modules/typescript/bin/tsc');

try {
  const result = JSON.parse(execFileSync('npm', [
    'pack', '--ignore-scripts', '--json', '--pack-destination', temporaryRoot,
  ], { cwd: projectRoot, encoding: 'utf8' }));
  const [pack] = Array.isArray(result) ? result : Object.values(result);
  const files = pack.files.map(({ path }) => path);
  for (const entry of ['dist/index.d.ts', 'dist/index.d.cts', 'dist/index.esm.js', 'dist/index.cjs', 'dist/index.umd.js']) {
    assert(files.includes(entry), `Missing package entry: ${entry}`);
  }
  assert(!files.some((path) => /(^|\/)tests\//.test(path)), 'Tests must not be published.');

  const installedPackage = join(temporaryRoot, 'node_modules/let-it-go');
  mkdirSync(installedPackage, { recursive: true });
  execFileSync('tar', ['-xzf', join(temporaryRoot, pack.filename), '--strip-components=1', '-C', installedPackage]);

  const namedImport = `import { LetItGo, type Options, type Range } from 'let-it-go';
const range: Range = [0, 1];
const options: Options = { radiusRange: range };
new LetItGo(options).clear();
`;
  const requireImport = `import library = require('let-it-go');
const options: library.Options = { number: 0 };
new library.LetItGo(options).clear();
`;
  for (const resolution of ['Node16', 'NodeNext']) {
    for (const [name, source] of [['named.cts', namedImport], ['require.cts', requireImport], ['named.mts', namedImport]]) {
      const consumer = join(temporaryRoot, name);
      writeFileSync(consumer, source);
      execFileSync(process.execPath, [compiler, '--noEmit', '--strict', '--target', 'ES2022',
        '--module', resolution, '--moduleResolution', resolution, consumer], { stdio: 'inherit' });
    }
  }

  execFileSync(process.execPath, ['--input-type=module', '-e',
    "import { LetItGo } from 'let-it-go'; if (typeof LetItGo !== 'function') throw Error('Missing ESM export');"],
  { cwd: temporaryRoot, stdio: 'inherit' });
  execFileSync(process.execPath, ['-e',
    "if (typeof require('let-it-go').LetItGo !== 'function') throw Error('Missing CJS export');"],
  { cwd: temporaryRoot, stdio: 'inherit' });
  console.log('Packed ESM/CJS runtime and Node16/NodeNext declaration checks passed.');
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
