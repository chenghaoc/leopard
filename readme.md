# Leopard

> 60 fps pages made easy.
>

Performant, heuristic scheduler for building user interface (Just 4 kb gzipped).

Leopard eliminat janky experiences by scheduling DOM related operation automatically. For page with heavy DOM manipulation, Leopard will batch update related manipulation. For page with heavy JavaScript calculation, Leopard will delay the calculation for avoiding janky experience.

## Examples

- [Animation example](http://changbenny.github.io/leoaprd/demo/animation.html)
- [JavaScript calculation example](http://changbenny.github.io/leoaprd/demo/js-heavy.html)

## Usage

#### Schedule user actions with high priority

```javascript
let level = 50
while (level --) {
  Leopard.put(level, function () {
    // DOM manipulation
  })
}
Leopard.start()
```

#### Listen on specific level completeness.

```javascript
Leopard.put(2, function() {
  console.log('level 2: task')
})
Leopard.put(1, function() {
  console.log('level 1: first task')
})
Leopard.put(1, function() {
  console.log('level 1: second task')
})
Leopard.on(1, function () {
  console.log('level 1: complete')
})
```

Output:

```javascript
level 1: first task
level 1: second task
level 1: complete
level 2: task
```

#### Doing background data analysis.

```javascript
target.addEventListener('click', function(e) {
  Leopard.put(1, doAnimation)
})
Leopard.put(10, syncData)
```



## Installation

```sh
npm install leopard.js
```



## API

#### `Leopard.put(level, callback)`

`level` Integer between 0 to 1000, lower level, higher priority.

Enqueue a task to the Scheduler.

#### `Leopard.start(options)`

Start Leopard, the [options](#options) is for optional advanced setting.

#### `Leopard.stop()`

Stop Leopard.

### Events

#### `Leopard.on(level, callback)`

#### `Leopard.once(level, callback)`

### Options

| Name     | Type    | Usage                                    | Default  |
| -------- | ------- | ---------------------------------------- | -------- |
| limit    | Integer | The limit of actions can be executed per frame. Leopard will adjust this value based on browser performance. | 1000     |
| strategy | String  | The batching strategy. For pages with heavy DOM manipulation (means lots of page re-layout, re-paint), you should set the value to `batch`, Leopard will batch update. For pages with heavy Calculation with JavaScript, set the option to `normal`, Leopard will schedule those operation for avoiding janky experience. | 'script' |
| perf     | Float   | Tune the performance. Bigger the number, better perfmance , but lower FPS. | 2.0      |

## Concept

The algorithm that calculating maximun callback each frames can execute is inspired by TCP congestion control.

The scheduler for scheduling the prioritised process is based on *Fixed priority none-preemptive scheduling*. You can specify the pripority of tasks by yourself, but be careful about the tasks number you assign to scheduler, too many tasks will cause [starvation](https://en.wikipedia.org/wiki/Starvation_(computer_science)).

## Browser Support

| Chrome | Firefox | IE   | Safari |
| ------ | ------- | ---- | ------ |
| latest | latest  | 9+   | latest |

## License

MIT


