import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Use node:process to avoid type errors in some environments
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // We remove the define for API_KEY here because the frontend no longer needs it directly.
    // The backend handles the key.
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});