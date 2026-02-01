---
title: "JavaScript Scope"
subTitle: "Where Variables Live"
excerpt: "Understanding scope is understanding JavaScript."
featureImage: "/img/js-scope.png"
date: "2026-02-01"
order: 7
---

# Explanation

## What is Scope?

Scope determines where variables are accessible in your code. Understanding scope prevents bugs, helps with memory management, and is essential for closures.

### Key Concepts

- **Global Scope**: Accessible everywhere
- **Function Scope**: Only inside the function
- **Block Scope**: Only inside `{}` (let/const)
- **Lexical Scope**: Inner functions access outer variables
- **Closure**: Functions that remember their scope

### var vs let vs const Scope

```javascript
// var - function scoped
function example() {
    if (true) {
        var x = 1;
    }
    console.log(x);  // 1 (accessible!)
}

// let/const - block scoped
function example2() {
    if (true) {
        let y = 1;
        const z = 2;
    }
    console.log(y);  // ReferenceError
}
```

---

# Demonstration

## Example 1: Scope Types

```javascript
// Global scope
const globalVar = "I'm global";

function outerFunction() {
    // Function scope
    const outerVar = "I'm in outer";

    if (true) {
        // Block scope
        const blockVar = "I'm in block";
        let blockLet = "Also in block";
        var functionVar = "I'm function-scoped despite being in block";

        console.log(globalVar);  // ✓ Accessible
        console.log(outerVar);   // ✓ Accessible
        console.log(blockVar);   // ✓ Accessible
    }

    console.log(globalVar);   // ✓ Accessible
    console.log(outerVar);    // ✓ Accessible
    console.log(functionVar); // ✓ Accessible (var ignores block)
    // console.log(blockVar);  // ✗ ReferenceError

    function innerFunction() {
        // Nested function scope
        const innerVar = "I'm in inner";

        console.log(globalVar);  // ✓ Accessible
        console.log(outerVar);   // ✓ Accessible (lexical scope)
        console.log(innerVar);   // ✓ Accessible
    }

    innerFunction();
    // console.log(innerVar);  // ✗ ReferenceError
}

outerFunction();
```

## Example 2: Closures

```javascript
// Basic closure
function createCounter() {
    let count = 0;  // Private variable

    return {
        increment() {
            count++;
            return count;
        },
        decrement() {
            count--;
            return count;
        },
        getCount() {
            return count;
        }
    };
}

const counter = createCounter();
console.log(counter.increment());  // 1
console.log(counter.increment());  // 2
console.log(counter.getCount());   // 2
// console.log(count);  // ReferenceError (private!)

// Closure with parameters
function createMultiplier(factor) {
    return function(number) {
        return number * factor;  // factor is "remembered"
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// Closure in loops (classic gotcha)
// Problem with var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);  // 3, 3, 3
}

// Solution 1: Use let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);  // 0, 1, 2
}

// Solution 2: IIFE (old pattern)
for (var i = 0; i < 3; i++) {
    ((j) => {
        setTimeout(() => console.log(j), 100);
    })(i);  // 0, 1, 2
}
```

## Example 3: Hoisting

```javascript
// var hoisting
console.log(hoistedVar);  // undefined (not ReferenceError!)
var hoistedVar = "hello";
console.log(hoistedVar);  // "hello"

// What JavaScript sees:
// var hoistedVar;
// console.log(hoistedVar);  // undefined
// hoistedVar = "hello";

// let/const - Temporal Dead Zone (TDZ)
// console.log(hoistedLet);  // ReferenceError
let hoistedLet = "hello";

// Function hoisting
sayHello();  // Works! "Hello"

function sayHello() {
    console.log("Hello");
}

// Function expressions are NOT hoisted
// sayGoodbye();  // TypeError: sayGoodbye is not a function
const sayGoodbye = function() {
    console.log("Goodbye");
};

// Class declarations are NOT hoisted
// const obj = new MyClass();  // ReferenceError
class MyClass {}

// Best practice: Declare before use
// Don't rely on hoisting for readability
```

## Example 4: this and Scope

