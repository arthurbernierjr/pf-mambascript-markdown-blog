---
title: "Microservices Architecture"
subTitle: "Distributed Systems Done Right"
excerpt: "Break big problems into small, manageable services."
featureImage: "/img/microservices.png"
date: "2026-02-01"
order: 815
---

# Explanation

## What are Microservices?

Microservices architecture structures an application as a collection of loosely coupled services. Each service is independently deployable and organized around business capabilities.

### Key Characteristics

| Characteristic | Description |
|----------------|-------------|
| Single Responsibility | Each service does one thing well |
| Independent Deployment | Deploy without affecting others |
| Decentralized Data | Each service owns its data |
| Technology Agnostic | Use the best tool for each job |
| Resilient | Failure isolation |

### Monolith vs Microservices

```
Monolith:                    Microservices:
┌─────────────────┐         ┌─────┐ ┌─────┐ ┌─────┐
│  UI + Business  │         │User │ │Order│ │Pay- │
│  Logic + Data   │   vs    │Svc  │ │Svc  │ │ment │
└─────────────────┘         └─────┘ └─────┘ └─────┘
                            └──────┬───────┘
                              Message Bus
```

---

# Demonstration

## Example 1: Service Communication (REST)

```javascript
// User Service
const express = require('express');
const app = express();

// User endpoints
app.get('/users/:id', async (req, res) => {
    const user = await db.users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
});

app.post('/users', async (req, res) => {
    const user = await db.users.create(req.body);
    // Publish event
    await messageBus.publish('user.created', user);
    res.status(201).json(user);
});

// Order Service - calling User Service
const axios = require('axios');

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3000';

async function getUserById(userId) {
    try {
        const response = await axios.get(`${userServiceUrl}/users/${userId}`, {
            timeout: 5000,
            headers: {
                'X-Request-Id': req.requestId
            }
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new UserNotFoundError(userId);
        }
        throw new ServiceError('user-service', error);
    }
}

app.post('/orders', async (req, res) => {
    // Get user from User Service
    const user = await getUserById(req.body.userId);

    // Create order
    const order = await db.orders.create({
        userId: user.id,
        items: req.body.items,
        total: calculateTotal(req.body.items)
    });

    // Publish event
    await messageBus.publish('order.created', order);

    res.status(201).json(order);
});
```

## Example 2: Event-Driven Communication

```javascript
// Message broker setup (RabbitMQ)
const amqp = require('amqplib');

class MessageBus {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
    }

    async publish(event, data) {
        const exchange = 'events';
        await this.channel.assertExchange(exchange, 'topic', { durable: true });

        this.channel.publish(
            exchange,
            event,
            Buffer.from(JSON.stringify({
                event,
                data,
                timestamp: new Date().toISOString(),
                correlationId: asyncLocalStorage.getStore()?.requestId
            }))
        );
    }

    async subscribe(pattern, handler) {
        const exchange = 'events';
        await this.channel.assertExchange(exchange, 'topic', { durable: true });

        const { queue } = await this.channel.assertQueue('', { exclusive: true });
        await this.channel.bindQueue(queue, exchange, pattern);

        this.channel.consume(queue, async (msg) => {
            const content = JSON.parse(msg.content.toString());
            try {
                await handler(content);
                this.channel.ack(msg);
            } catch (error) {
                console.error('Handler error:', error);
                // Requeue or send to dead letter queue
                this.channel.nack(msg, false, false);
            }
        });
    }
}

// User Service - publishes events
app.post('/users', async (req, res) => {
    const user = await db.users.create(req.body);

    await messageBus.publish('user.created', {
        id: user.id,
        email: user.email,
        name: user.name
    });

    res.status(201).json(user);
});

// Email Service - subscribes to events
await messageBus.subscribe('user.created', async (message) => {
    const { data: user } = message;

    await sendWelcomeEmail({
        to: user.email,
        name: user.name
    });

    console.log(`Welcome email sent to ${user.email}`);
});

// Order Service - subscribes to payment events
await messageBus.subscribe('payment.*', async (message) => {
    const { event, data } = message;

    switch (event) {
        case 'payment.completed':
            await db.orders.update(data.orderId, { status: 'paid' });
            await messageBus.publish('order.paid', { orderId: data.orderId });
            break;

        case 'payment.failed':
            await db.orders.update(data.orderId, { status: 'payment_failed' });
            break;
    }
});
```

