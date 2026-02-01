---
title: "Application Monitoring"
subTitle: "Observability for Production Apps"
excerpt: "You can't fix what you can't see - monitoring reveals the truth."
featureImage: "/img/monitoring.png"
date: "2026-02-01"
order: 813
---

# Explanation

## Why Monitor?

Monitoring provides visibility into application health, performance, and behavior. It enables proactive issue detection and data-driven decisions.

### Three Pillars of Observability

| Pillar | Description | Tools |
|--------|-------------|-------|
| Metrics | Numeric measurements | Prometheus, Datadog |
| Logs | Event records | ELK Stack, Loki |
| Traces | Request flow | Jaeger, Zipkin |

### Key Metrics

- **RED Method**: Rate, Errors, Duration
- **USE Method**: Utilization, Saturation, Errors
- **Golden Signals**: Latency, Traffic, Errors, Saturation

---

# Demonstration

## Example 1: Prometheus Metrics

```javascript
// Express with prometheus-client
const client = require('prom-client');
const express = require('express');

// Create Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestsTotal);

const activeConnections = new client.Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
});
register.registerMetric(activeConnections);

// Middleware to collect metrics
function metricsMiddleware(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;

        httpRequestDuration
            .labels(req.method, route, res.statusCode)
            .observe(duration);

        httpRequestsTotal
            .labels(req.method, route, res.statusCode)
            .inc();
    });

    next();
}

// Expose metrics endpoint
const app = express();
app.use(metricsMiddleware);

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Business metrics
const ordersProcessed = new client.Counter({
    name: 'orders_processed_total',
    help: 'Total orders processed',
    labelNames: ['status']
});

const orderValue = new client.Histogram({
    name: 'order_value_dollars',
    help: 'Order value in dollars',
    buckets: [10, 50, 100, 500, 1000, 5000]
});

// In your order processing
async function processOrder(order) {
    try {
        await saveOrder(order);
        ordersProcessed.labels('success').inc();
        orderValue.observe(order.total);
    } catch (error) {
        ordersProcessed.labels('failure').inc();
        throw error;
    }
}
```

## Example 2: Structured Logging

```javascript
const winston = require('winston');
const { format } = winston;

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'api',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    ]
});

// Request ID middleware
const { v4: uuidv4 } = require('uuid');

function requestIdMiddleware(req, res, next) {
    req.requestId = req.headers['x-request-id'] || uuidv4();
    res.setHeader('X-Request-Id', req.requestId);
    next();
}

// Request logging middleware
function requestLogger(req, res, next) {
    const start = Date.now();

    // Log request
    logger.info('Request received', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        userAgent: req.get('user-agent'),
        ip: req.ip
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;

        const logData = {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('content-length')
        };

        if (res.statusCode >= 500) {
            logger.error('Request failed', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('Request error', logData);
        } else {
            logger.info('Request completed', logData);
        }
    });

    next();
}

// Child logger with context
class RequestLogger {
    constructor(requestId, userId) {
        this.logger = logger.child({
            requestId,
            userId
        });
    }

    info(message, data = {}) {
        this.logger.info(message, data);
    }

    error(message, error, data = {}) {
        this.logger.error(message, {
            ...data,
            error: error.message,
            stack: error.stack
        });
    }
}

// Usage in handlers
app.post('/orders', async (req, res) => {
    const log = new RequestLogger(req.requestId, req.user.id);

    log.info('Creating order', { items: req.body.items.length });

    try {
        const order = await createOrder(req.body);
        log.info('Order created', { orderId: order.id });
        res.json(order);
    } catch (error) {
        log.error('Failed to create order', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
```

## Example 3: Distributed Tracing

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

// Initialize tracing
const provider = new NodeTracerProvider();

const jaegerExporter = new JaegerExporter({
    serviceName: 'api-service',
    host: process.env.JAEGER_HOST || 'localhost',
    port: 6832
});

provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
provider.register();

// Auto-instrumentation
registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation()
    ]
});

const tracer = provider.getTracer('api-service');

