/**
 * Run your XiaoZhi AI on the terminal
 *
 * sobird<i@sobird.me> at 2025/02/17 8:35:26 created.
 */

import readline from 'readline';

import MqttService from './services/MqttService';

const mqttService = new MqttService();

mqttService.start();

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
    // keypress
  } else {
    mqttService.stopListening();
  }

  // 按下 Ctrl+C 退出
  if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});

console.log('按下空号键...');
