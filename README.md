# npm-template
Npm package template repository, designed to quickly start a front-end typescript project.

[![npm][npm]][npm-url]
[![Build Status][build-status]][build-status-url]
[![Install Size][size]][size-url]

<!-- Badges -->

[npm]: https://img.shields.io/npm/v/@sobird/npm-template.svg
[npm-url]: https://www.npmjs.com/package/@sobird/npm-template
[build-status]: https://img.shields.io/github/actions/workflow/status/sobird/npm-template/release-please.yml?label=CI&logo=github
[build-status-url]: https://github.com/sobird/npm-template/actions
[size]: https://packagephobia.com/badge?p=@sobird/npm-template
[size-url]: https://packagephobia.com/result?p=@sobird/npm-template

## husky config
```sh
# install
pnpm install --save-dev husky

# husky init
npx husky init
```

## commitlint config
```sh
npm install --save-dev @commitlint/config-conventional @commitlint/cli
echo "export default {extends: ['@commitlint/config-conventional']};" > commitlint.config.js

echo "npx commitlint --edit \$1" > .husky/commit-msg
```

## how to publish

### 一

手动通过下面的命令，进行tag发布

```sh
npm version --patch
npm version --minor
npm version --major
```

### 二

通过 `release-please` 这个自动化Action进行发布，详见 `.github/workflows/release-please.yml` 配置

## 参考

* [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)