# Changelog

## [1.2.3](https://github.com/sobird/xiaozhi/compare/v1.2.2...v1.2.3) (2025-03-11)


### Bug Fixes

* send hello message params update ([078578e](https://github.com/sobird/xiaozhi/commit/078578e4ef5ed759e819d573d5c4f1fabd9e8198))


### Performance Improvements

* show sox install guide ([e358580](https://github.com/sobird/xiaozhi/commit/e3585801993baccd3885502d4a93aeb2997c21ab))
* tip spinner optimize ([3f7ef92](https://github.com/sobird/xiaozhi/commit/3f7ef9234ed09eee38b41c8f98f31594ec982bba))

## [1.2.2](https://github.com/sobird/xiaozhi/compare/v1.2.1...v1.2.2) (2025-02-19)


### Bug Fixes

* use @sobird/opusscript ([014d571](https://github.com/sobird/xiaozhi/commit/014d57189d3890111535f870aae569be60ab77b1))

## [1.2.1](https://github.com/sobird/xiaozhi/compare/v1.2.0...v1.2.1) (2025-02-19)


### Bug Fixes

* change opusscript MAX_FRAME_SIZE to 960 * 6 ([443cbcb](https://github.com/sobird/xiaozhi/commit/443cbcbda97ebea58d3030b4a019983fe79fecdf))


### Performance Improvements

* audio spinner interactive optimal ([0876397](https://github.com/sobird/xiaozhi/commit/0876397d9a91cd85565b9b8ea3a42a0798548696))

## [1.2.0](https://github.com/sobird/xiaozhi/compare/v1.1.0...v1.2.0) (2025-02-19)


### Features

* cli parameter configuration ([9b1fe32](https://github.com/sobird/xiaozhi/commit/9b1fe329e1e21546c3615586b6d0edb305ecaed3))
* config support prompts ([cc67d4e](https://github.com/sobird/xiaozhi/commit/cc67d4e9b5986e3c9a09f0049608087eb15a1c31))


### Bug Fixes

* keypress event conflict with prompts or ora ([320fdd5](https://github.com/sobird/xiaozhi/commit/320fdd55aa1100efc37ae668b8fa768f588b17d1))
* spwan sox on data event only run 108 seconds ([adabd05](https://github.com/sobird/xiaozhi/commit/adabd05635229685b05b0a9b26a5581aa71933ae))

## [1.1.0](https://github.com/sobird/xiaozhi/compare/v1.0.2...v1.1.0) (2025-02-19)


### Features

* spawn using spawn to call sox to manipulate audio streams ([c83aaff](https://github.com/sobird/xiaozhi/commit/c83aaff3bf385c2ed87471a518e4e190012f8ab0))
* speaker: comment out annoying warning & publish to @sobird/speaker ([f31a6ab](https://github.com/sobird/xiaozhi/commit/f31a6ab8308f93624fcc38431a97e69b16787c72))


### Bug Fixes

* await mqtt connected ([d088cb3](https://github.com/sobird/xiaozhi/commit/d088cb3e0484ca610c6ac79f2a6b8e4f48163c65))

## [1.0.2](https://github.com/sobird/xiaozhi/compare/v1.0.1...v1.0.2) (2025-02-18)


### Bug Fixes

* npm publish script ([6d20a63](https://github.com/sobird/xiaozhi/commit/6d20a63c869f1848304ca557991cb513b1d2a7c2))

## [1.0.1](https://github.com/sobird/xiaozhi/compare/v1.0.0...v1.0.1) (2025-02-18)


### Bug Fixes

* update prepublish script ([83934d0](https://github.com/sobird/xiaozhi/commit/83934d00d43fe0421ac1f1576e0e59cd7d9da007))

## 1.0.0 (2025-02-18)


### Features

* add test scripts ([c95028c](https://github.com/sobird/xiaozhi/commit/c95028c543b6ce1402d19f321d8f9d04eef27529))
* chat interaction optimization ([ce70d9a](https://github.com/sobird/xiaozhi/commit/ce70d9a7ca5f29c3d1ac481d709f460e61a9e417))
* complete the basic functions of the Xiaozhi terminal version ([554d960](https://github.com/sobird/xiaozhi/commit/554d9606dd858757cc181bf367358470033c049f))
* display sound ripples on the terminal when the user speaks ([a170841](https://github.com/sobird/xiaozhi/commit/a1708416ef8b833e2e33c05efd22376b31bb95c2))
* replace bin env tsx with  node ([7ffdef5](https://github.com/sobird/xiaozhi/commit/7ffdef52e144cd89cecd82f1d26c945f0a52ac1a))
* xiaozhi ai can run on terminal now ([adeeddf](https://github.com/sobird/xiaozhi/commit/adeeddf501687e3e79e31011c95801252031318a))


### Bug Fixes

* mic do not use mqtt's audio_params, use a local const ([5fd3c3b](https://github.com/sobird/xiaozhi/commit/5fd3c3bc96e8c4e6c7f6dc113c4c4deb48357327))
* mic's sample rate is difference speaker ([3d4aa0b](https://github.com/sobird/xiaozhi/commit/3d4aa0bc6c3af2c1376867320e483c7cc86027fa))
* ora causes invalid keypress event ([8fa26d7](https://github.com/sobird/xiaozhi/commit/8fa26d73c30944af7e402615d56dd067ac6f50b0))


### Performance Improvements

* interrupt ai speaker ([697a524](https://github.com/sobird/xiaozhi/commit/697a524ec96bae47bd48a1abf8356e764e670205))
