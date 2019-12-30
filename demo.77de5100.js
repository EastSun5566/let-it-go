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
})({"node_modules/let-it-go/dist/index.js":[function(require,module,exports) {
var define;
!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i((t=t||self)["let-it-go"]={})}(this,(function(t){"use strict";function i(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function e(t,i){for(var e=0;e<i.length;e++){var n=i[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function n(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}function o(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}function a(t,i){return function(t){if(Array.isArray(t))return t}(t)||function(t,i){if(!(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t)))return;var e=[],n=!0,o=!1,a=void 0;try{for(var r,s=t[Symbol.iterator]();!(n=(r=s.next()).done)&&(e.push(r.value),!i||e.length!==i);n=!0);}catch(t){o=!0,a=t}finally{try{n||null==s.return||s.return()}finally{if(o)throw a}}return e}(t,i)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var r=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;i(this,t),this.x=e,this.y=n}return n(t,[{key:"add",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=t.x,e=void 0===i?0:i,n=t.y,o=void 0===n?0:n;return this.x+=e,this.y+=o,this}}]),t}(),s=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=e.p,a=void 0===n?new r:n,s=e.v,h=void 0===s?new r:s,l=e.r,u=void 0===l?.5:l,c=e.color,v=void 0===c?"#fff":c,d=e.alpha,f=void 0===d?1:d;i(this,t),o(this,"p",void 0),o(this,"v",void 0),o(this,"r",void 0),o(this,"color",void 0),o(this,"alpha",void 0),this.p=a,this.v=h,this.r=u,this.color=v,this.alpha=f}return n(t,[{key:"update",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=t.width,e=void 0===i?window.innerWidth:i,n=t.height,o=void 0===n?window.innerHeight:n,a=this.p,r=this.r,s=this.v;a.y+r>o&&(this.p.y=0),a.x+r>e&&(this.p.x=0),a.x-r<0&&(this.p.x=e),this.p=this.p.add(s)}},{key:"draw",value:function(t){var i=this.p,e=this.r,n=this.color,o=this.alpha;t.save(),t.beginPath(),t.arc(i.x,i.y,e,0,2*Math.PI),t.closePath(),t.fillStyle=n,t.globalAlpha=o,t.fill(),t.restore()}}]),t}(),h=function(t,i){return Math.random()*(i-t)+t},l=function(){function t(){var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=n.number,s=void 0===r?window.innerWidth:r,h=n.velocityXRange,l=a(h=void 0===h?[-3,3]:h,2),u=l[0],c=l[1],v=n.velocityYRange,d=a(v=void 0===v?[1,5]:v,2),f=d[0],p=d[1],y=n.radiusRange,w=a(y=void 0===y?[.5,1]:y,2),g=w[0],m=w[1],b=n.color,x=void 0===b?"#fff":b,R=n.alphaRange,k=a(R=void 0===R?[.8,1]:R,2),I=k[0],_=k[1],A=n.fps,D=void 0===A?30:A;i(this,t),o(this,"number",void 0),o(this,"velocityXRange",void 0),o(this,"velocityYRange",void 0),o(this,"radiusRange",void 0),o(this,"color",void 0),o(this,"alphaRange",void 0),o(this,"fps",void 0),o(this,"canvas",document.createElement("canvas")),o(this,"ctx",void 0),o(this,"snowflakes",[]),o(this,"intervalID",null),o(this,"requestID",null),o(this,"_update",(function(){return e.snowflakes.forEach((function(t){return t.update(e.canvas)}))})),o(this,"_draw",(function(){var t=e.canvas,i=t.width,n=t.height;e.ctx.clearRect(0,0,i,n),e.snowflakes.forEach((function(t){return t.draw(e.ctx)})),requestAnimationFrame(e._draw)})),this.number=s,this.velocityXRange=[u,c],this.velocityYRange=[f,p],this.radiusRange=[g,m],this.color=x,this.alphaRange=[I,_],this.fps=D;var S=this.canvas.getContext("2d");if(!S)throw new Error("The 2d context canvas is not supported.");this.ctx=S,this._mountCanvas(),this._createSnowflakes(),this._init()}return n(t,[{key:"_mountCanvas",value:function(){var t=this,i=function(){t.canvas.width=window.innerWidth,t.canvas.height=window.innerHeight};i(),window.addEventListener("resize",i),document.body.appendChild(this.canvas)}},{key:"_createSnowflakes",value:function(){var t=this.color,i=this.canvas,e=a(this.velocityXRange,2),n=e[0],o=e[1],l=a(this.velocityYRange,2),u=l[0],c=l[1],v=a(this.radiusRange,2),d=v[0],f=v[1],p=a(this.alphaRange,2),y=p[0],w=p[1];this.snowflakes=Array.from({length:this.number},(function(){return new s({p:new r(h(0,i.width),h(0,-i.height)),v:new r(h(n,o),h(u,c)),r:h(d,f),color:t,alpha:h(y,w)})}))}},{key:"_init",value:function(){this.intervalID=setInterval(this._update,1e3/this.fps),this.requestID=requestAnimationFrame(this._draw)}},{key:"letItStop",value:function(){this.intervalID&&this.requestID&&(clearInterval(this.intervalID),cancelAnimationFrame(this.requestID))}},{key:"letItGoAgain",value:function(){this._init()}},{key:"clear",value:function(){this.letItStop(),document.body.removeChild(this.canvas)}}]),t}();t.LetItGo=l,t.default=l,Object.defineProperty(t,"__esModule",{value:!0})}));

},{}],"index.ts":[function(require,module,exports) {
"use strict";

var _letItGo = require("let-it-go");

// eslint-disable-next-line no-new
new _letItGo.LetItGo();
},{"let-it-go":"node_modules/let-it-go/dist/index.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55281" + '/');

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
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/demo.77de5100.js.map