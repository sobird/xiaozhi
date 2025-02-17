import Record, { Recording } from 'node-record-lpcm16';
import OpusScript from 'opusscript';
import Speaker from 'speaker';

import { aesCtrEncrypt, aesCtrDecrypt } from '@/utils/crypto';

import DgramService from './DgramService';
import { MqttMessage } from './MqttService';

// const mic = Record.record({});
// const st = mic.stream();

let localSequence = 0;

export default class AudioService {
  mic?: Recording;

  speaker?: Speaker;

  sendAudio(opusInfo: MqttMessage) {
    const { key, nonce } = opusInfo.udp;

    const samplingRate = 48000;
    const frameDuration = 20;
    const channels = 2;
    const encoder = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO);
    const frameSize = (samplingRate * frameDuration) / 1000;

    const mic = Record.record({
      sampleRate: 48000,
      channels: 2,
      threshold: 0.5,
    });

    mic.stream().on('data', (data: Buffer) => {
      const encodedPacket = encoder.encode(data, frameSize);
      const encodedDataLengthHex = encodedPacket.length.toString(16).padStart(4, '0');
      localSequence += 1;
      const localSequenceHex = localSequence.toString(16).padStart(8, '0');

      const newNonce = nonce.slice(0, 4)
      + encodedDataLengthHex + nonce.slice(8, 24) + localSequenceHex;
      const encryptedData = aesCtrEncrypt(key, newNonce, encodedPacket);
      const packet = Buffer.concat([Buffer.from(newNonce, 'hex'), encryptedData]);
      console.log('packet message', packet);
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

  // 用户暂停说话
  pauseSendAudio() {
    this.mic?.pause();
    this.speaker = new Speaker({
      channels: 2, // 2 channels
      bitDepth: 16, // 16-bit samples
      sampleRate: 24000, // 44,100 Hz sample rate
    });
  }

  resumeSendAudio() {
    this.mic?.resume();
  }

  playAudio(opusInfo: MqttMessage) {
    const { key, nonce } = opusInfo.udp;
    const { sample_rate: sampleRate, frame_duration: frameDuration } = opusInfo.audio_params;
    const frameNum = Math.floor(frameDuration / (1000 / sampleRate));
    console.log('frameNum', frameNum);
    const opusScript = new OpusScript(sampleRate, 2, OpusScript.Application.AUDIO);

    let timer: NodeJS.Timeout;

    DgramService.on('message', (data) => {
      const splitNonce = data.subarray(0, 16);
      const encryptedData = data.subarray(16);
      const decryptedData = aesCtrDecrypt(key, splitNonce.toString('hex'), encryptedData);
      const decodedData = opusScript.decode(decryptedData);

      this.speaker?.write(decodedData, 'utf-8', (err) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.speaker?.close(true);
        }, 500);
      });
    });
  }
}
