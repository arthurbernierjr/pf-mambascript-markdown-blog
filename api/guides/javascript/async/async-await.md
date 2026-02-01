---
title: "Async/Await"
subTitle: "Writing Asynchronous Code That Looks Synchronous"
excerpt: "Simplicity is the soul of efficiency. - Austin Freeman"
featureImage: "/img/js-async-await.png"
date: "2026-02-01"
order: 111
---

# Explanation

## What is Async/Await?

Async/await is syntactic sugar over Promises that makes asynchronous code look and behave more like synchronous code. It's like having a conversation instead of sending letters back and forth.

```javascript
// Promise chain
fetchUser(1)
    .then(user => fetchPosts(user.id))
    .then(posts => console.log(posts));

// Async/await (same thing, cleaner)
const user = await fetchUser(1);
const posts = await fetchPosts(user.id);
console.log(posts);
```

### Key Concepts

- **async**: Marks a function as asynchronous (always returns a Promise)
- **await**: Pauses execution until the Promise resolves
- **try/catch**: Handles errors in async code
- **Top-level await**: Use await outside functions (in modules)

### Why This Matters

Async/await makes code:
- **Readable**: Looks like synchronous code
- **Debuggable**: Stack traces make sense
- **Maintainable**: Easier to modify and understand

---

# Demonstration

## Example 1: Basic Async/Await

```javascript
// Regular function that returns a Promise
const fetchUser = (id) => {
    return new Promise(resolve => {
        setTimeout(() => resolve({ id, name: 'Arthur' }), 1000);
    });
};

// Async function
async function getUser(id) {
    console.log('Fetching user...');
    const user = await fetchUser(id); // Waits here
    console.log('User fetched:', user);
    return user;
}

// Arrow function version
const getUserArrow = async (id) => {
    const user = await fetchUser(id);
    return user;
};

// Calling async functions
getUser(1).then(user => console.log('Final:', user));

// Or with await (must be in async context)
const main = async () => {
    const user = await getUser(1);
    console.log('Final:', user);
};
main();
```

## Example 2: Error Handling

```javascript
const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
};

// Try/catch for error handling
const getUserData = async (userId) => {
    try {
        const user = await fetchData(`/api/users/${userId}`);
        const posts = await fetchData(`/api/users/${userId}/posts`);
        return { user, posts };
    } catch (error) {
        console.error('Failed to fetch:', error.message);
        // Return default or rethrow
        return { user: null, posts: [] };
    } finally {
        console.log('Fetch attempt completed');
    }
};

// Alternative: catch on the call
const result = await getUserData(1).catch(err => {
    console.error(err);
    return null;
});
```

## Example 3: Parallel vs Sequential

```javascript
const delay = (ms, value) => new Promise(r => setTimeout(() => r(value), ms));

// SEQUENTIAL - Each waits for previous (slow)
const sequential = async () => {
    console.time('sequential');
    const a = await delay(1000, 'A'); // Wait 1s
    const b = await delay(1000, 'B'); // Wait another 1s
    const c = await delay(1000, 'C'); // Wait another 1s
    console.timeEnd('sequential'); // ~3000ms
    return [a, b, c];
};

// PARALLEL - All run at once (fast)
const parallel = async () => {
    console.time('parallel');
    const [a, b, c] = await Promise.all([
        delay(1000, 'A'),
        delay(1000, 'B'),
        delay(1000, 'C')
    ]);
    console.timeEnd('parallel'); // ~1000ms
    return [a, b, c];
};

// Start parallel, await later
const parallelAlt = async () => {
    // Start all immediately
    const promiseA = delay(1000, 'A');
    const promiseB = delay(1000, 'B');
    const promiseC = delay(1000, 'C');

    // Await results
    const a = await promiseA;
    const b = await promiseB;
    const c = await promiseC;

    return [a, b, c]; // ~1000ms total
};
```

**Key Takeaways:**
- `await` pauses the function, not the entire program
- Use `Promise.all()` for parallel operations
- Start promises early, await them later for concurrency
- Always handle errors with try/catch

---

# Imitation

### Challenge 1: Async Loop

**Task:** Fetch users 1-5 sequentially (one at a time).

```javascript
// Should fetch user 1, then 2, then 3, etc.
// Not all at once!
```

<details>
<summary>Solution</summary>

```javascript
const fetchUsersSequentially = async () => {
    const users = [];
    for (let i = 1; i <= 5; i++) {
        const user = await fetchUser(i);
        users.push(user);
        console.log(`Fetched user ${i}`);
    }
    return users;
};

// Using for...of with array
const fetchAll = async (ids) => {
    const results = [];
    for (const id of ids) {
        results.push(await fetchUser(id));
    }
    return results;
};
```

</details>

### Challenge 2: Async Map

**Task:** Create an async version of `Array.map()`.

```javascript
const results = await asyncMap([1, 2, 3], async (n) => {
    return await fetchUser(n);
});
```

<details>
<summary>Solution</summary>

```javascript
// Parallel version (all at once)
const asyncMap = async (arr, fn) => {
    return Promise.all(arr.map(fn));
};

// Sequential version (one at a time)
const asyncMapSequential = async (arr, fn) => {
    const results = [];
    for (const item of arr) {
        results.push(await fn(item));
    }
    return results;
};
```

</details>

---

# Practice

### Exercise 1: Data Aggregator
**Difficulty:** Intermediate

Create an async function that fetches data from multiple APIs and combines them:

```javascript
const getDashboardData = async (userId) => {
    // Fetch user, their posts, and notifications in parallel
    // Return combined object
};
```

### Exercise 2: Retry with Exponential Backoff
**Difficulty:** Advanced

Create an async retry function with exponential backoff:

```javascript
await retryWithBackoff(fetchData, {
    maxRetries: 3,
    baseDelay: 1000 // 1s, then 2s, then 4s
});
```

---

## Summary

**What you learned:**
- `async` functions always return Promises
- `await` pauses execution until Promise resolves
- Use try/catch for error handling
- Use Promise.all for parallel operations

**Next Steps:**
- Read: [Event Loop](/api/guides/javascript/async/event-loop)
- Practice: Refactor Promise chains to async/await
- Build: Create an async data fetching hook for React

---

## Resources

- [MDN: async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
- [JavaScript.info: Async/await](https://javascript.info/async-await)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
