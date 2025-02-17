import mqtt from 'mqtt';
import { WebSocketServer } from 'ws';

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: 8080 });

// 连接到远程 MQTT 服务
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'ws-mqtt-proxy',
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // 将 WebSocket 消息转发到 MQTT
  ws.on('message', (message) => {
    console.log('Received WebSocket message:', message.toString());
    // mqttClient.publish('test/topic', message);
  });

  // 将 MQTT 消息转发到 WebSocket
  mqttClient.on('message', (topic, message) => {
    console.log('Received MQTT message:', message.toString());
    ws.send(message.toString());
  });

  // 订阅 MQTT 主题
  mqttClient.subscribe('test/topic', (err) => {
    if (!err) {
      console.log('Subscribed to test/topic');
    }
  });

  // WebSocket 断开连接
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

console.log('WebSocket server started on port 8080');
