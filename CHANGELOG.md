# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/EastSun5566/let-it-go/compare/v1.1.0...v2.0.0) (2026-09-28)

### Highlights

* support importing the package in Node.js and SSR environments without accessing DOM globals
* publish explicit ESM, CommonJS, UMD, and TypeScript declaration entry points
* improve custom-root sizing, resize handling, animation timing, rendering work, and cleanup

### Breaking Changes

* Node.js 22 or newer is required
* ranges, styles, and `DEFAULT_OPTIONS` are owned by the library and exposed as read-only values
* `number` must be a non-negative safe integer no greater than 10,000
* package exports are limited to the root entry point and `package.json`; undocumented deep imports are no longer available
* `clear()` permanently disposes the instance; create a new instance to mount the effect again

### Migration

Import from the package root, replace options through setters instead of mutating returned values,
and create a new instance after clearing the previous one:

```js
import { LetItGo } from "let-it-go";

let snow = new LetItGo();
snow.velocityXRange = [-2, 10];

snow.clear();
snow = new LetItGo();
```

### Bug Fixes

* build error on nodejs >=22 ([e1cea5e](https://github.com/EastSun5566/let-it-go/commit/e1cea5eaa5af04e450eb0f702d402ff77579aecf))
* **demo:** stabilize control panel layout ([#100](https://github.com/EastSun5566/let-it-go/issues/100)) ([d2bee02](https://github.com/EastSun5566/let-it-go/commit/d2bee02fb352e9911cd1a933654b8480f8026a8e))
* harden runtime, packaging, and release workflows ([#99](https://github.com/EastSun5566/let-it-go/issues/99)) ([bd3a540](https://github.com/EastSun5566/let-it-go/commit/bd3a5408fd9657870a9f861ec101d435c8dbc805))
* unify render loop into single requestAnimationFrame callback ([#93](https://github.com/EastSun5566/let-it-go/issues/93)) ([389ccfa](https://github.com/EastSun5566/let-it-go/commit/389ccfabfd839cd14b739f6e54dcd6770c451b2e))

## [1.1.0](https://github.com/EastSun5566/let-it-go/compare/v1.0.0...v1.1.0) (2024-11-15)


### Features

* add og tag to demo ([23f6b63](https://github.com/EastSun5566/let-it-go/commit/23f6b63009a479551556170ac3340aa2cb29f202))
* tweak og ([d2aca4f](https://github.com/EastSun5566/let-it-go/commit/d2aca4f74d89b02c15c14625ab0497a14267b891))


### Bug Fixes

* add assertions and improve error handling in core functionality ([5c6ac51](https://github.com/EastSun5566/let-it-go/commit/5c6ac51b8a6454064b1d8a67f30746cf1cd6cd03))
* enhance clean up ([902aba2](https://github.com/EastSun5566/let-it-go/commit/902aba2c37f8e5be72cd2e3a0c06036f81d48750))
* fix build & add ci build task ([e869da4](https://github.com/EastSun5566/let-it-go/commit/e869da4844d1925c60726ae25d365bc51089d748))
* remove unnecessary condiction ([536c09f](https://github.com/EastSun5566/let-it-go/commit/536c09f8281cd8170f9cf33866e1bec90b711509))

## [1.0.0](https://github.com/EastSun5566/let-it-go/compare/v0.0.10...v1.0.0) (2023-08-05)

### [0.0.10](https://github.com/EastSun5566/let-it-go/compare/v0.0.9...v0.0.10) (2023-08-05)


### Features

* add logo ([612c8f5](https://github.com/EastSun5566/let-it-go/commit/612c8f562a838eb432d1544b25203b72fc432ab3))
* update demo ([0f6a6a5](https://github.com/EastSun5566/let-it-go/commit/0f6a6a58cc118dc74b81258d2460fbf1d844097c))


### Bug Fixes

* use `style` prop instead of `setProperty` ([36c09f8](https://github.com/EastSun5566/let-it-go/commit/36c09f8cd849d7685ce4f41461dd7bbc2a4b9680))

### [0.0.9](https://github.com/EastSun5566/let-it-go/compare/v0.0.8...v0.0.9) (2022-12-29)

### [0.0.8](https://github.com/EastSun5566/let-it-go/compare/v0.0.7...v0.0.8) (2022-12-29)


### Features

* add deploy script ([5964977](https://github.com/EastSun5566/let-it-go/commit/5964977854a225115b7db0999e8fdc3147898728))
* add ga ([5575bd7](https://github.com/EastSun5566/let-it-go/commit/5575bd74255cc51099270025fd5b9cf41fd0a1bc))
* add latest let-it-go ([805faba](https://github.com/EastSun5566/let-it-go/commit/805faba3d99a602d3299c9234c32d4644a71ed2e))
* demo switch to vite ([6f1afb3](https://github.com/EastSun5566/let-it-go/commit/6f1afb34af1b301ec4b254561927ef4e6035ab14))
* update style ([3ce7baf](https://github.com/EastSun5566/let-it-go/commit/3ce7baf7e618f9ac2606bff34e789a24dced44fa))


### Bug Fixes

* should can be installed by any pakage manager ([68d2bcf](https://github.com/EastSun5566/let-it-go/commit/68d2bcfb376987563343e0ce313e2b8bdb4ea43f))
* typing ([e81a68b](https://github.com/EastSun5566/let-it-go/commit/e81a68bb52d18e5a7f824f9262f752fbc0f6a1af))

### [0.0.7](https://github.com/EastSun5566/let-it-go/compare/v0.0.6...v0.0.7) (2022-12-24)


### Features

* add `backgroundColor` option ([fe91ccf](https://github.com/EastSun5566/let-it-go/commit/fe91ccf0e1e351d5dbee0683d50a09a59cb456c2))
* add `style` option ([e19a215](https://github.com/EastSun5566/let-it-go/commit/e19a2152405b46e960f73bf3cb4b6e2e57acb192))


### Bug Fixes

* remove resize event ([c7c2752](https://github.com/EastSun5566/let-it-go/commit/c7c275277d06d7bd896a06f2623b925508394bcc))
* typing ([e05a297](https://github.com/EastSun5566/let-it-go/commit/e05a2970521de47e9a09e35509bca3808665e146))