## Example 3: API Gateway

```javascript
// API Gateway with Express
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Service routes
const services = {
    users: process.env.USER_SERVICE_URL,
    orders: process.env.ORDER_SERVICE_URL,
    products: process.env.PRODUCT_SERVICE_URL,
    payments: process.env.PAYMENT_SERVICE_URL
};

// Proxy configuration
Object.entries(services).forEach(([name, target]) => {
    app.use(
        `/api/${name}`,
        authenticate,
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: { [`^/api/${name}`]: '' },
            onProxyReq: (proxyReq, req) => {
                // Forward user info
                proxyReq.setHeader('X-User-Id', req.user.id);
                proxyReq.setHeader('X-Request-Id', req.requestId);
            }
        })
    );
});

// Aggregation endpoint
app.get('/api/dashboard', authenticate, async (req, res) => {
    const [user, orders, notifications] = await Promise.all([
        fetch(`${services.users}/users/${req.user.id}`).then(r => r.json()),
        fetch(`${services.orders}/orders?userId=${req.user.id}&limit=5`).then(r => r.json()),
        fetch(`${services.notifications}/notifications?userId=${req.user.id}&unread=true`).then(r => r.json())
    ]);

    res.json({
        user,
        recentOrders: orders,
        unreadNotifications: notifications.length
    });
});
```

## Example 4: Service Discovery

```javascript
// Consul-based service discovery
const Consul = require('consul');

const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || 8500
});

class ServiceRegistry {
    constructor(serviceName, servicePort) {
        this.serviceName = serviceName;
        this.servicePort = servicePort;
        this.serviceId = `${serviceName}-${process.env.HOSTNAME}`;
    }

    async register() {
        await consul.agent.service.register({
            id: this.serviceId,
            name: this.serviceName,
            address: process.env.HOSTNAME,
            port: this.servicePort,
            check: {
                http: `http://${process.env.HOSTNAME}:${this.servicePort}/health`,
                interval: '10s',
                timeout: '5s'
            }
        });

        // Deregister on shutdown
        process.on('SIGTERM', () => this.deregister());
        process.on('SIGINT', () => this.deregister());
    }

    async deregister() {
        await consul.agent.service.deregister(this.serviceId);
        process.exit(0);
    }

    async getService(serviceName) {
        const services = await consul.health.service({
            service: serviceName,
            passing: true
        });

        if (services.length === 0) {
            throw new Error(`No healthy instances of ${serviceName}`);
        }

        // Simple round-robin
        const index = Math.floor(Math.random() * services.length);
        const service = services[index].Service;

        return `http://${service.Address}:${service.Port}`;
    }
}

// Usage
const registry = new ServiceRegistry('order-service', 3000);
await registry.register();

// Call another service
async function callUserService(userId) {
    const userServiceUrl = await registry.getService('user-service');
    return fetch(`${userServiceUrl}/users/${userId}`);
}
```

## Example 5: Circuit Breaker

```javascript
// Circuit breaker implementation
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000;
        this.state = 'CLOSED';
        this.failures = 0;
        this.lastFailureTime = null;
        this.nextAttempt = Date.now();
    }

    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new CircuitBreakerError('Circuit is OPEN');
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
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
        }
    }

    getState() {
        return {
            state: this.state,
            failures: this.failures,
            nextAttempt: this.state === 'OPEN' ? this.nextAttempt : null
        };
    }
}

// Usage
const userServiceBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000
});

async function getUserWithCircuitBreaker(userId) {
    return userServiceBreaker.execute(async () => {
        const response = await fetch(`${userServiceUrl}/users/${userId}`, {
            timeout: 5000
        });
        if (!response.ok) throw new Error('Service error');
        return response.json();
    });
}

// With fallback
async function getUserSafe(userId) {
    try {
        return await getUserWithCircuitBreaker(userId);
    } catch (error) {
        if (error instanceof CircuitBreakerError) {
            // Return cached or default data
            return getCachedUser(userId) || { id: userId, name: 'Unknown' };
        }
        throw error;
    }
}
```

## Example 6: Saga Pattern

```javascript
// Saga for order processing
class OrderSaga {
    constructor(services, messageBus) {
        this.services = services;
        this.messageBus = messageBus;
    }

