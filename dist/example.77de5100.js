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
})({"../src/main.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = exports.calcProjectedStart = exports.calcStarts = void 0;

var parseToParts = function parseToParts(inputString) {
  var docMatches = inputString.match(/([0-9A-Z_a-z]+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+[0-9A-Z_a-z]+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+[0-9A-Z_a-z]+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+[0-9A-Z_a-z]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+([\s\S]*)/m);

  if (docMatches === null) {
    throw Error('the content is not formatted correct.');
  }

  var header = docMatches[1],
      rawData = docMatches[2];
  var headerPartsMatches = header.match(/([0-9A-Z_a-z]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+([0-9A-Z_a-z]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+([0-9A-Z_a-z]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+([0-9A-Z_a-z]+)/m);

  if (headerPartsMatches === null) {
    throw Error('the header is not formatted correct.');
  }

  var typeStr = headerPartsMatches[1],
      widthStr = headerPartsMatches[2],
      heightStr = headerPartsMatches[3],
      maxStr = headerPartsMatches[4];
  var type = typeStr;
  var width = +widthStr;
  var height = +heightStr;
  var max = +maxStr;
  return {
    type: type,
    dimension: {
      width: width,
      height: height
    },
    max: max,
    rawData: rawData
  };
};

exports.calcStarts = function (perRow, mag, projectedStart) {
  var result = [];

  for (var row = 0; row < mag; row++) {
    for (var col = 0; col < mag; col++) {
      result.push(projectedStart + row * perRow + col * 4); // 3 + 0, 3 + 1
    }
  }

  return result;
};

exports.calcProjectedStart = function (unitDocWidth, mag, i) {
  var row = Math.floor(i / unitDocWidth) * mag;
  var col = i % unitDocWidth / 3 * mag;
  var perRow = unitDocWidth / 3 * 4 * mag;
  return row * perRow + col * 4;
};

var parseData = function parseData(doc, mag) {
  var dimension = doc.dimension,
      max = doc.max,
      rawData = doc.rawData;
  var width = dimension.width,
      height = dimension.height;
  var size = width * mag * (height * mag) * 4;
  var array = rawData.split(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/m).filter(function (_) {
    return _ !== '' && _ !== ' ';
  });
  return array.reduce(function (prev, curr, i, array) {
    if (i % 3 === 0) {
      var r_1 = 255 * (+array[i] / max);
      var g_1 = 255 * (+array[i + 1] / max);
      var b_1 = 255 * (+array[i + 2] / max);
      var a_1 = 255;

      if (isNaN(r_1) || isNaN(g_1) || isNaN(b_1)) {
        return prev;
      }

      var projectedStart = exports.calcProjectedStart(width * 3, mag, i);
      var projected = exports.calcStarts(width * mag * 4, mag, projectedStart);
      projected.forEach(function (projectedStart) {
        prev.set([r_1, g_1, b_1, a_1], projectedStart);
      });
      return prev;
    }

    return prev;
  }, new Uint8ClampedArray(size));
};

var formatOutput = function formatOutput(doc, rgba, mag) {
  return {
    dimension: {
      height: doc.dimension.height * mag,
      width: doc.dimension.width * mag
    },
    rawData: doc.rawData,
    max: doc.max,
    type: doc.type,
    rgba: rgba
  };
};

exports.parse = function (inputStr, mag) {
  var doc = parseToParts(inputStr);
  var rgba = parseData(doc, mag);
  return formatOutput(doc, rgba, mag);
};
},{}],"index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var main_1 = require("../src/main");

var fileEl = document.querySelector('#file');
var canvasEl = document.querySelector('#image');
var magEl = document.querySelector('#mag-input');
var magDisplayEl = document.querySelector('#mag-value');
var magValue = +magEl.value;
magEl.addEventListener('change', function (evt) {
  var value = evt.target.value;
  var numValue = +value;

  if (isNaN(numValue)) {
    throw Error('not a number');
  }

  magValue = numValue;
  magDisplayEl.innerHTML = magValue.toString();
});
fileEl.addEventListener('change', function (evt) {
  var fileList = evt.target.files;
  var reader = new FileReader();

  reader.onload = function (evt) {
    var _a;

    var ctx = canvasEl.getContext('2d');

    var _b = main_1.parse((_a = evt.target) === null || _a === void 0 ? void 0 : _a.result, magValue),
        dimension = _b.dimension,
        rgba = _b.rgba;

    var width = dimension.width,
        height = dimension.height;
    canvasEl.width = width;
    canvasEl.height = height;
    console.log(width, height, rgba);
    var data = new ImageData(rgba, width, height);
    ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(data, 0, 0);
  };

  reader.readAsText(fileList[0]);
});
},{"../src/main":"../src/main.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "7721" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/example.77de5100.js.map