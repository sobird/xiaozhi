/**
 * Run your XiaoZhi AI on the terminal
 *
 * sobird<i@sobird.me> at 2025/02/17 8:35:26 created.
 */
import readline from 'readline';

import ora from 'ora';

import { randomWave } from '@/utils/randomWave';

import MqttService from './services/MqttService';

const mqttService = new MqttService();
mqttService.start();

const spinner = ora({
  discardStdin: false,
  // text: 'Loading...',
  spinner: {
    frames: [
      randomWave(),
      randomWave(),
      randomWave(),
      randomWave(),
    ],
    interval: 120, // 每帧的间隔时间（单位：ms）
  },
});

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

  if (space) {
    mqttService.startListening();
    spinner.start();
    // keypress
  } else {
    spinner.stop();
    mqttService.stopListening();
  }

  // 按下 Ctrl+C 退出
  if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});

console.log('按空格键开始聊天...');

process.on('SIGINT', () => {
  // console.log('\nReceived SIGINT. Exiting...');
  // spinner.stop(); // 停止 ora 动画
  process.exit(); // 退出进程
});
