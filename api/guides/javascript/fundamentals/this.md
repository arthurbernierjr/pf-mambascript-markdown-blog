---
title: "JavaScript this Keyword"
subTitle: "Context is Everything"
excerpt: "The 'this' keyword changes based on how a function is called."
featureImage: "/img/js-this.png"
date: "2026-02-01"
order: 11
---

# Explanation

## What is 'this'?

The `this` keyword refers to the object that is executing the current function. Its value is determined by how a function is called, not where it's defined.

### Key Rules

1. **Global context**: `this` = window (browser) or global (Node)
2. **Object method**: `this` = the object
3. **Constructor**: `this` = new instance
4. **Explicit binding**: `this` = specified object
5. **Arrow function**: `this` = lexical (inherited)

---

# Demonstration

## Example 1: Global and Function Context

```javascript
// Global context (non-strict mode)
console.log(this);  // window (browser) or global (Node)

// Strict mode
'use strict';
function strictFunc() {
    console.log(this);  // undefined
}
strictFunc();

// Non-strict mode
function regularFunc() {
    console.log(this);  // window/global
}
regularFunc();

// Global variables become window properties
var globalVar = 'I am global';
console.log(window.globalVar);  // 'I am global'
console.log(this.globalVar);    // 'I am global'

// let/const don't attach to window
let notGlobal = 'Not on window';
console.log(window.notGlobal);  // undefined
```

## Example 2: Object Methods

```javascript
const user = {
    name: 'Arthur',
    greet() {
        console.log(`Hello, I'm ${this.name}`);
    },
    nested: {
        name: 'Nested',
        greet() {
            console.log(`Hello from ${this.name}`);
        }
    }
};

user.greet();         // "Hello, I'm Arthur"
user.nested.greet();  // "Hello from Nested"

// Method assignment loses context
const greetFunc = user.greet;
greetFunc();  // "Hello, I'm undefined" (or error in strict mode)

// Passing as callback loses context
setTimeout(user.greet, 100);  // "Hello, I'm undefined"

// Fix with bind
setTimeout(user.greet.bind(user), 100);  // "Hello, I'm Arthur"

// Fix with arrow function wrapper
setTimeout(() => user.greet(), 100);  // "Hello, I'm Arthur"

// Method shorthand vs function property
const obj = {
    // Method shorthand - 'this' works
    method() {
        return this;
    },
    // Arrow - 'this' is lexical (outer scope)
    arrow: () => {
        return this;
    }
};

console.log(obj.method() === obj);  // true
console.log(obj.arrow() === obj);   // false (window or undefined)
```

## Example 3: Constructor Functions and Classes

```javascript
// Constructor function
function Person(name) {
    this.name = name;
    this.greet = function() {
        console.log(`Hi, I'm ${this.name}`);
    };
}

const person1 = new Person('Arthur');
person1.greet();  // "Hi, I'm Arthur"

// Without 'new' - disaster!
const person2 = Person('Oops');  // 'this' is window/global
console.log(person2);            // undefined
console.log(window.name);        // 'Oops' - polluted global!

// Class syntax
class User {
    constructor(name) {
        this.name = name;
    }

    greet() {
        console.log(`Hello, ${this.name}`);
    }

    // Arrow method - bound to instance
    greetArrow = () => {
        console.log(`Hello, ${this.name}`);
    };
}

const user = new User('Arthur');
const greet = user.greet;
const greetArrow = user.greetArrow;

