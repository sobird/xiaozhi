import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';

import OpusScript from 'opusscript';

import { aesCtrEncrypt, aesCtrDecrypt } from '@/utils/crypto';
import voiceWave from '@/utils/voiceWave';

import DgramService from './DgramService';
import { MqttMessage } from './MqttService';

const AUDIO_PARAMS: MqttMessage['audio_params'] = {
  sample_rate: 48000,
  channels: 2,
  frame_duration: 40,
};

// 单例
export class AudioService {
  options!: MqttMessage;

  mic?: ChildProcessWithoutNullStreams;

  speaker?: ChildProcessWithoutNullStreams;

  sequence = 0;

  start(options: MqttMessage) {
    this.options = options;
    this.createMicrophone();
    this.createSpeaker();

    this.sequence = 0;
  }

  // 用户暂停说话
  pauseSendAudio() {
    this.mic?.kill('SIGSTOP');
    this.mic?.stdout.pause();
    // voiceWave.stop();
  }

  resumeSendAudio() {
    this.mic?.kill('SIGCONT');
    // voiceWave.start();
    this.mic?.stdout.resume();
  }

  // 启动麦克风
  createMicrophone() {
    if (this.mic) {
      return;
    }

    const { sample_rate: sampleRate, channels, frame_duration: frameDuration } = AUDIO_PARAMS;
    const frameSize = (sampleRate * frameDuration) / 1000;
    // 写死
    const opusScript = new OpusScript(sampleRate, channels, OpusScript.Application.AUDIO);

    // const mic = Record.record({
    //   sampleRate,
    //   channels,
    // });

    const sox = spawn('sox', [
      '-t', process.platform === 'win32' ? 'waveaudio' : 'coreaudio', '-d', // 捕获默认麦克风音频
      '-t', 'raw', // 指定输入格式为原始音频数据
      '-r', `${sampleRate}`, // 采样率
      '-b', '16', // 位深
      '-c', `${channels}`, // 声道数
      '-e', 'signed-integer',
      '-', // 从标准输入读取数据
    ], { stdio: 'pipe' });

    const mic = sox.stdout;

    // sox.stderr.on('data', (chunk) => {
    //   console.log(chunk.toString());
    // });

    // voiceWave.start();
    // spinner.start();

    // mic.on('readable', () => {
    //   console.log('有数据可读');
    //   const chunk = mic.read();
    //   while (chunk !== null) {
    //     console.log(`读取到 ${chunk.length} 字节的数据`);
    //   }
    // });

    mic.on('data', (data: Buffer) => {
      const {
        key, nonce, port, server,
      } = this.options.udp;

      const encodedPacket = opusScript.encode(data, frameSize);
      const encodedDataLengthHex = encodedPacket.length.toString(16).padStart(4, '0');
      this.sequence += 1;
      const sequenceHex = this.sequence.toString(16).padStart(8, '0');

      const newNonce = nonce.slice(0, 4)
      + encodedDataLengthHex + nonce.slice(8, 24) + sequenceHex;
      const encryptedData = aesCtrEncrypt(key, newNonce, encodedPacket);
      const packet = Buffer.concat([Buffer.from(newNonce, 'hex'), encryptedData]);

      // console.log('packet', packet);
      DgramService.send(packet, port, server, (err) => {
        if (err) console.error('Error sending audio:', err);
      });
    });

    mic.on('error', (err) => {
      console.error(`send audio error: ${err}`);
    });

    this.mic = sox;
  }

  // 启动扬声器
  createSpeaker() {
    if (this.speaker) {
      return;
    }

    // const { sample_rate: sampleRate, frame_duration: frameDuration } = AUDIO_PARAMS;
    // const frameNum = Math.floor(frameDuration / (1000 / sampleRate));

    const sampleRate = 48000;
    const channels = 1;

    const sox = spawn('sox', [
      '-t', 'raw', // 指定输入格式为原始音频数据
      '-r', `${sampleRate}`, // 采样率
      '-b', '16', // 位深
      '-c', `${channels}`, // 声道数
      '-e', 'signed-integer',
      '-', // 从标准输入读取数据
      '-t', process.platform === 'win32' ? 'waveaudio' : 'coreaudio', '-d', // 输出到默认音频设备
    ]);
    // sox.stderr.on('data', (data) => {
    //   console.error(data.toString());
    // });

    // 写死
    const opusScript = new OpusScript(sampleRate, channels, OpusScript.Application.AUDIO);

    DgramService.on('message', (data) => {
      const { key } = this.options.udp;
      // console.log('speaker data', data);

      const splitNonce = data.subarray(0, 16);
      const encryptedData = data.subarray(16);
      const decryptedData = aesCtrDecrypt(key, splitNonce.toString('hex'), encryptedData);
      const decodedData = opusScript.decode(decryptedData);

      sox.stdin.write(decodedData);
    });

    this.speaker = sox;
  }
}

export default new AudioService();
