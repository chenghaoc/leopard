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
var singletonEmitter = new Emitter()
export default singletonEmitter
