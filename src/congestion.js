import _ from './rAF'
import __ from './now'
import { run, enqueue, flush } from './schedule'


const perFrame = 16

// options
var expectedFrame = perFrame
var limit = 1000
var count = limit
var strategy = 'normal'
var perf = 2
var autoStop = false

var isRunning = false
var accelerate = 1 // for slow start

var scriptStart
var scriptEnd
var styleStart
var styleEnd

var styleDuration
var scriptDuration

function frame(frameStart) {
  if (!isRunning) return
  // calculate metrix
  styleEnd = frameStart
  styleDuration = styleStart ? (styleEnd - styleStart) : expectedFrame
  scriptDuration = scriptEnd - scriptStart

  var inc = true
  var dec = true
  // calculate limit
  if (strategy === 'batch') {
    // will try to batch up all update
    inc =
      (scriptDuration < expectedFrame + 1)
    dec =
      (scriptDuration >= expectedFrame + 1)
  } else {
    inc =
      (styleDuration >= expectedFrame) &&
      (styleDuration < expectedFrame + 1) &&
      (styleDuration !== 0)
    dec =
      (styleDuration >= expectedFrame + 1)
  }
  if (inc) {
    accelerate = accelerate * perf
    count += accelerate
  } else if (dec) {
    accelerate = 1
    count = Math.floor(count / 2)
    /* istanbul ignore next */
  } else if (styleDuration === 0) {
    // This is a skipped frame
  }
  if (count < 1)
    count = 1
  scriptStart = window.performance.now()
  var continueRun = run(count)
  if (!continueRun && autoStop)
    return
  scriptEnd = window.performance.now()
  styleStart = frameStart

  window.requestAnimationFrame(frame)
  if (window && window.requestIdleCallback) {
    // For browsers which support requestIdleCallback
    /* istanbul ignore next */
    window.requestIdleCallback(function(deadline) {
      if (deadline.timeRemaining() > 0) {
        var ratio = deadline.timeRemaining() / perFrame
        run(Math.floor(count * ratio))
      }
    })
  }
}

export function stop() {
  accelerate = 1 // for slow start
  count = limit
  isRunning = false
  flush()
}
export function start(options = {}) {
  if (!isRunning)
    window.requestAnimationFrame(frame)
  options.limit && (limit = count = options.limit)
  options.expectedFrame && (expectedFrame = options.expectedFrame)
  options.strategy && (strategy = options.strategy)
  options.perf && (perf = options.perf)
  options.autoStop && (autoStop = options.autoStop)
  scriptStart = null
  scriptEnd = null
  styleStart = null
  styleEnd = null
  isRunning = true
}
export function put(priority, callback, times) {
  enqueue(priority, callback, times)
}
export function getCount() {
  return count
}
