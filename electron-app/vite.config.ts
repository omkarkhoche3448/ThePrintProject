import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    electron({
      entry: [
        'electron/main.ts',
        'electron/preload.ts'
      ],
      vite: {
        build: {
          outDir: 'dist-electron',
          rollupOptions: {
            external: ['electron']
          }
        }
      },
      onstart: options => {
        options.startup()
      }
    }),
    electronRenderer()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.ELECTRON=="true" ? './' : '/',
}));
