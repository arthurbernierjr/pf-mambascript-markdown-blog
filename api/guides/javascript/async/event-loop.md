---
title: "JavaScript Event Loop"
subTitle: "How JavaScript Handles Asynchronous Code"
excerpt: "Understanding the event loop is understanding JavaScript."
featureImage: "/img/js-event-loop.png"
date: "2026-02-01"
order: 23
---

# Explanation

## What is the Event Loop?

JavaScript is single-threaded but handles async operations through the event loop. It's how JavaScript manages concurrency without multiple threads.

### Key Components

- **Call Stack**: Where code executes (LIFO)
- **Web APIs**: Browser-provided async capabilities
- **Task Queue**: Callbacks waiting to execute (macrotasks)
- **Microtask Queue**: Promises, queueMicrotask (higher priority)

### Execution Order

```
1. Execute synchronous code (call stack)
2. Process all microtasks (promises)
3. Process one macrotask (setTimeout, setInterval)
4. Repeat from step 2
```

---

# Demonstration

## Example 1: Basic Event Loop

```javascript
console.log('1. Start');

setTimeout(() => {
    console.log('4. Timeout');
}, 0);

Promise.resolve().then(() => {
    console.log('3. Promise');
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. Promise
// 4. Timeout

// Why this order?
// 1. Sync code runs first (Start, End)
// 2. Microtasks (Promises) run next
// 3. Macrotasks (setTimeout) run last
```

## Example 2: Microtasks vs Macrotasks

```javascript
console.log('Script start');

// Macrotask
setTimeout(() => {
    console.log('setTimeout 1');
}, 0);

// Microtask
Promise.resolve()
    .then(() => console.log('Promise 1'))
    .then(() => console.log('Promise 2'));

// Another macrotask
setTimeout(() => {
    console.log('setTimeout 2');
}, 0);

// Microtask
queueMicrotask(() => {
    console.log('queueMicrotask');
});

console.log('Script end');

// Output:
// Script start
// Script end
// Promise 1
// queueMicrotask
// Promise 2
// setTimeout 1
// setTimeout 2

// Microtasks (Promise, queueMicrotask) always run
// before the next macrotask (setTimeout)
```

## Example 3: Nested Async Operations

```javascript
console.log('Start');

setTimeout(() => {
    console.log('Timeout 1');

    Promise.resolve().then(() => {
        console.log('Promise inside timeout');
    });
}, 0);

Promise.resolve().then(() => {
    console.log('Promise 1');

    setTimeout(() => {
        console.log('Timeout inside promise');
    }, 0);
});

setTimeout(() => {
    console.log('Timeout 2');
}, 0);

console.log('End');

// Output:
// Start
// End
// Promise 1
// Timeout 1
// Promise inside timeout
// Timeout 2
// Timeout inside promise

// Key insight: Microtasks from a macrotask run
// BEFORE the next macrotask
```

## Example 4: Real-World Implications

```javascript
// Problem: UI blocking
function heavySync() {
    const start = Date.now();
    while (Date.now() - start < 1000) {
        // Blocks for 1 second
    }
    console.log('Heavy computation done');
}

console.log('Before');
heavySync();  // UI freezes here
console.log('After');

// Solution: Break into chunks with setTimeout
function heavyAsync(data, callback) {
    const chunkSize = 100;
    let index = 0;

    function processChunk() {
        const end = Math.min(index + chunkSize, data.length);

        for (; index < end; index++) {
            // Process item
        }

        if (index < data.length) {
            setTimeout(processChunk, 0);  // Yield to event loop
        } else {
            callback();
        }
    }

    processChunk();
}

// Better solution: Use requestAnimationFrame for UI
function animateSmooth() {
    let position = 0;

    function step() {
        position += 1;
        element.style.left = position + 'px';

        if (position < 100) {
            requestAnimationFrame(step);  // Syncs with display refresh
        }
    }

    requestAnimationFrame(step);
}

// Best solution for heavy computation: Web Workers
const worker = new Worker('heavy-task.js');
worker.postMessage(data);
worker.onmessage = (e) => console.log('Result:', e.data);
```

## Example 5: async/await and the Event Loop

```javascript
async function example() {
    console.log('1. Async function start');

    await Promise.resolve();
    console.log('3. After await');

    return 'done';
}

console.log('0. Script start');

example().then(result => {
    console.log('4. Promise resolved:', result);
});

console.log('2. Script end');

// Output:
// 0. Script start
// 1. Async function start
// 2. Script end
// 3. After await
// 4. Promise resolved: done

// await pauses the async function and schedules
// continuation as a microtask

// Multiple awaits
async function multipleAwaits() {
    console.log('A');

    await 1;
    console.log('B');

    await 2;
    console.log('C');

    await 3;
    console.log('D');
}

console.log('Start');
multipleAwaits();
console.log('End');

// Output:
// Start
// A
// End
// B
// C
// D

// Each await creates a new microtask for the continuation
```

## Example 6: Common Pitfalls

