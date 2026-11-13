import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Prefix '' loads non-VITE_ variables, so the key never reaches the client bundle
  const { FAVORIT_KEY = '' } = loadEnv(mode, process.cwd(), '');

  const proxy = {
    '/api': {
      target: 'https://api.favorit-parts.ru',
      changeOrigin: true,
      // The key is attached here, on the server side
      rewrite: (path) => {
        const { searchParams } = new URL(path, 'http://localhost');
        searchParams.set('key', FAVORIT_KEY);
        return `/hs/hsprice/?${searchParams}`;
      },
    },
  };

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    test: { environment: 'node' },
  };
});
