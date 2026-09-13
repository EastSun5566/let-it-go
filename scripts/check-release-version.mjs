import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const [packageJson, jsrJson] = await Promise.all([
  readJson(new URL('../package.json', import.meta.url)),
  readJson(new URL('../jsr.json', import.meta.url)),
]);

if (packageJson.version !== jsrJson.version) {
  throw new Error(
    `Version mismatch: package.json is ${packageJson.version}, jsr.json is ${jsrJson.version}.`,
  );
}

const [tag] = process.argv.slice(2);
const expectedTag = `v${packageJson.version}`;

if (tag && tag !== expectedTag) {
  throw new Error(`Tag mismatch: expected ${expectedTag}, received ${tag}.`);
}

console.log(`Release version verified: ${packageJson.version}`);
