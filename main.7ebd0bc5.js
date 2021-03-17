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
})({"../node_modules/let-it-go/dist/index.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertRange = exports.assertRadiusRange = exports.assertAlphaRange = exports.LetItGo = exports.DEFAULT_OPTIONS = void 0;

function t(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}

function e(t, e) {
  for (var i = 0; i < e.length; i++) {
    var n = e[i];
    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
  }
}

function i(t, i, n) {
  return i && e(t.prototype, i), n && e(t, n), t;
}

function n(t, e, i) {
  return e in t ? Object.defineProperty(t, e, {
    value: i,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = i, t;
}

function o(t) {
  return function (t) {
    if (Array.isArray(t)) return r(t);
  }(t) || function (t) {
    if ("undefined" != typeof Symbol && Symbol.iterator in Object(t)) return Array.from(t);
  }(t) || function (t, e) {
    if (!t) return;
    if ("string" == typeof t) return r(t, e);
    var i = Object.prototype.toString.call(t).slice(8, -1);
    "Object" === i && t.constructor && (i = t.constructor.name);
    if ("Map" === i || "Set" === i) return Array.from(t);
    if ("Arguments" === i || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)) return r(t, e);
  }(t) || function () {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }();
}

function r(t, e) {
  (null == e || e > t.length) && (e = t.length);

  for (var i = 0, n = new Array(e); i < e; i++) n[i] = t[i];

  return n;
}

var a = function () {
  function e() {
    var i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
    t(this, e), this.x = i, this.y = n;
  }

  return i(e, [{
    key: "add",
    value: function (t) {
      var e = t.x,
          i = void 0 === e ? 0 : e,
          n = t.y,
          o = void 0 === n ? 0 : n;
      return this.x += i, this.y += o, this;
    }
  }]), e;
}(),
    s = function () {
  function e() {
    var i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        o = i.p,
        r = void 0 === o ? new a() : o,
        s = i.v,
        h = void 0 === s ? new a() : s,
        u = i.r,
        l = void 0 === u ? .5 : u,
        c = i.color,
        v = void 0 === c ? "#ffffff" : c,
        f = i.alpha,
        d = void 0 === f ? 1 : f;
    t(this, e), n(this, "p", void 0), n(this, "v", void 0), n(this, "r", void 0), n(this, "color", void 0), n(this, "alpha", void 0), this.p = r, this.v = h, this.r = l, this.color = v, this.alpha = d;
  }

  return i(e, [{
    key: "update",
    value: function () {
      var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
          e = t.width,
          i = void 0 === e ? 0 : e,
          n = t.height,
          o = void 0 === n ? 0 : n,
          r = this.p,
          a = this.r,
          s = this.v;
      r.y - a > o && (this.p.y = 0 - a), r.x - a > i && (this.p.x = 0 - a), r.x + a < 0 && (this.p.x = i + a), this.p.add(s);
    }
  }, {
    key: "draw",
    value: function (t) {
      var e = this.p,
          i = this.r,
          n = this.color,
          o = this.alpha;
      t.save(), t.beginPath(), t.arc(e.x, e.y, i, 0, 2 * Math.PI), t.closePath(), t.fillStyle = n, t.globalAlpha = o, t.fill(), t.restore();
    }
  }]), e;
}(),
    h = function (t, e) {
  if (!t) throw Error("[let-it-go] ".concat(e));
},
    u = function (t, e) {
  return Math.random() * (e - t) + t;
},
    l = function (t) {
  h(Array.isArray(t), "range must be array"), h(2 === t.length, "range size must be 2"), h(t.every(function (t) {
    return "number" == typeof t;
  }), "range value must be number");
},
    c = function (t) {
  l(t), h(t.every(function (t) {
    return t >= 0;
  }), "radius range value must be positive");
},
    v = function (t) {
  l(t), h(t.every(function (t) {
    return t >= 0 && t <= 1;
  }), "alpha range value must be from 0 to 1");
},
    f = {
  root: document.body,
  number: window.innerWidth,
  velocityXRange: [-3, 3],
  velocityYRange: [1, 5],
  radiusRange: [.5, 1],
  color: "#ffffff",
  alphaRange: [.8, 1],
  fps: 30
},
    d = function () {
  function e() {
    var i = this,
        o = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        r = o.root,
        a = void 0 === r ? f.root : r,
        s = o.number,
        h = void 0 === s ? f.number : s,
        u = o.velocityXRange,
        d = void 0 === u ? f.velocityXRange : u,
        y = o.velocityYRange,
        p = void 0 === y ? f.velocityYRange : y,
        g = o.radiusRange,
        m = void 0 === g ? f.radiusRange : g,
        b = o.color,
        w = void 0 === b ? f.color : b,
        R = o.alphaRange,
        _ = void 0 === R ? f.alphaRange : R,
        k = o.fps,
        I = void 0 === k ? f.fps : k;

    t(this, e), n(this, "root", void 0), n(this, "isGo", !1), n(this, "_number", void 0), n(this, "_velocityXRange", void 0), n(this, "_velocityYRange", void 0), n(this, "_radiusRange", void 0), n(this, "_color", void 0), n(this, "_alphaRange", void 0), n(this, "fps", void 0), n(this, "canvas", document.createElement("canvas")), n(this, "ctx", void 0), n(this, "snowflakes", []), n(this, "intervalID", null), n(this, "requestID", null), n(this, "update", function () {
      return i.snowflakes.forEach(function (t) {
        return t.update(i.canvas);
      });
    }), n(this, "draw", function () {
      var t = i.canvas,
          e = t.width,
          n = t.height;
      i.ctx.clearRect(0, 0, e, n), i.snowflakes.forEach(function (t) {
        return t.draw(i.ctx);
      }), requestAnimationFrame(i.draw);
    }), l(d), l(p), c(m), v(_), this.root = a, this._number = h, this._velocityXRange = d.sort(), this._velocityYRange = p.sort(), this._radiusRange = m.sort(), this._color = w, this._alphaRange = _.sort(), this.fps = I;
    var A = this.canvas.getContext("2d");
    if (!A) throw new Error("[let-it-go] The 2d context canvas is not supported.");
    this.ctx = A, this.mountCanvas(), this.createSnowflakes(), this.init();
  }

  return i(e, [{
    key: "number",
    get: function () {
      return this._number;
    },
    set: function (t) {
      this._number = t, this.createSnowflakes();
    }
  }, {
    key: "velocityXRange",
    get: function () {
      return this._velocityXRange;
    },
    set: function (t) {
      l(t);
      var e = t.sort();
      this._velocityXRange = e, this.snowflakes.forEach(function (t) {
        t.v.x = u.apply(void 0, o(e));
      });
    }
  }, {
    key: "velocityYRange",
    get: function () {
      return this._velocityYRange;
    },
    set: function (t) {
      l(t);
      var e = t.sort();
      this._velocityYRange = e, this.snowflakes.forEach(function (t) {
        t.v.y = u.apply(void 0, o(e));
      });
    }
  }, {
    key: "radiusRange",
    get: function () {
      return this._radiusRange;
    },
    set: function (t) {
      c(t);
      var e = t.sort();
      this._radiusRange = e, this.snowflakes.forEach(function (t) {
        t.r = u.apply(void 0, o(e));
      });
    }
  }, {
    key: "color",
    get: function () {
      return this._color;
    },
    set: function (t) {
      this._color = t, this.snowflakes.forEach(function (e) {
        e.color = t;
      });
    }
  }, {
    key: "alphaRange",
    get: function () {
      return this._alphaRange;
    },
    set: function (t) {
      v(t);
      var e = t.sort();
      this._alphaRange = e, this.snowflakes.forEach(function (t) {
        t.alpha = u.apply(void 0, o(e));
      });
    }
  }]), i(e, [{
    key: "resizeCanvas",
    value: function () {
      var t = this.root,
          e = t.clientWidth,
          i = t.clientHeight;
      this.canvas.width = e, this.canvas.height = i;
    }
  }, {
    key: "mountCanvas",
    value: function () {
      var t = this;
      this.root.style.position = "relative", this.canvas.style.position = "absolute", this.canvas.style.top = "0", this.canvas.style.left = "0", this.canvas.style.zIndex = "-1", this.resizeCanvas(), window.addEventListener("resize", function (t) {
        var e,
            i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 250;
        return function () {
          for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++) o[r] = arguments[r];

          clearTimeout(e), e = setTimeout(function () {
            return t.apply(void 0, o);
          }, i);
        };
      }(function () {
        return t.resizeCanvas();
      })), this.root.appendChild(this.canvas);
    }
  }, {
    key: "createSnowflakes",
    value: function () {
      var t = this._number,
          e = this._color,
          i = this.canvas,
          n = this._velocityXRange,
          r = this._velocityYRange,
          h = this._radiusRange,
          l = this._alphaRange;
      this.snowflakes = Array.from({
        length: t
      }, function () {
        return new s({
          p: new a(u(0, i.width), u(0, -i.height)),
          v: new a(u.apply(void 0, o(n)) || Number.MIN_VALUE, u.apply(void 0, o(r)) || Number.MIN_VALUE),
          r: u.apply(void 0, o(h)) || Number.MIN_VALUE,
          color: e,
          alpha: u.apply(void 0, o(l)) || Number.MIN_VALUE
        });
      });
    }
  }, {
    key: "init",
    value: function () {
      this.isGo || (this.intervalID = setInterval(this.update, 1e3 / this.fps), this.requestID = requestAnimationFrame(this.draw), this.isGo = !0);
    }
  }, {
    key: "letItStop",
    value: function () {
      var t = this.intervalID,
          e = this.requestID;
      t && (clearInterval(t), this.intervalID = null), e && (cancelAnimationFrame(e), this.requestID = null), this.isGo = !1;
    }
  }, {
    key: "letItGoAgain",
    value: function () {
      this.init();
    }
  }, {
    key: "clear",
    value: function () {
      this.letItStop(), this.root.removeChild(this.canvas), window.removeEventListener("resize", this.resizeCanvas);
    }
  }]), e;
}();

exports.LetItGo = d;
exports.DEFAULT_OPTIONS = f;
exports.assertAlphaRange = v;
exports.assertRadiusRange = c;
exports.assertRange = l;
n(d, "DEFAULT_OPTIONS", f);
},{}],"js/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRangeInputs = exports.bindRangeInputs = exports.bindColorInput = exports.bindNumberInput = exports.bindSwitch = exports.bindResetBtn = exports.setupToggle = void 0;

