#!/usr/bin/env tsx

/**
 * Run your XiaoZhi AI on the terminal
 *
 * sobird<i@sobird.me> at 2025/02/17 8:35:26 created.
 */
// import readline from 'readline';

import { Command } from '@commander-js/extra-typings';
import ora from 'ora';

import { randomWave } from '@/utils/randomWave';

import Config from './config';
import { version, description } from './package.json' with { type: 'json' };
import MqttService from './services/MqttService';
import { keypress } from './utils';

const program = new Command();

export type CommandOptions = ReturnType<typeof command.opts>;

const command = program
  .name('xzai')
  .description(description)
  .version(version)
  .option('-r, --input-sample-rate <Number>', 'Input sample rate of audio', (value: string) => { return Number(value) as SampleRate; })
  .option('-c, --input-channels <Number>', 'Input number of channels of audio data; e.g. 2 = stereo', (value: string) => { return Number(value); })
  .option('-b, --input-bits <Number>', 'Input encoded sample size in bits', (value: string) => { return Number(value); })
  .option('-f, --input-frame-duration <Number>', 'Input frame duration', (value: string) => { return Number(value); })

  .option('-R, --output-sample-rate <Number>', 'Ouput sample rate of audio', (value: string) => { return Number(value) as SampleRate; }, 48000)
  .option('-C, --output-channels <Number>', 'Ouput number of channels of audio data; e.g. 2 = stereo', (value: string) => { return Number(value); }, 1)
  .option('-B, --output-bits <Number>', 'Ouput encoded sample size in bits', (value: string) => { return Number(value); }, 16)
  // .option('-F, --output-frame-duration <Number>', 'Ouput frame duration', (value: string) => { return Number(value); }, 60)

  .option('-i, --init', 'Initial configuration')
  // .option('--config <PATH>', 'Config file path')
  .action(async (options) => {
    const config = await Config.Load(options);
    await config.prompts();

    const mqttService = new MqttService(config);
    await mqttService.start();

    const spinner = ora({
      discardStdin: false,
      // text: 'Loading...',
      spinner: {
        frames: [
          randomWave(),
          randomWave(),
          randomWave(),
          randomWave(),
        ],
        interval: 120, // 每帧的间隔时间（单位：ms）
      },
    });

    let space = false;
    keypress((str, key) => {
      if (key.name === 'space') {
        space = !space;

        if (space) {
          mqttService.startListening();
          spinner.start();

          // keypress
        } else {
          spinner.stop();
          mqttService.stopListening();
        }
      }

      // 按下 Ctrl+C 退出
      if (key.ctrl && key.name === 'c') {
        process.exit();
      }
    });
  });

try {
  // program.exitOverride();
  program.parse(process.argv);
} catch (err) {
  console.log('err', err);
}

process.on('SIGINT', () => {
  process.exit();
});
