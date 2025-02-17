// https://ccnphfhqs21z.feishu.cn/wiki/M0XiwldO9iJwHikpXD5cEx71nKh
import mqtt, { MqttClient } from 'mqtt';

import AudioService from './AudioService';
import DgramService from './DgramService';
import OtaService, { OtaInfo } from './OtaService';

export interface MqttMessage {
  type: string;
  state: string;
  transport: 'udp';
  udp: {
    server: string;
    port: number;
    encryption: string;
    key: string;
    nonce: string;
  },
  audio_params: {
    format: string;
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
    sample_rate: 16000,
    channels: 1,
    frame_duration: 60,
  },
};

const audioService = new AudioService();

export default class MqttService {
  mqttClient!: MqttClient;

  mqttOption!: OtaInfo['mqtt'];

  aesOpusInfo?: MqttMessage;

  // 对话状态
  ttsState = '';

  sendAudioThread: NodeJS.Immediate;

  playAudioThread: NodeJS.Immediate;

  ttsConnected: boolean = false;

  async start() {
    const otaInfo = await OtaService.otaInfo();
    const mqttOption = otaInfo.mqtt;
    console.log('otaInfo', otaInfo);
    const mqttClient = mqtt.connect(`mqtts://${mqttOption?.endpoint}:8883`, {
      clientId: mqttOption.client_id,
      username: mqttOption.username,
      password: mqttOption.password,
    });
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT server');
      mqttClient.subscribe(mqttOption.subscribe_topic);
    });

    mqttClient.on('message', (topic, message) => {
      const msg: MqttMessage = JSON.parse(message.toString());
      console.log('message:', msg);

      switch (msg.type) {
        case 'hello':
          this.hello(topic, msg);
          break;
        case 'tts':
          break;
        case 'goodbye':
          this.goodbye(topic, msg);
          break;
        default:
      }
    });

    mqttClient.on('error', (error) => {
      console.log('mqtt error', error);
    });

    this.mqttClient = mqttClient;
    this.mqttOption = mqttOption;
  }

  private hello(topic: string, message: MqttMessage) {
    this.aesOpusInfo = message;
    const { udp } = message;

    // 建立语音聊天通道
    DgramService.connect(udp.port, udp.server, () => {
      console.log('tts connected');
      // if (!this.sendAudioThread) {
      this.sendAudioThread = setImmediate(() => {
        audioService.sendAudio(message);
      });
      // }

      // if (!this.playAudioThread) {
      this.playAudioThread = setImmediate(() => {
        audioService.playAudio(message);
      });
      // }

      this.ttsConnected = true;
    });
  }

  // 结束对话
  goodbye(topic: string, message: MqttMessage) {
    if (message.session_id === this.aesOpusInfo?.session_id) {
      this.aesOpusInfo = undefined;
      DgramService.disconnect();
      this.ttsConnected = false;
    }
  }

  private tts(topic: string, message: MqttMessage) {
    this.ttsState = message.state;
  }

  // 对用户来说，就是开始说话
  startListening() {
    const { aesOpusInfo, ttsState } = this;
    console.log('aesOpusInfo', aesOpusInfo);
    // 开启新的对话
    if (!this.ttsConnected && !aesOpusInfo?.session_id) {
      this.publish(HELLO_MESSAGE);
    }

    // 打断小智说话
    if (ttsState === 'start' || ttsState === 'entence_start') {
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

      audioService.resumeSendAudio();
    }
  }

  // 对用户来说，就是停止说话
  stopListening() {
    const { aesOpusInfo } = this;
    if (aesOpusInfo?.session_id) {
      this.publish({
        session_id: aesOpusInfo.session_id,
        type: 'listen',
        state: 'stop',
      });

      audioService.pauseSendAudio();
    }
  }

  // 连接建立后，客户端发送一个 JSON 格式的 "hello" 消息，初始化服务器端的音频解码器。
  publish(message: object) {
    console.log('publish message:', message);
    this.mqttClient.publish(this.mqttOption.publish_topic, JSON.stringify(message));
  }
}
