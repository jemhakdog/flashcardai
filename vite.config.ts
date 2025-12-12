import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures code using process.env.API_KEY doesn't crash in the browser
      // It replaces it with the value set in your environment (e.g. Vercel Dashboard)
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});