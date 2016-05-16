'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Emitter = function Emitter() {
  this.uid = 0;
  this.handlers = [];
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
var singletonEmitter = new Emitter()

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

;(function () {
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
  /* istanbul ignore if */
  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
})();

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
  /* istanbul ignore next */
  Date.now = Date.now || function () {
    // thanks IE8
    return new Date().getTime();
  };

  if ('now' in window.performance == false) {

    var nowOffset = Date.now();
    /* istanbul ignore next */
    if (window.performance.timing && window.performance.timing.navigationStart) {
      nowOffset = window.performance.timing.navigationStart;
    }

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }
})();

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
      count--;
      var callback = level.shift();
      if (callback && typeof callback === 'function') callback();
      if (!level.length) {
        singletonEmitter.emit(i);
      }
    }
    /* istanbul ignore if */
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
function flush() {
  for (var _i = 0; _i < levels; _i++) {
    queue[_i].length = 0;
  }counter = 0;
}

var perFrame = 16;

// options
var expectedFrame = perFrame;
var limit = 1000;
var count = limit;
var strategy = 'normal';
var perf = 2;
var autoStop = false;

var isRunning = false;
var accelerate = 1; // for slow start

var scriptStart;
var scriptEnd;
var styleStart;
var styleEnd;

var styleDuration;
var scriptDuration;

function frame(frameStart) {
  if (!isRunning) return;
  // calculate metrix
  styleEnd = frameStart;
  styleDuration = styleStart ? styleEnd - styleStart : expectedFrame;
  scriptDuration = scriptEnd - scriptStart;

  var inc = true;
  var dec = true;
  // calculate limit
  if (strategy === 'batch') {
    // will try to batch up all update
    inc = scriptDuration < expectedFrame + 1;
    dec = scriptDuration >= expectedFrame + 1;
  } else {
    inc = styleDuration >= expectedFrame && styleDuration < expectedFrame + 1 && styleDuration !== 0;
    dec = styleDuration >= expectedFrame + 1;
  }
  if (inc) {
    accelerate = accelerate * perf;
    count += accelerate;
  } else if (dec) {
    accelerate = 1;
    count = Math.floor(count / 2);
    /* istanbul ignore next */
  } else if (styleDuration === 0) {
      // This is a skipped frame
    }
  if (count < 1) count = 1;
  scriptStart = window.performance.now();
  var continueRun = run(count);
  if (!continueRun && autoStop) return;
  scriptEnd = window.performance.now();
  styleStart = frameStart;

  window.requestAnimationFrame(frame);
  if (window && window.requestIdleCallback) {
    // For browsers which support requestIdleCallback
    /* istanbul ignore next */
    window.requestIdleCallback(function (deadline) {
      if (deadline.timeRemaining() > 0) {
        var ratio = deadline.timeRemaining() / perFrame;
        run(Math.floor(count * ratio));
      }
    });
  }
}

function stop() {
  accelerate = 1; // for slow start
  count = limit;
  isRunning = false;
  flush();
}
function start() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (!isRunning) window.requestAnimationFrame(frame);
  options.limit && (limit = count = options.limit);
  options.expectedFrame && (expectedFrame = options.expectedFrame);
  options.strategy && (strategy = options.strategy);
  options.perf && (perf = options.perf);
  options.autoStop && (autoStop = options.autoStop);
  scriptStart = null;
  scriptEnd = null;
  styleStart = null;
  styleEnd = null;
  isRunning = true;
}
function put(priority, callback, times) {
  enqueue(priority, callback, times);
}
function getCount() {
  return count;
}

var Leopard = {
  on: singletonEmitter.on.bind(singletonEmitter),
  once: singletonEmitter.once.bind(singletonEmitter),
  start: start,
  stop: stop,
  put: put,
  get limit() {
    return getCount();
  }
};

if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') module.exports = Leopard;else if (typeof define === 'function' && typeof define.amd !== 'undefined') define(function () {
  return Leopard;
});else window.Leopard = Leopard;