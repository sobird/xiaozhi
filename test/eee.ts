import readline from 'readline';

// 设置终端界面
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// 定义波纹字符
const waveChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

// 生成随机波纹
function generateRandomWave() {
  let wave = '';
  for (let i = 0; i < process.stdout.columns; i++) {
    wave += waveChars[Math.floor(Math.random() * waveChars.length)];
  }
  return wave;
}

// 清屏函数
function clearScreen() {
  process.stdout.write('\x1Bc');
}

// 主循环
function animateWave() {
  clearScreen();
  console.log(generateRandomWave());
}

// 设置定时器，每隔100毫秒更新一次波纹
const timer = setInterval(animateWave, 100);

// 监听退出键
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    // process.exit();
    clearScreen();
    clearInterval(timer);
  }
});
