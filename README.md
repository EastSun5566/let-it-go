# Let It Go

[![NPM Version](https://img.shields.io/npm/v/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)
[![NPM Downloads](https://img.shields.io/npm/dt/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)
[![License](https://img.shields.io/github/license/EastSun5566/let-it-go.svg?style=for-the-badge)](https://www.npmjs.com/package/let-it-go)

> ❄️ Let your website snow instantly, zero dependencies, small & fast

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

### Advance

#### Options

```js
// create snow with some options
const snow = new LetItGo({
  // root container, defaults to `document.body`
  root: document.getElementById("root"),
  // number of snowflake, defaults to `window.innerWidth`
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
  // style prop of `canvas` element, defaults to `{ zIndex: -1, pointerEvents: 'none' }`
  style: { zIndex: -999, pointerEvents: "none" },
});

// you can use static prop `DEFAULT_OPTIONS` to get all the default options
const allTheDefaultOptions = LetItGo.DEFAULT_OPTIONS;
```

#### Dynamic get/set instance options

```js
/** the number of snowflake */
const snowflakeNumber = snow.number;

// you can directly update instance prop and it will reflect those change limitedly
snow.number = 5566;
snow.color: "#333333"
snow.velocityXRange = [-10, 50]; // must be tuple `[number, number]`
```

#### Some other methods

```js
// just stop animation
snow.letItStop();

// and snow again!
snow.letItGoAgain();

// stop animation & remove mounted `canvas` element
snow.clear();
```
