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
  #path: string = path.join(APP_HOME, 'config');

  public rate: number;

  public channels: number;

  public bits: number;

  public frameDuration: number;

  #modified = false;

  #init? = false;

  constructor(config: Config, options: CommandOptions) {
    this.rate = options.rate || config.rate;
    this.channels = options.channels || config.channels;
    this.bits = options.bits || config.bits;
    this.frameDuration = options.frameDuration || config.frameDuration;

    this.#init = options.init;
  }

  async prompts() {
    await this.promptRate();
    await this.promptChannels();
    await this.promptBits();
    await this.promptframeDuration();

    this.modify();
  }

  async promptRate() {
    if (this.rate && !this.#init) {
      return;
    }
    let initial = 0;
    const choices: Choice[] = [
      { title: '48000', value: 48000, description: '' },
      { title: '44100', value: 44100 },
      { title: '32000', value: 32000 },
      { title: '24000', value: 24000 },
      { title: '16000', value: 16000 },
      { title: 'other', value: 'other', description: 'custom input sample rate' },
    ];
    if (this.rate) {
      initial = choices.findIndex((item) => {
        return item.value === this.rate;
      });
    }
    const { rate } = await prompts({
      type: 'select',
      name: 'rate',
      message: 'Pick a Sample Rate',
      choices,
      initial,
    });

    if (rate === 'other') {
      const { other } = await prompts({
        type: 'number',
        name: 'other',
        message: 'Please enter Sample Rate',
      });
      this.rate = other;
      return;
    }
    this.rate = rate;
    this.#modified = true;
  }

  async promptChannels() {
    if (this.channels && !this.#init) {
      return;
    }
    const { channels } = await prompts({
      type: 'number',
      name: 'channels',
      message: 'Please enter Channels',
      initial: this.channels || 2,
    });
    this.channels = channels;
    this.#modified = true;
  }

  async promptBits() {
    if (this.bits && !this.#init) {
      return;
    }

    const { bits } = await prompts({
      type: 'number',
      name: 'bits',
      message: 'Please enter Bits',
      initial: this.bits || 16,
    });
    this.bits = bits;
    this.#modified = true;
  }

  async promptframeDuration() {
    if (this.frameDuration && !this.#init) {
      return;
    }

    const { frameDuration } = await prompts({
      type: 'number',
      name: 'frameDuration',
      message: 'Please enter Frame Duration',
      initial: this.frameDuration || 60,
    });
    this.frameDuration = frameDuration;
    this.#modified = true;
  }

  modify() {
    if (!this.#modified) {
      return;
    }
    fs.mkdirSync(path.dirname(this.#path), { recursive: true });
    fs.writeFileSync(this.#path, JSON.stringify(this, null, 2), 'utf8');
  }

  static async Load(options: CommandOptions) {
    const config = rc(APP_NAME, { } as Config);
    return new Config(config, options);
  }
}

export default Config;
