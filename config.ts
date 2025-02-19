import fs from 'node:fs';
import path from 'node:path';
import os from 'os';

import rc from 'rc';

const APP_NAME = 'xzai';
const APP_HOME = path.resolve(os.homedir(), `.${APP_NAME}`);

class Config {
  #path: string = path.join(APP_HOME, 'config');

  public rate: number;

  public channels: number;

  public bits: number;

  constructor(config: Config) {
    this.rate = config.rate;
    this.channels = config.channels;
    this.bits = config.bits;
  }

  save() {
    fs.mkdirSync(path.dirname(this.#path), { recursive: true });
    fs.writeFileSync(this.#path, JSON.stringify(this, null, 2), 'utf8');
  }

  static Load(file?: string, appname = APP_NAME) {
    const config = rc(appname, { } as Config, { config: file });
    console.log('config', config);

    ///
    return new Config(config);
  }
}

export default Config;
