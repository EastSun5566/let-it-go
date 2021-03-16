// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../src/utils/Vector.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vec2D = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// eslint-disable-next-line import/prefer-default-export
var Vec2D = /*#__PURE__*/function () {
  // eslint-disable-next-line no-useless-constructor
  function Vec2D() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Vec2D);

    this.x = x;
    this.y = y;
  }

  _createClass(Vec2D, [{
    key: "add",
    value: function add(_ref) {
      var _ref$x = _ref.x,
          x = _ref$x === void 0 ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === void 0 ? 0 : _ref$y;
      this.x += x;
      this.y += y;
      return this;
    }
  }]);

  return Vec2D;
}();

exports.Vec2D = Vec2D;
},{}],"../../src/utils/Snowflake.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Snowflake = void 0;

var _Vector = require("./Vector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// eslint-disable-next-line import/prefer-default-export
var Snowflake = /*#__PURE__*/function () {
  function Snowflake() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$p = _ref.p,
        p = _ref$p === void 0 ? new _Vector.Vec2D() : _ref$p,
        _ref$v = _ref.v,
        v = _ref$v === void 0 ? new _Vector.Vec2D() : _ref$v,
        _ref$r = _ref.r,
        r = _ref$r === void 0 ? 0.5 : _ref$r,
        _ref$color = _ref.color,
        color = _ref$color === void 0 ? '#fff' : _ref$color,
        _ref$alpha = _ref.alpha,
        alpha = _ref$alpha === void 0 ? 1 : _ref$alpha;

    _classCallCheck(this, Snowflake);

    this.p = p;
    this.v = v;
    this.r = r;
    this.color = color;
    this.alpha = alpha;
  }

  _createClass(Snowflake, [{
    key: "update",
    value: function update() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$width = _ref2.width,
          width = _ref2$width === void 0 ? 0 : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? 0 : _ref2$height;

      var p = this.p,
          r = this.r,
          v = this.v;

      if (p.y - r > height) {
        this.p.y = 0 - r;
      }

      if (p.x - r > width) {
        this.p.x = 0 - r;
      }

      if (p.x + r < 0) {
        this.p.x = width + r;
      }

      this.p.add(v);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      var p = this.p,
          r = this.r,
          color = this.color,
          alpha = this.alpha;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.restore();
    }
  }]);

  return Snowflake;
}();

exports.Snowflake = Snowflake;
},{"./Vector":"../../src/utils/Vector.ts"}],"../../src/utils/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  assert: true,
  getRandom: true,
  debounce: true
};
exports.debounce = exports.getRandom = exports.assert = void 0;

var _Vector = require("./Vector");

Object.keys(_Vector).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Vector[key];
    }
  });
});

var _Snowflake = require("./Snowflake");

Object.keys(_Snowflake).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Snowflake[key];
    }
  });
});

var assert = function assert(condition, message) {
  if (!condition) throw Error("[let-it-go] ".concat(message));
};

exports.assert = assert;

var getRandom = function getRandom(min, max) {
  return Math.random() * (max - min) + min;
};

exports.getRandom = getRandom;

var debounce = function debounce(fn) {
  var ms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 250;
  var timeoutID;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    clearTimeout(timeoutID);
    timeoutID = setTimeout(function () {
      return fn.apply(void 0, args);
    }, ms);
  };
};

exports.debounce = debounce;
},{"./Vector":"../../src/utils/Vector.ts","./Snowflake":"../../src/utils/Snowflake.ts"}],"../../src/LetItGo.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LetItGo = exports.assertRange = void 0;

var _utils = require("./utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var assertRange = function assertRange(range) {
  (0, _utils.assert)(Array.isArray(range), 'range must be array');
  (0, _utils.assert)(range.length === 2, 'range size must be 2');
  (0, _utils.assert)(range.every(function (value) {
    return typeof value === 'number';
  }), 'range value must be number');
};

exports.assertRange = assertRange;
var DEFAULT_OPTIONS = {
  root: document.body,
  number: window.innerWidth,
  velocityXRange: [-3, 3],
  velocityYRange: [1, 5],
  radiusRange: [0.5, 1],
  color: '#ffffff',
  alphaRange: [0.8, 1],
  fps: 30
};

