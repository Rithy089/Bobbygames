import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_SITE_URL': JSON.stringify(
      process.env.VITE_SITE_URL ||
        loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
          : 'https://bobbygames.sayrithy089.chatgpt.site'),
    ),
  },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  server: { host: '127.0.0.1' },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@supabase') || id.includes('@tanstack'))
            return 'backend';
          if (
            /node_modules\/(react|react-dom|react-router)/.test(
              id.replaceAll('\\', '/'),
            )
          )
            return 'react';
        },
      },
    },
  },
}));
