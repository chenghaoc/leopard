import { run, enqueue } from './schedule'

const perFrame = 16

var expectedFrame = perFrame
var limit = 10
var focus = 'smooth'

// var balance = options.limit
var isRunning = false
var accelerate = 1 // for slow start

var scriptStart
var scriptEnd
var styleStart
var styleEnd

var styleDuration
var scriptDuration

var c = 1
var sum = 0
function frame(frameStart) {
  if (!isRunning) return

  // calculate metrix
  styleEnd = frameStart
  styleDuration = styleStart ? (styleEnd - styleStart) : expectedFrame
  scriptDuration = scriptEnd - scriptStart
  

  var inc = true
  var dec = true
  // console.log(scriptDuration);
  sum += limit
  c ++
  console.log(styleDuration);
  // calculate limit
  if (focus === 'script') {
    inc = 
      (scriptDuration < expectedFrame + 1)
    dec = 
      (scriptDuration >= expectedFrame + 1)
  } else if (focus === 'style') {
    inc = true
    dec = false
  } else {
    inc = 
      (styleDuration >= expectedFrame) && 
      (styleDuration < expectedFrame + 1) &&
      (styleDuration !== 0)
    dec = 
      (styleDuration >= expectedFrame + 1)
  }
    
  if (inc) {
    accelerate = accelerate * 2
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
  accelerate = 1 // for slow start
  isRunning = false
}
export function start(options = {}) {
  if (isRunning) return
  options.limit && (limit = options.limit)
  options.expectedFrame && (expectedFrame = options.expectedFrame)
  options.focus && (focus = options.focus)
  scriptStart = null
  scriptEnd = null
  styleStart = null
  styleEnd = null
  isRunning = true

  return requestAnimationFrame(frame)
}
export function put(priority, callback, times) {
  enqueue(priority, callback, times)
  if (!isRunning)
    start()
}
