# XiaoZhi AI Terminal
Run your XiaoZhi AI on the terminal

[![npm][npm]][npm-url]
[![Build Status][build-status]][build-status-url]
[![Install Size][size]][size-url]

<!-- Badges -->

[npm]: https://img.shields.io/npm/v/@sobird/xiaozhi.svg
[npm-url]: https://www.npmjs.com/package/@sobird/xiaozhi
[build-status]: https://img.shields.io/github/actions/workflow/status/sobird/xiaozhi/release-please.yml?label=CI&logo=github
[build-status-url]: https://github.com/sobird/xiaozhi/actions
[size]: https://packagephobia.com/badge?p=@sobird/xiaozhi
[size-url]: https://packagephobia.com/result?p=@sobird/xiaozhi

## 本地开发
```sh
# 安装依赖
pnpm install

# 运行项目
pnpm start

# 或者 将命令安装到全局
npm link

# 在终端运行
xzai
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