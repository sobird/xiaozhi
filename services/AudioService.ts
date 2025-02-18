import Speaker from '@sobird/speaker';
import Record, { Recording } from 'node-record-lpcm16';
import OpusScript from 'opusscript';

import { aesCtrEncrypt, aesCtrDecrypt } from '@/utils/crypto';
import voiceWave from '@/utils/voiceWave';

import DgramService from './DgramService';
import { MqttMessage } from './MqttService';

const AUDIO_PARAMS: MqttMessage['audio_params'] = {
  sample_rate: 48000,
  channels: 2,
  frame_duration: 20,
};

// 单例
export class AudioService {
  options!: MqttMessage;

  mic?: Recording;

  speaker?: Speaker;

  sequence = 0;

  start(options: MqttMessage) {
    this.options = options;
    this.createMicrophone();
    this.createSpeaker();

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

    const { sample_rate: sampleRate, channels, frame_duration: frameDuration } = AUDIO_PARAMS;
    const frameSize = (sampleRate * frameDuration) / 1000;
    // 写死
    const opusScript = new OpusScript(sampleRate, channels, OpusScript.Application.AUDIO);

    const mic = Record.record({
      sampleRate,
      channels,
    });

    // voiceWave.start();
    // spinner.start();

    mic.stream().on('data', (data: Buffer) => {
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

    mic.stream().on('error', (err) => {
      console.error(`send audio error: ${err}`);
    });

    this.mic = mic;
  }

  // 启动扬声器
  createSpeaker() {
    if (this.speaker) {
      return;
    }

    // const { sample_rate: sampleRate, frame_duration: frameDuration } = AUDIO_PARAMS;
    // const frameNum = Math.floor(frameDuration / (1000 / sampleRate));

    let timer: NodeJS.Timeout;
    this.speaker = AudioService.Speaker();

    // 写死
    const opusScript = new OpusScript(24000, 2, OpusScript.Application.AUDIO);

    DgramService.on('message', (data) => {
      const { key } = this.options.udp;
      // console.log('speaker data', data);

      const splitNonce = data.subarray(0, 16);
      const encryptedData = data.subarray(16);
      const decryptedData = aesCtrDecrypt(key, splitNonce.toString('hex'), encryptedData);
      const decodedData = opusScript.decode(decryptedData);

      // console.log('decodedData', decodedData);
      this.speaker?.write(decodedData, 'utf-8', (err) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.speaker?.close(true);
        }, 1000);
      });
    });
  }

  destroy() {
    // this.mic?.stop();
    // this.mic?.stream().destroy();
    // this.speaker?.destroy();
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
