---
title: "Testing Fundamentals"
subTitle: "Writing Reliable, Maintainable Tests"
excerpt: "Code without tests is broken by design."
featureImage: "/img/testing.png"
date: "2026-02-01"
order: 805
---

# Explanation

## Why Test?

Tests catch bugs early, document behavior, enable refactoring, and give you confidence when deploying. They're an investment that pays dividends.

### Types of Tests

- **Unit Tests**: Test individual functions/classes
- **Integration Tests**: Test components working together
- **E2E Tests**: Test complete user flows
- **Snapshot Tests**: Detect unexpected changes

### Testing Pyramid

```
        /\
       /  \
      / E2E \       Few, slow, expensive
     /______\
    /        \
   /Integration\    Some, medium speed
  /__________\
 /            \
/   Unit Tests  \   Many, fast, cheap
/________________\
```

---

# Demonstration

## Example 1: Unit Testing (Jest)

```javascript
// calculator.js
class Calculator {
    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }

    multiply(a, b) {
        return a * b;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Cannot divide by zero');
        }
        return a / b;
    }
}

module.exports = Calculator;

// calculator.test.js
const Calculator = require('./calculator');

describe('Calculator', () => {
    let calc;

    beforeEach(() => {
        calc = new Calculator();
    });

    describe('add', () => {
        test('adds two positive numbers', () => {
            expect(calc.add(2, 3)).toBe(5);
        });

        test('adds negative numbers', () => {
            expect(calc.add(-1, -2)).toBe(-3);
        });

        test('adds zero', () => {
            expect(calc.add(5, 0)).toBe(5);
        });
    });

    describe('divide', () => {
        test('divides two numbers', () => {
            expect(calc.divide(10, 2)).toBe(5);
        });

        test('throws on division by zero', () => {
            expect(() => calc.divide(10, 0)).toThrow('Cannot divide by zero');
        });

        test('handles decimal results', () => {
            expect(calc.divide(5, 2)).toBe(2.5);
        });
    });
});
```

## Example 2: Testing Async Code

```javascript
// userService.js
class UserService {
    constructor(api) {
        this.api = api;
    }

    async getUser(id) {
        const response = await this.api.get(`/users/${id}`);
        return response.data;
    }

    async createUser(userData) {
        const response = await this.api.post('/users', userData);
        return response.data;
    }

    async getUserPosts(userId) {
        const [user, posts] = await Promise.all([
            this.api.get(`/users/${userId}`),
            this.api.get(`/users/${userId}/posts`)
        ]);
        return { user: user.data, posts: posts.data };
    }
}

// userService.test.js
const UserService = require('./userService');

describe('UserService', () => {
    let service;
    let mockApi;

    beforeEach(() => {
        mockApi = {
            get: jest.fn(),
            post: jest.fn()
        };
        service = new UserService(mockApi);
    });

    describe('getUser', () => {
        test('fetches user by id', async () => {
            const mockUser = { id: 1, name: 'Arthur' };
            mockApi.get.mockResolvedValue({ data: mockUser });

            const user = await service.getUser(1);

            expect(mockApi.get).toHaveBeenCalledWith('/users/1');
            expect(user).toEqual(mockUser);
        });

        test('handles API errors', async () => {
            mockApi.get.mockRejectedValue(new Error('Network error'));

            await expect(service.getUser(1)).rejects.toThrow('Network error');
        });
    });

    describe('getUserPosts', () => {
        test('fetches user and posts in parallel', async () => {
            const mockUser = { id: 1, name: 'Arthur' };
            const mockPosts = [{ id: 1, title: 'Post 1' }];

            mockApi.get
                .mockResolvedValueOnce({ data: mockUser })
                .mockResolvedValueOnce({ data: mockPosts });

            const result = await service.getUserPosts(1);

            expect(result).toEqual({
                user: mockUser,
                posts: mockPosts
            });
            expect(mockApi.get).toHaveBeenCalledTimes(2);
        });
    });
});
```

