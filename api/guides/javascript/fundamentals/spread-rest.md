---
title: "Spread and Rest Operators"
subTitle: "The Three Dots That Do Everything"
excerpt: "... is the Swiss Army knife of JavaScript."
featureImage: "/img/js-spread-rest.png"
date: "2026-02-01"
order: 9
---

# Explanation

## What are Spread and Rest?

The `...` syntax serves two purposes: spreading arrays/objects apart, and gathering items together. Same syntax, opposite effects depending on context.

### Key Concepts

- **Spread**: Expands an iterable into individual elements
- **Rest**: Collects multiple elements into an array
- **Context Determines Behavior**: Left side = rest, right side = spread

### Quick Reference

```javascript
// Spread - expands
const arr = [...other];     // Copy array
const obj = {...other};     // Copy object

// Rest - collects
const [first, ...rest] = arr;  // Rest in destructuring
function fn(...args) {}        // Rest in parameters
```

---

# Demonstration

## Example 1: Spread with Arrays

```javascript
// Copying arrays
const original = [1, 2, 3];
const copy = [...original];

copy.push(4);
console.log(original);  // [1, 2, 3] - unchanged
console.log(copy);      // [1, 2, 3, 4]

// Concatenating arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2];
console.log(combined);  // [1, 2, 3, 4]

// Adding elements
const withStart = [0, ...original];      // [0, 1, 2, 3]
const withEnd = [...original, 4];        // [1, 2, 3, 4]
const withMiddle = [1, ...arr2, 5];      // [1, 3, 4, 5]

// Spreading strings
const chars = [..."hello"];
console.log(chars);  // ['h', 'e', 'l', 'l', 'o']

// Converting iterables to arrays
const set = new Set([1, 2, 3]);
const fromSet = [...set];  // [1, 2, 3]

const nodeList = document.querySelectorAll('div');
const divArray = [...nodeList];

// Function arguments
const numbers = [5, 2, 8, 1, 9];
console.log(Math.max(...numbers));  // 9
console.log(Math.min(...numbers));  // 1
```

## Example 2: Spread with Objects

```javascript
// Copying objects (shallow)
const user = { name: 'Arthur', age: 30 };
const userCopy = { ...user };

userCopy.age = 31;
console.log(user.age);      // 30 - unchanged
console.log(userCopy.age);  // 31

// Merging objects
const defaults = { theme: 'light', lang: 'en' };
const settings = { theme: 'dark' };
const merged = { ...defaults, ...settings };
console.log(merged);  // { theme: 'dark', lang: 'en' }

// Order matters - later wins
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
console.log({ ...obj1, ...obj2 });  // { a: 1, b: 3, c: 4 }
console.log({ ...obj2, ...obj1 });  // { a: 1, b: 2, c: 4 }

// Adding/overriding properties
const withNewProp = { ...user, role: 'admin' };
const withOverride = { ...user, name: 'Art' };

// Conditional spreading
const isAdmin = true;
const adminUser = {
    ...user,
    ...(isAdmin && { role: 'admin', permissions: ['all'] })
};

// Removing properties (with destructuring)
const { age, ...userWithoutAge } = user;
console.log(userWithoutAge);  // { name: 'Arthur' }
```

## Example 3: Rest Parameters

```javascript
// Rest in function parameters
function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Rest with regular parameters
function log(message, ...args) {
    console.log(message, args);
}

log('Users:', 'Alice', 'Bob', 'Charlie');
// Users: ['Alice', 'Bob', 'Charlie']

// Rest must be last
// function bad(a, ...rest, b) {}  // SyntaxError!

// Rest in destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4, 5]

// Rest with objects
const { name, ...otherProps } = { name: 'Arthur', age: 30, role: 'admin' };
console.log(name);        // 'Arthur'
console.log(otherProps);  // { age: 30, role: 'admin' }
```

## Example 4: Practical Patterns

```javascript
// Immutable state updates (React pattern)
const state = {
    user: { name: 'Arthur', settings: { theme: 'dark' } },
    posts: [{ id: 1, title: 'Hello' }]
};

// Update nested property immutably
const newState = {
    ...state,
    user: {
        ...state.user,
        settings: {
            ...state.user.settings,
            theme: 'light'
        }
    }
};

// Add item to array immutably
const withNewPost = {
    ...state,
    posts: [...state.posts, { id: 2, title: 'World' }]
};

// Remove item from array immutably
const withoutFirst = {
    ...state,
    posts: state.posts.filter(p => p.id !== 1)
};

// Update item in array immutably
const withUpdatedPost = {
    ...state,
    posts: state.posts.map(p =>
        p.id === 1 ? { ...p, title: 'Updated' } : p
    )
};

// Function composition with spread
function pipe(...fns) {
    return (value) => fns.reduce((acc, fn) => fn(acc), value);
}

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = pipe(addOne, double, square);
console.log(transform(2));  // ((2 + 1) * 2)² = 36
```

