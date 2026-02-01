---
title: "Caching Strategies"
subTitle: "Speed Through Strategic Data Storage"
excerpt: "The fastest request is the one you don't make."
featureImage: "/img/caching.png"
date: "2026-02-01"
order: 812
---

# Explanation

## Why Cache?

Caching stores copies of data to serve future requests faster. It reduces database load, decreases latency, and improves scalability.

### Cache Levels

1. **Browser Cache**: Client-side (HTTP headers)
2. **CDN Cache**: Edge servers
3. **Application Cache**: In-memory (Redis)
4. **Database Cache**: Query caching

### Cache Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Cache-Aside | App manages cache | General purpose |
| Read-Through | Cache manages reads | Consistent reads |
| Write-Through | Sync write to cache+DB | Data consistency |
| Write-Behind | Async write to DB | High write volume |

---

# Demonstration

## Example 1: HTTP Caching

```javascript
// Express middleware for cache headers
function cacheControl(options = {}) {
    const {
        maxAge = 3600,
        sMaxAge = null,
        private: isPrivate = false,
        noCache = false,
        noStore = false,
        mustRevalidate = false
    } = options;

    return (req, res, next) => {
        if (noStore) {
            res.set('Cache-Control', 'no-store');
        } else if (noCache) {
            res.set('Cache-Control', 'no-cache');
        } else {
            const directives = [];

            directives.push(isPrivate ? 'private' : 'public');
            directives.push(`max-age=${maxAge}`);

            if (sMaxAge !== null) {
                directives.push(`s-maxage=${sMaxAge}`);
            }

            if (mustRevalidate) {
                directives.push('must-revalidate');
            }

            res.set('Cache-Control', directives.join(', '));
        }

        next();
    };
}

// Usage
// Public, cached for 1 hour
app.get('/api/products',
    cacheControl({ maxAge: 3600, sMaxAge: 7200 }),
    getProducts
);

// Private, user-specific
app.get('/api/profile',
    cacheControl({ maxAge: 300, private: true }),
    getProfile
);

// Never cache
app.get('/api/transactions',
    cacheControl({ noStore: true }),
    getTransactions
);

// ETag for conditional requests
const etag = require('etag');

app.get('/api/data', async (req, res) => {
    const data = await fetchData();
    const body = JSON.stringify(data);
    const hash = etag(body);

    res.set('ETag', hash);
    res.set('Cache-Control', 'private, max-age=0, must-revalidate');

    // Check If-None-Match header
    if (req.headers['if-none-match'] === hash) {
        return res.status(304).end();  // Not Modified
    }

    res.json(data);
});
```

## Example 2: Redis Caching

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Cache-Aside Pattern
class CacheService {
    constructor(redis, defaultTTL = 3600) {
        this.redis = redis;
        this.defaultTTL = defaultTTL;
    }

    async get(key) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
    }

    async set(key, value, ttl = this.defaultTTL) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
    }

    async delete(key) {
        await this.redis.del(key);
    }

    async deletePattern(pattern) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    // Cache-aside helper
    async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
        let value = await this.get(key);

        if (value === null) {
            value = await fetchFn();
            await this.set(key, value, ttl);
        }

        return value;
    }
}

const cache = new CacheService(redis);

// Usage in API
app.get('/api/users/:id', async (req, res) => {
    const cacheKey = `user:${req.params.id}`;

    const user = await cache.getOrSet(
        cacheKey,
        () => User.findById(req.params.id),
        3600  // 1 hour
    );

    if (!user) {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json({ data: user });
});

// Invalidate on update
app.put('/api/users/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body);

    // Invalidate cache
    await cache.delete(`user:${req.params.id}`);

    res.json({ data: user });
});
```

## Example 3: In-Memory Caching

```javascript
// Simple in-memory cache with LRU
class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return undefined;

        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);

        return value.data;
    }

    set(key, data, ttl = 0) {
        // Delete if exists (to update position)
        this.cache.delete(key);

        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }

        this.cache.set(key, {
            data,
            expiresAt: ttl > 0 ? Date.now() + ttl * 1000 : 0
        });
    }

    isExpired(key) {
        const item = this.cache.get(key);
        if (!item) return true;
        if (item.expiresAt === 0) return false;
        return Date.now() > item.expiresAt;
    }

    getOrSet(key, fetchFn, ttl = 0) {
        if (this.cache.has(key) && !this.isExpired(key)) {
            return this.get(key);
        }

        const data = fetchFn();
        this.set(key, data, ttl);
        return data;
    }

    clear() {
        this.cache.clear();
    }
}

// Node-cache alternative
const NodeCache = require('node-cache');

const cache = new NodeCache({
    stdTTL: 600,           // Default TTL 10 minutes
    checkperiod: 120,      // Check for expired keys every 2 minutes
    useClones: false       // Don't clone on get (faster)
});

