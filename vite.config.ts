import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config/site';
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'store-brand',
      transformIndexHtml: (html) => html.replaceAll('SpinPoint', siteConfig.name),
    },
  ],
  base: process.env.VITE_BASE_PATH || './',
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion/react'],
          validation: ['zod'],
        },
      },
    },
  },
});