## Example 5: Common Use Cases

```javascript
// Clone and extend
const createUser = (base, overrides) => ({
    id: Date.now(),
    createdAt: new Date(),
    ...base,
    ...overrides
});

const user = createUser(
    { name: 'Arthur', role: 'user' },
    { role: 'admin' }
);

// Array deduplication
const withDupes = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(withDupes)];
console.log(unique);  // [1, 2, 3]

// Conditional array elements
const permissions = [
    'read',
    'write',
    ...(isAdmin ? ['delete', 'admin'] : [])
];

// Props forwarding in React
function Button({ children, ...props }) {
    return <button {...props}>{children}</button>;
}

// <Button className="primary" onClick={handleClick}>Click</Button>

// API response transformation
function transformUser({ id, attributes, relationships }) {
    return {
        id,
        ...attributes,
        friends: relationships?.friends?.data || []
    };
}

// Merge configurations
function mergeConfig(...configs) {
    return configs.reduce((merged, config) => ({
        ...merged,
        ...config,
        // Deep merge for nested objects
        headers: { ...merged.headers, ...config.headers }
    }), {});
}

const config = mergeConfig(
    { timeout: 1000, headers: { 'Accept': 'application/json' } },
    { timeout: 2000, headers: { 'Authorization': 'Bearer token' } }
);
```

**Key Takeaways:**
- Spread expands, rest collects
- Both use `...` syntax
- Essential for immutable updates
- Shallow copy only (not deep)
- Order matters when merging

---

# Imitation

### Challenge 1: Implement Merge Deep

**Task:** Create a function that deeply merges objects.

<details>
<summary>Solution</summary>

```javascript
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// Immutable version
function mergeDeepImmutable(...objects) {
    return objects.reduce((result, obj) => {
        Object.keys(obj).forEach(key => {
            if (isObject(result[key]) && isObject(obj[key])) {
                result[key] = mergeDeepImmutable(result[key], obj[key]);
            } else {
                result[key] = obj[key];
            }
        });
        return result;
    }, {});
}
```

</details>

### Challenge 2: Create Variadic Function Wrapper

**Task:** Build a wrapper that logs all arguments and return value.

<details>
<summary>Solution</summary>

```javascript
function withLogging(fn, name = fn.name) {
    return function(...args) {
        console.log(`${name} called with:`, args);

        const result = fn.apply(this, args);

        if (result instanceof Promise) {
            return result.then(value => {
                console.log(`${name} resolved:`, value);
                return value;
            }).catch(error => {
                console.log(`${name} rejected:`, error);
                throw error;
            });
        }

        console.log(`${name} returned:`, result);
        return result;
    };
}

// Usage
const add = (a, b) => a + b;
const loggedAdd = withLogging(add);

loggedAdd(2, 3);
// add called with: [2, 3]
// add returned: 5

// With async
const fetchUser = async (id) => ({ id, name: 'User' });
const loggedFetch = withLogging(fetchUser, 'fetchUser');

await loggedFetch(1);
// fetchUser called with: [1]
// fetchUser resolved: { id: 1, name: 'User' }
```

</details>

---

# Practice

### Exercise 1: Array Utilities
**Difficulty:** Intermediate

Create utility functions using spread/rest:
- `first(arr, n)` - Get first n items
- `last(arr, n)` - Get last n items
- `without(arr, ...values)` - Remove values

### Exercise 2: Object Utilities
**Difficulty:** Advanced

Build object utility functions:
- `pick(obj, ...keys)` - Select keys
- `omit(obj, ...keys)` - Exclude keys
- `defaults(obj, ...sources)` - Apply defaults

---

## Summary

**What you learned:**
- Spread expands arrays and objects
- Rest collects into arrays
- Essential for immutable patterns
- Shallow copying behavior
- Practical use cases

**Next Steps:**
- Read: [JavaScript Classes](/api/guides/javascript/oop/classes)
- Practice: Refactor mutations to immutable
- Build: State management without mutation

---

## Resources

- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN: Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