var LetItGo = /*#__PURE__*/function () {
  function LetItGo() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$root = _ref.root,
        root = _ref$root === void 0 ? DEFAULT_OPTIONS.root : _ref$root,
        _ref$number = _ref.number,
        number = _ref$number === void 0 ? DEFAULT_OPTIONS.number : _ref$number,
        _ref$velocityXRange = _ref.velocityXRange,
        velocityXRange = _ref$velocityXRange === void 0 ? DEFAULT_OPTIONS.velocityXRange : _ref$velocityXRange,
        _ref$velocityYRange = _ref.velocityYRange,
        velocityYRange = _ref$velocityYRange === void 0 ? DEFAULT_OPTIONS.velocityYRange : _ref$velocityYRange,
        _ref$radiusRange = _ref.radiusRange,
        radiusRange = _ref$radiusRange === void 0 ? DEFAULT_OPTIONS.radiusRange : _ref$radiusRange,
        _ref$color = _ref.color,
        color = _ref$color === void 0 ? DEFAULT_OPTIONS.color : _ref$color,
        _ref$alphaRange = _ref.alphaRange,
        alphaRange = _ref$alphaRange === void 0 ? DEFAULT_OPTIONS.alphaRange : _ref$alphaRange,
        _ref$fps = _ref.fps,
        fps = _ref$fps === void 0 ? DEFAULT_OPTIONS.fps : _ref$fps;

    _classCallCheck(this, LetItGo);

    this.isGo = false;
    this.canvas = document.createElement('canvas');
    this.snowflakes = [];
    this.intervalID = null;
    this.requestID = null;

    this._update = function () {
      return _this.snowflakes.forEach(function (snowflake) {
        return snowflake.update(_this.canvas);
      });
    };

    this._draw = function () {
      var _this$canvas = _this.canvas,
          width = _this$canvas.width,
          height = _this$canvas.height;

      _this.ctx.clearRect(0, 0, width, height);

      _this.snowflakes.forEach(function (snowflake) {
        return snowflake.draw(_this.ctx);
      });

      requestAnimationFrame(_this._draw);
    };

    assertRange(velocityXRange);
    assertRange(velocityYRange);
    assertRange(radiusRange);
    assertRange(alphaRange);
    this.root = root;
    this._number = number;
    this._velocityXRange = velocityXRange.sort();
    this._velocityYRange = velocityYRange.sort();
    this._radiusRange = radiusRange.sort();
    this._color = color;
    this._alphaRange = alphaRange.sort();
    this.fps = fps;
    var ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('[let-it-go] The 2d context canvas is not supported.');
    this.ctx = ctx;

    this._mountCanvas();

    this._createSnowflakes();

    this._init();
  }

  _createClass(LetItGo, [{
    key: "_resizeCanvas",
    value: function _resizeCanvas() {
      var _this$root = this.root,
          clientWidth = _this$root.clientWidth,
          clientHeight = _this$root.clientHeight;
      this.canvas.width = clientWidth;
      this.canvas.height = clientHeight;
    }
  }, {
    key: "_mountCanvas",
    value: function _mountCanvas() {
      var _this2 = this;

      this.root.style.position = 'relative';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.zIndex = '-1';

      this._resizeCanvas();

      window.addEventListener('resize', (0, _utils.debounce)(function () {
        return _this2._resizeCanvas();
      }));
      this.root.appendChild(this.canvas);
    }
  }, {
    key: "_createSnowflakes",
    value: function _createSnowflakes() {
      var number = this.number,
          color = this.color,
          canvas = this.canvas,
          velocityXRange = this.velocityXRange,
          velocityYRange = this.velocityYRange,
          radiusRange = this.radiusRange,
          alphaRange = this.alphaRange;
      this.snowflakes = Array.from({
        length: number
      }, function () {
        return new _utils.Snowflake({
          p: new _utils.Vec2D((0, _utils.getRandom)(0, canvas.width), (0, _utils.getRandom)(0, -canvas.height)),
          v: new _utils.Vec2D(_utils.getRandom.apply(void 0, _toConsumableArray(velocityXRange)) || Number.MIN_VALUE, _utils.getRandom.apply(void 0, _toConsumableArray(velocityYRange)) || Number.MIN_VALUE),
          r: _utils.getRandom.apply(void 0, _toConsumableArray(radiusRange)) || Number.MIN_VALUE,
          color: color,
          alpha: _utils.getRandom.apply(void 0, _toConsumableArray(alphaRange)) || Number.MIN_VALUE
        });
      });
    }
  }, {
    key: "_init",
    value: function _init() {
      if (this.isGo) return;
      this.intervalID = setInterval(this._update, 1000 / this.fps);
      this.requestID = requestAnimationFrame(this._draw);
      this.isGo = true;
    }
  }, {
    key: "letItStop",
    value: function letItStop() {
      var intervalID = this.intervalID,
          requestID = this.requestID;
      if (!intervalID || !requestID) return;
      clearInterval(intervalID);
      cancelAnimationFrame(requestID);
      this.isGo = false;
    }
  }, {
    key: "letItGoAgain",
    value: function letItGoAgain() {
      this._init();
    }
  }, {
    key: "clear",
    value: function clear() {
      this.letItStop();
      this.root.removeChild(this.canvas);
      window.removeEventListener('resize', this._resizeCanvas);
    }
  }, {
    key: "number",
    get: function get() {
      return this._number;
    },
    set: function set(number) {
      this._number = number;

      this._createSnowflakes();
    }
  }, {
    key: "velocityXRange",
    get: function get() {
      return this._velocityXRange;
    },
    set: function set(range) {
      var _this3 = this;

      assertRange(range);
      this._velocityXRange = range.sort();
      this.snowflakes.forEach(function (snowflake) {
        snowflake.v.x = _utils.getRandom.apply(void 0, _toConsumableArray(_this3._velocityXRange));
      });
    }
  }, {
    key: "velocityYRange",
    get: function get() {
      return this._velocityYRange;
    },
    set: function set(range) {
      var _this4 = this;

      assertRange(range);
      this._velocityYRange = range.sort();
      this.snowflakes.forEach(function (snowflake) {
        snowflake.v.y = _utils.getRandom.apply(void 0, _toConsumableArray(_this4._velocityYRange));
      });
    }
  }, {
    key: "radiusRange",
    get: function get() {
      return this._radiusRange;
    },
    set: function set(range) {
      var _this5 = this;

      assertRange(range);
      this._radiusRange = range.sort();
      this.snowflakes.forEach(function (snowflake) {
        snowflake.r = _utils.getRandom.apply(void 0, _toConsumableArray(_this5._radiusRange));
      });
    }
  }, {
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(color) {
      this._color = color;
      this.snowflakes.forEach(function (snowflake) {
        snowflake.color = color;
      });
    }
  }, {
    key: "alphaRange",
    get: function get() {
      return this._alphaRange;
    },
    set: function set(range) {
      var _this6 = this;

      assertRange(range);
      this._alphaRange = range.sort();
      this.snowflakes.forEach(function (snowflake) {
        snowflake.alpha = _utils.getRandom.apply(void 0, _toConsumableArray(_this6.alphaRange));
      });
    }
  }]);

  return LetItGo;
}();

