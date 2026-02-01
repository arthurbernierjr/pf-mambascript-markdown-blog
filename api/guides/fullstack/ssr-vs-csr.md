---
title: "SSR vs CSR"
subTitle: "Server-Side vs Client-Side Rendering"
excerpt: "Choose the right rendering strategy for your application."
featureImage: "/img/ssr-csr.png"
date: "2026-02-01"
order: 902
---

# Explanation

## Rendering Strategies

How your app renders content affects performance, SEO, and user experience. Understanding the trade-offs helps you choose the right approach.

### Key Concepts

- **CSR**: JavaScript renders content in the browser
- **SSR**: Server generates HTML for each request
- **SSG**: HTML generated at build time
- **ISR**: Static with on-demand regeneration
- **Hydration**: Making static HTML interactive

### Comparison

| Aspect | CSR | SSR | SSG |
|--------|-----|-----|-----|
| Initial Load | Slower | Faster | Fastest |
| SEO | Challenging | Good | Good |
| Server Load | Low | High | Low |
| Dynamic Data | Easy | Moderate | Needs ISR |
| TTFB | Fast | Slower | Fastest |

---

# Demonstration

## Example 1: Client-Side Rendering (React)

```jsx
// CSR - React with useEffect
import { useState, useEffect } from 'react';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

// What the browser receives:
// <div id="root"></div>
// <script src="/bundle.js"></script>

// Then JavaScript:
// 1. Downloads bundle
// 2. Executes React
// 3. Fetches data
// 4. Renders content
```

## Example 2: Server-Side Rendering (Next.js)

```jsx
// pages/products/index.js - SSR with getServerSideProps
export default function ProductsPage({ products }) {
    return (
        <div>
            <h1>Products</h1>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

export async function getServerSideProps(context) {
    // Runs on every request ON THE SERVER
    const res = await fetch(`${process.env.API_URL}/products`);
    const products = await res.json();

    // Handle errors
    if (!res.ok) {
        return {
            notFound: true,
            // or redirect: { destination: '/error', permanent: false }
        };
    }

    return {
        props: { products }
    };
}

// What the browser receives:
// Complete HTML with data already rendered
// <div>
//   <h1>Products</h1>
//   <div class="product">Product 1</div>
//   <div class="product">Product 2</div>
// </div>
```

## Example 3: Static Site Generation (Next.js)

```jsx
// pages/posts/[slug].js - SSG with getStaticProps
export default function PostPage({ post }) {
    return (
        <article>
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}

// Generate paths at build time
export async function getStaticPaths() {
    const res = await fetch(`${process.env.API_URL}/posts`);
    const posts = await res.json();

    const paths = posts.map(post => ({
        params: { slug: post.slug }
    }));

    return {
        paths,
        fallback: 'blocking' // or true or false
    };
}

// Generate page content at build time
export async function getStaticProps({ params }) {
    const res = await fetch(`${process.env.API_URL}/posts/${params.slug}`);
    const post = await res.json();

    if (!post) {
        return { notFound: true };
    }

    return {
        props: { post },
        revalidate: 3600 // ISR: Regenerate every hour
    };
}
```

## Example 4: Incremental Static Regeneration

```jsx
// pages/products/[id].js - ISR
export default function ProductPage({ product, lastUpdated }) {
    return (
        <div>
            <h1>{product.name}</h1>
            <p>${product.price}</p>
            <p>Stock: {product.stock}</p>
            <small>Last updated: {lastUpdated}</small>
        </div>
    );
}

export async function getStaticPaths() {
    // Only pre-generate top products
    const res = await fetch(`${process.env.API_URL}/products/top`);
    const products = await res.json();

    return {
        paths: products.map(p => ({ params: { id: p.id.toString() } })),
        fallback: 'blocking' // Generate other pages on-demand
    };
}

export async function getStaticProps({ params }) {
    const res = await fetch(`${process.env.API_URL}/products/${params.id}`);
    const product = await res.json();

    return {
        props: {
            product,
            lastUpdated: new Date().toISOString()
        },
        revalidate: 60 // Regenerate every minute if requested
    };
}

// How ISR works:
// 1. User requests /products/123
// 2. If cached version exists and is fresh, serve it
// 3. If stale, serve cached version AND trigger regeneration
// 4. Next request gets the new version
```

## Example 5: Hybrid Approach

```jsx
// pages/dashboard.js - Hybrid: SSR shell + CSR data
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Shell rendered on server, data fetched on client
export default function Dashboard({ initialStats }) {
    const { data: session } = useSession();
    const [stats, setStats] = useState(initialStats);
    const [activities, setActivities] = useState([]);

    // Fetch real-time data on client
    useEffect(() => {
        if (session) {
            fetchRealTimeData();
            const interval = setInterval(fetchRealTimeData, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    async function fetchRealTimeData() {
        const [statsRes, activitiesRes] = await Promise.all([
            fetch('/api/stats'),
            fetch('/api/activities')
        ]);
        setStats(await statsRes.json());
        setActivities(await activitiesRes.json());
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {/* Static content - SEO friendly */}
            <StaticWelcome />

            {/* Dynamic content - client-side */}
            <StatsDisplay stats={stats} />
            <ActivityFeed activities={activities} />
        </div>
    );
}

export async function getServerSideProps(context) {
    // Get initial data for faster first paint
    const res = await fetch(`${process.env.API_URL}/stats/summary`);
    const initialStats = await res.json();

    return {
        props: { initialStats }
    };
}
```

