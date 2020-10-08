# Let it go

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

// Just snow!
const snow = new LetItGo();

// With some options
const snow = new LetItGo({
  /** root container */
  root: document.body,
  /** snow flake number */
  number: window.innerWidth,
  /** x of velocity range */
  velocityXRange: [-3, 3],
  /** y of velocity range */
  velocityYRange: [1, 5],
  /** snow flake radius range */
  radiusRange: [0.5, 1],
  /** snow flake color */
  color: "#fff",
  /** snow flake opacity range */
  alphaRange: [0.8, 1],
  /** FPS */
  fps: 30,
});
```

### More

```js
// Just stop
snow.letItStop();

// And snow again!
snow.letItGoAgain();

// Clear canvas
snow.clear();
```
