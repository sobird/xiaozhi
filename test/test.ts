import readline from 'readline';

import mqtt from 'mqtt';
import ora from 'ora';
import stdinDiscarder from 'stdin-discarder';

const waveChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

// 生成随机波纹
function generateRandomWave() {
  let wave = '';
  for (let i = 0; i < process.stdout.columns - 1; i++) {
    wave += waveChars[Math.floor(Math.random() * waveChars.length)];
  }
  return wave;
}

// console.log(generateRandomWave());

// const frames = generateRandomWave(10); // 生成 10 个帧
const spinner = ora({
  isEnabled: true,
  discardStdin: false,
  // text: 'Loading...',
  spinner: {
    frames: [
      generateRandomWave(),
      generateRandomWave(),
      generateRandomWave(),
    ],
    interval: 120, // 每帧的间隔时间（单位：ms）
  },
});

setTimeout(() => {
  spinner.stopAndPersist();
  console.log('11111', 11111);
}, 5000);

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

let space = false;
// 监听按键事件
process.stdin.on('keypress', (str, key) => {
  if (key.name === 'space') {
    space = !space;
  }
  console.log('space', space);
  if (space) {
    // mqttService.startListening();
    spinner.start();
    // keypress
  } else {
    process.stdin.addListener('keypress', () => {
      console.log('1222', 1222);
    });
    // spinner.succeed();
    // process.stdin.on('keypress', (str, key) => {
    //   console.log('key', key);
    // });
    // mqttService.stopListening();
  }

  // 按下 Ctrl+C 退出
  if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});

setTimeout(() => {
  console.log('222222', 222222);
  spinner.start();
}, 10000);
const mqttOption = {
  endpoint: 'post-cn-apg3xckag01.mqtt.aliyuncs.com',
  client_id: 'GID_test@@@18_65_90_d3_0a_e9',
  username: 'Signature|LTAI5tF8J3CrdWmRiuTjxHbF|post-cn-apg3xckag01',
  password: 'zHfxex/VmPLz0Gq214y8Op9+4cg=',
  publish_topic: 'device-server',
  subscribe_topic: 'devices/18_65_90_d3_0a_e9',
};
const mqttClient = mqtt.connect(`mqtts://${mqttOption?.endpoint}:8883`, {
  clientId: mqttOption.client_id,
  username: mqttOption.username,
  password: mqttOption.password,
});

process.on('SIGINT', () => {
  // console.log('\nReceived SIGINT. Exiting...');
  spinner.stop(); // 停止 ora 动画
  process.exit(); // 退出进程
});