## Example 6: Choosing the Right Strategy

```jsx
// Decision tree for rendering strategy

const renderingGuide = {
    // Public, SEO-important, rarely changes
    "Marketing pages": "SSG",
    "Blog posts": "SSG or ISR",
    "Documentation": "SSG",

    // Public, SEO-important, changes frequently
    "Product listings": "ISR",
    "News articles": "ISR or SSR",
    "Search results": "SSR",

    // Private, user-specific
    "Dashboard": "SSR + CSR",
    "User profile": "SSR",
    "Settings": "CSR",

    // Real-time data
    "Chat": "CSR + WebSocket",
    "Live scores": "CSR + polling",
    "Notifications": "CSR"
};

// Next.js 13+ App Router patterns
// app/products/page.js - Server Component (default)
export default async function ProductsPage() {
    // This runs on the server
    const products = await fetch(`${process.env.API_URL}/products`);

    return <ProductList products={products} />;
}

// app/products/[id]/page.js - With caching
export default async function ProductPage({ params }) {
    // Cache for 1 hour
    const product = await fetch(`${process.env.API_URL}/products/${params.id}`, {
        next: { revalidate: 3600 }
    });

    return <ProductDetail product={product} />;
}

// Client Component for interactivity
'use client';
export function AddToCartButton({ productId }) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        await addToCart(productId);
        setLoading(false);
    }

    return (
        <button onClick={handleClick} disabled={loading}>
            {loading ? 'Adding...' : 'Add to Cart'}
        </button>
    );
}
```

**Key Takeaways:**
- SSG for static, SEO-important content
- SSR for dynamic, personalized pages
- CSR for highly interactive features
- ISR bridges static and dynamic
- Hybrid approaches often work best

---

# Imitation

### Challenge 1: Convert CSR to SSR

**Task:** Convert this CSR component to use SSR.

```jsx
// Before: CSR
function UserProfile() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetch('/api/user').then(r => r.json()).then(setUser);
    }, []);
    return user ? <Profile user={user} /> : <Loading />;
}
```

<details>
<summary>Solution</summary>

```jsx
// After: SSR
export default function UserProfile({ user }) {
    return <Profile user={user} />;
}

export async function getServerSideProps(context) {
    // Get auth from cookies
    const { req } = context;
    const token = req.cookies.token;

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        };
    }

    const res = await fetch(`${process.env.API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        return { notFound: true };
    }

    const user = await res.json();

    return {
        props: { user }
    };
}
```

</details>

### Challenge 2: Implement ISR for E-commerce

**Task:** Set up ISR for a product catalog with proper cache invalidation.

<details>
<summary>Solution</summary>

```jsx
// pages/products/[slug].js
export default function ProductPage({ product }) {
    return (
        <div>
            <h1>{product.name}</h1>
            <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
        </div>
    );
}

export async function getStaticPaths() {
    const products = await fetch(`${process.env.API_URL}/products`).then(r => r.json());

    return {
        paths: products.slice(0, 100).map(p => ({
            params: { slug: p.slug }
        })),
        fallback: 'blocking'
    };
}

export async function getStaticProps({ params }) {
    const product = await fetch(`${process.env.API_URL}/products/${params.slug}`)
        .then(r => r.json());

    if (!product) {
        return { notFound: true };
    }

    return {
        props: { product },
        revalidate: 60 // Revalidate every minute
    };
}

// pages/api/revalidate.js - On-demand revalidation
export default async function handler(req, res) {
    const { secret, slug } = req.query;

    if (secret !== process.env.REVALIDATE_SECRET) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        await res.revalidate(`/products/${slug}`);
        return res.json({ revalidated: true });
    } catch (err) {
        return res.status(500).json({ message: 'Error revalidating' });
    }
}

// Call from your CMS webhook when product updates
```

</details>

---

# Practice

### Exercise 1: Build a Blog with SSG
**Difficulty:** Intermediate

Create a blog that:
- Generates pages at build time
- Uses ISR for comments
- Has client-side search

### Exercise 2: E-commerce Product Pages
**Difficulty:** Advanced

Implement:
- ISR for product pages
- Real-time stock updates (CSR)
- SEO-optimized metadata
- On-demand revalidation

---

## Summary

**What you learned:**
- CSR vs SSR vs SSG trade-offs
- When to use each rendering strategy
- Implementing ISR for dynamic static sites
- Hybrid approaches combining strategies
- Next.js rendering patterns

**Next Steps:**
- Read: [Performance Optimization](/api/guides/concepts/performance)
- Practice: Migrate an SPA to SSR
- Explore: Edge rendering and streaming

---

## Resources

- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [Patterns.dev](https://www.patterns.dev/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
