// @ts-check
import { defineConfig } from 'astro/config';

// Static output only. Stylesheets are never inlined so the CSP can stay style-src 'self'.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  // three.js gets its own lazy chunk so tools/check-budgets.mjs can count it as 3D, not page JS.
  vite: {
    build: {
      chunkSizeWarningLimit: 700, // three.js is ~600 KB raw, ~150 KB compressed, and lazy
      rollupOptions: {
        output: { manualChunks: (id) => (id.includes('/node_modules/three/') ? 'three' : undefined) },
      },
    },
  },
});