```javascript
// Global context
console.log(this);  // window (browser) or global (Node)

// Object method
const user = {
    name: "Arthur",
    greet() {
        console.log(this.name);  // "Arthur"
    },
    greetArrow: () => {
        console.log(this.name);  // undefined (arrow inherits outer this)
    }
};

user.greet();       // "Arthur"
user.greetArrow();  // undefined

// Lost this context
const greet = user.greet;
greet();  // undefined (this is now global)

// Solutions
// 1. bind
const boundGreet = user.greet.bind(user);
boundGreet();  // "Arthur"

// 2. Arrow function wrapper
const wrappedGreet = () => user.greet();
wrappedGreet();  // "Arthur"

// 3. call/apply
greet.call(user);   // "Arthur"
greet.apply(user);  // "Arthur"

// Nested functions
const obj = {
    name: "Arthur",
    processItems() {
        const items = [1, 2, 3];

        // Problem: this is undefined in callback
        // items.forEach(function(item) {
        //     console.log(this.name);  // undefined
        // });

        // Solution 1: Arrow function
        items.forEach((item) => {
            console.log(this.name);  // "Arthur"
        });

        // Solution 2: Save reference
        const self = this;
        items.forEach(function(item) {
            console.log(self.name);  // "Arthur"
        });

        // Solution 3: bind
        items.forEach(function(item) {
            console.log(this.name);
        }.bind(this));
    }
};
```

## Example 5: Module Scope

```javascript
// ES Modules - file scope
// utils.js
const privateHelper = () => "private";  // Not exported
export const publicHelper = () => "public";

// main.js
import { publicHelper } from './utils.js';
// privateHelper is not accessible

// Module pattern (before ES modules)
const Module = (function() {
    // Private
    const privateVar = "secret";
    const privateMethod = () => console.log(privateVar);

    // Public API
    return {
        publicMethod() {
            privateMethod();
        },
        publicVar: "visible"
    };
})();

Module.publicMethod();   // Works
// Module.privateVar;    // undefined
// Module.privateMethod; // undefined

// Revealing module pattern
const Calculator = (function() {
    let result = 0;

    const add = (n) => result += n;
    const subtract = (n) => result -= n;
    const getResult = () => result;
    const reset = () => result = 0;

    return { add, subtract, getResult, reset };
})();
```

**Key Takeaways:**
- Use `let` and `const` for predictable block scope
- Closures "remember" their lexical environment
- Avoid `var` to prevent hoisting confusion
- Arrow functions inherit `this` from enclosing scope
- Module scope provides true privacy

---

# Imitation

### Challenge 1: Create a Private Counter

**Task:** Create a counter with private state using closures.

<details>
<summary>Solution</summary>

```javascript
function createSecureCounter(initial = 0) {
    let count = initial;
    const history = [];

    return {
        increment(amount = 1) {
            count += amount;
            history.push({ action: 'increment', amount, result: count });
            return count;
        },

        decrement(amount = 1) {
            count -= amount;
            history.push({ action: 'decrement', amount, result: count });
            return count;
        },

        getCount() {
            return count;
        },

        getHistory() {
            return [...history];  // Return copy
        },

        reset() {
            count = initial;
            history.push({ action: 'reset', result: count });
            return count;
        }
    };
}

const counter = createSecureCounter(10);
counter.increment(5);
counter.decrement(3);
console.log(counter.getCount());    // 12
console.log(counter.getHistory());  // Shows all operations
```

</details>

### Challenge 2: Implement Memoization

**Task:** Create a memoize function that caches results.

<details>
<summary>Solution</summary>

```javascript
function memoize(fn) {
    const cache = new Map();

    return function(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            console.log('Cache hit!');
            return cache.get(key);
        }

        console.log('Computing...');
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Usage
const expensiveOperation = (n) => {
    // Simulate expensive computation
    let result = 0;
    for (let i = 0; i < n * 1000000; i++) {
        result += i;
    }
    return result;
};

const memoized = memoize(expensiveOperation);

console.log(memoized(10));  // Computing... (slow)
console.log(memoized(10));  // Cache hit! (instant)
console.log(memoized(20));  // Computing... (slow)
console.log(memoized(20));  // Cache hit! (instant)
```

</details>

---

# Practice

### Exercise 1: Event Handler Factory
**Difficulty:** Intermediate

Create a function that generates event handlers with preset configurations:
```javascript
const clickHandler = createHandler('click', { log: true });
button.addEventListener('click', clickHandler);
```

### Exercise 2: Module with State
**Difficulty:** Advanced

Build a state management module with:
- Private state
- Subscribe/unsubscribe to changes
- Undo/redo functionality

---

## Summary

**What you learned:**
- Different scope types (global, function, block)
- How closures capture variables
- Hoisting behavior with var/let/const
- `this` binding and context
- Module patterns for encapsulation

**Next Steps:**
- Read: [JavaScript Hoisting](/api/guides/javascript/fundamentals/hoisting)
- Practice: Build a module system
- Deep dive: Event loop and execution context

---

## Resources

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Variable scope, closure](https://javascript.info/closure)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
