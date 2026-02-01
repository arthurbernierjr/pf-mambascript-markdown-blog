---
title: "Performance Optimization"
subTitle: "Making Your Apps Fast"
excerpt: "Performance is a feature your users will love."
featureImage: "/img/performance.png"
date: "2026-02-01"
order: 810
---

# Explanation

## Why Performance Matters

Users expect fast experiences. A 1-second delay can reduce conversions by 7%. Performance affects user satisfaction, SEO rankings, and business metrics.

### Key Metrics

- **TTFB**: Time to First Byte
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

### Performance Budget

| Metric | Good | Needs Work |
|--------|------|------------|
| LCP | < 2.5s | > 4s |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |

---

# Demonstration

## Example 1: Frontend Performance

```javascript
// Lazy loading images
// HTML
<img src="placeholder.jpg"
     data-src="actual-image.jpg"
     loading="lazy"
     alt="Description">

// JavaScript Intersection Observer
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Code splitting with dynamic imports
// Instead of importing everything at once:
// import { heavyFunction } from './heavy-module';

// Load on demand:
async function handleClick() {
    const { heavyFunction } = await import('./heavy-module');
    heavyFunction();
}

// React lazy loading
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
    return (
        <Suspense fallback={<Loading />}>
            <HeavyComponent />
        </Suspense>
    );
}

// Debouncing expensive operations
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

const handleSearch = debounce(async (query) => {
    const results = await searchAPI(query);
    displayResults(results);
}, 300);

// Virtual scrolling for long lists
function VirtualList({ items, itemHeight, containerHeight }) {
    const [scrollTop, setScrollTop] = useState(0);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;

    return (
        <div
            style={{ height: containerHeight, overflow: 'auto' }}
            onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
            <div style={{ height: items.length * itemHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, i) => (
                        <div key={startIndex + i} style={{ height: itemHeight }}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

## Example 2: Backend Performance

```javascript
// Database query optimization
// BAD: N+1 query problem
const users = await User.findAll();
for (const user of users) {
    const posts = await Post.findAll({ where: { userId: user.id } });
    user.posts = posts;
}

// GOOD: Eager loading
const users = await User.findAll({
    include: [{ model: Post }]
});

// GOOD: Batch loading with DataLoader
const postLoader = new DataLoader(async (userIds) => {
    const posts = await Post.findAll({
        where: { userId: { [Op.in]: userIds } }
    });

    const postsByUser = userIds.map(id =>
        posts.filter(p => p.userId === id)
    );
    return postsByUser;
});

// Caching
const redis = require('redis');
const client = redis.createClient();

async function getCachedUser(id) {
    const cacheKey = `user:${id}`;

    // Try cache first
    const cached = await client.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    // Fetch from database
    const user = await User.findByPk(id);

    // Cache for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(user));

    return user;
}

// Cache invalidation
async function updateUser(id, data) {
    const user = await User.update(data, { where: { id } });
    await client.del(`user:${id}`);
    return user;
}

// Connection pooling
const { Pool } = require('pg');

const pool = new Pool({
    max: 20,                  // Max connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000
});

// Compression
const compression = require('compression');
app.use(compression({
    level: 6,
    threshold: 1024,  // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
```

## Example 3: API Optimization

```javascript
// Pagination
app.get('/api/posts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.findAll({ limit, offset }),
        Post.count()
    ]);

    res.json({
        data: posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// Field selection
app.get('/api/users/:id', async (req, res) => {
    const fields = req.query.fields?.split(',') || ['id', 'name', 'email'];

    // Validate fields
    const allowedFields = ['id', 'name', 'email', 'createdAt'];
    const selectedFields = fields.filter(f => allowedFields.includes(f));

    const user = await User.findByPk(req.params.id, {
        attributes: selectedFields
    });

    res.json({ data: user });
});

// Response compression and ETags
const etag = require('etag');

app.get('/api/data', async (req, res) => {
    const data = await fetchData();
    const body = JSON.stringify(data);
    const hash = etag(body);

    res.set('ETag', hash);
    res.set('Cache-Control', 'public, max-age=300');

    if (req.headers['if-none-match'] === hash) {
        return res.status(304).end();
    }

    res.json(data);
});

// Parallel requests where possible
app.get('/api/dashboard', async (req, res) => {
    const [user, stats, notifications, recentActivity] = await Promise.all([
        getUser(req.userId),
        getStats(req.userId),
        getNotifications(req.userId),
        getRecentActivity(req.userId)
    ]);

    res.json({ user, stats, notifications, recentActivity });
});
```

## Example 4: Bundle Optimization

```javascript
// webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    priority: -10
                },
                common: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })
        ]
    }
};

// Tree shaking - use named exports
// BAD
import _ from 'lodash';
_.debounce(fn, 300);

// GOOD
import { debounce } from 'lodash-es';
debounce(fn, 300);

// Analyze bundle size
// npm install --save-dev webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    plugins: [
        new BundleAnalyzerPlugin()
    ]
};
```

## Example 5: Monitoring Performance

```javascript
// Web Vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
    fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ metric: name, value: delta, id }),
        headers: { 'Content-Type': 'application/json' }
    });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Performance Observer
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log(entry.name, entry.duration);
    }
});

observer.observe({ entryTypes: ['longtask', 'resource', 'navigation'] });

// Server-side timing
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;

        console.log(`${req.method} ${req.url} - ${duration.toFixed(2)}ms`);

        // Send to monitoring service
        metrics.timing('http.request.duration', duration, {
            method: req.method,
            path: req.route?.path || req.url,
            status: res.statusCode
        });
    });

    next();
});
```

**Key Takeaways:**
- Measure before optimizing
- Lazy load non-critical resources
- Cache aggressively
- Optimize database queries
- Monitor continuously

---

# Imitation

### Challenge 1: Implement Response Caching

**Task:** Create middleware that caches API responses.

<details>
<summary>Solution</summary>

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

function cacheMiddleware(options = {}) {
    const { ttl = 300, keyGenerator } = options;

    return (req, res, next) => {
        // Skip non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = keyGenerator
            ? keyGenerator(req)
            : `${req.originalUrl}`;

        const cached = cache.get(key);

        if (cached) {
            res.set('X-Cache', 'HIT');
            return res.json(cached);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        res.json = (data) => {
            cache.set(key, data, ttl);
            res.set('X-Cache', 'MISS');
            return originalJson(data);
        };

        next();
    };
}

// Clear cache helper
function clearCache(pattern) {
    const keys = cache.keys();
    keys.filter(key => key.includes(pattern))
        .forEach(key => cache.del(key));
}

// Usage
app.get('/api/products',
    cacheMiddleware({ ttl: 600 }),
    getProducts
);

app.post('/api/products', async (req, res) => {
    const product = await createProduct(req.body);
    clearCache('/api/products');
    res.json(product);
});
```

</details>

---

# Practice

### Exercise 1: Optimize a Slow Page
**Difficulty:** Intermediate

Given a slow-loading page:
- Identify bottlenecks
- Implement lazy loading
- Add caching

### Exercise 2: Database Query Optimization
**Difficulty:** Advanced

Optimize queries for:
- N+1 problems
- Missing indexes
- Expensive joins

---

## Summary

**What you learned:**
- Frontend optimization techniques
- Backend caching strategies
- API optimization patterns
- Bundle optimization
- Performance monitoring

**Next Steps:**
- Read: [Caching Strategies](/api/guides/concepts/caching)
- Practice: Profile your application
- Explore: CDN configuration

---

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
