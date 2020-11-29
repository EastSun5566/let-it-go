# Let It Go

[![NPM Version](https://img.shields.io/npm/v/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)
[![NPM Downloads](https://img.shields.io/npm/dt/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)
[![License](https://img.shields.io/github/license/EastSun5566/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)

> ❄️ Make your website snow instantly

🔗 <https://eastsun5566.github.io/let-it-go/>

## ✨ Installation

```sh
npm i let-it-go
```

## 🚀 Usage

### Basic

```js
import { LetItGo } from "let-it-go";

// just snow!
const snow = new LetItGo();
```

### More

```js
// with some options
const snow = new LetItGo({
  root: document.getElementById("root"), // root container, default is document.body
  number: 1000, // snow flake number, default is window.innerWidth
  velocityXRange: [-3, 3], // x of velocity range, default is [-3, 3]
  velocityYRange: [1, 5], // y of velocity range, default is [1, 5]
  radiusRange: [0.5, 1], // snow flake radius range, default is [0.5, 1]
  color: "#fff", // snow flake color, default is #fff
  alphaRange: [0.8, 1], // snow flake opacity range, default is [0.8, 1]
  fps: 30, // FPS, default is 30
});

// just stop
snow.letItStop();

// and snow again!
snow.letItGoAgain();

// stop & remove mounted canvas
snow.clear();
```
