---
title: "JavaScript Promises"
subTitle: "Taming Asynchronous Code"
excerpt: "The future belongs to those who prepare for it today. - Malcolm X"
featureImage: "/img/js-promises.png"
date: "2026-02-01"
order: 110
---

# Explanation

## What Are Promises?

A Promise is an object representing the eventual completion (or failure) of an asynchronous operation. Think of it like ordering food at a restaurant - you get a ticket (promise) that will eventually be fulfilled with your food (resolved) or you'll be told they're out (rejected).

```javascript
const orderFood = new Promise((resolve, reject) => {
    // Kitchen is working...
    if (foodReady) {
        resolve('🍔 Your burger is ready!');
    } else {
        reject('Sorry, we are out of burgers');
    }
});
```

### Promise States

1. **Pending**: Initial state, neither fulfilled nor rejected
2. **Fulfilled**: Operation completed successfully
3. **Rejected**: Operation failed

### Why This Matters

Promises solve "callback hell" and make async code readable:

```javascript
// Callback hell 😱
getData(function(a) {
    getMoreData(a, function(b) {
        getEvenMoreData(b, function(c) {
            console.log(c);
        });
    });
});

// Promise chain 😊
getData()
    .then(a => getMoreData(a))
    .then(b => getEvenMoreData(b))
    .then(c => console.log(c));
```

---

# Demonstration

## Example 1: Creating and Using Promises

```javascript
// Creating a promise
const fetchUser = (userId) => {
    return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: 'Arthur', email: 'art@bpc.com' });
            } else {
                reject(new Error('Invalid user ID'));
            }
        }, 1000);
    });
};

// Using the promise
fetchUser(1)
    .then(user => {
        console.log('User found:', user);
        return user.name; // Pass to next .then
    })
    .then(name => {
        console.log('Name is:', name);
    })
    .catch(error => {
        console.error('Error:', error.message);
    })
    .finally(() => {
        console.log('Request completed');
    });
```

**Output:**
```
User found: { id: 1, name: 'Arthur', email: 'art@bpc.com' }
Name is: Arthur
Request completed
```

## Example 2: Promise.all and Promise.race

```javascript
const fetchUser = id => new Promise(resolve =>
    setTimeout(() => resolve({ id, name: `User ${id}` }), 1000)
);

const fetchPosts = userId => new Promise(resolve =>
    setTimeout(() => resolve([{ id: 1, title: 'Post 1' }]), 800)
);

const fetchComments = postId => new Promise(resolve =>
    setTimeout(() => resolve(['Great post!', 'Thanks!']), 600)
);

// Promise.all - Wait for ALL to complete
Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
])
.then(([user, posts, comments]) => {
    console.log('All data:', { user, posts, comments });
})
.catch(error => console.error('One failed:', error));

// Promise.race - First one wins
Promise.race([
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
])
.then(firstResult => {
    console.log('First to finish:', firstResult);
});

// Promise.allSettled - Get all results regardless of success/failure
Promise.allSettled([
    Promise.resolve('Success'),
    Promise.reject('Failed'),
    Promise.resolve('Also success')
])
.then(results => {
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            console.log('Value:', result.value);
        } else {
            console.log('Reason:', result.reason);
        }
    });
});
```

## Example 3: Real-World API Calls

```javascript
// Fetch API returns promises
const getUsers = async () => {
    const response = await fetch('https://api.example.com/users');

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Chaining API calls
const getUserWithPosts = (userId) => {
    let userData;

    return fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            userData = user;
            return fetch(`/api/users/${userId}/posts`);
        })
        .then(res => res.json())
        .then(posts => {
            return { ...userData, posts };
        });
};

// Error handling with specific catches
fetch('/api/data')
    .then(res => {
        if (res.status === 404) throw new Error('Not found');
        if (res.status === 401) throw new Error('Unauthorized');
        return res.json();
    })
    .then(data => console.log(data))
    .catch(error => {
        if (error.message === 'Unauthorized') {
            // Redirect to login
        } else {
            // Show error message
        }
    });
```

**Key Takeaways:**
- `.then()` handles success, `.catch()` handles errors
- `.finally()` runs regardless of outcome
- `Promise.all` fails fast - one rejection rejects all
- `Promise.allSettled` waits for all, reports each status

---

# Imitation

### Challenge 1: Retry Logic

**Task:** Create a function that retries a failed promise up to N times.

```javascript
retry(fetchData, 3); // Try fetchData up to 3 times
```

<details>
<summary>Solution</summary>

```javascript
const retry = (fn, retries) => {
    return fn().catch(error => {
        if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            return retry(fn, retries - 1);
        }
        throw error;
    });
};

// Usage
retry(() => fetch('/flaky-api').then(r => r.json()), 3)
    .then(data => console.log(data))
    .catch(err => console.log('All retries failed'));
```

</details>

### Challenge 2: Timeout Wrapper

**Task:** Create a function that adds a timeout to any promise.

```javascript
withTimeout(fetchData(), 5000); // Reject if not resolved in 5 seconds
```

<details>
<summary>Solution</summary>

```javascript
const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });

    return Promise.race([promise, timeout]);
};

// Usage
withTimeout(fetch('/slow-api'), 5000)
    .then(data => console.log(data))
    .catch(err => console.log(err.message)); // 'Timeout' if too slow
```

</details>

---

# Practice

### Exercise 1: Sequential vs Parallel
**Difficulty:** Intermediate

You have 3 API calls that each take 1 second. Write two versions:
1. Sequential (total ~3 seconds)
2. Parallel (total ~1 second)

### Exercise 2: Promise Queue
**Difficulty:** Advanced

Create a promise queue that runs promises with a concurrency limit:

```javascript
const queue = new PromiseQueue(2); // Max 2 concurrent
queue.add(() => fetch('/api/1'));
queue.add(() => fetch('/api/2'));
queue.add(() => fetch('/api/3')); // Waits until one of the first two finishes
```

---

## Summary

**What you learned:**
- Promise states: pending, fulfilled, rejected
- Creating promises with `new Promise()`
- Chaining with `.then()`, `.catch()`, `.finally()`
- Combining promises: `all`, `race`, `allSettled`

**Next Steps:**
- Read: [Async/Await](/api/guides/javascript/async/async-await)
- Practice: Convert callback-based code to promises
- Build: Create a data fetching library with retry logic

---

## Resources

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info: Promises](https://javascript.info/promise-basics)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
