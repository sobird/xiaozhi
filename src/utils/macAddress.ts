import { networkInterfaces } from 'node:os';

export function macAddress() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.mac;
      }
    }
  }
  return '00:00:00:00:00:00';
}
