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

var Schedule = {}
var queue = []
var counter = 0
var limit = 10
var balance = limit
var goal = 17
var isRunning = false
var accelerate = 1 // for slow start
var multiplier = 2

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
  // styleEnd = frameStart

  
  styleEnd = frameStart
  styleDuration = styleEnd - styleStart
  scriptDuration = scriptEnd - scriptStart
  scriptStart = now()



  // console.log(styleDuration)
  // console.log(scriptDuration)
  // if (styleDuration < 17) {
    // console.log(styleDuration);
    console.log(styleDuration);
    if (styleDuration < goal && styleDuration !== 0) {
      accelerate = accelerate * 2
      limit += accelerate
      balance = limit
    } else if (styleDuration >= goal) {
      hit = true
      accelerate = 1
      limit = Math.floor(limit / 2)
    } else {}
  // } else {
  //   limit = limit * multiplier
  //   // multiplier = multiplier * 2
  // }
  if (limit < 1)
    limit = 1
  // console.log(accelerate);
  // console.log(styleDuration);
  var count = limit
  for (var i = 0; i < queue.length; i ++) {
    if (count < 1) break
    var level = queue[i]
    while (level.length) {
      if (count < 1) break
      counter --
      level.shift()()
      if (!level.length)
        emitter.emit(i)
      count --
    }
    if (i === queue.length - 1 && counter === 0)
      Schedule.stop()
  }

  scriptEnd = now()
  styleStart = frameStart
  rAF(frame)
}

function now() {
  return performance.now() || Date.now()
}
Schedule.stop = function() {
  console.log('stop');
  limit = balance
  accelerate = 1 // for slow start
  multiplier = 2
  isRunning = false
}
Schedule.start = function () {
  scriptStart = 0
  scriptEnd = 0
  styleStart = 0
  styleEnd = 0
  isRunning = true
  rAF(frame)
}
Schedule.put = function(priority, callback, times) {
  if (!times) {
    queue[priority].push(callback)
    counter ++
  }
  else {
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
