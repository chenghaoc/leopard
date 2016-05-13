import now from './now'
import {
  start,
  stop,
  put,
  l
} from './congestion'
import emitter from './emitter'
import rAF from './rAF'

var Leopard = {
  on: emitter.on.bind(emitter),
  once: emitter.once.bind(emitter),
  start,
  stop,
  put,
  get limit() {
    return l()
  }
}

if (typeof exports === 'object')
    module.exports = Leopard
else if (typeof define === 'function' && typeof define.amd !== 'undefined')
  define(function() { return Leopard })
else
  window.Leopard = Leopard