## Example 3: Integration Testing (API)

```javascript
// app.test.js
const request = require('supertest');
const app = require('./app');
const db = require('./db');

describe('User API', () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    beforeEach(async () => {
        await db.clear();
    });

    describe('POST /users', () => {
        test('creates a new user', async () => {
            const userData = {
                name: 'Arthur',
                email: 'art@bpc.com'
            };

            const response = await request(app)
                .post('/users')
                .send(userData)
                .expect(201);

            expect(response.body).toMatchObject({
                name: 'Arthur',
                email: 'art@bpc.com'
            });
            expect(response.body.id).toBeDefined();
        });

        test('validates required fields', async () => {
            const response = await request(app)
                .post('/users')
                .send({ name: 'Arthur' })
                .expect(400);

            expect(response.body.error).toContain('email');
        });

        test('prevents duplicate emails', async () => {
            const userData = { name: 'Arthur', email: 'art@bpc.com' };

            await request(app).post('/users').send(userData);

            const response = await request(app)
                .post('/users')
                .send(userData)
                .expect(400);

            expect(response.body.error).toContain('exists');
        });
    });

    describe('GET /users/:id', () => {
        test('returns user by id', async () => {
            // Setup
            const createResponse = await request(app)
                .post('/users')
                .send({ name: 'Arthur', email: 'art@bpc.com' });

            const userId = createResponse.body.id;

            // Test
            const response = await request(app)
                .get(`/users/${userId}`)
                .expect(200);

            expect(response.body.name).toBe('Arthur');
        });

        test('returns 404 for non-existent user', async () => {
            await request(app)
                .get('/users/nonexistent')
                .expect(404);
        });
    });
});
```

## Example 4: Mocking and Spies

```javascript
// emailService.test.js
const EmailService = require('./emailService');

describe('EmailService', () => {
    let service;
    let mockTransporter;

    beforeEach(() => {
        mockTransporter = {
            sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
        };
        service = new EmailService(mockTransporter);
    });

    test('sends welcome email', async () => {
        await service.sendWelcome('art@bpc.com', 'Arthur');

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'art@bpc.com',
                subject: expect.stringContaining('Welcome')
            })
        );
    });

    test('retries on failure', async () => {
        mockTransporter.sendMail
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValue({ messageId: '123' });

        await service.sendWelcome('art@bpc.com', 'Arthur');

        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
    });
});

// Spying on existing methods
describe('Logger', () => {
    test('logs to console', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        logger.info('Test message');

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Test message')
        );

        consoleSpy.mockRestore();
    });
});

// Timer mocks
describe('Scheduler', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('executes after delay', () => {
        const callback = jest.fn();

        scheduler.delay(callback, 1000);

        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1000);

        expect(callback).toHaveBeenCalled();
    });
});
```

## Example 5: Test Coverage and Best Practices

```javascript
// Good test structure
describe('Feature', () => {
    describe('when condition A', () => {
        test('should do X', () => {});
        test('should do Y', () => {});
    });

    describe('when condition B', () => {
        test('should do Z', () => {});
    });
});

// Test data builders
function buildUser(overrides = {}) {
    return {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        ...overrides
    };
}

test('admin user can delete posts', () => {
    const admin = buildUser({ role: 'admin' });
    expect(canDeletePost(admin)).toBe(true);
});

// Custom matchers
expect.extend({
    toBeValidUser(received) {
        const hasId = typeof received.id === 'number';
        const hasEmail = received.email?.includes('@');

        return {
            pass: hasId && hasEmail,
            message: () => `Expected valid user, got ${JSON.stringify(received)}`
        };
    }
});

test('creates valid user', async () => {
    const user = await createUser({ name: 'Art', email: 'art@bpc.com' });
    expect(user).toBeValidUser();
});

// package.json scripts
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:ci": "jest --ci --coverage --maxWorkers=2"
    }
}
```

