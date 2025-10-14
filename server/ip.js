// server/ip.js
import os from 'os';

export function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const iface of list || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Accept only private ranges
        if (
          iface.address.startsWith('10.') ||
          iface.address.startsWith('192.168.') ||
          (iface.address.startsWith('172.') &&
            (() => { const n = Number(iface.address.split('.')[1]); return n >= 16 && n <= 31; })())
        ) {
          return iface.address;
        }
      }
    }
  }
  return '127.0.0.1';
}
