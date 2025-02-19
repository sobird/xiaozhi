/* eslint-disable class-methods-use-this */
// https://ccnphfhqs21z.feishu.cn/wiki/M0XiwldO9iJwHikpXD5cEx71nKh
import mqtt, { MqttClient } from 'mqtt';

import Config from '@/config';
import { printRightAlign } from '@/utils/printRightAlign';
import { tipSpinner } from '@/utils/spinner';

import audioService from './AudioService';
import OtaService, { OtaInfo } from './OtaService';

export interface MqttMessage {
  type: 'hello' | 'llm' | 'stt' | 'tts' | 'goodbye';
  state: 'start' | 'sentence_start' | 'sentence_stop' | 'stop';
  text: string;
  emotion: string;
  transport: 'udp';
  udp: {
    server: string;
    port: number;
    encryption: string;
    key: string;
    nonce: string;
  },
  audio_params: {
    format?: string;
    sample_rate: 8000 | 12000 | 16000 | 24000 | 48000;
    channels: number;
    frame_duration: number;
  },
  session_id: string;
}

const HELLO_MESSAGE = {
  type: 'hello',
  version: 3,
  transport: 'udp',
  audio_params: {
    format: 'opus',
    sample_rate: 48000,
    channels: 2,
    frame_duration: 20,
  },
};

export default class MqttService {
  mqttClient!: MqttClient;

  mqttOption!: OtaInfo['mqtt'];

  aesOpusInfo?: MqttMessage;

  // 对话状态
  ttsState = '';

  listening = false;

  llmMessage?: MqttMessage;

  // ttsConnected: boolean = false;

  constructor(public config: Config) {}

  async start() {
    const otaInfo = await OtaService.otaInfo();
    const mqttOption = otaInfo.mqtt;
    // console.log('otaInfo', otaInfo);

    const mqttClient = mqtt.connect(`mqtts://${mqttOption?.endpoint}:8883`, {
      clientId: mqttOption.client_id,
      username: mqttOption.username,
      password: mqttOption.password,
    });
    mqttClient.on('connect', () => {
      // console.log('Connected to MQTT server');
      mqttClient.subscribe(mqttOption.subscribe_topic);
      tipSpinner.start();
    });
    mqttClient.on('message', (topic, message) => {
      const msg: MqttMessage = JSON.parse(message.toString());
      // console.log('message:', msg);

      const method = this[`${msg.type}`];
      if (typeof method === 'function') {
        method.call(this, topic, msg);
      }
    });
    mqttClient.on('error', (error) => {
      console.log('mqtt error', error);
    });

    this.mqttClient = mqttClient;
    this.mqttOption = mqttOption;

    return this;
  }

  private hello(topic: string, message: MqttMessage) {
    this.aesOpusInfo = message;

    audioService.hello({
      udp: message.udp,
      ...this.config,
    });
  }

  // 结束对话
  private goodbye(topic: string, message: MqttMessage) {
    if (message.session_id === this.aesOpusInfo?.session_id) {
      this.aesOpusInfo = undefined;
      // DgramService.disconnect();
      // audioService.destroy();
      // this.ttsConnected = false;
    }
  }

  private llm(topic: string, message: MqttMessage) {
    if (this.ttsState === 'start') {
      this.llmMessage = message;
      console.log(message.text, message.emotion);
    }
  }

  private stt(topic: string, message: MqttMessage) {
    // 输出用户聊天内容
    printRightAlign(message.text);
  }

  private tts(topic: string, message: MqttMessage) {
    if (!message.text) {
      this.ttsState = message.state;
    }

    if (message.state === 'sentence_start') {
      // const { llmMessage } = this;
      process.stdout.write('\x1b[2K'); // 清除当前行
      console.log('');
      console.log(`\x1b[95m${message.text}\x1b[0m\n`);
      // audioService.text = `${llmMessage?.text} \x1b[95m${message.text}\x1b[0m\n`;
    }

    if (message.state === 'stop' && !this.listening) {
      audioService.ttsStoped = true;
    }
  }

  // 对用户来说，就是开始说话
  startListening() {
    tipSpinner.stop();
    this.listening = true;

    const { aesOpusInfo, ttsState } = this;
    // console.log('aesOpusInfo', aesOpusInfo);
    // 开启新的对话
    if (!aesOpusInfo?.session_id) {
      this.publish(HELLO_MESSAGE);
    }

    // 打断小智说话
    if (ttsState === 'start') {
      this.publish({ type: 'abort' });
    }

    // 用户开始说话了
    if (aesOpusInfo?.session_id) {
      this.publish({
        session_id: aesOpusInfo.session_id,
        type: 'listen',
        state: 'start',
        mode: 'manual',
      });
    }

    audioService.resumeMicrophone();
  }

  // 对用户来说，就是停止说话
  stopListening() {
    this.listening = false;
    const { aesOpusInfo } = this;

    if (aesOpusInfo?.session_id) {
      this.publish({
        session_id: aesOpusInfo.session_id,
        type: 'listen',
        state: 'stop',
      });

      audioService.pauseMicrophone();
    }
  }

  // 连接建立后，客户端发送一个 JSON 格式的 "hello" 消息，初始化服务器端的音频解码器。
  publish(message: object) {
    this.mqttClient.publish(this.mqttOption.publish_topic, JSON.stringify(message));
  }
}
