---
title: "JavaScript Hoisting"
subTitle: "Understanding Declaration Hoisting"
excerpt: "Variables and functions rise to the top - but not quite how you'd expect."
featureImage: "/img/js-hoisting.png"
date: "2026-02-01"
order: 10
---

# Explanation

## What is Hoisting?

Hoisting is JavaScript's default behavior of moving declarations to the top of their scope before code execution. Only declarations are hoisted, not initializations.

### Key Concepts

- **var declarations**: Hoisted and initialized to `undefined`
- **let/const declarations**: Hoisted but not initialized (TDZ)
- **Function declarations**: Fully hoisted
- **Function expressions**: Only variable hoisted

### Temporal Dead Zone (TDZ)

The TDZ is the time between entering scope and variable declaration where `let` and `const` cannot be accessed.

---

# Demonstration

## Example 1: var Hoisting

```javascript
// What you write
console.log(name);  // undefined (not an error!)
var name = 'Arthur';
console.log(name);  // 'Arthur'

// How JavaScript interprets it
var name;           // Declaration hoisted
console.log(name);  // undefined
name = 'Arthur';    // Initialization stays
console.log(name);  // 'Arthur'

// Multiple var declarations
var x = 1;
var x = 2;  // No error, just reassigns
console.log(x);  // 2

// var in function scope
function example() {
    console.log(value);  // undefined
    var value = 10;
    console.log(value);  // 10
}

// var ignores block scope
if (true) {
    var blockVar = 'I escape blocks!';
}
console.log(blockVar);  // 'I escape blocks!'
```

## Example 2: let and const Hoisting (TDZ)

```javascript
// let - hoisted but not initialized
console.log(age);  // ReferenceError: Cannot access 'age' before initialization
let age = 30;

// The variable IS hoisted (proven below)
let x = 'outer';
function checkTDZ() {
    console.log(x);  // ReferenceError, not 'outer'!
    let x = 'inner'; // TDZ starts at function entry
}

// const behaves the same
console.log(PI);  // ReferenceError
const PI = 3.14159;

// TDZ with typeof
console.log(typeof undeclared);  // 'undefined' (no error)
console.log(typeof inTDZ);       // ReferenceError
let inTDZ = 'value';

// TDZ in switch statements
switch (x) {
    case 0:
        let foo;  // TDZ covers entire switch block
        break;
    case 1:
        foo = 1;  // OK, after declaration
        break;
    case 2:
        let foo;  // SyntaxError: already declared
        break;
}

// TDZ with default parameters
function example(a = b, b = 1) {  // ReferenceError
    // 'b' is in TDZ when 'a' default is evaluated
}

// Safe pattern
function safe(a = 1, b = a) {  // OK, 'a' is already initialized
    console.log(a, b);  // 1, 1
}
```

## Example 3: Function Hoisting

```javascript
// Function declarations are fully hoisted
sayHello();  // 'Hello!' - works!

function sayHello() {
    console.log('Hello!');
}

// Function expressions are NOT fully hoisted
sayGoodbye();  // TypeError: sayGoodbye is not a function

var sayGoodbye = function() {
    console.log('Goodbye!');
};

// What actually happens with function expression
var sayGoodbye;  // Declaration hoisted
sayGoodbye();    // undefined() - TypeError!
sayGoodbye = function() { ... };  // Assignment stays

// Arrow functions same as function expressions
greet();  // TypeError: greet is not a function
var greet = () => console.log('Hi!');

// Function declarations beat var
console.log(myFunc);  // [Function: myFunc]
var myFunc = 'string';
function myFunc() {}
console.log(myFunc);  // 'string'

// Order of hoisting
// 1. Function declarations (fully)
// 2. var declarations (undefined)
// 3. Code executes in order
```

## Example 4: Hoisting in Loops