```javascript
// Pitfall 1: Assuming setTimeout is precise
console.time('timeout');
setTimeout(() => {
    console.timeEnd('timeout');  // Often > 0ms
}, 0);

// Pitfall 2: Promise in setTimeout ordering
setTimeout(() => console.log('timeout 1'), 0);
setTimeout(() => {
    console.log('timeout 2');
    Promise.resolve().then(() => console.log('promise in timeout'));
}, 0);
setTimeout(() => console.log('timeout 3'), 0);

// Output:
// timeout 1
// timeout 2
// promise in timeout  (runs before timeout 3!)
// timeout 3

// Pitfall 3: Infinite microtask loop
function infiniteMicrotask() {
    Promise.resolve().then(infiniteMicrotask);
}
// infiniteMicrotask();  // This would hang the browser!

// Pitfall 4: this binding in callbacks
class Timer {
    constructor() {
        this.seconds = 0;
    }

    start() {
        // Wrong: 'this' is undefined/window
        // setInterval(function() {
        //     this.seconds++;  // Error!
        // }, 1000);

        // Correct: arrow function preserves 'this'
        setInterval(() => {
            this.seconds++;
        }, 1000);
    }
}
```

## Example 7: Visualizing the Event Loop

```javascript
// Simulation of event loop behavior
class EventLoopSimulator {
    constructor() {
        this.callStack = [];
        this.microtaskQueue = [];
        this.macrotaskQueue = [];
    }

    execute(fn, name) {
        console.log(`📥 Push to call stack: ${name}`);
        this.callStack.push(name);
        fn();
        this.callStack.pop();
        console.log(`📤 Pop from call stack: ${name}`);
    }

    scheduleMicrotask(fn, name) {
        console.log(`⏳ Schedule microtask: ${name}`);
        this.microtaskQueue.push({ fn, name });
    }

    scheduleMacrotask(fn, name) {
        console.log(`⏰ Schedule macrotask: ${name}`);
        this.macrotaskQueue.push({ fn, name });
    }

    runEventLoop() {
        // Process all microtasks
        while (this.microtaskQueue.length > 0) {
            const { fn, name } = this.microtaskQueue.shift();
            console.log(`🔄 Processing microtask: ${name}`);
            fn();
        }

        // Process one macrotask
        if (this.macrotaskQueue.length > 0) {
            const { fn, name } = this.macrotaskQueue.shift();
            console.log(`🔄 Processing macrotask: ${name}`);
            fn();

            // Check for new microtasks after macrotask
            this.runEventLoop();
        }
    }
}
```

**Key Takeaways:**
- JavaScript is single-threaded with an event loop
- Microtasks (Promises) have priority over macrotasks (setTimeout)
- Each macrotask is followed by all pending microtasks
- Long-running sync code blocks the event loop
- Use setTimeout/requestAnimationFrame to yield control

---

# Imitation

### Challenge 1: Predict the Output

**Task:** What does this code output?

```javascript
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => {
    console.log('C');
    setTimeout(() => console.log('D'), 0);
}).then(() => console.log('E'));
console.log('F');
```

<details>
<summary>Solution</summary>

```javascript
// Output:
// A
// F
// C
// E
// B
// D

// Explanation:
// 1. 'A' - sync
// 2. setTimeout 'B' scheduled (macrotask)
// 3. Promise .then 'C' scheduled (microtask)
// 4. 'F' - sync
// 5. Call stack empty, process microtasks:
//    - 'C' prints, schedules setTimeout 'D'
//    - 'E' prints (chained .then)
// 6. Process macrotasks:
//    - 'B' prints
// 7. Process macrotasks:
//    - 'D' prints
```

</details>

### Challenge 2: Implement a Task Scheduler

**Task:** Create a scheduler that processes tasks without blocking.

<details>
<summary>Solution</summary>

```javascript
class TaskScheduler {
    constructor(options = {}) {
        this.tasks = [];
        this.running = false;
        this.maxTimePerFrame = options.maxTimePerFrame || 10;
    }

    add(task) {
        this.tasks.push(task);
        if (!this.running) {
            this.run();
        }
    }

    run() {
        this.running = true;

        const processFrame = () => {
            const frameStart = performance.now();

            while (this.tasks.length > 0) {
                const elapsed = performance.now() - frameStart;

                if (elapsed >= this.maxTimePerFrame) {
                    // Yield to the event loop
                    requestAnimationFrame(processFrame);
                    return;
                }

                const task = this.tasks.shift();
                task();
            }

            this.running = false;
        };

        requestAnimationFrame(processFrame);
    }
}

// Usage
const scheduler = new TaskScheduler();

for (let i = 0; i < 1000; i++) {
    scheduler.add(() => {
        // Simulate work
        const result = Math.random() * Math.random();
    });
}

// UI stays responsive!
```

</details>

---

# Practice

### Exercise 1: Debounce with Microtasks
**Difficulty:** Intermediate

Implement a debounce function using queueMicrotask instead of setTimeout.

### Exercise 2: Priority Queue
**Difficulty:** Advanced

Create a task queue with priority levels:
- High priority uses microtasks
- Low priority uses macrotasks
- Cancelable tasks

---

## Summary

**What you learned:**
- How the event loop works
- Microtasks vs macrotasks priority
- Why code executes in certain orders
- How to avoid blocking the main thread
- async/await interaction with event loop

**Next Steps:**
- Read: [Web Workers](/api/guides/javascript/advanced/web-workers)
- Practice: Build a non-blocking task processor
- Explore: requestIdleCallback for background tasks

---

## Resources

- [MDN: Concurrency model and Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [Jake Archibald: In The Loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
