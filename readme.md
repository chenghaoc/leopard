# Leopard

60 fps pages made easy.

Leopard is a performant, heuristic scheduler for building user interface.

Leopard eliminat janky experiences by scheduling DOM related operation automatically. For page with heavy DOM manipulation, Leopard will batch update related manipulation. For page with heavy JavaScript calculation, Leopard will delay the calculation for avoiding janky experience.

You can call Leopard a **No brainer Progrssive renderer**.

### Usage

##### Schedule user actions with high priority

```javascript
let level = 50
while (level --)
Leopard.put(level, function () {
  // DOM manipulation
})
Leopard.start()
```

##### Listen on specific level completeness.

```javascript

```



### Installation

```sh
npm install leopard.js
```



### API

`Leopard.put(level, callback)`

`Leopard.start(options)`

`Leopard.stop()`

### Events

`Leopard.on()`

`Leopard.once()`

### Options

`limit`

`expectedFrame`

`strategy`

`perf`

### Concept

The algorithm that calculating maximun callback each frames can execute is inspired by TCP congestion control.

The scheduler for scheduling the prioritised process is based on *Fixed priority none-preemptive scheduling*. You can specify the pripority of tasks by yourself, but be careful about the tasks number you assign to scheduler, too many tasks will cause [starvation](https://en.wikipedia.org/wiki/Starvation_(computer_science)).

### Browser Support



### License

MIT


