import mqtt from 'mqtt';

// 测试客户端
const client = mqtt.connect('mqtt://localhost:1883');

const topicObject = 'test/topic';

client.on('connect', () => {
  console.log('Mqtt Client connected to broker');

  // 订阅主题
  client.subscribe(topicObject, (err) => {
    if (!err) {
      console.log(`Mqtt client subscribed to ${topicObject}`);

      // 发布消息
      client.publish(topicObject, 'Hello from test client');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Test client received message on ${topic}: ${message.toString()}`);
});
