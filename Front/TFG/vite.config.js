import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      protocol: 'wss',
      host: 'cuestamarket.duckdns.org',
      port: 443,
    },
    watch: {
      usePolling: true,
    },
  },
});
