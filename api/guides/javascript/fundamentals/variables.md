---
title: "JavaScript Variables"
subTitle: "The Building Blocks of Every Program"
excerpt: "Excellence is not a singular act, but a habit. You are what you repeatedly do. - Shaquille O'Neal"
featureImage: "/img/js-variables.png"
date: "2026-02-01"
order: 101
---

# Explanation

## What Are Variables?

Think of variables like labeled boxes in your garage. Each box has a name on it (the variable name) and something inside it (the value). When you need that thing, you just look for the box with the right label.

```javascript
const toolbox = "hammers and screwdrivers";
let groceryBag = "apples and oranges";
```

In programming, variables are how we store and manage data. They're the foundation of everything we build.

### The Three Ways to Declare Variables

JavaScript gives us three keywords for creating variables: `var`, `let`, and `const`.

| Keyword | Reassignable | Scope | Use Case |
|---------|-------------|-------|----------|
| `const` | No | Block | Default choice, values that don't change |
| `let` | Yes | Block | Values that will be reassigned |
| `var` | Yes | Function | Legacy code (avoid in modern JS) |

### Why This Matters

Understanding variables is like understanding the alphabet before writing. Every program you write will use variables to:
- Store user input
- Track application state
- Hold data from APIs
- Configure settings
- And much more...

---

# Demonstration

## Example 1: const vs let

```javascript
// const - for values that won't be reassigned
const API_URL = "https://api.example.com";
const MAX_USERS = 100;
const user = { name: "Arthur", role: "admin" };

// This will ERROR:
// API_URL = "https://other-api.com"; // TypeError!

// But this is FINE (mutating, not reassigning):
user.name = "Big Poppa";  // ✅ Works!
user.email = "art@bpc.com"; // ✅ Adding properties works too

// let - for values that will change
let score = 0;
let isLoggedIn = false;
let currentPage = "home";

// Reassignment is allowed
score = score + 10;  // ✅ Now score is 10
isLoggedIn = true;   // ✅ User logged in
```

**Output:**
```
user = { name: "Big Poppa", role: "admin", email: "art@bpc.com" }
score = 10
isLoggedIn = true
```

**Explanation:**
- `const` prevents reassignment, not mutation
- Objects and arrays declared with `const` can still have their contents changed
- Use `let` when you know the value will be reassigned

## Example 2: Block Scope

```javascript
function demonstrateScope() {
    const outsideBlock = "I'm accessible everywhere in this function";

    if (true) {
        const insideBlock = "I only exist inside this if block";
        let alsoInsideBlock = "Me too!";

        console.log(outsideBlock);    // ✅ Works
        console.log(insideBlock);     // ✅ Works
    }

    console.log(outsideBlock);        // ✅ Works
    // console.log(insideBlock);      // ❌ ReferenceError!
    // console.log(alsoInsideBlock);  // ❌ ReferenceError!
}

// var ignores block scope (one reason to avoid it)
function varExample() {
    if (true) {
        var leaky = "I escape the block!";
    }
    console.log(leaky); // "I escape the block!" - probably not what you wanted
}
```

**Key Takeaways:**
- `const` and `let` are block-scoped (curly braces define their boundaries)
- `var` is function-scoped (can leak out of blocks)
- Block scoping prevents accidental variable pollution

---

# Imitation

### Challenge 1: Fix the Bug

**Task:** This code has a bug. The developer wanted to prevent changes to the config, but something's wrong.

```javascript
const config = {
    apiKey: "secret123",
    maxRetries: 3
};

// Later in the code...
config.apiKey = "hacked!";  // This shouldn't be allowed!
console.log(config.apiKey); // Outputs: "hacked!"
```

**Hint:** `const` doesn't make objects immutable. Research `Object.freeze()`.

<details>
<summary>Solution</summary>

```javascript
const config = Object.freeze({
    apiKey: "secret123",
    maxRetries: 3
});

config.apiKey = "hacked!";  // Silently fails (or throws in strict mode)
console.log(config.apiKey); // Still "secret123"
```

**Explanation:** `Object.freeze()` makes the object immutable. In strict mode, attempting to modify it throws an error.

</details>

### Challenge 2: Swap Variables

**Task:** Swap the values of two variables without using a third variable.

```javascript
let a = "first";
let b = "second";

// Your code here

console.log(a); // Should be "second"
console.log(b); // Should be "first"
```

**Requirements:**
- Don't create a `temp` variable
- Use modern JavaScript features

<details>
<summary>Solution</summary>

```javascript
let a = "first";
let b = "second";

// Destructuring assignment swap
[a, b] = [b, a];

console.log(a); // "second"
console.log(b); // "first"
```

**Explanation:** Array destructuring lets you unpack values. `[b, a]` creates a temporary array, and `[a, b] =` unpacks it into the variables.

</details>

---

# Practice

### Exercise 1: Shopping Cart State
**Difficulty:** Beginner

**Scenario:** You're building a shopping cart. Set up the variables correctly.

**Your Task:**
Declare appropriate variables for:
1. The store name (never changes)
2. Items in cart (will be modified)
3. Total price (will be recalculated)
4. Is the cart empty? (will change)
5. Maximum items allowed (configuration, shouldn't change)

**Tests:**
- Store name should use `const`
- Cart items should be modifiable
- You should be able to add items and update the total

### Exercise 2: User Session Manager
**Difficulty:** Intermediate

**Scenario:** Build a simple user session manager.

**Your Task:**
1. Create a `session` object with: `userId`, `username`, `loginTime`, `isActive`
2. Create a function `login(userId, username)` that sets the session
3. Create a function `logout()` that clears the session
4. Create a function `isSessionValid()` that checks if session is active

**Bonus:**
- Add session expiry (30 minutes from login)
- Add a `getSessionDuration()` function

---

## Summary

**What you learned:**
- `const` for values that won't be reassigned (your default choice)
- `let` for values that will be reassigned
- Avoid `var` in modern JavaScript
- Block scope vs function scope
- `const` doesn't mean immutable for objects

**Next Steps:**
- Read: [JavaScript Functions](/api/guides/javascript/fundamentals/functions)
- Practice: Refactor old code to use `const` and `let`
- Build: Create a configuration manager for an app

---

## Resources

- [MDN: let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
