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
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self)["let-it-go"]={})}(this,(function(t){"use strict";function e(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function n(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}function r(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function o(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(t)))return;var i=[],n=!0,r=!1,o=void 0;try{for(var a,s=t[Symbol.iterator]();!(n=(a=s.next()).done)&&(i.push(a.value),!e||i.length!==e);n=!0);}catch(t){r=!0,o=t}finally{try{n||null==s.return||s.return()}finally{if(r)throw o}}return i}(t,e)||function(t,e){if(!t)return;if("string"==typeof t)return a(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);"Object"===i&&t.constructor&&(i=t.constructor.name);if("Map"===i||"Set"===i)return Array.from(t);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return a(t,e)}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}var s=function(){function t(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;e(this,t),this.x=i,this.y=n}return n(t,[{key:"add",value:function(t){var e=t.x,i=void 0===e?0:e,n=t.y,r=void 0===n?0:n;return this.x+=i,this.y+=r,this}}]),t}(),h=function(){function t(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=i.p,o=void 0===n?new s:n,a=i.v,h=void 0===a?new s:a,l=i.r,u=void 0===l?.5:l,c=i.color,v=void 0===c?"#fff":c,d=i.alpha,f=void 0===d?1:d;e(this,t),r(this,"p",void 0),r(this,"v",void 0),r(this,"r",void 0),r(this,"color",void 0),r(this,"alpha",void 0),this.p=o,this.v=h,this.r=u,this.color=v,this.alpha=f}return n(t,[{key:"update",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,i=void 0===e?window.innerWidth:e,n=t.height,r=void 0===n?window.innerHeight:n,o=this.p,a=this.r,s=this.v;o.y-a>r&&(this.p.y=0-a),o.x-a>i&&(this.p.x=0-a),o.x+a<0&&(this.p.x=i+a),this.p.add(s)}},{key:"draw",value:function(t){var e=this.p,i=this.r,n=this.color,r=this.alpha;t.save(),t.beginPath(),t.arc(e.x,e.y,i,0,2*Math.PI),t.closePath(),t.fillStyle=n,t.globalAlpha=r,t.fill(),t.restore()}}]),t}(),l=function t(e,i){return Math.random()*(i-e)+e||t(e,i)},u=function(){function t(){var i=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},a=n.number,s=void 0===a?window.innerWidth:a,h=n.velocityXRange,l=o(h=void 0===h?[-3,3]:h,2),u=l[0],c=l[1],v=n.velocityYRange,d=o(v=void 0===v?[1,5]:v,2),f=d[0],p=d[1],y=n.radiusRange,g=o(y=void 0===y?[.5,1]:y,2),w=g[0],m=g[1],b=n.color,x=void 0===b?"#fff":b,R=n.alphaRange,k=o(R=void 0===R?[.8,1]:R,2),I=k[0],_=k[1],A=n.fps,S=void 0===A?30:A;e(this,t),r(this,"number",void 0),r(this,"velocityXRange",void 0),r(this,"velocityYRange",void 0),r(this,"radiusRange",void 0),r(this,"color",void 0),r(this,"alphaRange",void 0),r(this,"fps",void 0),r(this,"canvas",document.createElement("canvas")),r(this,"ctx",void 0),r(this,"snowflakes",[]),r(this,"intervalID",null),r(this,"requestID",null),r(this,"_update",(function(){return i.snowflakes.forEach((function(t){return t.update(i.canvas)}))})),r(this,"_draw",(function(){var t=i.canvas,e=t.width,n=t.height;i.ctx.clearRect(0,0,e,n),i.snowflakes.forEach((function(t){return t.draw(i.ctx)})),requestAnimationFrame(i._draw)})),this.number=s,this.velocityXRange=[u,c],this.velocityYRange=[f,p],this.radiusRange=[w,m],this.color=x,this.alphaRange=[I,_],this.fps=S;var j=this.canvas.getContext("2d");if(!j)throw new Error("The 2d context canvas is not supported.");this.ctx=j,this._mountCanvas(),this._createSnowflakes(),this._init()}return n(t,[{key:"_mountCanvas",value:function(){var t=this,e=function(){var e=window,i=e.innerWidth,n=e.innerHeight;t.canvas.width=i,t.canvas.height=n};e(),window.addEventListener("resize",e),document.body.appendChild(this.canvas)}},{key:"_createSnowflakes",value:function(){var t=this.color,e=this.canvas,i=o(this.velocityXRange,2),n=i[0],r=i[1],a=o(this.velocityYRange,2),u=a[0],c=a[1],v=o(this.radiusRange,2),d=v[0],f=v[1],p=o(this.alphaRange,2),y=p[0],g=p[1];this.snowflakes=Array.from({length:this.number},(function(){return new h({p:new s(l(0,e.width),l(0,-e.height)),v:new s(l(n,r),l(u,c)),r:l(d,f),color:t,alpha:l(y,g)})}))}},{key:"_init",value:function(){this.intervalID=setInterval(this._update,1e3/this.fps),this.requestID=requestAnimationFrame(this._draw)}},{key:"letItStop",value:function(){var t=this.intervalID,e=this.requestID;t&&e&&(clearInterval(t),cancelAnimationFrame(e))}},{key:"letItGoAgain",value:function(){this._init()}},{key:"clear",value:function(){this.letItStop(),document.body.removeChild(this.canvas)}}]),t}();t.LetItGo=u,t.default=u,Object.defineProperty(t,"__esModule",{value:!0})}));

},{}],"main.ts":[function(require,module,exports) {
"use strict";

var _letItGo = require("let-it-go");

var snow = new _letItGo.LetItGo();
document.querySelector('#switch-input').addEventListener('change', function (_ref) {
  var target = _ref.target;
  if (target.checked) snow.letItGoAgain();else snow.letItStop();
});
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61379" + '/');

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
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.c39d6dcf.js.map