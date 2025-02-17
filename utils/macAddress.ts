import { networkInterfaces } from 'node:os';

export function macAddress() {
  const networkInterfaceInfo = networkInterfaces();
  for (const name of Object.keys(networkInterfaceInfo)) {
    const interfaces = networkInterfaceInfo[name] || [];
    for (const item of interfaces) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.mac;
      }
    }
  }
  return '00:00:00:00:00:00';
}
