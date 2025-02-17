import mqtt from 'mqtt';

function loadScript(url: string, callback: () => void) {
  const script = document.createElement('script');
  script.src = url;

  // 添加加载完成的回调函数
  script.onload = () => {
    console.log('Script loaded:', url);
    if (callback) callback();
  };

  // 添加加载失败的回调函数
  script.onerror = () => {
    console.error('Failed to load script:', url);
  };

  // 将 script 标签插入到文档中
  document.head.appendChild(script);
}

// 使用示例
loadScript('https://unpkg.com/mqtt@5.10.3/dist/mqtt.min.js', () => {
  console.log('Script is ready to use!');
});

const mqttClient = mqtt.connect('ws://localhost:8888');
mqttClient.on('connect', () => {
  console.log('connected to MQTT server');
  mqttClient.subscribe('test/topic');
});

mqttClient.on('message', (topic, message) => {
  console.log('received MQTT server message:', message);
});

mqttClient.on('error', (error) => {
  console.log('error', error);
});
