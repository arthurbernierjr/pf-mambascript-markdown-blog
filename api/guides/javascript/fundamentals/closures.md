---
title: "JavaScript Closures"
subTitle: "Functions That Remember"
excerpt: "Closures give functions memory - a superpower of JavaScript."
featureImage: "/img/js-closures.png"
date: "2026-02-01"
order: 12
---

# Explanation

## What is a Closure?

A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned. Closures "close over" their environment.

### Key Concepts

- **Lexical Scoping**: Functions can access variables from where they're defined
- **Persistence**: Outer variables persist in memory
- **Privacy**: Create truly private variables
- **Factory Pattern**: Generate customized functions

---

# Demonstration

## Example 1: Basic Closures

```javascript
// Simple closure
function outer() {
    const message = 'Hello';  // Outer variable

    function inner() {
        console.log(message);  // Accesses outer variable
    }

    return inner;
}

const myFunc = outer();  // outer() returns inner
myFunc();  // 'Hello' - still has access to 'message'!

// The closure in action
function createCounter() {
    let count = 0;  // Private variable

    return function() {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3

// Each call creates a new closure
const counter2 = createCounter();
console.log(counter2());  // 1 (independent)

// Closures preserve references, not values
function createFunctions() {
    const funcs = [];

    for (var i = 0; i < 3; i++) {
        funcs.push(function() {
            return i;  // All reference the same 'i'
        });
    }

    return funcs;
}

const funcs = createFunctions();
console.log(funcs[0]());  // 3 (not 0!)
console.log(funcs[1]());  // 3 (not 1!)
console.log(funcs[2]());  // 3 (not 2!)

// Fix with let (block scope)
function createFunctionsFixed() {
    const funcs = [];

    for (let i = 0; i < 3; i++) {
        funcs.push(function() {
            return i;  // Each has its own 'i'
        });
    }

    return funcs;
}
```

## Example 2: Private Variables

```javascript
// Module pattern with closures
function createBankAccount(initialBalance) {
    let balance = initialBalance;  // Private!
    const transactions = [];       // Private!

    return {
        deposit(amount) {
            if (amount <= 0) throw new Error('Invalid amount');
            balance += amount;
            transactions.push({ type: 'deposit', amount, date: new Date() });
            return balance;
        },

        withdraw(amount) {
            if (amount <= 0) throw new Error('Invalid amount');
            if (amount > balance) throw new Error('Insufficient funds');
            balance -= amount;
            transactions.push({ type: 'withdrawal', amount, date: new Date() });
            return balance;
        },

        getBalance() {
            return balance;  // Read-only access
        },

        getTransactions() {
            return [...transactions];  // Return copy
        }
    };
}

const account = createBankAccount(1000);
account.deposit(500);
account.withdraw(200);
console.log(account.getBalance());  // 1300

// Cannot access directly
console.log(account.balance);       // undefined
console.log(account.transactions);  // undefined

// Private class fields (modern alternative)
class BankAccount {
    #balance;        // Private field
    #transactions = [];

    constructor(initialBalance) {
        this.#balance = initialBalance;
    }

    deposit(amount) {
        this.#balance += amount;
        this.#transactions.push({ type: 'deposit', amount });
        return this.#balance;
    }

    get balance() {
        return this.#balance;
    }
}
```

## Example 3: Function Factories

```javascript
// Create customized functions
function multiply(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = multiply(2);
const triple = multiply(3);
const quadruple = multiply(4);

console.log(double(5));     // 10
console.log(triple(5));     // 15
console.log(quadruple(5));  // 20

// Tax calculator factory
function createTaxCalculator(taxRate) {
    return function(amount) {
        const tax = amount * taxRate;
        return {
            amount,
            tax,
            total: amount + tax
        };
    };
}

const calculateNYTax = createTaxCalculator(0.08875);
const calculateCATax = createTaxCalculator(0.0725);

console.log(calculateNYTax(100));  // { amount: 100, tax: 8.875, total: 108.875 }
console.log(calculateCATax(100));  // { amount: 100, tax: 7.25, total: 107.25 }

// Logger factory
function createLogger(prefix) {
    return {
        log: (msg) => console.log(`[${prefix}] ${msg}`),
        error: (msg) => console.error(`[${prefix}] ERROR: ${msg}`),
        warn: (msg) => console.warn(`[${prefix}] WARNING: ${msg}`)
    };
}

const apiLogger = createLogger('API');
const dbLogger = createLogger('Database');

apiLogger.log('Request received');
dbLogger.error('Connection failed');
```

## Example 4: Memoization

