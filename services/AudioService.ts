import Record, { Recording } from 'node-record-lpcm16';
import OpusScript from 'opusscript';
import ora from 'ora';
import Speaker from 'speaker';

import { aesCtrEncrypt, aesCtrDecrypt } from '@/utils/crypto';
import voiceWave from '@/utils/voiceWave';

import DgramService from './DgramService';
import { MqttMessage } from './MqttService';

const AUDIO_PARAMS: MqttMessage['audio_params'] = {
  sample_rate: 48000,
  channels: 2,
  frame_duration: 60,
};
// 单例
export class AudioService {
  options: MqttMessage;

  mic?: Recording;

  speaker?: Speaker;

  sequence = 0;

  opus: OpusScript;

  start(options: MqttMessage) {
    this.options = options;
    this.createMicrophone();
    // this.createSpeaker();

    const { sample_rate: sampleRate, channels } = AUDIO_PARAMS;
    this.opus = new OpusScript(sampleRate, channels, OpusScript.Application.AUDIO);

    this.sequence = 0;
  }

  // 用户暂停说话
  pauseSendAudio() {
    this.mic?.pause();
    // voiceWave.stop();
    this.speaker = AudioService.Speaker();
  }

  resumeSendAudio() {
    // voiceWave.start();
    this.mic?.resume();
  }

  // 启动麦克风
  createMicrophone() {
    if (this.mic) {
      return;
    }
    const sampleRate = 48000;
    const frameDuration = 20;
    const channels = 2;
    // const { sample_rate: sampleRate, channels, frame_duration: frameDuration } = this.options.audio_params;
    const frameSize = (sampleRate * frameDuration) / 1000;

    const mic = Record.record({
      sampleRate,
      channels,
    });

    const encoder = new OpusScript(48000, 2, OpusScript.Application.AUDIO);

    // voiceWave.start();

    mic.stream().on('data', (data: Buffer) => {
      console.log('mic data', data);

      const { key, nonce } = this.options.udp;

      const encodedPacket = this.opus.encode(data, frameSize);
      const encodedDataLengthHex = encodedPacket.length.toString(16).padStart(4, '0');
      this.sequence += 1;
      const sequenceHex = this.sequence.toString(16).padStart(8, '0');

      const newNonce = nonce.slice(0, 4)
      + encodedDataLengthHex + nonce.slice(8, 24) + sequenceHex;
      const encryptedData = aesCtrEncrypt(key, newNonce, encodedPacket);
      const packet = Buffer.concat([Buffer.from(newNonce, 'hex'), encryptedData]);

      // console.log('packet', packet);
      DgramService.send(packet, (err) => {
        if (err) console.error('Error sending audio:', err);
      });
    });

    mic.stream().on('error', (err) => {
      console.error(`send audio error: ${err}`);
    });

    this.mic = mic;
  }

  // 启动扬声器
  createSpeaker(opusInfo: MqttMessage) {
    if (this.speaker) {
      return;
    }

    // const { sample_rate: sampleRate, frame_duration: frameDuration } = opusInfo.audio_params;
    // const frameNum = Math.floor(frameDuration / (1000 / sampleRate));

    let timer: NodeJS.Timeout;
    this.speaker = AudioService.Speaker();

    console.log('create Speaker opusInfo', opusInfo);

    DgramService.on('message', (data) => {
      const { key, nonce } = opusInfo.udp;
      console.log('speaker data', data);

      const splitNonce = data.subarray(0, 16);
      const encryptedData = data.subarray(16);
      const decryptedData = aesCtrDecrypt(key, splitNonce.toString('hex'), encryptedData);
      const decodedData = this.opus.decode(decryptedData);

      this.speaker?.write(decodedData, 'utf-8', (err) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.speaker?.close(true);
        }, 500);
      });
    });
  }

  destroy() {
    this.mic?.stop();
    this.mic?.stream().destroy();
    this.speaker?.destroy();
    console.log('destroy');
  }

  static Speaker() {
    return new Speaker({
      channels: 2,
      sampleRate: 24000,
      bitDepth: 16,
    });
  }
}

export default new AudioService();
