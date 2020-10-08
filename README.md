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

// With options
const snow = new LetItGo({
  root: document.body,
  number: window.innerWidth,
  velocityXRange: [-3, 3],
  velocityYRange: [1, 5],
  radiusRange: [0.5, 1],
  color: '#fff',
  alphaRange: [0.8, 1],
  fps = 30,
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
