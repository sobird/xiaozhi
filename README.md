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

* 使用`ora`后，设置的`process.stdin.on('keypress', (str, key) => {});`键盘监听时间无效
```ts
const spinner = ora({
  // 此处配置必须false，防止ora阻止用户的键盘输入事件
  discardStdin: false,
});
```