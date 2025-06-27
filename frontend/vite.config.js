import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // REST calls
            '/api': {
                target: 'http://localhost',
                changeOrigin: true,
            },
            // WebSocket upgrade
            '/ws': {
                target: 'ws://localhost',
                changeOrigin: true,
                ws: true,
            }
        }
    }
});
