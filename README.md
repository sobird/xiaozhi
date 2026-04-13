# XiaoZhi AI Terminal
Run your XiaoZhi AI on the terminal

[![npm][npm]][npm-url]
![TypeScript][typescript]
![Node.js][node]
![CLI][cli]
[![Build Status][build-status]][build-status-url]
[![License][license]][license-url]
[![Install Size][size]][size-url]

## Usage

**Install [sox](https://sourceforge.net/projects/sox/)**

Configure sox environment variables

```sh
# installed successfully
sox --version
sox:      SoX v
```

**Install [Node.js](https://nodejs.org/)**
```sh
# installed successfully
node -v
v22.1.0
```

**Install XiaoZhi AI**

```sh
npm i -g @sobird/xiaozhi

# Run xzai on the terminal and start a chat
xzai
```
**Note:** Press the spacebar to start chatting(No need to keep pressing), Press the spacebar again to complete the voice input.


## Develop
```sh
# clone repo
git clone https://github.com/sobird/xiaozhi.git
# install deps
pnpm install
# start run
pnpm start
# or npm link to xzai cli to global
npm link

# Run on the terminal
xzai
```

## Wechat

```sh
npx localtunnel --port 3000
```

## FAQ

* 使用`ora`后，设置的`process.stdin.on('keypress', (str, key) => {});`键盘监听事件无效
```ts
const spinner = ora({
  // 此处配置必须false，防止ora阻止用户的键盘输入事件
  discardStdin: false,
});
```

* 按下说话报错，Error: spawn sox ENOENT，详细信息如下
```sh
      throw er; // Unhandled 'error' event
      ^

Error: spawn sox ENOENT
    at ChildProcess._handle.onexit (node:internal/child_process:286:19)
    at onErrorNT (node:internal/child_process:484:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)
Emitted 'error' event on ChildProcess instance at:
    at ChildProcess._handle.onexit (node:internal/child_process:292:12)
    at onErrorNT (node:internal/child_process:484:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'spawn sox',
  path: 'sox',
  spawnargs: [
    '--default-device',
    '--no-show-progress',
    '--rate',
    48000,
    '--channels',
    2,
    '--encoding',
    'signed-integer',
    '--bits',
    '16',
    '--type',
    'wav',
    '-'
  ]
}
```

电脑上没有安装sox，请自行根据系统选择安装对应的版本。

* 查看电脑音频设备信息
```sh
# macOS 执行下面命令
$ system_profiler SPAudioDataType
Audio:

    Devices:

        Built-in Microphone:

          Default Input Device: Yes
          Input Channels: 2
          Manufacturer: Apple Inc.
          Current SampleRate: 44100
          Transport: Built-in
          Input Source: Internal Microphone

        Built-in Output:

          Default Output Device: Yes
          Default System Output Device: Yes
          Manufacturer: Apple Inc.
          Output Channels: 2
          Current SampleRate: 44100
          Transport: Built-in
          Output Source: Internal Speakers

```


<!-- Badges -->
[npm]: https://img.shields.io/npm/v/@sobird/xiaozhi.svg?style=flat-square&logo=npm&label=@sobird/xiaozhi
[npm-url]: https://www.npmjs.com/package/@sobird/xiaozhi
[build-status]: https://img.shields.io/github/actions/workflow/status/sobird/xiaozhi/release.yml?label=CI&logo=github&style=flat-square
[build-status-url]: https://github.com/sobird/xiaozhi/actions
[size]: https://img.shields.io/badge/dynamic/json?style=flat-square&label=mass&query=$.publish.pretty&url=https://packagephobia.com/v2/api.json?p=@sobird/xiaozhi&color=blueviolet
[size-url]: https://packagephobia.com/result?p=@sobird/xiaozhi
[license]: https://img.shields.io/github/license/sobird/xiaozhi.svg?style=flat-square&v=1
[license-url]: https://github.com/sobird/xiaozhi/blob/master/LICENSE
[typescript]: https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white
[cli]: https://img.shields.io/badge/-CLI-000000?style=flat-square&logo=gnu-bash
[node]: https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white
