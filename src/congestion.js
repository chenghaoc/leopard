import { run, enqueue } from './schedule'

const perFrame = 16

var expectedFrame = perFrame
var limit = 1000
var strategy = 'style'
var perf = 2

// var balance = options.limit
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
  // console.log(scriptDuration);
  
  // calculate limit
  if (focus === 'style') {
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
    limit += accelerate
  } else if (dec) {
    accelerate = 1
    limit = Math.floor(limit / 2)
  } else if (styleDuration === 0) {
    // This is a skipped frame
  }
  if (limit < 1)
    limit = 1
  scriptStart = performance.now()
  if (!run(limit)) // stop {
    stop()
  scriptEnd = performance.now()
  styleStart = frameStart

  requestAnimationFrame(frame)
  if (window && window.requestIdleCallback) {
    // For browsers which support requestIdleCallback
    requestIdleCallback(function(deadline) {
      if (deadline.timeRemaining() > 0) {
        var ratio = deadline.timeRemaining() / perFrame
        run(Math.floor(limit * ratio))
      }
    })
  }
}

export function stop() {
  console.log('stop');
  accelerate = 1 // for slow start
  isRunning = false
}
export function start(options = {}) {
  if (!isRunning)
    requestAnimationFrame(frame)
  options.limit && (limit = options.limit)
  options.expectedFrame && (expectedFrame = options.expectedFrame)
  options.strategy && (strategy = options.strategy)
  options.perf && (perf = options.perf)
  scriptStart = null
  scriptEnd = null
  styleStart = null
  styleEnd = null
  isRunning = true
}
export function put(priority, callback, times) {
  enqueue(priority, callback, times)
  if (!isRunning)
    start()
}
export function l() {
  return limit
}
