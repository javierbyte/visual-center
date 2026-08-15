import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from javier.xyz/visual-center via a vercel rewrite to
// javierbyte.github.io/visual-center.
export default defineConfig({
  base: '/visual-center/',
  plugins: [react()],
  build: { outDir: 'dist' }
});
