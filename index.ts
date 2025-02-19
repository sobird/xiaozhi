#!/usr/bin/env tsx

/**
 * Run your XiaoZhi AI on the terminal
 *
 * sobird<i@sobird.me> at 2025/02/17 8:35:26 created.
 */
import readline from 'readline';

import { Command } from '@commander-js/extra-typings';
import ora from 'ora';

import { randomWave } from '@/utils/randomWave';

import Config from './config';
import { version, description } from './package.json' with { type: 'json' };
import MqttService from './services/MqttService';
import { asyncFunction } from './utils/asyncFunction';

const program = new Command();

export type CommandOptions = ReturnType<typeof command.opts>;

const command = program
  .name('xzai')
  .description(description)
  .version(version)
  // .arguments('[eventName]')
  .option('-r, --rate <Number>', 'Sample rate of audio', (value: string) => { return Number(value); })
  .option('-c, --channels <Number>', 'Number of channels of audio data; e.g. 2 = stereo', (value: string) => { return Number(value); })
  .option('-b, --bits <Number>', 'Encoded sample size in bits', (value: string) => { return Number(value); })
  .option('-f, --frame-duration <Number>', 'Frame duration', (value: string) => { return Number(value); })
  .option('-i, --init', 'Initial configuration')
  // .option('--config <PATH>', 'Config file path')
  .action(async (options) => {
    const config = await Config.Load(options);
    await config.prompts();

    // config.save();
    console.log('config', config);

    return;
    const mqttService = new MqttService();
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

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    let space = false;
    // 监听按键事件
    process.stdin.on('keypress', (str, key) => {
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
    // 监听按键事件
    process.stdin.on('keypress', (str, key) => {
      console.log('key', key);
      if (key.ctrl && key.name === 'c') {
        process.exit();
      }
    });

    // await asyncFunction(5000);
  });

try {
  // program.exitOverride();
  program.parse(process.argv);
} catch (err) {
  console.log('err', err);
  // custom processing...
}

//
process.on('SIGINT', () => {
  process.exit();
});