    async execute(orderData) {
        const saga = {
            orderId: null,
            steps: [],
            status: 'pending'
        };

        try {
            // Step 1: Create order
            saga.orderId = await this.createOrder(orderData);
            saga.steps.push({ step: 'createOrder', status: 'completed' });

            // Step 2: Reserve inventory
            await this.reserveInventory(saga.orderId, orderData.items);
            saga.steps.push({ step: 'reserveInventory', status: 'completed' });

            // Step 3: Process payment
            await this.processPayment(saga.orderId, orderData.paymentMethod, orderData.total);
            saga.steps.push({ step: 'processPayment', status: 'completed' });

            // Step 4: Confirm order
            await this.confirmOrder(saga.orderId);
            saga.steps.push({ step: 'confirmOrder', status: 'completed' });

            saga.status = 'completed';
            return saga;

        } catch (error) {
            saga.status = 'failed';
            saga.error = error.message;

            // Compensate - rollback completed steps in reverse
            await this.compensate(saga);

            throw error;
        }
    }

    async createOrder(orderData) {
        const order = await this.services.orders.create(orderData);
        return order.id;
    }

    async reserveInventory(orderId, items) {
        await this.services.inventory.reserve(orderId, items);
    }

    async processPayment(orderId, paymentMethod, amount) {
        await this.services.payments.charge(orderId, paymentMethod, amount);
    }

    async confirmOrder(orderId) {
        await this.services.orders.confirm(orderId);
    }

    async compensate(saga) {
        const completedSteps = saga.steps
            .filter(s => s.status === 'completed')
            .reverse();

        for (const step of completedSteps) {
            try {
                switch (step.step) {
                    case 'processPayment':
                        await this.services.payments.refund(saga.orderId);
                        break;
                    case 'reserveInventory':
                        await this.services.inventory.release(saga.orderId);
                        break;
                    case 'createOrder':
                        await this.services.orders.cancel(saga.orderId);
                        break;
                }
                step.compensated = true;
            } catch (error) {
                console.error(`Compensation failed for ${step.step}:`, error);
                // Log for manual intervention
            }
        }
    }
}

// Usage
const orderSaga = new OrderSaga(services, messageBus);

app.post('/orders', async (req, res) => {
    try {
        const result = await orderSaga.execute(req.body);
        res.status(201).json({ orderId: result.orderId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
```

**Key Takeaways:**
- Design services around business capabilities
- Use async communication when possible
- Implement circuit breakers for resilience
- Use sagas for distributed transactions
- API gateways centralize cross-cutting concerns

---

# Imitation

### Challenge 1: Build an E-commerce System

**Task:** Design microservices for an e-commerce platform.

<details>
<summary>Solution</summary>

```
Services:
1. User Service - authentication, profiles
2. Product Service - catalog, search
3. Cart Service - shopping cart
4. Order Service - order management
5. Payment Service - payment processing
6. Inventory Service - stock management
7. Notification Service - emails, SMS
8. Shipping Service - delivery tracking

Communication:
- REST for synchronous (cart → product)
- Events for async (order.created → inventory, notification)

Events:
- user.registered → notification (welcome email)
- order.created → inventory (reserve), payment (charge)
- payment.completed → order (confirm), notification (receipt)
- payment.failed → inventory (release), notification (alert)
- order.shipped → notification (tracking)
```

</details>

---

# Practice

### Exercise 1: Event Sourcing
**Difficulty:** Intermediate

Implement event sourcing:
- Store events as source of truth
- Rebuild state from events
- Snapshots for performance

### Exercise 2: Service Mesh
**Difficulty:** Advanced

Set up a service mesh:
- Sidecar proxies
- Mutual TLS
- Traffic management

---

## Summary

**What you learned:**
- Microservices architecture
- Communication patterns
- Service discovery
- Circuit breakers
- Saga pattern

**Next Steps:**
- Read: [API Design](/api/guides/fullstack/api-design)
- Practice: Split a monolith
- Explore: Kubernetes, Istio

---

## Resources

- [Microservices.io](https://microservices.io/)
- [Martin Fowler on Microservices](https://martinfowler.com/microservices/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
