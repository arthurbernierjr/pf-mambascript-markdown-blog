---
title: "JavaScript Prototypes"
subTitle: "The Foundation of JavaScript Objects"
excerpt: "Understanding prototypes unlocks JavaScript's true power."
featureImage: "/img/js-prototypes.png"
date: "2026-02-01"
order: 31
---

# Explanation

## What are Prototypes?

JavaScript uses prototypal inheritance. Every object has a hidden `[[Prototype]]` property that links to another object. When you access a property, JavaScript looks up the prototype chain.

### Key Concepts

- **Prototype Chain**: Object → Prototype → Prototype → null
- **`__proto__`**: Access an object's prototype (legacy)
- **`Object.getPrototypeOf()`**: Modern way to access prototype
- **`.prototype`**: Property on constructor functions

### Classes vs Prototypes

```javascript
// Classes are syntactic sugar
class Dog {
    bark() { return 'Woof!'; }
}

// Equivalent prototype code
function Dog() {}
Dog.prototype.bark = function() { return 'Woof!'; };
```

---

# Demonstration

## Example 1: Prototype Basics

```javascript
// Every object has a prototype
const obj = {};
console.log(Object.getPrototypeOf(obj) === Object.prototype);  // true

// Prototype chain
const arr = [];
console.log(Object.getPrototypeOf(arr) === Array.prototype);   // true
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype);  // true
console.log(Object.getPrototypeOf(Object.prototype));          // null

// Property lookup
const parent = { greeting: 'Hello' };
const child = Object.create(parent);
child.name = 'Arthur';

console.log(child.name);      // 'Arthur' (own property)
console.log(child.greeting);  // 'Hello' (inherited)
console.log(child.hasOwnProperty('name'));      // true
console.log(child.hasOwnProperty('greeting'));  // false

// Shadowing
child.greeting = 'Hi';
console.log(child.greeting);         // 'Hi'
console.log(parent.greeting);        // 'Hello' (unchanged)

// Check prototype chain
console.log('greeting' in child);    // true (any level)
console.log(parent.isPrototypeOf(child));  // true
```

## Example 2: Constructor Functions

```javascript
// Constructor function (pre-ES6)
function User(name, email) {
    this.name = name;
    this.email = email;
}

// Methods on prototype (shared across instances)
User.prototype.greet = function() {
    return `Hello, I'm ${this.name}!`;
};

User.prototype.updateEmail = function(newEmail) {
    this.email = newEmail;
    return this;
};

// Static method (on constructor itself)
User.createGuest = function() {
    return new User('Guest', 'guest@example.com');
};

// Usage
const user1 = new User('Arthur', 'art@bpc.com');
const user2 = new User('Sarah', 'sarah@example.com');

// Both share the same methods
console.log(user1.greet === user2.greet);  // true

// But have different properties
console.log(user1.name);  // 'Arthur'
console.log(user2.name);  // 'Sarah'

// What `new` does:
// 1. Creates empty object: {}
// 2. Sets prototype: Object.setPrototypeOf({}, User.prototype)
// 3. Binds `this` and calls constructor
// 4. Returns the object (unless constructor returns object)
```

## Example 3: Prototypal Inheritance

```javascript
// Parent constructor
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

// Child constructor
function Dog(name, breed) {
    Animal.call(this, name);  // Call parent constructor
    this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Add/override methods
Dog.prototype.speak = function() {
    return `${this.name} says Woof!`;
};

Dog.prototype.fetch = function() {
    return `${this.name} fetches the ball`;
};

const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.speak());  // Buddy says Woof!
console.log(dog.fetch());  // Buddy fetches the ball

// Check inheritance
console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true
console.log(dog instanceof Object);  // true

// Prototype chain:
// dog → Dog.prototype → Animal.prototype → Object.prototype → null
```

## Example 4: Object.create() Patterns

```javascript
// Pure prototypal inheritance (no constructors)
const personProto = {
    greet() {
        return `Hello, I'm ${this.name}!`;
    },

    introduce() {
        return `I'm ${this.name}, ${this.age} years old`;
    }
};

// Create object with prototype
const arthur = Object.create(personProto, {
    name: { value: 'Arthur', writable: true },
    age: { value: 30, writable: true }
});

console.log(arthur.greet());  // Hello, I'm Arthur!

