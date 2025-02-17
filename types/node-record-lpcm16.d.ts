// import { ChildProcess } from 'child_process';

declare module 'node-record-lpcm16' {
  interface RecordOptions {
    sampleRate?: number;
    channels?: number;
    compress?: boolean;
    threshold?: number;
    thresholdStart?: string;
    thresholdEnd?: string;
    silence?: string;
    recorder?: 'sox' | 'rec' | 'arecord';
    endOnSilence?: boolean;
    audioType?: string;
  }
  export function record(options: RecordOptions): Recording;

  export class Recording {
    constructor(options: RecordOptions);
    start(): this;
    stop(): void;
    pause(): void;
    resume(): void;
    isPaused(): boolean;
    stream(): import('child_process').ChildProcessWithoutNullStreams['stdout'];
  }
}
