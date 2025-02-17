const waveChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

// 生成随机波纹
export function randomWave() {
  let wave = '';
  for (let i = 0; i < process.stdout.columns - 1; i++) {
    wave += waveChars[Math.floor(Math.random() * waveChars.length)];
  }
  return wave;
}
