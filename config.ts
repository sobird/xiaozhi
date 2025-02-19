/* eslint-disable no-param-reassign */
import fs from 'node:fs';
import path from 'node:path';
import os from 'os';

import prompts, { Choice } from 'prompts';
import rc from 'rc';

import { CommandOptions } from '.';

const APP_NAME = 'xzai';
const APP_HOME = path.resolve(os.homedir(), `.${APP_NAME}`);

class Config {
  public inputSampleRate: SampleRate;

  public inputChannels: number;

  public inputBits: number;

  public inputFrameDuration: number;

  public outputSampleRate: SampleRate;

  public outputChannels: number;

  public outputBits: number;

  // public outputFrameDuration: number;

  #path: string = path.join(APP_HOME, 'config');

  #modified = false;

  #init? = false;

  constructor(config: Config, options: CommandOptions) {
    this.inputSampleRate = options.inputSampleRate || config.inputSampleRate;
    this.inputChannels = options.inputChannels || config.inputChannels;
    this.inputBits = options.inputBits || config.inputBits;
    this.inputFrameDuration = options.inputFrameDuration || config.inputFrameDuration;

    this.outputSampleRate = options.outputSampleRate || config.outputSampleRate;
    this.outputChannels = options.outputChannels || config.outputChannels;
    this.outputBits = options.outputBits || config.outputBits;
    // this.outputFrameDuration = options.outputFrameDuration || config.outputFrameDuration;

    this.#init = options.init;
  }

  async prompts() {
    await this.promptInputSampleRate();
    await this.promptInputChannels();
    await this.promptInputBits();
    await this.promptInputFrameDuration();

    this.modify();
  }

  async promptInputSampleRate() {
    if (this.inputSampleRate && !this.#init) {
      return;
    }
    let initial = 0;
    const choices: Choice[] = [
      { title: '48000', value: 48000, description: '' },
      { title: '44100', value: 44100 },
      { title: '32000', value: 32000 },
      { title: '24000', value: 24000 },
      { title: '16000', value: 16000 },
      { title: 'other', value: 'other', description: 'custom input sample inputSampleRate' },
    ];
    if (this.inputSampleRate) {
      initial = choices.findIndex((item) => {
        return item.value === this.inputSampleRate;
      });
    }
    const { inputSampleRate } = await prompts({
      type: 'select',
      name: 'inputSampleRate',
      message: 'Pick a Sample SampleRate',
      choices,
      initial,
    });

    if (inputSampleRate === 'other') {
      const { other } = await prompts({
        type: 'number',
        name: 'other',
        message: 'Please enter Sample SampleRate',
      });
      this.inputSampleRate = other;
      return;
    }

    if (this.#init && !inputSampleRate) {
      return;
    }
    this.inputSampleRate = inputSampleRate;
    this.#modified = true;
  }

  async promptInputChannels() {
    if (this.inputChannels && !this.#init) {
      return;
    }
    const { inputChannels } = await prompts({
      type: 'number',
      name: 'inputChannels',
      message: 'Please enter Channels',
      initial: this.inputChannels || 2,
    });

    // 当初始化时，值不存在则不更新
    if (this.#init && !inputChannels) {
      return;
    }
    this.inputChannels = inputChannels;
    this.#modified = true;
  }

  async promptInputBits() {
    if (this.inputBits && !this.#init) {
      return;
    }

    const { inputBits } = await prompts({
      type: 'number',
      name: 'inputBits',
      message: 'Please enter Bits',
      initial: this.inputBits || 16,
    });

    if (this.#init && !inputBits) {
      return;
    }
    this.inputBits = inputBits;
    this.#modified = true;
  }

  async promptInputFrameDuration() {
    if (this.inputFrameDuration && !this.#init) {
      return;
    }

    const { inputFrameDuration } = await prompts({
      type: 'number',
      name: 'inputFrameDuration',
      message: 'Please enter Frame Duration',
      initial: this.inputFrameDuration || 60,
    });

    if (this.#init && !inputFrameDuration) {
      return;
    }
    this.inputFrameDuration = inputFrameDuration;
    this.#modified = true;
  }

  modify() {
    if (!this.#modified) {
      return;
    }
    fs.mkdirSync(path.dirname(this.#path), { recursive: true });
    fs.writeFileSync(this.#path, JSON.stringify(this, null, 2), 'utf8');
  }

  get modified() {
    return this.#modified;
  }

  static async Load(options: CommandOptions) {
    const config = rc(APP_NAME, { } as Config);
    return new Config(config, options);
  }
}

export default Config;
