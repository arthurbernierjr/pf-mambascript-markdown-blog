---
title: "JavaScript Fetch API"
subTitle: "Modern HTTP Requests"
excerpt: "Fetch makes HTTP requests clean and promise-based."
featureImage: "/img/js-fetch.png"
date: "2026-02-01"
order: 23
---

# Explanation

## What is Fetch?

The Fetch API provides a modern interface for making HTTP requests. It returns Promises and offers more power and flexibility than XMLHttpRequest.

### Key Features

- Promise-based
- Supports streaming
- Built-in JSON handling
- CORS support
- Request/Response objects

---

# Demonstration

## Example 1: Basic Requests

```javascript
// GET request
const response = await fetch('https://api.example.com/users');
const data = await response.json();

// Check response status
if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

// POST request
const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: 'Arthur',
        email: 'art@bpc.com'
    })
});

// Other methods
await fetch(url, { method: 'PUT', body: JSON.stringify(data) });
await fetch(url, { method: 'PATCH', body: JSON.stringify(data) });
await fetch(url, { method: 'DELETE' });

// With query parameters
const params = new URLSearchParams({
    page: 1,
    limit: 10,
    sort: 'name'
});
const response = await fetch(`${url}?${params}`);
```

## Example 2: Headers and Options

```javascript
// Setting headers
const response = await fetch(url, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'X-Custom-Header': 'value'
    }
});

// Using Headers object
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.set('Authorization', 'Bearer ' + token);

const response = await fetch(url, { headers });

// Reading response headers
console.log(response.headers.get('Content-Type'));
response.headers.forEach((value, name) => {
    console.log(`${name}: ${value}`);
});

// Full options
const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'cors',           // cors, no-cors, same-origin
    credentials: 'include', // include, same-origin, omit
    cache: 'no-cache',      // default, no-cache, reload, force-cache
    redirect: 'follow',     // follow, error, manual
    referrerPolicy: 'no-referrer',
    signal: abortController.signal
});
```

## Example 3: Response Handling

```javascript
// Different response types
const response = await fetch(url);

// JSON
const json = await response.json();

// Text
const text = await response.text();

// Blob (for files)
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);

// ArrayBuffer (for binary data)
const buffer = await response.arrayBuffer();

// FormData
const formData = await response.formData();

// Response properties
console.log(response.ok);        // true if status 200-299
console.log(response.status);    // 200
console.log(response.statusText); // 'OK'
console.log(response.url);       // Final URL (after redirects)
console.log(response.type);      // 'basic', 'cors', 'error', 'opaque'
console.log(response.redirected); // Was redirected?

// Clone response (body can only be consumed once)
const clone = response.clone();
const json1 = await response.json();
const json2 = await clone.json();
```

## Example 4: Error Handling

```javascript
// Comprehensive error handling
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Try to parse error body
            let errorBody;
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }

            throw new HttpError(response.status, response.statusText, errorBody);
        }

        return response;
    } catch (error) {
        if (error instanceof TypeError) {
            // Network error or CORS issue
            throw new NetworkError('Network request failed', error);
        }
        throw error;
    }
}

class HttpError extends Error {
    constructor(status, statusText, body) {
        super(`HTTP ${status}: ${statusText}`);
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}

class NetworkError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
    }
}

// Usage
try {
    const response = await fetchWithErrorHandling('/api/users/123');
    const user = await response.json();
} catch (error) {
    if (error instanceof HttpError) {
        if (error.status === 404) {
            console.log('User not found');
        } else if (error.status === 401) {
            console.log('Unauthorized');
        }
    } else if (error instanceof NetworkError) {
        console.log('Network issue:', error.message);
    }
}
```

## Example 5: Advanced Patterns

```javascript
// Abort request
const controller = new AbortController();
const { signal } = controller;

// Timeout
setTimeout(() => controller.abort(), 5000);

try {
    const response = await fetch(url, { signal });
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('Request was aborted');
    }
}

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(id);
    }
}

// Retry with exponential backoff
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;

            // Don't retry client errors
            if (response.status >= 400 && response.status < 500) {
                throw new Error(`Client error: ${response.status}`);
            }
        } catch (error) {
            if (i === retries - 1) throw error;
        }

        // Exponential backoff
        await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
}

// Progress tracking (upload)
async function uploadWithProgress(url, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(e.loaded / e.total);
            }
        });
        xhr.addEventListener('load', () => resolve(xhr.response));
        xhr.addEventListener('error', reject);
        xhr.open('POST', url);
        xhr.send(file);
    });
}
```

## Example 6: API Client

```javascript
class ApiClient {
    constructor(baseUrl, options = {}) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = options.headers || {};
        this.timeout = options.timeout || 30000;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.defaultHeaders,
                    ...options.headers
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new ApiError(response.status, error);
            }

            return response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    get(endpoint, params) {
        const query = params ? '?' + new URLSearchParams(params) : '';
        return this.request(endpoint + query);
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    setAuthToken(token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
}

// Usage
const api = new ApiClient('https://api.example.com');
api.setAuthToken(userToken);

const users = await api.get('/users', { page: 1, limit: 10 });
const newUser = await api.post('/users', { name: 'Arthur' });
```

**Key Takeaways:**
- fetch() returns a Promise
- Check response.ok for success
- Body can only be consumed once
- Use AbortController for cancellation
- Build reusable API clients

---

# Imitation

### Challenge 1: Build a Request Queue

**Task:** Create a queue that limits concurrent requests.

<details>
<summary>Solution</summary>

```javascript
class RequestQueue {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    add(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }

        this.running++;
        const { requestFn, resolve, reject } = this.queue.shift();

        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.process();
        }
    }
}

// Usage
const queue = new RequestQueue(3);

const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
const results = await Promise.all(
    urls.map(url => queue.add(() => fetch(url).then(r => r.json())))
);
```

</details>

---

# Practice

### Exercise 1: Fetch with Cache
**Difficulty:** Intermediate

Implement a caching layer for fetch requests.

### Exercise 2: GraphQL Client
**Difficulty:** Advanced

Build a simple GraphQL client using fetch.

---

## Summary

**What you learned:**
- Basic fetch usage
- Headers and options
- Response handling
- Error handling patterns
- Advanced patterns

**Next Steps:**
- Read: [Async/Await](/api/guides/javascript/async/async-await)
- Practice: Build an API client
- Explore: axios, ky

---

## Resources

- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JavaScript.info: Fetch](https://javascript.info/fetch)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
