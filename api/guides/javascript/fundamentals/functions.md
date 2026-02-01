---
title: "JavaScript Functions"
subTitle: "The First Class Citizens of JavaScript"
excerpt: "I want to be the best. I want to be the best simple and plain, that's what drives me. - Kobe Bryant"
featureImage: "/img/js-functions.png"
date: "2026-02-01"
order: 102
---

# Explanation

## Why Functions Are Special in JavaScript

In JavaScript, functions are "first-class citizens." This means they're treated like any other value - you can store them in variables, pass them as arguments, return them from other functions, and even add properties to them.

Think of functions like recipes. A recipe has a name, takes ingredients (parameters), follows steps (the function body), and produces a dish (the return value). You can share recipes, combine them, and modify them.

### Key Concepts

- **Function Declaration**: Traditional way using the `function` keyword
- **Function Expression**: Storing a function in a variable
- **Arrow Functions**: Modern, concise syntax (ES6+)
- **Parameters vs Arguments**: Parameters are placeholders; arguments are actual values
- **Return Values**: What the function sends back

### Why This Matters

Functions are the building blocks of any JavaScript application. They help you:
- Write reusable code (DRY - Don't Repeat Yourself)
- Organize logic into manageable pieces
- Create abstractions
- Handle callbacks and async operations
- Build entire applications with functional programming

---

# Demonstration

## Example 1: Three Ways to Write Functions

```javascript
// 1. Function Declaration (hoisted)
function greet(name) {
    return `Hello, ${name}!`;
}

// 2. Function Expression (not hoisted)
const greetExpression = function(name) {
    return `Hello, ${name}!`;
};

// 3. Arrow Function (concise, no own 'this')
const greetArrow = (name) => `Hello, ${name}!`;

// All three work the same:
console.log(greet("Arthur"));           // Hello, Arthur!
console.log(greetExpression("Arthur")); // Hello, Arthur!
console.log(greetArrow("Arthur"));      // Hello, Arthur!
```

**When to use which:**
- **Declaration**: When you need hoisting or recursion
- **Expression**: When you want to prevent hoisting
- **Arrow**: For callbacks, short functions, and when you don't need `this`

## Example 2: Parameters and Default Values

```javascript
// Default parameters
const createUser = (name, role = "user", active = true) => {
    return { name, role, active, createdAt: new Date() };
};

console.log(createUser("Arthur"));
// { name: "Arthur", role: "user", active: true, createdAt: ... }

console.log(createUser("Sarah", "admin"));
// { name: "Sarah", role: "admin", active: true, createdAt: ... }

// Rest parameters (gather remaining args into array)
const sum = (...numbers) => {
    return numbers.reduce((total, n) => total + n, 0);
};

console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(sum(10, 20));        // 30

// Destructuring parameters
const displayUser = ({ name, role, active }) => {
    console.log(`${name} is a ${role} (${active ? "active" : "inactive"})`);
};

displayUser({ name: "Arthur", role: "admin", active: true });
// Arthur is a admin (active)
```

**Key Takeaways:**
- Default parameters prevent undefined errors
- Rest parameters (`...`) collect multiple arguments
- Destructuring in parameters makes code cleaner

## Example 3: Higher-Order Functions

```javascript
// A function that returns a function
const multiplier = (factor) => {
    return (number) => number * factor;
};

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// A function that takes a function as argument
const withLogging = (fn) => {
    return (...args) => {
        console.log(`Calling with args: ${args}`);
        const result = fn(...args);
        console.log(`Result: ${result}`);
        return result;
    };
};

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);

loggedAdd(3, 4);
// Calling with args: 3,4
// Result: 7
```

---

# Imitation

### Challenge 1: Create a Greeting Factory

**Task:** Create a function `createGreeter` that takes a greeting word and returns a function that greets people with that word.

```javascript
const sayHello = createGreeter("Hello");
const sayHowdy = createGreeter("Howdy");

console.log(sayHello("Arthur")); // "Hello, Arthur!"
console.log(sayHowdy("Partner")); // "Howdy, Partner!"
```

<details>
<summary>Solution</summary>

```javascript
const createGreeter = (greeting) => {
    return (name) => `${greeting}, ${name}!`;
};

// Or even shorter:
const createGreeter = greeting => name => `${greeting}, ${name}!`;
```

</details>

### Challenge 2: Memoization

**Task:** Create a `memoize` function that caches results of expensive function calls.

```javascript
const slowFibonacci = (n) => {
    if (n <= 1) return n;
    return slowFibonacci(n - 1) + slowFibonacci(n - 2);
};

const fastFibonacci = memoize(slowFibonacci);
console.log(fastFibonacci(40)); // Should be fast on repeated calls
```

<details>
<summary>Solution</summary>

```javascript
const memoize = (fn) => {
    const cache = {};
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache[key] !== undefined) {
            return cache[key];
        }
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
};
```

</details>

---

# Practice

### Exercise 1: Function Composition
**Difficulty:** Intermediate

**Task:** Create a `compose` function that combines multiple functions into one.

```javascript
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const combined = compose(square, double, addOne);
console.log(combined(3)); // square(double(addOne(3))) = square(double(4)) = square(8) = 64
```

### Exercise 2: Curry Function
**Difficulty:** Advanced

**Task:** Create a `curry` function that transforms a function to accept arguments one at a time.

```javascript
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
```

---

## Summary

**What you learned:**
- Three ways to define functions
- Default, rest, and destructured parameters
- Higher-order functions (functions that operate on functions)
- Closures and function factories

**Next Steps:**
- Read: [JavaScript Arrays](/api/guides/javascript/fundamentals/arrays)
- Practice: Refactor callbacks to use arrow functions
- Build: Create a utility library with reusable functions

---

## Resources

- [MDN: Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [JavaScript.info: Functions](https://javascript.info/function-basics)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