greet();       // undefined (lost context)
greetArrow();  // "Hello, Arthur" (arrow keeps context)
```

## Example 4: Explicit Binding (call, apply, bind)

```javascript
function introduce(greeting, punctuation) {
    console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const arthur = { name: 'Arthur' };
const sarah = { name: 'Sarah' };

// call - invoke immediately with arguments
introduce.call(arthur, 'Hello', '!');    // "Hello, I'm Arthur!"
introduce.call(sarah, 'Hi', '.');        // "Hi, I'm Sarah."

// apply - invoke immediately with array of arguments
introduce.apply(arthur, ['Hey', '!!']);  // "Hey, I'm Arthur!!"

// bind - return new function with bound 'this'
const arthurIntro = introduce.bind(arthur);
arthurIntro('Greetings', '~');  // "Greetings, I'm Arthur~"

// bind with preset arguments (partial application)
const arthurHello = introduce.bind(arthur, 'Hello');
arthurHello('!');  // "Hello, I'm Arthur!"

// bind is permanent - can't rebind
const boundOnce = introduce.bind(arthur);
const boundTwice = boundOnce.bind(sarah);
boundTwice('Hi', '!');  // "Hi, I'm Arthur!" (still arthur)

// Practical: Event handlers
class Button {
    constructor(label) {
        this.label = label;
    }

    handleClick() {
        console.log(`${this.label} clicked`);
    }
}

const btn = new Button('Submit');
// Without bind: 'this' would be the DOM element
document.querySelector('button')
    .addEventListener('click', btn.handleClick.bind(btn));
```

## Example 5: Arrow Functions

```javascript
// Arrow functions inherit 'this' from enclosing scope
const obj = {
    name: 'Arthur',

    regularMethod() {
        console.log(this.name);  // 'Arthur'

        // Regular function in method - loses 'this'
        function inner() {
            console.log(this.name);  // undefined
        }
        inner();

        // Arrow function preserves 'this'
        const innerArrow = () => {
            console.log(this.name);  // 'Arthur'
        };
        innerArrow();
    },

    // Arrow as method - inherits outer 'this' (usually wrong!)
    arrowMethod: () => {
        console.log(this.name);  // undefined (outer scope)
    }
};

obj.regularMethod();
obj.arrowMethod();

// Arrow functions great for callbacks
class Timer {
    constructor() {
        this.seconds = 0;
    }

    start() {
        // Arrow preserves 'this'
        setInterval(() => {
            this.seconds++;
            console.log(this.seconds);
        }, 1000);
    }
}

// Arrow functions can't be bound
const arrow = () => this;
console.log(arrow.call({ name: 'test' }));  // window (ignored)
```

## Example 6: Common Patterns and Gotchas

```javascript
// this in callbacks
const obj = {
    items: [1, 2, 3],

    // forEach with arrow - works
    sumArrow() {
        let sum = 0;
        this.items.forEach(item => {
            sum += item * this.multiplier;
        });
        return sum;
    },

    // forEach with regular function - fails
    sumRegular() {
        let sum = 0;
        this.items.forEach(function(item) {
            sum += item * this.multiplier;  // this.multiplier undefined
        });
        return sum;
    },

    // Fix: pass thisArg to forEach
    sumFixed() {
        let sum = 0;
        this.items.forEach(function(item) {
            sum += item * this.multiplier;
        }, this);  // Pass 'this' as second argument
        return sum;
    },

    multiplier: 2
};

// 'that' / 'self' pattern (old-school)
function OldClass() {
    const self = this;
    this.value = 42;

    setTimeout(function() {
        console.log(self.value);  // 42 (using closure)
    }, 100);
}

// Chaining with 'this'
class Builder {
    constructor() {
        this.value = '';
    }

    add(str) {
        this.value += str;
        return this;  // Enable chaining
    }

    build() {
        return this.value;
    }
}

const result = new Builder()
    .add('Hello')
    .add(' ')
    .add('World')
    .build();  // 'Hello World'
```

**Key Takeaways:**
- `this` is determined by how a function is called
- Object methods: `this` = the object
- Arrow functions: `this` = lexical scope
- Use bind/call/apply for explicit binding
- Arrow functions can't be rebound

---

# Imitation

### Challenge 1: Fix the Context

**Task:** Fix this code so `counter.increment()` works correctly when passed to setInterval.

```javascript
const counter = {
    count: 0,
    increment() {
        this.count++;
        console.log(this.count);
    }
};

// This doesn't work - fix it
setInterval(counter.increment, 1000);
```

<details>
<summary>Solution</summary>

```javascript
// Solution 1: Use bind
setInterval(counter.increment.bind(counter), 1000);

// Solution 2: Arrow function wrapper
setInterval(() => counter.increment(), 1000);

// Solution 3: Define increment as arrow function
const counter = {
    count: 0,
    increment: function() {
        this.count++;
        console.log(this.count);
    }.bind(this)  // Won't work - this is wrong at definition time
};

// Better: Arrow in class
class Counter {
    count = 0;

    increment = () => {
        this.count++;
        console.log(this.count);
    };
}

const c = new Counter();
setInterval(c.increment, 1000);  // Works!
```

</details>

---

# Practice

### Exercise 1: Implement bind
**Difficulty:** Intermediate

Implement your own `myBind` function:
```javascript
Function.prototype.myBind = function(context, ...args) {
    // Your implementation
};
```

### Exercise 2: this in Event Handlers
**Difficulty:** Advanced

Create a component class where event handler methods maintain correct `this` context without arrow functions or bind in constructor.

---

## Summary

**What you learned:**
- How `this` is determined by call-site
- Object methods and context loss
- Explicit binding with call/apply/bind
- Arrow function lexical `this`
- Common patterns and solutions

**Next Steps:**
- Read: [Closures](/api/guides/javascript/fundamentals/closures)
- Practice: Refactor class methods
- Explore: Proxy and Reflect

---

## Resources

- [MDN: this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [JavaScript.info: Object methods, this](https://javascript.info/object-methods)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
