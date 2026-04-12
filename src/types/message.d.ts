interface Message {
  type: 'hello' | 'llm' | 'stt' | 'tts' | 'goodbye';
  session_id: string;
}
type SampleRate = 8000 | 12000 | 16000 | 24000 | 48000;

interface HelloMessage extends Message {
  type: 'hello';
  version: number;
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
    sample_rate: SampleRate;
    channels: number;
    frame_duration: number;
  },
}

interface SttMessage extends Message {
  text: string;
}

interface TtsMessage extends Message {
  state: 'start' | 'sentence_start' | 'sentence_stop' | 'stop';
  text: string;
}

interface LlmMessage extends Message {
  text: string;
  emotion: string;
}
