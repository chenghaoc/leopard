import emitter from './emitter'

import {
  start,
  stop,
  put,
  getCount
} from './congestion'


var Leopard = {
  on: emitter.on.bind(emitter),
  once: emitter.once.bind(emitter),
  start,
  stop,
  put
}

if (typeof exports === 'object')
    module.exports = Leopard
else if (typeof define === 'function' && typeof define.amd !== 'undefined')
  define(function() { return Leopard })
else
  window.Leopard = Leopard
