# [Leopard](http://changbenny.github.io/leopard/)

<a href='https://travis-ci.org/changbenny/leopard'>
  <img src='https://img.shields.io/travis/changbenny/leopard.svg'>
</a>
<a href='https://coveralls.io/github/changbenny/leopard?branch=master'>
  <img src='https://img.shields.io/coveralls/changbenny/leopard.svg'>
</a>
<img src='https://img.shields.io/npm/v/leopard.js.svg'>
<img src='https://img.shields.io/npm/l/leopard.js.svg?maxAge=2592000'>

> 60 FPS pages made easy.

Performant, heuristic scheduler for building user interface (Just 4 kb gzipped).

[Leopard](http://changbenny.github.io/leopard/) eliminates jank from websites by scheduling page interactions automatically. For pages with heavy DOM manipulation, Leopard will batch update related manipulation. For pages with heavy JavaScript calculation, Leopard will schedule the calculation for avoiding jank.

## Install

```sh
npm install leopard.js
```

```html
<script src="build/leopard.min.js"></script>
```

## Examples

- [Lists with large amount of items](http://changbenny.github.io/leopard/demo/)
- [Image processing](http://changbenny.github.io/leopard/demo/image.html)

## Usage

#### Schedule user actions with high priority

```javascript
target.addEventListener('click', function(e) {
  Leopard.put(1, function() {
    // feedback of user actions
  })
})
Leopard.put(10, function() {
  // sync the data, upload analysis data, etc.
})
Leopard.start()
```

#### Listen events

```javascript
Leopard.put(2, function() {
  console.log('priority 2: task')
})
Leopard.put(1, function() {
  console.log('priority 1: first task')
})
Leopard.put(1, function() {
  console.log('priority 1: second task')
})
Leopard.on(1, function () {
  console.log('priority 1: complete')
})
Leopard.start()

```

Output:

```javascript
priority 1: first task
priority 1: second task
priority 1: complete
priority 2: task
```



## API

#### `Leopard.put(priority, callback)`

`priority` Integer between 0 to 1000, lower value, higher priority.

Enqueue a task with specific priority to the Scheduler.

#### `Leopard.start([options])`

Start Leopard, the [options](#options) is for optional advanced setting.

#### `Leopard.stop()`

Stop Leopard and flush the unfinished tasks in the scheduler queue.

### Events

When all tasks in one priority queue finish, Leopard will fire an event. Your can listen to the specific priority queue.

#### `Leopard.on(priority, callback)`

#### `Leopard.once(priority, callback)`

### Options

| Name     | Type    | Usage                                    | Default  |
| -------- | ------- | ---------------------------------------- | -------- |
| limit    | Integer | The limit of actions can be executed per frame. Leopard will adjust this value based on the browser performance. If each actions in scheduler queue costs many resources, then decrease this option. | 1000     |
| strategy | String  | The batching strategy. For pages with heavy DOM manipulation (a lot of page re-layout, re-paint), you should set the option to `batch`. Leopard will batch update and avoid too many page re-paint. Otherwise, keep this option as `normal`, Leopard will schedule those operation for avoiding jank. | 'normal' |
| perf     | Float   | Tune the performance. Bigger the number, better perfmance , but lower FPS. | 2.0      |
| autoStop | Boolean | automatically stop if there's no tasks in scheduler queue. | false    |

## Concept

The algorithm for calculating maximum actions per frames is inspired by *TCP congestion control*. 

The scheduler for scheduling the prioritised actions is based on *Fixed priority none-preemptive scheduling*. You specify the priority of tasks by yourself. Be careful about number of tasks you assign to the scheduler. Too many tasks in a scheduler queue will cause [Starvation](https://en.wikipedia.org/wiki/Starvation_(computer_science)).



## Browser Support

| Chrome | Firefox | IE   | Safari |
| :----- | :------ | :--- | :----- |
| latest | latest  | 9+   | latest |

## License

MIT