exports.LetItGo = LetItGo;
LetItGo.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
var _default = LetItGo;
exports.default = _default;
},{"./utils":"../../src/utils/index.ts"}],"../../src/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LetItGo = require("./LetItGo");

Object.keys(_LetItGo).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _LetItGo[key];
    }
  });
});
},{"./LetItGo":"../../src/LetItGo.ts"}],"js/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRangeInputs = exports.bindRangeInputs = exports.bindColorInput = exports.bindNumberInput = exports.bindSwitch = exports.bindResetBtn = void 0;

var _src = require("../../../src");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var DEFAULT_OPTIONS = _src.LetItGo.DEFAULT_OPTIONS;

var bindResetBtn = function bindResetBtn(snow) {
  var resetBtn = document.querySelector('#reset');
  resetBtn.addEventListener('click', function () {
    snow.letItGoAgain();
    snow.number = DEFAULT_OPTIONS.number;
    snow.color = DEFAULT_OPTIONS.color;
    snow.velocityXRange = DEFAULT_OPTIONS.velocityXRange;
    snow.velocityYRange = DEFAULT_OPTIONS.velocityYRange;
    snow.radiusRange = DEFAULT_OPTIONS.radiusRange;
    snow.alphaRange = DEFAULT_OPTIONS.alphaRange;
  });
};

exports.bindResetBtn = bindResetBtn;

var bindSwitch = function bindSwitch(snow) {
  var stop = 'Let It Stop ⛄️';
  var go = 'Let It Go ☃️';
  var switchInput = document.querySelector('#is-snow');
  var switchLabel = document.querySelector('[for="is-snow"]');
  switchInput.checked = true;
  switchLabel.textContent = stop;
  switchInput.addEventListener('change', function (_ref) {
    var target = _ref.target;

    if (target.checked) {
      snow.letItGoAgain();
      switchLabel.textContent = stop;
      return;
    }

    snow.letItStop();
    switchLabel.textContent = go;
  });
};

