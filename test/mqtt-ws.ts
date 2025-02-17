import http from 'node:http';

import Aedes from 'aedes';
import { WebSocketServer, createWebSocketStream } from 'ws';

const aedes = new Aedes();

const port = 8888;
// 创建 HTTP 服务器
const server = http.createServer();

// ws.createServer({ server }, aedes.handle);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // 将 WebSocket 连接包装为流
  const stream = createWebSocketStream(ws);

  // 将流传递给 aedes 处理
  aedes.handle(stream, req);
});

server.listen(port, () => {
  console.log('websocket server listening on port ', port);
});

const topicObject = 'test/topic';
// 每隔一秒向客户端发送一条消息
setInterval(() => {
  aedes.publish({
    topic: topicObject,
    payload: Buffer.from('message from server'),
    qos: 0,
    retain: false,
    cmd: 'publish',
    dup: true,
  }, (err) => {
    if (err) {
      console.error('Error publishing message to client:', err);
    } else {
      console.log('Message published to client');
    }
  });
}, 1000);

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