// Factory with Object.create
function createPerson(name, age) {
    const person = Object.create(personProto);
    person.name = name;
    person.age = age;
    return person;
}

const sarah = createPerson('Sarah', 25);
console.log(sarah.introduce());  // I'm Sarah, 25 years old

// Object with no prototype
const dict = Object.create(null);
dict.key = 'value';
console.log(dict.hasOwnProperty);  // undefined (no inherited methods!)
// Useful for dictionary/map objects to avoid prototype pollution
```

## Example 5: Modifying Built-in Prototypes

```javascript
// Adding methods to built-ins (use with caution!)
Array.prototype.first = function() {
    return this[0];
};

Array.prototype.last = function() {
    return this[this.length - 1];
};

console.log([1, 2, 3].first());  // 1
console.log([1, 2, 3].last());   // 3

// Better: Use symbols to avoid conflicts
const first = Symbol('first');
const last = Symbol('last');

Array.prototype[first] = function() {
    return this[0];
};

// Even better: Don't modify built-ins
// Use utility functions or subclass
class ExtendedArray extends Array {
    first() {
        return this[0];
    }

    last() {
        return this[this.length - 1];
    }
}

// Checking if method exists before adding
if (!Array.prototype.includes) {
    Array.prototype.includes = function(item) {
        return this.indexOf(item) !== -1;
    };
}
```

## Example 6: Performance Considerations

```javascript
// Methods on prototype (efficient - shared)
function User(name) {
    this.name = name;
}
User.prototype.greet = function() {
    return `Hello, ${this.name}`;
};

// Methods in constructor (inefficient - new function per instance)
function UserBad(name) {
    this.name = name;
    this.greet = function() {  // New function each time!
        return `Hello, ${this.name}`;
    };
}

// Memory comparison
const users = Array.from({ length: 1000 }, (_, i) =>
    new User(`User ${i}`)
);

const usersBad = Array.from({ length: 1000 }, (_, i) =>
    new UserBad(`User ${i}`)
);

// All 1000 users share ONE greet function
console.log(users[0].greet === users[999].greet);  // true

// Each user has their OWN greet function
console.log(usersBad[0].greet === usersBad[999].greet);  // false
```

**Key Takeaways:**
- Objects inherit from their prototype
- Methods on prototype are shared (memory efficient)
- `Object.create()` creates objects with specified prototype
- Classes are syntactic sugar over prototypes
- Avoid modifying built-in prototypes

---

# Imitation

### Challenge 1: Implement Basic Inheritance

**Task:** Create a Shape hierarchy using only prototypes (no classes).

<details>
<summary>Solution</summary>

```javascript
// Base constructor
function Shape(x, y) {
    this.x = x;
    this.y = y;
}

Shape.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
};

Shape.prototype.area = function() {
    throw new Error('Not implemented');
};

// Circle constructor
function Circle(x, y, radius) {
    Shape.call(this, x, y);
    this.radius = radius;
}

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.area = function() {
    return Math.PI * this.radius ** 2;
};

// Rectangle constructor
function Rectangle(x, y, width, height) {
    Shape.call(this, x, y);
    this.width = width;
    this.height = height;
}

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.area = function() {
    return this.width * this.height;
};

// Usage
const circle = new Circle(0, 0, 5);
const rect = new Rectangle(0, 0, 10, 5);

console.log(circle.area());  // ~78.54
console.log(rect.area());    // 50

circle.move(10, 10);
console.log(circle.x, circle.y);  // 10, 10
```

</details>

---

# Practice

### Exercise 1: Polyfill Array.flat()
**Difficulty:** Intermediate

Implement Array.prototype.flat using prototypes:
```javascript
[1, [2, [3]]].flat(2)  // [1, 2, 3]
```

### Exercise 2: Object Pool
**Difficulty:** Advanced

Create an object pool using prototypes:
- Reuse objects instead of creating new ones
- acquire() and release() methods
- Efficient for high-frequency object creation

---

## Summary

**What you learned:**
- How prototypal inheritance works
- Constructor functions and `.prototype`
- Setting up inheritance chains
- Object.create() patterns
- Performance implications

**Next Steps:**
- Read: [JavaScript this](/api/guides/javascript/oop/this)
- Practice: Convert prototype code to classes
- Deep dive: Reflect and Proxy

---

## Resources

- [MDN: Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [JavaScript.info: Prototypal inheritance](https://javascript.info/prototype-inheritance)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
