var rAF = requestAnimationFrame

var Schedule = {}
var queue = []
var limit = 1500
var isRunning = false
var accelerate = 1 // for slow start

var scriptStart
var scriptEnd
var styleStart
var styleEnd

var styleDuration
var scriptDuration

for (let i = 0; i < 100; i ++) queue.push([])


function frame(frameStart) {
  if (!isRunning) return
  styleEnd = frameStart

  styleDuration = styleEnd - styleStart
  scriptDuration = scriptEnd - scriptStart

  scriptStart = now()


  // console.log(styleDuration)
  // console.log(scriptDuration)
  if (scriptDuration < 17) {
    accelerate = accelerate * 2
    limit += accelerate * 10
  }
  else {
    hit = true
    accelerate = Math.floor(accelerate / 2)
    limit = Math.floor(limit / 2)
  }
  console.log(limit)
  if (limit < 1)
    limit = 1
  var count = limit
  for (let i = 0; i < queue.length; i ++) {
    if (count < 1) break
    let level = queue[i]
    while (level.length) {
      if (count < 1) break
      level.shift()()
      count --
    }
    if (i === queue.length - 1)
      Schedule.stop()
  }

  scriptEnd = now()
  styleStart = now()

  rAF(frame)
}

function now() {
  return performance.now() || Date.now()
}
Schedule.stop = function() {
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
  while (times--) 
    queue[priority].push(callback)
  if (!isRunning)
    Schedule.start()
}
