import test from 'ava'
import 'babel-register'
import {
  start,
  stop,
  put,
  getCount
} from '../src/congestion'
import emitter from '../src/emitter'

test.beforeEach(t => {
  
})
test.afterEach(t => {
  stop()
})

test('start(options)', t => {
  start({
    limit: 100
  })
  t.is(getCount(), 100)
})

test.cb('put() and start(): multiple times', t => {
  var results = []
  put(2, function() {
    results.push(1)
  }, 200)
  
  start()
  t.is(results.length, 0)
  setTimeout(() => {
    t.true(results.length < 200)
    t.end()
  }, 16)
})

test.cb('put() and start(): single time', t => {
  var results = []
  put(1, function() {
    results.push(1)
  })
  
  start()
  t.is(results.length, 0)
  setTimeout(() => {
    t.is(results.length, 1)
    t.end()
  }, 16)
})

test.cb('put() and start(): limit < 1', t => {
  var results = []
  put(1, function() {
    results.push(1)
  })
  
  start({
    limit: -100
  })
  t.is(results.length, 0)
  setTimeout(() => {
    t.is(results.length, 1)
    t.end()
  }, 16)
})

test.cb('put() and start(): multiple multiple times', t => {
  var results = []
  put(3, function() {
    results.push(1)
  }, 20000)
  
  start()
  t.is(results.length, 0)
  setTimeout(() => {
    t.true(results.length < 200)
    t.end()
  }, 16)
})

test.cb('put() and start(): long frame with script strategy', t => {
  var results = []
  put(1, function() {
    var times = 1000000
    while (times --)
      results.push(1)
  }, 2)
  
  // force the limit to become 1
  start({
    limit: -10000,
    strategy: 'script'
  })
  t.is(results.length, 0)
  setTimeout(() => {
    t.true(results.length <= 2000000)
    t.end()
  }, 16)
})

test.cb('put() and start(): long frame with style strategy, limit will decrease if janky', t => {
  var results = []
  put(1, function() {
    var times = 1000000
    while (times --)
      results.push(1)
  }, 10)
  
  // force the limit to become 1
  start({
    limit: -10000,
    strategy: 'style'
  })
  t.is(results.length, 0)
  setTimeout(() => {
    t.true(results.length <= 10000000)
    t.end()
  }, 100)
})

test.cb('emitter once()', t => {
  var results = []
  put(500, function() {
    results.push(1)
  })
  emitter.once(500, function() {
    results.push(1)
  })
  start()
  setTimeout(() => {
    t.is(results.length, 2)
    t.end()
  }, 50)
})
