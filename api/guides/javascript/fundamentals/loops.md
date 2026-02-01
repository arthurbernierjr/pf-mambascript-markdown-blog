---
title: "JavaScript Loops"
subTitle: "Iterating Through Data"
excerpt: "Loops are the workhorses of programming - master them."
featureImage: "/img/js-loops.png"
date: "2026-02-01"
order: 5
---

# Explanation

## Why Loops Matter

Loops let you repeat code without writing it multiple times. Whether you're processing arrays, generating data, or waiting for conditions, loops are essential.

### Key Concepts

- **for**: Classic counting loop
- **for...of**: Iterate over values
- **for...in**: Iterate over keys
- **while**: Condition-based loop
- **forEach**: Array method for iteration

### Loop Types at a Glance

| Loop | Use Case | Break/Continue |
|------|----------|----------------|
| for | Need index, specific count | Yes |
| for...of | Arrays, iterables | Yes |
| for...in | Object keys | Yes |
| while | Unknown iterations | Yes |
| forEach | Simple array iteration | No |

---

# Demonstration

## Example 1: For Loops

```javascript
// Classic for loop
for (let i = 0; i < 5; i++) {
    console.log(i);  // 0, 1, 2, 3, 4
}

// Counting down
for (let i = 5; i > 0; i--) {
    console.log(i);  // 5, 4, 3, 2, 1
}

// Step by 2
for (let i = 0; i < 10; i += 2) {
    console.log(i);  // 0, 2, 4, 6, 8
}

// Iterating array with index
const fruits = ['apple', 'banana', 'cherry'];
for (let i = 0; i < fruits.length; i++) {
    console.log(`${i}: ${fruits[i]}`);
}

// for...of (values)
for (const fruit of fruits) {
    console.log(fruit);
}

// for...of with index (using entries)
for (const [index, fruit] of fruits.entries()) {
    console.log(`${index}: ${fruit}`);
}

// for...in (keys/indices)
for (const index in fruits) {
    console.log(index);  // "0", "1", "2" (strings!)
}

// for...in with objects
const user = { name: 'Arthur', age: 30, role: 'admin' };
for (const key in user) {
    console.log(`${key}: ${user[key]}`);
}
```

## Example 2: While Loops

```javascript
// Basic while
let count = 0;
while (count < 5) {
    console.log(count);
    count++;
}

// do...while (runs at least once)
let num = 10;
do {
    console.log(num);
    num++;
} while (num < 5);  // Still prints 10 once

// Reading until condition met
const readline = require('readline');
async function readUntilQuit() {
    while (true) {
        const input = await getInput();
        if (input === 'quit') break;
        console.log(`You said: ${input}`);
    }
}

// Waiting for async condition
async function waitForElement() {
    let element = null;
    while (!element) {
        element = document.querySelector('.dynamic-content');
        if (!element) {
            await new Promise(r => setTimeout(r, 100));
        }
    }
    return element;
}

// Processing queue
const queue = [1, 2, 3, 4, 5];
while (queue.length > 0) {
    const item = queue.shift();
    console.log(`Processing: ${item}`);
}
```

## Example 3: Break and Continue

```javascript
// Break - exit loop early
for (let i = 0; i < 10; i++) {
    if (i === 5) break;
    console.log(i);  // 0, 1, 2, 3, 4
}

// Continue - skip to next iteration
for (let i = 0; i < 5; i++) {
    if (i === 2) continue;
    console.log(i);  // 0, 1, 3, 4
}

// Labeled break (nested loops)
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) break outer;
        console.log(i, j);
    }
}
// 0 0, 0 1, 0 2, 1 0

// Find first match
const numbers = [1, 3, 5, 8, 9, 10];
let firstEven = null;
for (const num of numbers) {
    if (num % 2 === 0) {
        firstEven = num;
        break;
    }
}
console.log(firstEven);  // 8

// Skip invalid items
const data = [1, null, 2, undefined, 3, '', 4];
const valid = [];
for (const item of data) {
    if (item == null || item === '') continue;
    valid.push(item);
}
console.log(valid);  // [1, 2, 3, 4]
```

## Example 4: Array Methods vs Loops

```javascript
const numbers = [1, 2, 3, 4, 5];

// forEach - simple iteration (can't break)
numbers.forEach((num, index) => {
    console.log(`${index}: ${num}`);
});

// map - transform each element
const doubled = numbers.map(n => n * 2);

// filter - keep matching elements
const evens = numbers.filter(n => n % 2 === 0);

// reduce - accumulate values
const sum = numbers.reduce((acc, n) => acc + n, 0);

// find - first matching element
const firstBig = numbers.find(n => n > 3);

// some/every - test conditions
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);

// When to use loops vs methods:
// - Use loops when you need break/continue
// - Use loops for complex control flow
// - Use methods for cleaner, functional code
// - Use methods when chaining operations

// Chaining example
const result = numbers
    .filter(n => n > 2)
    .map(n => n * 2)
    .reduce((acc, n) => acc + n, 0);
console.log(result);  // 24 (3*2 + 4*2 + 5*2)
```

**Key Takeaways:**
- `for...of` is best for arrays
- `for...in` is for object keys (not arrays)
- `while` is for unknown iteration counts
- `forEach` can't `break` - use `for...of` if needed
- Array methods are often cleaner than loops

---

# Imitation

### Challenge 1: FizzBuzz

**Task:** Print 1-100. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", both print "FizzBuzz".

<details>
<summary>Solution</summary>

```javascript
for (let i = 1; i <= 100; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
        console.log('FizzBuzz');
    } else if (i % 3 === 0) {
        console.log('Fizz');
    } else if (i % 5 === 0) {
        console.log('Buzz');
    } else {
        console.log(i);
    }
}

// Or more elegantly:
for (let i = 1; i <= 100; i++) {
    let output = '';
    if (i % 3 === 0) output += 'Fizz';
    if (i % 5 === 0) output += 'Buzz';
    console.log(output || i);
}
```

</details>

### Challenge 2: Find Prime Numbers

**Task:** Write a function to find all prime numbers up to n.

<details>
<summary>Solution</summary>

```javascript
function findPrimes(n) {
    const primes = [];

    for (let num = 2; num <= n; num++) {
        let isPrime = true;

        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            primes.push(num);
        }
    }

    return primes;
}

console.log(findPrimes(50));
// [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
```

</details>

---

# Practice

### Exercise 1: Flatten Nested Array
**Difficulty:** Intermediate

Write a function that flattens a nested array using loops:
```javascript
flatten([1, [2, [3, 4], 5], 6]) // [1, 2, 3, 4, 5, 6]
```

### Exercise 2: Spiral Matrix
**Difficulty:** Advanced

Create a function that prints a matrix in spiral order:
```javascript
spiralOrder([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]) // [1, 2, 3, 6, 9, 8, 7, 4, 5]
```

---

## Summary

**What you learned:**
- Different loop types and when to use them
- Break and continue for flow control
- Labeled statements for nested loops
- Array methods as loop alternatives
- When to choose loops vs methods

**Next Steps:**
- Read: [JavaScript Conditionals](/api/guides/javascript/fundamentals/conditionals)
- Practice: Solve loop problems on LeetCode
- Build: Create a pagination system

---

## Resources

- [MDN: Loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [JavaScript.info: Loops](https://javascript.info/while-for)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