```javascript
// Basic memoization
function memoize(fn) {
    const cache = {};  // Closure over cache

    return function(...args) {
        const key = JSON.stringify(args);

        if (key in cache) {
            console.log('Cache hit');
            return cache[key];
        }

        console.log('Computing...');
        const result = fn.apply(this, args);
        cache[key] = result;
        return result;
    };
}

// Expensive calculation
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(function fib(n) {
    if (n <= 1) return n;
    return memoizedFib(n - 1) + memoizedFib(n - 2);
});

console.log(memoizedFib(40));  // Fast!

// LRU Memoization with size limit
function memoizeWithLimit(fn, maxSize = 100) {
    const cache = new Map();

    return function(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            // Move to end (most recently used)
            const value = cache.get(key);
            cache.delete(key);
            cache.set(key, value);
            return value;
        }

        const result = fn.apply(this, args);
        cache.set(key, result);

        // Remove oldest if over limit
        if (cache.size > maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    };
}
```

## Example 5: Event Handlers and Callbacks

```javascript
// Closure in event handlers
function setupButton(buttonId, message) {
    const button = document.getElementById(buttonId);

    button.addEventListener('click', function() {
        alert(message);  // Closure over 'message'
    });
}

setupButton('btn1', 'Button 1 clicked!');
setupButton('btn2', 'Button 2 clicked!');

// Debounce using closures
function debounce(fn, delay) {
    let timeoutId;  // Closure over timeout

    return function(...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

const debouncedSearch = debounce((query) => {
    console.log('Searching for:', query);
}, 300);

// Throttle using closures
function throttle(fn, limit) {
    let inThrottle;

    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

const throttledScroll = throttle(() => {
    console.log('Scroll event');
}, 100);

window.addEventListener('scroll', throttledScroll);

// Once function
function once(fn) {
    let called = false;
    let result;

    return function(...args) {
        if (!called) {
            called = true;
            result = fn.apply(this, args);
        }
        return result;
    };
}

const initialize = once(() => {
    console.log('Initializing...');
    return 'initialized';
});

initialize();  // 'Initializing...'
initialize();  // (nothing, returns 'initialized')
```

## Example 6: Partial Application and Currying

```javascript
// Partial application
function partial(fn, ...presetArgs) {
    return function(...laterArgs) {
        return fn(...presetArgs, ...laterArgs);
    };
}

function greet(greeting, name, punctuation) {
    return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, 'Hello');
const sayHelloToArthur = partial(greet, 'Hello', 'Arthur');

console.log(sayHello('Arthur', '!'));     // 'Hello, Arthur!'
console.log(sayHelloToArthur('!!!'));     // 'Hello, Arthur!!!'

// Currying
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...moreArgs) {
            return curried.apply(this, args.concat(moreArgs));
        };
    };
}

const curriedGreet = curry(greet);

console.log(curriedGreet('Hi')('Sarah')('!'));  // 'Hi, Sarah!'
console.log(curriedGreet('Hey', 'Bob', '.'));   // 'Hey, Bob.'

// Practical currying
const add = curry((a, b, c) => a + b + c);
const add5 = add(5);
const add5and10 = add5(10);

console.log(add5and10(15));  // 30
```

**Key Takeaways:**
- Closures capture variables from outer scope
- Used for privacy, factories, and state
- Be aware of closure over reference vs value
- Foundation for many patterns (memoization, debounce)
- Modern alternatives: private class fields

---

# Imitation

### Challenge 1: Create a Rate Limiter

**Task:** Implement a rate limiter that allows only N calls per time window.

<details>
<summary>Solution</summary>

```javascript
function createRateLimiter(maxCalls, timeWindow) {
    const calls = [];  // Closure over call timestamps

    return function(fn) {
        return function(...args) {
            const now = Date.now();

            // Remove calls outside time window
            while (calls.length > 0 && calls[0] <= now - timeWindow) {
                calls.shift();
            }

            if (calls.length >= maxCalls) {
                console.log('Rate limit exceeded');
                return null;
            }

            calls.push(now);
            return fn.apply(this, args);
        };
    };
}

// Usage: max 3 calls per second
const limiter = createRateLimiter(3, 1000);

const limitedFetch = limiter(async (url) => {
    const response = await fetch(url);
    return response.json();
});

// First 3 calls work, 4th is rate limited
limitedFetch('/api/1');
limitedFetch('/api/2');
limitedFetch('/api/3');
limitedFetch('/api/4');  // 'Rate limit exceeded'
```

</details>

---

# Practice

### Exercise 1: Implement Compose
**Difficulty:** Intermediate

Create a `compose` function that composes multiple functions:
```javascript
const composed = compose(add1, multiply2, subtract3);
composed(5)  // subtract3(multiply2(add1(5)))
```

### Exercise 2: State Machine with Closures
**Difficulty:** Advanced

Build a state machine using closures:
- Define states and transitions
- Track current state
- Validate transitions

---

## Summary

**What you learned:**
- How closures capture variables
- Creating private state
- Function factories
- Memoization pattern
- Debounce, throttle, once
- Partial application and currying

**Next Steps:**
- Read: [Modules](/api/guides/javascript/fundamentals/modules)
- Practice: Implement utility functions
- Explore: Functional programming

---

## Resources

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Closure](https://javascript.info/closure)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
