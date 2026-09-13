<img src="./logo.svg" width="180" alt="let-it-go logo">

# ❄️ Let It Go

[![NPM Version](https://img.shields.io/npm/v/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)
[![NPM Downloads](https://img.shields.io/npm/dt/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)
[![JSR Version](https://img.shields.io/jsr/v/%40eastsun5566/let-it-go?style=for-the-badge)](https://jsr.io/@eastsun5566/let-it-go)
[![License](https://img.shields.io/github/license/EastSun5566/let-it-go.svg?style=for-the-badge)](https://github.com/EastSun5566/let-it-go/blob/main/LICENSE)

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" height="40">](https://www.buymeacoffee.com/eastsun5566)

> Let your website snow instantly, zero dependencies, small & fast

🔗 <https://eastsun5566.github.io/let-it-go/>

## ✨ Installation

```sh
npm i let-it-go
```

## 🚀 Usage

### Basic

```js
import { LetItGo } from "let-it-go";

// Run this in a browser after the document body is available.
const snow = new LetItGo();
```

The package can be imported by Node.js and SSR tooling, but creating a
`LetItGo` instance requires browser DOM and Canvas APIs. In an SSR application,
construct it from a client-only lifecycle hook.

### Advanced

#### Options

```js
// create snow with some options
const snow = new LetItGo({
  // root container, defaults to `document.body`
  root: document.getElementById("root") ?? document.body,
  // number of snowflakes, defaults to `window.innerWidth` (capped at 10,000)
  number: 1000,
  // velocity x range of snowflake, defaults to `[-3, 3]`
  velocityXRange: [-3, 3],
  // velocity y range of snowflake, defaults to `[1, 5]`
  velocityYRange: [1, 5],
  // radius range of snowflake, defaults to `[0.5, 1]`
  radiusRange: [0.5, 1],
  // color of snowflake color, defaults to `#ffffff`
  color: "#ffffff",
  // opacity range of snowflake, defaults to `[0.8, 1]`
  alphaRange: [0.8, 1],
  // background color of `canvas` element, defaults to `transparent`
  backgroundColor: "transparent",
  // construction-only canvas styles; CSSStyleDeclaration values are strings
  style: { zIndex: "-999", pointerEvents: "none" },
});

// you can use static prop `DEFAULT_OPTIONS` to get all the default options
const allTheDefaultOptions = LetItGo.DEFAULT_OPTIONS;
```

#### Dynamic get/set instance options

```js
/** the number of snowflake */
const snowflakeNumber = snow.number;

// These options update state immediately and redraw on the next running frame.
snow.number = 5566;
snow.color = "#333333";
snow.backgroundColor = "transparent";
snow.velocityXRange = [-10, 50];
snow.velocityYRange = [1, 5];
snow.radiusRange = [0.5, 1];
snow.alphaRange = [0.8, 1];
```

Range values must be finite two-item tuples. `number` must be a non-negative
safe integer no greater than 10,000. The `root` and `style` options are
construction-only.

#### Some other methods

```js
// just stop animation
snow.letItStop();

// and snow again!
snow.letItGoAgain();

// permanently stop animation and remove the mounted `canvas` element
// create a new instance if you need to mount the effect again
snow.clear();
```