**Key Takeaways:**
- Write tests before or alongside code
- Test behavior, not implementation
- Mock external dependencies
- Keep tests fast and independent
- Aim for meaningful coverage, not 100%

---

# Imitation

### Challenge 1: Test a Shopping Cart

**Task:** Write tests for a shopping cart class.

<details>
<summary>Solution</summary>

```javascript
describe('ShoppingCart', () => {
    let cart;

    beforeEach(() => {
        cart = new ShoppingCart();
    });

    describe('addItem', () => {
        test('adds new item to cart', () => {
            cart.addItem({ id: 1, name: 'Book', price: 20 });

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].name).toBe('Book');
        });

        test('increases quantity for existing item', () => {
            cart.addItem({ id: 1, name: 'Book', price: 20 });
            cart.addItem({ id: 1, name: 'Book', price: 20 });

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].quantity).toBe(2);
        });
    });

    describe('getTotal', () => {
        test('returns 0 for empty cart', () => {
            expect(cart.getTotal()).toBe(0);
        });

        test('calculates total correctly', () => {
            cart.addItem({ id: 1, name: 'Book', price: 20 });
            cart.addItem({ id: 2, name: 'Pen', price: 5 }, 3);

            expect(cart.getTotal()).toBe(35);
        });
    });

    describe('applyDiscount', () => {
        test('applies percentage discount', () => {
            cart.addItem({ id: 1, name: 'Book', price: 100 });
            cart.applyDiscount(10);

            expect(cart.getTotal()).toBe(90);
        });

        test('rejects invalid discount', () => {
            expect(() => cart.applyDiscount(101)).toThrow();
            expect(() => cart.applyDiscount(-5)).toThrow();
        });
    });
});
```

</details>

### Challenge 2: Test Async Pagination

**Task:** Test a paginated API endpoint.

<details>
<summary>Solution</summary>

```javascript
describe('GET /posts', () => {
    beforeEach(async () => {
        // Create 25 posts
        await Promise.all(
            Array.from({ length: 25 }, (_, i) =>
                Post.create({ title: `Post ${i + 1}` })
            )
        );
    });

    test('returns first page by default', async () => {
        const response = await request(app)
            .get('/posts')
            .expect(200);

        expect(response.body.data).toHaveLength(10);
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.total).toBe(25);
    });

    test('returns requested page', async () => {
        const response = await request(app)
            .get('/posts?page=2')
            .expect(200);

        expect(response.body.data).toHaveLength(10);
        expect(response.body.meta.page).toBe(2);
    });

    test('returns last page with remaining items', async () => {
        const response = await request(app)
            .get('/posts?page=3')
            .expect(200);

        expect(response.body.data).toHaveLength(5);
    });

    test('returns empty array for page beyond total', async () => {
        const response = await request(app)
            .get('/posts?page=10')
            .expect(200);

        expect(response.body.data).toHaveLength(0);
    });

    test('respects custom page size', async () => {
        const response = await request(app)
            .get('/posts?per_page=5')
            .expect(200);

        expect(response.body.data).toHaveLength(5);
        expect(response.body.meta.total_pages).toBe(5);
    });
});
```

</details>

---

# Practice

### Exercise 1: Test a Form Validator
**Difficulty:** Intermediate

Write tests for a form validator:
- Email validation
- Password strength
- Required fields
- Custom rules

### Exercise 2: E2E Test Suite
**Difficulty:** Advanced

Create E2E tests for a login flow:
- Navigate to login page
- Fill in credentials
- Submit form
- Verify redirect
- Check session state

---

## Summary

**What you learned:**
- Unit vs integration vs E2E tests
- Jest testing patterns
- Mocking and spying
- Async testing
- Test organization

**Next Steps:**
- Read: [CI/CD Pipelines](/api/guides/concepts/cicd)
- Practice: Add tests to existing project
- Explore: Playwright for E2E testing

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
