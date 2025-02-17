import { createServer } from 'net';

import Aedes from 'aedes';

const aedes = new Aedes();
const server = createServer(aedes.handle);

// 启动 MQTT
const PORT = 1883;
server.listen(PORT, () => {
  console.log(`MQTT broker started on port ${PORT}`);
});

// 客户端连接事件
aedes.on('client', (client) => {
  console.log(`Client connected: ${client.id}`);
});

// 客户端断开事件
aedes.on('clientDisconnect', (client) => {
  console.log(`Client disconnected: ${client.id}`);
});

// 订阅事件
aedes.on('subscribe', (subscriptions, client) => {
  console.log(`Client ${client.id} subscribed to:`, subscriptions);
});

// 发布事件
aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(`Client ${client.id} published message to ${packet.topic}: ${packet.payload.toString()}`);
  }
});
