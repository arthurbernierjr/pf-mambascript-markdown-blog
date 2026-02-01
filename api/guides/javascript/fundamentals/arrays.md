---
title: "JavaScript Arrays"
subTitle: "Mastering the Most Versatile Data Structure"
excerpt: "The more you sweat in practice, the less you bleed in battle. - Richard Marcinko"
featureImage: "/img/js-arrays.png"
date: "2026-02-01"
order: 103
---

# Explanation

## What Are Arrays?

Arrays are ordered collections of data. Think of an array like a train with numbered cars - each car (element) has a position (index), and you can add or remove cars from either end.

```javascript
const train = ['engine', 'coal', 'passengers', 'cargo', 'caboose'];
//              index 0    1         2           3         4
```

### Key Concepts

- **Zero-indexed**: First element is at index 0
- **Dynamic size**: Arrays grow and shrink automatically
- **Mixed types**: Can hold any data types (though usually you keep them consistent)
- **Reference type**: Arrays are objects, passed by reference

### Why This Matters

Arrays are everywhere in programming:
- API responses (list of users, posts, products)
- Form data (multiple selections)
- Game states (inventory, scores)
- DOM manipulation (list of elements)

---

# Demonstration

## Example 1: Array Basics

```javascript
// Creating arrays
const fruits = ['apple', 'banana', 'cherry'];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, 'two', { three: 3 }, [4, 5]];

// Accessing elements
console.log(fruits[0]);        // 'apple'
console.log(fruits[fruits.length - 1]); // 'cherry' (last element)

// Modifying elements
fruits[1] = 'blueberry';
console.log(fruits); // ['apple', 'blueberry', 'cherry']

// Array length
console.log(fruits.length); // 3

// Check if array
console.log(Array.isArray(fruits)); // true
```

## Example 2: Essential Array Methods

```javascript
const numbers = [1, 2, 3, 4, 5];

// Adding/Removing elements
numbers.push(6);      // Add to end: [1,2,3,4,5,6]
numbers.pop();        // Remove from end: [1,2,3,4,5]
numbers.unshift(0);   // Add to start: [0,1,2,3,4,5]
numbers.shift();      // Remove from start: [1,2,3,4,5]

// Finding elements
const fruits = ['apple', 'banana', 'cherry', 'banana'];
console.log(fruits.indexOf('banana'));     // 1 (first occurrence)
console.log(fruits.lastIndexOf('banana')); // 3 (last occurrence)
console.log(fruits.includes('cherry'));    // true

// Slicing (doesn't modify original)
console.log(fruits.slice(1, 3)); // ['banana', 'cherry']
console.log(fruits.slice(-2));   // ['cherry', 'banana'] (last 2)

// Splicing (modifies original)
fruits.splice(1, 1, 'blackberry'); // Remove 1 at index 1, insert 'blackberry'
console.log(fruits); // ['apple', 'blackberry', 'cherry', 'banana']
```

## Example 3: Transforming Arrays (The Big Three)

```javascript
const numbers = [1, 2, 3, 4, 5];

// MAP - Transform each element
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// FILTER - Keep elements that pass a test
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]

// REDUCE - Combine all elements into one value
const sum = numbers.reduce((total, n) => total + n, 0);
console.log(sum); // 15

// Chaining methods
const result = numbers
    .filter(n => n > 2)      // [3, 4, 5]
    .map(n => n * 10)        // [30, 40, 50]
    .reduce((a, b) => a + b); // 120

console.log(result); // 120
```

**Key Takeaways:**
- `map` returns a new array of same length
- `filter` returns a new array with fewer (or equal) elements
- `reduce` returns a single value
- Chain methods for powerful transformations

---

# Imitation

### Challenge 1: Get Unique Values

**Task:** Create a function that returns unique values from an array.

```javascript
unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
unique(['a', 'b', 'a']);    // ['a', 'b']
```

<details>
<summary>Solution</summary>

```javascript
// Using Set (modern)
const unique = arr => [...new Set(arr)];

// Using filter
const unique = arr => arr.filter((item, index) => arr.indexOf(item) === index);

// Using reduce
const unique = arr => arr.reduce((acc, item) =>
    acc.includes(item) ? acc : [...acc, item], []);
```

</details>

### Challenge 2: Group By Property

**Task:** Group an array of objects by a property.

```javascript
const people = [
    { name: 'Alice', dept: 'Engineering' },
    { name: 'Bob', dept: 'Sales' },
    { name: 'Charlie', dept: 'Engineering' }
];

groupBy(people, 'dept');
// { Engineering: [{...}, {...}], Sales: [{...}] }
```

<details>
<summary>Solution</summary>

```javascript
const groupBy = (arr, key) => {
    return arr.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};
```

</details>

---

# Practice

### Exercise 1: Shopping Cart
**Difficulty:** Beginner

Create functions for a shopping cart:
- `addItem(cart, item)` - Add item to cart
- `removeItem(cart, itemId)` - Remove item by ID
- `getTotal(cart)` - Calculate total price
- `getItemCount(cart)` - Count items

### Exercise 2: Array Flatten
**Difficulty:** Advanced

Create a function that flattens nested arrays:

```javascript
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
flatten([[1, 2], [3, 4]]);   // [1, 2, 3, 4]
```

---

## Summary

**What you learned:**
- Array basics: creation, access, modification
- Adding/removing: push, pop, shift, unshift, splice
- Searching: indexOf, includes, find
- Transforming: map, filter, reduce

**Next Steps:**
- Read: [JavaScript Objects](/api/guides/javascript/fundamentals/objects)
- Practice: Solve array problems on LeetCode
- Build: Create a todo list using array methods

---

## Resources

- [MDN: Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [JavaScript.info: Arrays](https://javascript.info/array)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
