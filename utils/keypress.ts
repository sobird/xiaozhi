// https://github.com/terkelg/prompts/issues/312#issuecomment-841560055
import readline from 'readline';

export const keypress = (listener: (str: string, key: any) => void) => {
  const rl = readline.createInterface({ input: process.stdin, escapeCodeTimeout: 50 });
  readline.emitKeypressEvents(process.stdin, rl);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  // const listener = (key) => {
  //   process.stdin.removeListener('keypress', listener);
  //   process.stdin.setRawMode(false);
  //   rl.close();
  //   resolve();
  // };
  process.stdin.on('keypress', listener);
};