var _letItGo = require("let-it-go");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var DEFAULT_OPTIONS = _letItGo.LetItGo.DEFAULT_OPTIONS;

var setupToggle = function setupToggle() {
  var DOWN = '👇';
  var UP = '☝️';
  var isDown = false;
  var toggle = document.getElementById('toggle');
  var option = document.getElementById('option');
  toggle.textContent = DOWN;
  toggle.addEventListener('click', function () {
    if (isDown) {
      option.style.bottom = '16px';
      toggle.textContent = DOWN;
      isDown = false;
      return;
    }

    option.style.bottom = "".concat(-option.offsetHeight + toggle.offsetHeight + 24, "px");
    toggle.textContent = UP;
    isDown = true;
  });
};

exports.setupToggle = setupToggle;

var bindResetBtn = function bindResetBtn(snow) {
  document.querySelector('#reset').addEventListener('click', function () {
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
  var STOP = '⛄️';
  var GO = '☃️';
  var switchInput = document.querySelector('#is-snow');
  var switchLabel = document.querySelector('[for="is-snow"]');
  switchInput.checked = true;
  switchLabel.textContent = STOP;
  switchInput.addEventListener('change', function (_ref) {
    var target = _ref.target;

    if (target.checked) {
      snow.letItGoAgain();
      switchLabel.textContent = STOP;
      return;
    }

    snow.letItStop();
    switchLabel.textContent = GO;
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
        max = _ref7.max,
        step = _ref7.step;
    return "\n  <fieldset class=\"form-group\">\n      <label id=\"".concat(type, "-range-label\">\u2744\uFE0F ").concat(type.toUpperCase(), " RANGE ()</label>\n\n      <input\n        type=\"range\"\n        class=\"custom-range\"\n        min=\"").concat(min, "\"\n        max=\"").concat(max, "\"\n        ").concat(step && "step=\"".concat(step, "\""), "\n        value=\"0\"\n        id=\"").concat(type, "-range-value-1\"\n      />\n      <input\n        type=\"range\"\n        class=\"custom-range\"\n        min=\"").concat(min, "\"\n        max=\"").concat(max, "\"\n        ").concat(step && "step=\"".concat(step, "\""), "\n        value=\"0\"\n        id=\"").concat(type, "-range-value-2\"\n      />\n    </fieldset>\n  ");
  };

  container.innerHTML = rangeOptions.map(function (option) {
    return template(option);
  }).join();
};

exports.createRangeInputs = createRangeInputs;
},{"let-it-go":"../node_modules/let-it-go/dist/index.esm.js"}],"js/main.ts":[function(require,module,exports) {
"use strict";

var _letItGo = require("let-it-go");

var _utils = require("./utils");

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
  max: 1,
  step: 0.1
}];
document.addEventListener('DOMContentLoaded', function () {
  (0, _utils.createRangeInputs)(document.getElementById('ranges-container'), rangeOptions);
  var snow = new _letItGo.LetItGo({
    root: document.getElementById('let-it-go')
  });
  (0, _utils.setupToggle)();
  (0, _utils.bindResetBtn)(snow);
  (0, _utils.bindSwitch)(snow);
  (0, _utils.bindNumberInput)(snow);
  (0, _utils.bindColorInput)(snow);
  (0, _utils.bindRangeInputs)(snow, rangeOptions);
});
},{"let-it-go":"../node_modules/let-it-go/dist/index.esm.js","./utils":"js/utils.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53241" + '/');

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