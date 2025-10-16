import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal) {
        if (
          i.address.startsWith('10.') ||
          i.address.startsWith('192.168.') ||
          (i.address.startsWith('172.') && (() => { const n = Number(i.address.split('.')[1]); return n >= 16 && n <= 31; })())
        ) return i.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = process.env.LOCAL_IP || getLocalIp();
const BACKEND_PORT = process.env.BACKEND_PORT || '5000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      host: localIP, 
      // protocol: 'ws',
      // clientPort: 3000 
    },
    proxy: {
      '/api': {
        target: `http://${localIP}:${BACKEND_PORT}`,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: `http://${localIP}:${BACKEND_PORT}`,
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