exports.bindSwitch = bindSwitch;

var bindNumberInput = function bindNumberInput(snow) {
  var numberInput = document.querySelector('#number');
  numberInput.value = "".concat(DEFAULT_OPTIONS.number);
  numberInput.addEventListener('input', function (_ref2) {
    var target = _ref2.target;
    snow.number = +target.value;
  });
};

exports.bindNumberInput = bindNumberInput;

var bindColorInput = function bindColorInput(snow) {
  var colorInput = document.querySelector('#color');
  colorInput.value = DEFAULT_OPTIONS.color;
  colorInput.addEventListener('input', function (_ref3) {
    var target = _ref3.target;
    snow.color = target.value;
  });
};

exports.bindColorInput = bindColorInput;

var bindRangeInputs = function bindRangeInputs(snow, rangeOptions) {
  rangeOptions.forEach(function (_ref4) {
    var type = _ref4.type;

    var _DEFAULT_OPTIONS$ = _slicedToArray(DEFAULT_OPTIONS["".concat(type, "Range")], 2),
        v1 = _DEFAULT_OPTIONS$[0],
        v2 = _DEFAULT_OPTIONS$[1];

    var updateLabel = function updateLabel() {
      var label = document.querySelector("#".concat(type, "-range-label"));
      label.textContent = label.textContent.replace(/\(.*\)/, "(".concat([v1, v2].sort().join(' to '), ")"));
    };

    var v1Input = document.querySelector("#".concat(type, "-range-value-1"));
    v1Input.value = "".concat(v1);
    v1Input.addEventListener('change', function (_ref5) {
      var target = _ref5.target;
      var value = target.value;
      v1 = +value;
      snow["".concat(type, "Range")] = [v1, v2];
      updateLabel();
    });
    var v2Input = document.querySelector("#".concat(type, "-range-value-2"));
    v2Input.value = "".concat(v2);
    v2Input.addEventListener('change', function (_ref6) {
      var target = _ref6.target;
      var value = target.value;
      v2 = +value;
      snow["".concat(type, "Range")] = [v1, v2];
      updateLabel();
    });
    updateLabel();
  });
};

exports.bindRangeInputs = bindRangeInputs;

var createRangeInputs = function createRangeInputs(container, rangeOptions) {
  var template = function template(_ref7) {
    var type = _ref7.type,
        min = _ref7.min,
        max = _ref7.max;
    return "\n  <fieldset class=\"form-group\">\n      <label id=\"".concat(type, "-range-label\">\u2744\uFE0F ").concat(type, " range ()</label>\n\n      <input\n        type=\"range\"\n        class=\"custom-range\"\n        min=\"").concat(min, "\"\n        max=\"").concat(max, "\"\n        value=\"0\"\n        id=\"").concat(type, "-range-value-1\"\n      />\n      <input\n        type=\"range\"\n        class=\"custom-range\"\n        min=\"").concat(min, "\"\n        max=\"").concat(max, "\"\n        value=\"0\"\n        id=\"").concat(type, "-range-value-2\"\n      />\n    </fieldset>\n  ");
  };

  container.innerHTML = rangeOptions.map(function (option) {
    return template(option);
  }).join();
};

exports.createRangeInputs = createRangeInputs;
},{"../../../src":"../../src/index.ts"}],"js/main.ts":[function(require,module,exports) {
"use strict";

var _src = require("../../../src");

var _utils = require("./utils");

// import { LetItGo } from 'let-it-go';
var rangeOptions = [{
  type: 'velocityX',
  min: -100,
  max: 100
}, {
  type: 'velocityY',
  min: -100,
  max: 100
}, {
  type: 'radius',
  min: 0,
  max: 50
}, {
  type: 'alpha',
  min: 0,
  max: 1
}];
(0, _utils.createRangeInputs)(document.getElementById('ranges-container'), rangeOptions);
document.addEventListener('DOMContentLoaded', function () {
  var snow = new _src.LetItGo({
    root: document.getElementById('let-it-go')
  });
  (0, _utils.bindResetBtn)(snow);
  (0, _utils.bindSwitch)(snow);
  (0, _utils.bindNumberInput)(snow);
  (0, _utils.bindColorInput)(snow);
  (0, _utils.bindRangeInputs)(snow, rangeOptions);
});
},{"../../../src":"../../src/index.ts","./utils":"js/utils.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62783" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.ts"], null)
//# sourceMappingURL=/main.7ebd0bc5.js.map