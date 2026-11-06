import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site under /ai-risk-observatory/; override with BASE_PATH for other hosts.
  base: process.env.BASE_PATH ?? '/ai-risk-observatory/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules[\/](three|@react-three|d3-geo|d3-array|topojson-client|world-atlas)[\/]/.test(id)) return 'vendor-3d';
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'vendor-react';
          if (/node_modules[\/]framer-motion[\/]/.test(id)) return 'vendor-motion';
        },
      },
    },
  },
});
