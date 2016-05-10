import { run, enqueue } from './control'
var perFrame = 16
var limit = 10
var balance = limit
var goal = perFrame
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
  styleDuration = styleStart ? (styleEnd - styleStart) : goal
  scriptDuration = scriptEnd - scriptStart
  scriptStart = now()
  // console.log(limit)
  // console.log(styleDuration);

  // calculate limit
  if (goal <= styleDuration && styleDuration < goal + 1 &&
      styleDuration !== 0) {
    accelerate = accelerate * 2
    limit += accelerate
  } else if (styleDuration >= goal + 1) {
    accelerate = 1
    limit = Math.floor(limit / 2)
  } else if (styleDuration === 0) {
    // This is a skipped frame
  }
  if (limit < 1)
    limit = 1
  if (!run(limit)) // stop {
    stop()
  scriptEnd = now()
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


function now() {
  return performance.now() || Date.now()
}

export function stop() {
  accelerate = 1 // for slow start
  isRunning = false
}
export function start() {
  scriptStart = null
  scriptEnd = null
  styleStart = null
  styleEnd = null
  isRunning = true
  requestAnimationFrame(frame)

}
export function put(priority, callback, times) {
  enqueue(priority, callback, times)
  if (!isRunning)
    start()
}
