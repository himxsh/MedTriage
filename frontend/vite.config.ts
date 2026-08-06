import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Proxy target: where uvicorn listens. Browser talks same-origin to Vite.
  const apiTarget = env.MEDTRIAGE_PROXY_TARGET || 'http://127.0.0.1:8001';

  return {
    plugins: [react(), tailwindcss()],
    // GEMINI_API_KEY must stay backend-only — never define into the client bundle
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      // Same-origin /api + /ws so httpOnly session cookie is not cross-site dropped
      proxy: {
        '/api': {target: apiTarget, changeOrigin: true},
        '/ws': {target: apiTarget, ws: true, changeOrigin: true},
      },
    },
  };
});
