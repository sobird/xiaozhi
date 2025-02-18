import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';

const sox = spawn('sox', [
  '-t', process.platform === 'win32' ? 'waveaudio' : 'coreaudio', '-d', // 捕获默认麦克风音频
  '-t', 'raw', // 指定输入格式为原始音频数据
  '-r', '48000', // 采样率
  '-b', '16', // 位深
  '-c', '2', // 声道数
  '-e', 'signed-integer',
  '-', // 从标准输入读取数据
  'silence', '1', '0.1', '1%',
], { stdio: 'pipe' });

// console.log('sox', sox);

sox.stdout.on('data', (chunk) => {
  console.log('chunk', chunk);
});
sox.stderr.on('data', (chunk) => {
  console.log('sox --------chunk', chunk.toString());
});

setTimeout(() => {
  sox.kill('SIGSTOP');
  sox.stdout.pause();
}, 3000);

setTimeout(() => {
  sox.kill('SIGCONT');
  sox.stdout.resume();
}, 10000);

// 扬声器
const sox2 = spawn('sox', [
  '-t', 'raw', // 指定输入格式为原始音频数据
  '-r', '24000', // 采样率
  '-b', '16', // 位深
  '-c', '2', // 声道数
  '-e', 'signed-integer',
  '-', // 从标准输入读取数据
  '-t', process.platform === 'win32' ? 'waveaudio' : 'coreaudio', '-d', // 输出到默认音频设备
]);

sox2.stderr.on('data', (chunk) => {
  console.log('sox2 chunk', chunk.toString());
});