// Memoization for expensive functions
function memoize(fn, options = {}) {
    const { maxAge = 60000, maxSize = 100 } = options;
    const cache = new Map();

    return function(...args) {
        const key = JSON.stringify(args);
        const cached = cache.get(key);

        if (cached && Date.now() < cached.expiresAt) {
            return cached.value;
        }

        const value = fn.apply(this, args);
        cache.set(key, {
            value,
            expiresAt: Date.now() + maxAge
        });

        // Size limit
        if (cache.size > maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return value;
    };
}
```

## Example 4: Cache Invalidation

```javascript
// Tag-based invalidation
class TaggedCache {
    constructor(redis) {
        this.redis = redis;
    }

    async set(key, value, { tags = [], ttl = 3600 } = {}) {
        const pipeline = this.redis.pipeline();

        // Store value
        pipeline.setex(key, ttl, JSON.stringify(value));

        // Associate with tags
        for (const tag of tags) {
            pipeline.sadd(`tag:${tag}`, key);
            pipeline.expire(`tag:${tag}`, ttl);
        }

        await pipeline.exec();
    }

    async get(key) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
    }

    async invalidateTag(tag) {
        const keys = await this.redis.smembers(`tag:${tag}`);

        if (keys.length > 0) {
            const pipeline = this.redis.pipeline();
            keys.forEach(key => pipeline.del(key));
            pipeline.del(`tag:${tag}`);
            await pipeline.exec();
        }
    }
}

const cache = new TaggedCache(redis);

// Cache with tags
await cache.set('product:123', product, {
    tags: ['products', `category:${product.categoryId}`],
    ttl: 3600
});

// Invalidate all products in category
await cache.invalidateTag(`category:${categoryId}`);

// Event-driven invalidation
const EventEmitter = require('events');
const cacheEvents = new EventEmitter();

cacheEvents.on('user:updated', async (userId) => {
    await cache.delete(`user:${userId}`);
    await cache.deletePattern(`user:${userId}:*`);
});

cacheEvents.on('product:updated', async (productId) => {
    await cache.invalidateTag(`product:${productId}`);
});

// Emit events from services
async function updateUser(userId, data) {
    const user = await User.findByIdAndUpdate(userId, data);
    cacheEvents.emit('user:updated', userId);
    return user;
}
```

## Example 5: CDN and Edge Caching

```javascript
// Vercel edge caching
export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    const data = await fetchData();

    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
        }
    });
}

// stale-while-revalidate
// Serves stale content while fetching fresh content in background
app.get('/api/feed', (req, res) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    // Cache for 60s, serve stale for up to 10 min while refreshing
});

// Vary header for different cached versions
app.get('/api/content', (req, res) => {
    res.set('Vary', 'Accept-Language, Accept-Encoding');
    // Different cache for different languages
});

// Surrogate keys for CDN invalidation (Fastly, Cloudflare)
app.get('/api/products/:id', async (req, res) => {
    const product = await getProduct(req.params.id);

    res.set('Surrogate-Key', `product-${product.id} category-${product.categoryId}`);
    res.set('Cache-Control', 's-maxage=86400');

    res.json({ data: product });
});

// Invalidate via API
async function invalidateProduct(productId) {
    await fetch('https://api.fastly.com/purge/product-' + productId, {
        method: 'POST',
        headers: { 'Fastly-Key': process.env.FASTLY_KEY }
    });
}
```

**Key Takeaways:**
- Cache at multiple levels
- Use appropriate TTLs
- Implement cache invalidation strategy
- Consider stale-while-revalidate
- Tag-based invalidation scales better

---

# Imitation

### Challenge 1: Implement Read-Through Cache

**Task:** Create a read-through cache wrapper for database queries.

<details>
<summary>Solution</summary>

```javascript
class ReadThroughCache {
    constructor(redis, repository, options = {}) {
        this.redis = redis;
        this.repository = repository;
        this.prefix = options.prefix || 'cache';
        this.defaultTTL = options.ttl || 3600;
    }

    key(method, ...args) {
        return `${this.prefix}:${method}:${JSON.stringify(args)}`;
    }

    async wrap(method, ...args) {
        const cacheKey = this.key(method, ...args);

        // Try cache first
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Call repository method
        const result = await this.repository[method](...args);

        // Cache result
        if (result !== null && result !== undefined) {
            await this.redis.setex(
                cacheKey,
                this.defaultTTL,
                JSON.stringify(result)
            );
        }

        return result;
    }

    async invalidate(method, ...args) {
        const cacheKey = this.key(method, ...args);
        await this.redis.del(cacheKey);
    }

    async invalidateAll() {
        const keys = await this.redis.keys(`${this.prefix}:*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}

// Usage
const userCache = new ReadThroughCache(redis, UserRepository, {
    prefix: 'users',
    ttl: 1800
});

const user = await userCache.wrap('findById', userId);
const users = await userCache.wrap('findByRole', 'admin');

// Invalidate after update
await userCache.invalidate('findById', userId);
```

</details>

---

# Practice

### Exercise 1: Multi-Level Cache
**Difficulty:** Intermediate

Implement a cache that:
- Checks memory first
- Falls back to Redis
- Updates both on miss

### Exercise 2: Cache Warming
**Difficulty:** Advanced

Build a cache warming system:
- Pre-populate on deploy
- Background refresh
- Priority-based warming

---

## Summary

**What you learned:**
- HTTP caching headers
- Redis caching patterns
- Cache invalidation strategies
- CDN and edge caching
- Tag-based invalidation

**Next Steps:**
- Read: [Performance Optimization](/api/guides/concepts/performance)
- Practice: Add caching to your API
- Explore: CDN configuration

---

## Resources

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
