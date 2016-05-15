import emitter from './emitter'

var queue = []
var counter = 0
var levels = 1000

for (let i = 0; i < levels; i ++) queue.push([])

export function run(count) {
  for (var i = 0; i < queue.length; i ++) {
    if (count < 1) break
    var level = queue[i]
    while (level.length) {
      if (count < 1) break
      counter --
      // the bigger of level, the less emergent to complete
      // So we deduce more for higher level (lower priority) actions
      count --
      var callback = level.shift()
      if (callback && typeof callback === 'function') callback()
      if (!level.length) {
        emitter.emit(i)
      }
    }
    /* istanbul ignore if */
    if (i === queue.length - 1 && counter === 0) {
      return false
    }
  }
  return true
}
export function enqueue(priority, callback, times) {
  if (!times) {
    queue[priority].push(callback)
    counter ++
  } else {
    while (times--)  {
      queue[priority].push(callback)
      counter ++
    }
  }
}
export function flush() {
  for (let i = 0; i < levels; i ++) queue[i].length = 0
  counter = 0
}
