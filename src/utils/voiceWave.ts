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
  console.log('1212', 1212);
  console.log(generateRandomWave());
}

// 设置定时器，每隔100毫秒更新一次波纹
let timer: NodeJS.Timeout;

export const start = () => {
  clearScreen();
  timer = setInterval(animateWave, 100);

  console.log('start');
};

export const stop = () => {
  clearScreen();
  clearInterval(timer);
  console.log('stop');
};

export default { start, stop };

// start();

// setTimeout(() => {
//   stop();
// }, 5000);
