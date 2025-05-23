import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },  // Configure server with proxy
  server: {
    proxy: {
      '/api': {
        target: 'https://463b-42-104-216-32.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ['463b-42-104-216-32.ngrok-free.app'],
  },
  // Ensure Vite properly handles the PDF.js worker
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
        },
      },
    },
  },
});