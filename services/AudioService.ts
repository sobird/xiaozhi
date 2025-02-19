import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';

import OpusScript from 'opusscript';

import { aesCtrEncrypt, aesCtrDecrypt } from '@/utils/crypto';

import DgramService from './DgramService';

interface AudioOptions {
  udp: {
    server: string;
    port: number;
    encryption: string;
    key: string;
    nonce: string;
  }
  // 音频输入
  inputSampleRate: SampleRate;
  inputChannels: number;
  inputFrameDuration: number;
  // 音频输出
  outputSampleRate: SampleRate;
  outputChannels: number;
  outputframeDuration?: number;
}

// 单例
export class AudioService {
  options?: AudioOptions;

  mic?: ChildProcessWithoutNullStreams;

  speaker?: ChildProcessWithoutNullStreams;

  sequence = 0;

  isPaused = false;

  // 建立音频通道
  hello(options: AudioOptions) {
    this.options = options;
    this.createMicrophone();
    this.createSpeaker();

    this.sequence = 0;
  }

  // 启动麦克风
  createMicrophone() {
    if (this.mic) {
      return;
    }
    if (!this.options) {
      return;
    }
    const { inputSampleRate, inputChannels, inputFrameDuration } = this.options;
    const frameSize = (inputSampleRate * inputFrameDuration) / 1000;
    const opusScript = new OpusScript(inputSampleRate, inputChannels, OpusScript.Application.AUDIO);

    const sox = spawn('sox', [
      '-t', process.platform === 'win32' ? 'waveaudio' : 'coreaudio', '-d', // 捕获默认麦克风音频
      '-t', 'raw',
      '-r', `${inputSampleRate}`, // 采样率
      '-b', '16', // 位深
      '-c', `${inputChannels}`, // 声道数
      '-e', 'signed-integer',
      '-', // 从标准输入读取数据
    ]);

    const mic = sox.stdout;

    // sox.stderr.on('data', (chunk) => {
    //   console.log(chunk.toString());
    // });

    // mic.on('readable', () => {
    //   console.log('有数据可读');
    //   const chunk = mic.read();
    //   while (chunk !== null) {
    //     console.log(`读取到 ${chunk.length} 字节的数据`);
    //   }
    // });

    mic.on('data', (data: Buffer) => {
      if (this.isPaused) {
        return;
      }
      if (!this.options) {
        return;
      }
      const {
        key, nonce, port, server,
      } = this.options.udp;

      const encodedBuffer = opusScript.encode(data, frameSize);
      const encodedBufferLengthHex = encodedBuffer.length.toString(16).padStart(4, '0');
      this.sequence += 1;
      const sequenceHex = this.sequence.toString(16).padStart(8, '0');

      const newNonce = nonce.slice(0, 4)
      + encodedBufferLengthHex + nonce.slice(8, 24) + sequenceHex;
      const encryptedData = aesCtrEncrypt(key, newNonce, encodedBuffer);
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

    if (!this.options) {
      return;
    }

    const { outputSampleRate, outputChannels } = this.options;

    const sox = spawn('sox', [
      '-t', 'raw', // 指定输入格式为原始音频数据
      '-r', `${outputSampleRate}`, // 采样率
      '-b', '16', // 位深
      '-c', `${outputChannels}`, // 声道数
      '-e', 'signed-integer',
      '-', // 从标准输入读取数据
      '-t', process.platform === 'win32' ? 'waveaudio' : 'coreaudio', '-d', // 输出到默认音频设备
    ]);

    // sox.stderr.on('data', (data) => {
    //   console.error(data.toString());
    // });

    const opusScript = new OpusScript(outputSampleRate, outputChannels, OpusScript.Application.AUDIO);

    DgramService.on('message', (data) => {
      if (!this.options) {
        return;
      }
      const { key } = this.options.udp;

      const nonce = data.subarray(0, 16);
      const encryptedBuffer = data.subarray(16);
      const decryptedBuffer = aesCtrDecrypt(key, nonce.toString('hex'), encryptedBuffer);
      const decodeBuffer = opusScript.decode(decryptedBuffer);

      sox.stdin.write(decodeBuffer);
    });

    this.speaker = sox;
  }

  pauseMicrophone() {
    if (!this.mic) {
      return;
    }
    this.isPaused = true;
  }

  resumeMicrophone() {
    if (!this.mic) {
      return;
    }
    this.isPaused = false;
  }
}

export default new AudioService();
