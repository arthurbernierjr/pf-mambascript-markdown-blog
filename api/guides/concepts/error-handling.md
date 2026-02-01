---
title: "Error Handling"
subTitle: "Graceful Failure and Recovery"
excerpt: "Good error handling separates amateur code from professional."
featureImage: "/img/error-handling.png"
date: "2026-02-01"
order: 811
---

# Explanation

## Why Error Handling Matters

Errors are inevitable. How you handle them determines user experience and debugging efficiency. Good error handling is informative, recoverable, and secure.

### Key Principles

- **Fail Fast**: Detect errors early
- **Fail Gracefully**: Provide useful feedback
- **Log Appropriately**: Capture context for debugging
- **Don't Expose Internals**: Security through obscurity

---

# Demonstration

## Example 1: JavaScript Error Handling

```javascript
// Custom error classes
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

class ValidationError extends AppError {
    constructor(errors) {
        super('Validation failed', 400);
        this.errors = errors;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new NotFoundError('User');
    }

    res.json({ data: user });
}));

// Global error handler
app.use((err, req, res, next) => {
    // Log error
    console.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Operational errors - send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.errors && { details: err.errors })
        });
    }

    // Programming errors - don't leak details
    res.status(500).json({
        error: 'Something went wrong'
    });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Optionally restart the process
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
```

## Example 2: Try-Catch Patterns

```javascript
// Basic try-catch
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError') {
            // Network error
            console.error('Network error:', error);
            throw new AppError('Network unavailable', 503);
        }

        throw error;
    }
}

// Try-catch with cleanup
async function processFile(path) {
    let file;
    try {
        file = await fs.open(path, 'r');
        const content = await file.readFile('utf8');
        return processContent(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new NotFoundError('File');
        }
        throw error;
    } finally {
        // Always runs
        if (file) {
            await file.close();
        }
    }
}

// Optional catch binding (ES2019)
try {
    JSON.parse(invalidJson);
} catch {
    // Don't need error variable
    return defaultValue;
}

// Error boundaries in React
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log to error reporting service
        logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}

// Usage
<ErrorBoundary>
    <MyComponent />
</ErrorBoundary>
```

## Example 3: API Error Responses

```javascript
// Standardized error response format
const errorResponse = {
    error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
            { field: 'email', message: 'Invalid email format' },
            { field: 'password', message: 'Must be at least 8 characters' }
        ]
    },
    meta: {
        timestamp: '2024-01-15T10:30:00Z',
        requestId: 'abc-123-def'
    }
};

// Error codes enum
const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Error factory
function createErrorResponse(code, message, details = null) {
    return {
        error: {
            code,
            message,
            ...(details && { details })
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
        }
    };
}

// HTTP status code mapping
const statusCodeMap = {
    [ErrorCodes.VALIDATION_ERROR]: 400,
    [ErrorCodes.NOT_FOUND]: 404,
    [ErrorCodes.UNAUTHORIZED]: 401,
    [ErrorCodes.FORBIDDEN]: 403,
    [ErrorCodes.RATE_LIMITED]: 429,
    [ErrorCodes.INTERNAL_ERROR]: 500
};
```

## Example 4: Logging Best Practices

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'api' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Structured logging
logger.info('User created', {
    userId: user.id,
    email: user.email,
    action: 'create_user'
});

logger.error('Payment failed', {
    userId: user.id,
    orderId: order.id,
    error: error.message,
    stack: error.stack,
    paymentMethod: order.paymentMethod
});

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        logger.info('Request completed', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration,
            userAgent: req.get('user-agent'),
            ip: req.ip
        });
    });

    next();
});

// Error logging with context
function logError(error, context = {}) {
    logger.error(error.message, {
        ...context,
        errorName: error.name,
        errorCode: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}
```

**Key Takeaways:**
- Create custom error classes
- Use async error handlers
- Standardize error responses
- Log with context
- Never expose stack traces to users

---

# Imitation

### Challenge 1: Build Error Reporting

**Task:** Create an error reporting utility that sends errors to a service.

<details>
<summary>Solution</summary>

```javascript
class ErrorReporter {
    constructor(options = {}) {
        this.endpoint = options.endpoint;
        this.appName = options.appName || 'app';
        this.environment = options.environment || 'development';
        this.queue = [];
        this.batchSize = options.batchSize || 10;
        this.flushInterval = options.flushInterval || 5000;

        setInterval(() => this.flush(), this.flushInterval);
    }

    capture(error, context = {}) {
        const report = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            app: this.appName,
            environment: this.environment,
            context: {
                url: typeof window !== 'undefined' ? window.location.href : null,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                ...context
            }
        };

        this.queue.push(report);

        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    }

    async flush() {
        if (this.queue.length === 0) return;

        const batch = this.queue.splice(0, this.batchSize);

        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ errors: batch })
            });
        } catch (e) {
            // Re-queue on failure
            this.queue.unshift(...batch);
        }
    }

    // Global error handler
    install() {
        window.onerror = (message, source, line, column, error) => {
            this.capture(error || new Error(message), {
                source, line, column
            });
        };

        window.onunhandledrejection = (event) => {
            this.capture(event.reason);
        };
    }
}

const reporter = new ErrorReporter({
    endpoint: '/api/errors',
    appName: 'my-app'
});

reporter.install();
```

</details>

---

# Practice

### Exercise 1: Retry Logic
**Difficulty:** Intermediate

Implement a retry utility that:
- Retries failed operations
- Uses exponential backoff
- Has configurable max retries

### Exercise 2: Circuit Breaker
**Difficulty:** Advanced

Build a circuit breaker pattern:
- Opens on repeated failures
- Closes after timeout
- Half-open state for testing

---

## Summary

**What you learned:**
- Custom error classes
- Async error handling
- Standardized error responses
- Structured logging
- Error boundaries

**Next Steps:**
- Read: [Monitoring](/api/guides/concepts/monitoring)
- Practice: Add error handling to your API
- Explore: Sentry, LogRocket

---

## Resources

- [Node.js Error Handling](https://nodejs.org/api/errors.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
