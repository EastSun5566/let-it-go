import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const bundles = [
  ['ESM', 'dist/index.esm.js'],
  ['CommonJS', 'dist/index.cjs'],
  ['UMD', 'dist/index.umd.js'],
];
const esmLimit = 8 * 1024;

for (const [format, path] of bundles) {
  const gzipBytes = gzipSync(await readFile(path)).byteLength;
  console.log(`${format} gzip: ${(gzipBytes / 1024).toFixed(2)} KB (${gzipBytes} bytes)`);
  if (format === 'ESM' && gzipBytes > esmLimit) {
    throw new Error(`ESM gzip size exceeds the 8 KB limit: ${gzipBytes} bytes.`);
  }
}
