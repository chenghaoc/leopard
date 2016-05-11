'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// @license http://opensource.org/licenses/MIT
// copyright Paul Irish 2015

// Date.now() is supported everywhere except IE8. For IE8 we use the Date.now polyfill
//   github.com/Financial-Times/polyfill-service/blob/master/polyfills/Date.now/polyfill.js
// as Safari 6 doesn't have support for NavigationTiming, we use a Date.now() timestamp for relative values

// if you want values similar to what you'd get with real perf.now, place this towards the head of the page
// but in reality, you're just getting the delta between now() calls, so it's not terribly important where it's placed

(function () {

  if ('performance' in window == false) {
    window.performance = {};
  }

  Date.now = Date.now || function () {
    // thanks IE8
    return new Date().getTime();
  };

  if ('now' in window.performance == false) {

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }
})();

var Emitter = function Emitter() {
  this.uid = 0;
  this.handlers = [];
  // FIX 1000
  for (var i = 0; i < 1000; i++) {
    this.handlers.push([]);
  }
};
Emitter.prototype.on = function (level, callback) {
  this.handlers[level].push({
    id: this.uid++,
    action: callback
  });
};
Emitter.prototype.emit = function (level) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  this.handlers[level].forEach(function (handler) {
    if (typeof handler.action === 'function') handler.action.apply(handler, args);
  });
};
Emitter.prototype.once = function (level, callback) {
  var _this = this;

  var id = this.uid;
  this.on(level, function () {
    callback.apply(undefined, arguments);
    var handler = _this.handlers[level].find(function (handler) {
      return handler.id === id;
    });
    _this.handlers[level].splice(_this.handlers[level].indexOf(handler), 1);
    // delete handler
  });
};
var singletonEmitter = new Emitter();

var queue = [];
var counter = 0;
var levels = 1000;

for (var i = 0; i < levels; i++) {
  queue.push([]);
}function run(count) {
  for (var i = 0; i < queue.length; i++) {
    if (count < 1) break;
    var level = queue[i];
    while (level.length) {
      if (count < 1) break;
      counter--;
      // the bigger of level, the less emergent to complete
      // So we deduce more for higher level (lower priority) actions
      count = count - i * i;
      var callback = level.shift();
      if (callback && typeof callback === 'function') callback();
      if (!level.length) {
        singletonEmitter.emit(i);
      }
    }
    if (i === queue.length - 1 && counter === 0) {
      return false;
    }
  }
  return true;
}
function enqueue(priority, callback, times) {
  if (!times) {
    queue[priority].push(callback);
    counter++;
  } else {
    while (times--) {
      queue[priority].push(callback);
      counter++;
    }
  }
}

var perFrame = 16;

var expectedFrame = perFrame;
var limit = 10;
var focus = 'smooth';

// var balance = options.limit
var isRunning = false;
var accelerate = 1; // for slow start

var scriptStart;
var scriptEnd;
var styleStart;
var styleEnd;

var styleDuration;
var scriptDuration;

var c = 1;
var sum = 0;
function frame(frameStart) {
  if (!isRunning) return;

  // calculate metrix
  styleEnd = frameStart;
  styleDuration = styleStart ? styleEnd - styleStart : expectedFrame;
  scriptDuration = scriptEnd - scriptStart;

  var inc = true;
  var dec = true;
  // console.log(scriptDuration);
  sum += limit;
  c++;
  console.log(styleDuration);
  // calculate limit
  if (focus === 'script') {
    inc = scriptDuration < expectedFrame + 1;
    dec = scriptDuration >= expectedFrame + 1;
  } else if (focus === 'style') {
    inc = true;
    dec = false;
  } else {
    inc = styleDuration >= expectedFrame && styleDuration < expectedFrame + 1 && styleDuration !== 0;
    dec = styleDuration >= expectedFrame + 1;
  }

  if (inc) {
    accelerate = accelerate * 2;
    limit += accelerate;
  } else if (dec) {
    accelerate = 1;
    limit = Math.floor(limit / 2);
  } else if (styleDuration === 0) {
    // This is a skipped frame
  }
  if (limit < 1) limit = 1;
  scriptStart = performance.now();
  if (!run(limit)) // stop {
    stop();
  scriptEnd = performance.now();
  styleStart = frameStart;

  requestAnimationFrame(frame);
  if (window && window.requestIdleCallback) {
    // For browsers which support requestIdleCallback
    requestIdleCallback(function (deadline) {
      if (deadline.timeRemaining() > 0) {
        var ratio = deadline.timeRemaining() / perFrame;
        run(Math.floor(limit * ratio));
      }
    });
  }
}

function stop() {
  accelerate = 1; // for slow start
  isRunning = false;
}
function start() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (isRunning) return;
  options.limit && (limit = options.limit);
  options.expectedFrame && (expectedFrame = options.expectedFrame);
  options.focus && (focus = options.focus);
  scriptStart = null;
  scriptEnd = null;
  styleStart = null;
  styleEnd = null;
  isRunning = true;

  return requestAnimationFrame(frame);
}
function put(priority, callback, times) {
  enqueue(priority, callback, times);
  if (!isRunning) start();
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
})();

var Leopard = {
  on: singletonEmitter.on.bind(singletonEmitter),
  once: singletonEmitter.once.bind(singletonEmitter),
  start: start,
  stop: stop,
  put: put
};

if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') module.exports = Leopard;else if (typeof define === 'function' && typeof define.amd !== 'undefined') define(function () {
  return Leopard;
});else window.Leopard = Leopard;