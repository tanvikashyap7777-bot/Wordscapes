import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Ensure asset template names required by @capacitor/assets exist
try {
  const assetsDir = path.resolve(__dirname, 'assets');
  const src = path.join(assetsDir, 'wordspaceicon.png');
  if (fs.existsSync(src)) {
    ['logo.png', 'icon.png', 'icon-only.png', 'splash.png', 'splash-dark.png'].forEach((destName) => {
      const dest = path.join(assetsDir, destName);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    });
  }
} catch (e) {}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
