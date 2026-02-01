---
title: "Async Error Handling"
subTitle: "Handling Errors in Asynchronous Code"
excerpt: "Async errors can be tricky - learn the patterns that prevent bugs."
featureImage: "/img/js-async-errors.png"
date: "2026-02-01"
order: 24
---

# Explanation

## Why Async Error Handling Matters

Asynchronous operations can fail in ways synchronous code cannot. Network requests timeout, files don't exist, APIs return errors. Proper handling is critical.

### Common Pitfalls

- Unhandled promise rejections
- Silent failures
- Error swallowing
- Race conditions

---

# Demonstration

## Example 1: Promise Error Handling

```javascript
// .catch() for promises
fetch('/api/users')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Chain errors propagate
Promise.resolve()
    .then(() => {
        throw new Error('Step 1 failed');
    })
    .then(() => {
        console.log('This never runs');
    })
    .catch(error => {
        console.error('Caught:', error.message);  // 'Step 1 failed'
        return 'recovered';  // Recovery
    })
    .then(result => {
        console.log(result);  // 'recovered'
    });

// Rethrowing errors
fetch('/api/users')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Logging error:', error);
        throw error;  // Rethrow to propagate
    });

// Finally for cleanup
let loading = true;
fetch('/api/data')
    .then(r => r.json())
    .catch(error => console.error(error))
    .finally(() => {
        loading = false;  // Always runs
    });
```

## Example 2: Try/Catch with Async/Await

```javascript
// Basic try/catch
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;  // Re-throw or return default
    }
}

// Multiple awaits in one try
async function loadDashboard() {
    try {
        const user = await fetchUser(1);
        const posts = await fetchPosts(user.id);
        const comments = await fetchComments(posts[0].id);
        return { user, posts, comments };
    } catch (error) {
        // Any failure lands here
        console.error('Dashboard load failed:', error);
        return { error: error.message };
    }
}

// Separate try/catch blocks
async function loadData() {
    let user, posts;

    try {
        user = await fetchUser(1);
    } catch (error) {
        console.error('User fetch failed');
        user = null;
    }

    try {
        posts = await fetchPosts();
    } catch (error) {
        console.error('Posts fetch failed');
        posts = [];
    }

    return { user, posts };  // Partial data OK
}

// Finally with async/await
async function processFile(path) {
    const file = await openFile(path);
    try {
        return await processContent(file);
    } finally {
        await closeFile(file);  // Always runs
    }
}
```

## Example 3: Promise.all and Errors

```javascript
// Promise.all - first rejection wins
try {
    const results = await Promise.all([
        fetch('/api/users'),
        fetch('/api/posts'),
        fetch('/api/comments')
    ]);
} catch (error) {
    // One failure = all fail
    console.error('One request failed:', error);
}

// Promise.allSettled - get all results
const results = await Promise.allSettled([
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments')
]);

results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
        console.log(`Request ${index} succeeded:`, result.value);
    } else {
        console.log(`Request ${index} failed:`, result.reason);
    }
});

// Filter successes and failures
const successes = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

const failures = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

// Promise.any - first success wins
try {
    const first = await Promise.any([
        fetch('https://server1.com/api'),
        fetch('https://server2.com/api'),
        fetch('https://server3.com/api')
    ]);
    console.log('First success:', first);
} catch (error) {
    // AggregateError if all fail
    console.error('All failed:', error.errors);
}
```

## Example 4: Custom Error Classes

```javascript
// Custom error classes
class AppError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

class NetworkError extends AppError {
    constructor(message, details = {}) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'NetworkError';
    }
}

class ValidationError extends AppError {
    constructor(message, fields = {}) {
        super(message, 'VALIDATION_ERROR', { fields });
        this.name = 'ValidationError';
    }
}

class NotFoundError extends AppError {
    constructor(resource, id) {
        super(`${resource} not found`, 'NOT_FOUND', { resource, id });
        this.name = 'NotFoundError';
    }
}

// Usage
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);

        if (response.status === 404) {
            throw new NotFoundError('User', id);
        }

        if (!response.ok) {
            throw new NetworkError('Failed to fetch user', {
                status: response.status
            });
        }

        return await response.json();
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new NetworkError('Network request failed', { cause: error });
    }
}

// Handling
try {
    const user = await fetchUser(123);
} catch (error) {
    if (error instanceof NotFoundError) {
        showNotFound(error.details.resource);
    } else if (error instanceof NetworkError) {
        showNetworkError();
    } else if (error instanceof ValidationError) {
        showFieldErrors(error.details.fields);
    } else {
        showGenericError();
    }
}
```