// Manual span creation
async function processOrder(orderId) {
    const span = tracer.startSpan('process-order');
    span.setAttribute('order.id', orderId);

    try {
        // Validate order
        const validateSpan = tracer.startSpan('validate-order', { parent: span });
        await validateOrder(orderId);
        validateSpan.end();

        // Process payment
        const paymentSpan = tracer.startSpan('process-payment', { parent: span });
        paymentSpan.setAttribute('payment.method', 'credit_card');
        await processPayment(orderId);
        paymentSpan.end();

        // Send confirmation
        const emailSpan = tracer.startSpan('send-confirmation', { parent: span });
        await sendConfirmationEmail(orderId);
        emailSpan.end();

        span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message
        });
        span.recordException(error);
        throw error;
    } finally {
        span.end();
    }
}

// Context propagation
const { context, propagation } = require('@opentelemetry/api');

async function callExternalService(data) {
    const span = tracer.startSpan('external-service-call');

    const headers = {};
    propagation.inject(context.active(), headers);

    try {
        const response = await fetch('https://external-service.com/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers  // Inject trace context
            },
            body: JSON.stringify(data)
        });

        span.setAttribute('http.status_code', response.status);
        return response.json();
    } finally {
        span.end();
    }
}
```

## Example 4: Health Checks

```javascript
// Health check endpoints
const healthChecks = {
    database: async () => {
        try {
            await db.query('SELECT 1');
            return { status: 'healthy', latency: 0 };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    },

    redis: async () => {
        try {
            const start = Date.now();
            await redis.ping();
            return {
                status: 'healthy',
                latency: Date.now() - start
            };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    },

    externalApi: async () => {
        try {
            const start = Date.now();
            const response = await fetch('https://api.example.com/health');
            return {
                status: response.ok ? 'healthy' : 'degraded',
                latency: Date.now() - start
            };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
};

// Liveness probe - is the app running?
app.get('/health/live', (req, res) => {
    res.json({ status: 'alive' });
});

// Readiness probe - is the app ready to serve traffic?
app.get('/health/ready', async (req, res) => {
    const results = {};
    let isReady = true;

    for (const [name, check] of Object.entries(healthChecks)) {
        results[name] = await check();
        if (results[name].status === 'unhealthy') {
            isReady = false;
        }
    }

    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        checks: results,
        timestamp: new Date().toISOString()
    });
});

// Detailed health check
app.get('/health', async (req, res) => {
    const results = {};

    for (const [name, check] of Object.entries(healthChecks)) {
        results[name] = await check();
    }

    const healthy = Object.values(results).every(r => r.status === 'healthy');
    const degraded = Object.values(results).some(r => r.status === 'degraded');

    res.status(healthy ? 200 : degraded ? 200 : 503).json({
        status: healthy ? 'healthy' : degraded ? 'degraded' : 'unhealthy',
        version: process.env.APP_VERSION,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks: results
    });
});
```

## Example 5: Alerting Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: api_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) /
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: Error rate is {{ $value | humanizePercentage }}

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High latency detected
          description: 95th percentile latency is {{ $value }}s

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Service is down
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      # Memory usage
      - alert: HighMemoryUsage
        expr: |
          process_resident_memory_bytes / 1024 / 1024 > 500
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: Memory usage is {{ $value }}MB

      # Database connection pool
      - alert: DatabaseConnectionPoolExhausted
        expr: db_pool_available_connections < 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: Database connection pool nearly exhausted
```

## Example 6: Dashboard Configuration

```javascript
// Grafana dashboard JSON (simplified)
const dashboardConfig = {
    title: 'API Dashboard',
    panels: [
        {
            title: 'Request Rate',
            type: 'graph',
            targets: [{
                expr: 'sum(rate(http_requests_total[5m])) by (route)',
                legendFormat: '{{ route }}'
            }]
        },
        {
            title: 'Error Rate',
            type: 'graph',
            targets: [{
                expr: 'sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100',
                legendFormat: 'Error %'
            }]
        },
        {
            title: 'Latency (p95)',
            type: 'graph',
            targets: [{
                expr: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))',
                legendFormat: '{{ route }}'
            }]
        },
        {
            title: 'Active Connections',
            type: 'stat',
            targets: [{
                expr: 'active_connections'
            }]
        }
    ]
};

// Custom metrics for business monitoring
const businessMetrics = {
    // User activity
    activeUsers: new client.Gauge({
        name: 'active_users',
        help: 'Number of active users in the last 15 minutes'
    }),

    // Revenue tracking
    revenueTotal: new client.Counter({
        name: 'revenue_total_dollars',
        help: 'Total revenue in dollars',
        labelNames: ['product_type']
    }),

    // Feature usage
    featureUsage: new client.Counter({
        name: 'feature_usage_total',
        help: 'Feature usage count',
        labelNames: ['feature', 'user_tier']
    })
};

// Update metrics
setInterval(async () => {
    const count = await getActiveUserCount();
    businessMetrics.activeUsers.set(count);
}, 60000);

// Track revenue
async function recordPurchase(order) {
    businessMetrics.revenueTotal
        .labels(order.productType)
        .inc(order.total);
}
```

**Key Takeaways:**
- Collect metrics, logs, and traces
- Use structured logging
- Implement health checks
- Set up meaningful alerts
- Create actionable dashboards

---

# Imitation

### Challenge 1: Implement SLO Monitoring

**Task:** Create Service Level Objective monitoring with error budgets.

<details>
<summary>Solution</summary>

```javascript
class SLOMonitor {
    constructor(redis) {
        this.redis = redis;
        this.slos = new Map();
    }

    defineSLO(name, config) {
        this.slos.set(name, {
            target: config.target,        // e.g., 0.999 (99.9%)
            window: config.window,        // e.g., 30 days
            metric: config.metric         // e.g., 'availability'
        });
    }

    async recordEvent(sloName, success) {
        const key = `slo:${sloName}:${this.getCurrentWindow()}`;

        await this.redis.hincrby(key, 'total', 1);
        if (success) {
            await this.redis.hincrby(key, 'success', 1);
        }

        // Set expiry
        await this.redis.expire(key, 60 * 60 * 24 * 35);
    }

    async getSLOStatus(sloName) {
        const slo = this.slos.get(sloName);
        if (!slo) return null;

        const key = `slo:${sloName}:${this.getCurrentWindow()}`;
        const data = await this.redis.hgetall(key);

        const total = parseInt(data.total) || 0;
        const success = parseInt(data.success) || 0;
        const current = total > 0 ? success / total : 1;

        const errorBudget = 1 - slo.target;
        const consumedBudget = 1 - current;
        const remainingBudget = Math.max(0, errorBudget - consumedBudget);

        return {
            name: sloName,
            target: slo.target,
            current: current,
            errorBudget: errorBudget,
            consumedBudget: consumedBudget,
            remainingBudgetPercent: (remainingBudget / errorBudget) * 100,
            totalEvents: total,
            successfulEvents: success
        };
    }

    getCurrentWindow() {
        return new Date().toISOString().slice(0, 7); // YYYY-MM
    }
}

// Usage
const sloMonitor = new SLOMonitor(redis);

sloMonitor.defineSLO('api_availability', {
    target: 0.999,
    window: 30,
    metric: 'availability'
});

// In middleware
app.use(async (req, res, next) => {
    res.on('finish', async () => {
        const success = res.statusCode < 500;
        await sloMonitor.recordEvent('api_availability', success);
    });
    next();
});

// Endpoint to check SLO
app.get('/slo/status', async (req, res) => {
    const status = await sloMonitor.getSLOStatus('api_availability');
    res.json(status);
});
```

</details>

---

# Practice

### Exercise 1: Custom Metrics Library
**Difficulty:** Intermediate

Build a metrics library:
- Counter, Gauge, Histogram
- Label support
- Prometheus export format

### Exercise 2: Log Aggregation
**Difficulty:** Advanced

Implement log aggregation:
- Collect from multiple services
- Search and filter
- Alerting on patterns

---

## Summary

**What you learned:**
- Metrics collection with Prometheus
- Structured logging
- Distributed tracing
- Health check patterns
- Alerting and dashboards

**Next Steps:**
- Read: [Error Handling](/api/guides/concepts/error-handling)
- Practice: Add monitoring to your app
- Explore: Grafana, Datadog

---

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [OpenTelemetry](https://opentelemetry.io/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