```javascript
// var in loops - common gotcha
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (not 0, 1, 2!)
// 'i' is hoisted to function scope, shared by all callbacks

// Fix with let (block-scoped)
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log(j), 100);
}
// Output: 0, 1, 2 (each iteration gets its own 'j')

// Fix with IIFE (old pattern)
for (var k = 0; k < 3; k++) {
    (function(k) {
        setTimeout(() => console.log(k), 100);
    })(k);
}
// Output: 0, 1, 2

// var leaks out of for loop
for (var index = 0; index < 5; index++) {}
console.log(index);  // 5 - still accessible!

// let stays in block
for (let idx = 0; idx < 5; idx++) {}
console.log(idx);  // ReferenceError: idx is not defined
```

## Example 5: Class Hoisting

```javascript
// Classes are NOT hoisted like functions
const instance = new MyClass();  // ReferenceError

class MyClass {
    constructor() {
        this.name = 'MyClass';
    }
}

// Class expressions - same behavior
const obj = new MyOtherClass();  // ReferenceError
const MyOtherClass = class {
    constructor() {}
};

// Why? Classes have a TDZ like let/const
// This prevents accessing before full definition

// Safe pattern - declare before use
class Animal {
    speak() {
        return 'sound';
    }
}

class Dog extends Animal {
    speak() {
        return 'woof';
    }
}

const dog = new Dog();
console.log(dog.speak());  // 'woof'
```

## Example 6: Practical Patterns

```javascript
// Module pattern leveraging hoisting
const calculator = (function() {
    // Private functions available due to hoisting
    return {
        add: (a, b) => add(a, b),
        multiply: (a, b) => multiply(a, b)
    };

    function add(a, b) {
        return a + b;
    }

    function multiply(a, b) {
        return a * b;
    }
})();

calculator.add(2, 3);  // 5

// Avoiding hoisting issues - best practices
// 1. Use const/let instead of var
// 2. Declare variables at the top of their scope
// 3. Declare functions before calling them
// 4. Use strict mode

'use strict';

// This helps catch hoisting-related mistakes
function strictExample() {
    x = 10;  // ReferenceError in strict mode
    var x;
}

// ESLint rules to enforce
// "no-use-before-define": "error"
// "no-var": "error"
// "prefer-const": "error"
```

**Key Takeaways:**
- var is hoisted and initialized to undefined
- let/const are hoisted but stay in TDZ
- Function declarations are fully hoisted
- Function expressions/arrows follow variable rules
- Use let/const to avoid hoisting confusion

---

# Imitation

### Challenge 1: Predict the Output

**Task:** Determine what each console.log will output.

```javascript
var a = 1;
function outer() {
    console.log(a);  // ?
    var a = 2;
    function inner() {
        console.log(a);  // ?
        var a = 3;
        console.log(a);  // ?
    }
    inner();
    console.log(a);  // ?
}
outer();
console.log(a);  // ?
```

<details>
<summary>Solution</summary>

```javascript
var a = 1;
function outer() {
    console.log(a);  // undefined (local 'a' hoisted)
    var a = 2;
    function inner() {
        console.log(a);  // undefined (inner 'a' hoisted)
        var a = 3;
        console.log(a);  // 3
    }
    inner();
    console.log(a);  // 2 (outer's 'a')
}
outer();
console.log(a);  // 1 (global 'a')

// Explanation:
// Each function creates its own scope
// var declarations are hoisted to the top of their function
// The hoisted variable shadows any outer variables
```

</details>

---

# Practice

### Exercise 1: Fix the Loop
**Difficulty:** Beginner

Fix this code so it logs 0, 1, 2:
```javascript
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
```

### Exercise 2: Hoisting Quiz
**Difficulty:** Intermediate

Predict and explain the output:
```javascript
console.log(foo);
console.log(bar);
console.log(baz);

var foo = 'foo';
let bar = 'bar';
function baz() { return 'baz'; }
```

---

## Summary

**What you learned:**
- How var, let, and const are hoisted differently
- Temporal Dead Zone (TDZ)
- Function declaration vs expression hoisting
- Common hoisting pitfalls
- Best practices to avoid issues

**Next Steps:**
- Read: [Scope](/api/guides/javascript/fundamentals/scope)
- Practice: Refactor var to let/const
- Deep dive: Module systems

---

## Resources

- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [JavaScript.info: Variable scope](https://javascript.info/closure)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
