import { defineConfig } from 'vite';

const isolationHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export default defineConfig({
  server: {
    port: 4174,
    strictPort: true,
    headers: isolationHeaders,
  },
  preview: {
    port: 4174,
    strictPort: true,
    headers: isolationHeaders,
  },
  build: {
    target: 'es2022',
  },
});
