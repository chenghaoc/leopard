var Emitter = function() {
  this.uid = 0
  this.handlers = []
  for (let i = 0; i < 1000; i ++) this.handlers.push([])
}
Emitter.prototype.on = function(level, callback) {
  this.handlers[level].push({
    id: this.uid ++,
    action: callback
  })
}
Emitter.prototype.emit = function(level, ...args) {
  this.handlers[level].forEach(handler => {
    if (typeof(handler.action) === 'function')
      handler.action(...args)
  })
}
Emitter.prototype.once = function(level, callback) {
  var id = this.uid
  this.on(level, (...args) => {
    callback(...args)
    var handler = this.handlers[level].find(handler => handler.id === id)
    this.handlers[level].splice(this.handlers[level].indexOf(handler), 1)
    // delete handler
  })
}

var rAF = requestAnimationFrame

var perFrame = 16
var Schedule = {}
var queue = []
var counter = 0
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
var emitter = new Emitter()

for (let i = 0; i < 1000; i ++) queue.push([])

function frame(frameStart) {
  if (!isRunning) return

  // calculate metrix
  styleEnd = frameStart
  styleDuration = styleStart ? (styleEnd - styleStart) : goal
  scriptDuration = scriptEnd - scriptStart
  scriptStart = now()
  // calculate limit
  if (goal < styleDuration && styleDuration < goal + 1 &&
      styleDuration !== 0) {
    accelerate = accelerate * 2
    limit += accelerate
  } else if (styleDuration >= goal) {
    accelerate = 1
    limit = Math.floor(limit / 2)
  } else if (styleDuration === 0) {
    // This is a skipped frame
  }
  if (limit < 1)
    limit = 1

  run(limit)
  scriptEnd = now()
  styleStart = frameStart
  
  rAF(frame)
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

function run(count) {
  for (var i = 0; i < queue.length; i ++) {
    if (count < 1) break
    var level = queue[i]
    while (level.length) {
      if (count < 1) break
      counter --
      // the bigger of level, the less emergent to complete
      // So we deduce more for higher level (lower priority) actions
      count = count - i * i
      var callback = level.shift()
      if (callback && typeof callback === 'function') callback()
      if (!level.length) emitter.emit(i)
    }
    if (i === queue.length - 1 && counter === 0)
      Schedule.stop()
  }
}

function now() {
  return performance.now() || Date.now()
}
Schedule.stop = function() {
  accelerate = 1 // for slow start
  multiplier = 2
  isRunning = false
}
Schedule.start = function() {
  scriptStart = null
  scriptEnd = null
  styleStart = null
  styleEnd = null
  isRunning = true
  rAF(frame)

}
Schedule.put = function(priority, callback, times) {
  if (!times) {
    queue[priority].push(callback)
    counter ++
  } else {
    while (times--)  {
      queue[priority].push(callback)
      counter ++
    }
  }
  if (!isRunning)
    Schedule.start()
}
Schedule.on = emitter.on.bind(emitter)
Schedule.once = emitter.once.bind(emitter)