## Example 5: Global Error Handling

```javascript
// Browser: Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    // Report to error tracking
    trackError(event.reason);
    // Prevent default browser behavior
    event.preventDefault();
});

// Browser: Global errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    trackError(event.error);
});

// Node.js
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);  // Exit after logging
});

// React error boundary
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        trackError(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}
```

## Example 6: Error Handling Utilities

```javascript
// Safe JSON parse
function safeJsonParse(text, fallback = null) {
    try {
        return JSON.parse(text);
    } catch {
        return fallback;
    }
}

// Try/catch wrapper
function tryCatch(fn, fallback = null) {
    try {
        return fn();
    } catch {
        return fallback;
    }
}

// Async try/catch wrapper
async function asyncTryCatch(fn, fallback = null) {
    try {
        return await fn();
    } catch {
        return fallback;
    }
}

// Result type pattern
function ok(value) {
    return { ok: true, value };
}

function err(error) {
    return { ok: false, error };
}

async function safeFetch(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return err(new Error(`HTTP ${response.status}`));
        }
        const data = await response.json();
        return ok(data);
    } catch (error) {
        return err(error);
    }
}

// Usage
const result = await safeFetch('/api/users');
if (result.ok) {
    console.log('Data:', result.value);
} else {
    console.log('Error:', result.error);
}

// Retry helper
async function retry(fn, options = {}) {
    const { attempts = 3, delay = 1000, backoff = 2 } = options;

    let lastError;

    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < attempts - 1) {
                await new Promise(r => setTimeout(r, delay * backoff ** i));
            }
        }
    }

    throw lastError;
}

// Usage
const data = await retry(() => fetch('/api/data').then(r => r.json()), {
    attempts: 3,
    delay: 1000
});
```

**Key Takeaways:**
- Always handle promise rejections
- Use try/catch with async/await
- Create meaningful error classes
- Handle global unhandled errors
- Use Result type for explicit handling

---

# Imitation

### Challenge 1: Circuit Breaker Pattern

**Task:** Implement a circuit breaker for API calls.

<details>
<summary>Solution</summary>

```javascript
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 30000;

        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.nextRetry = 0;
    }

    async call(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextRetry) {
                throw new Error('Circuit is OPEN');
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failures = 0;
        if (this.state === 'HALF_OPEN') {
            this.successes++;
            if (this.successes >= this.successThreshold) {
                this.state = 'CLOSED';
                this.successes = 0;
            }
        }
    }

    onFailure() {
        this.failures++;
        this.successes = 0;

        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextRetry = Date.now() + this.timeout;
        }
    }
}

const breaker = new CircuitBreaker();

async function fetchWithCircuitBreaker(url) {
    return breaker.call(() => fetch(url).then(r => r.json()));
}
```

</details>

---

# Practice

### Exercise 1: Error Aggregation
**Difficulty:** Intermediate

Collect multiple async errors and report them together.

### Exercise 2: Graceful Degradation
**Difficulty:** Advanced

Build a system that falls back to cached data on errors.

---

## Summary

**What you learned:**
- Promise error handling
- Try/catch with async/await
- Promise.allSettled for partial failures
- Custom error classes
- Global error handling

**Next Steps:**
- Read: [Fetch API](/api/guides/javascript/async/fetch)
- Practice: Add error handling to your app
- Explore: Error tracking services

---

## Resources

- [MDN: Error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [JavaScript.info: Error handling](https://javascript.info/error-handling)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
