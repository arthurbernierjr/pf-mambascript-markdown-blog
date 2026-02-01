---
title: "REST API Design"
subTitle: "Building APIs That Developers Love"
excerpt: "Good design is obvious. Great design is transparent. - Joe Sparano"
featureImage: "/img/rest-api.png"
date: "2026-02-01"
order: 801
---

# Explanation

## What is REST?

REST (Representational State Transfer) is an architectural style for designing web APIs. Think of it as a set of rules that make APIs predictable and easy to use.

Imagine a restaurant menu. REST is like having a standardized menu format where:
- The menu sections (resources) are clearly labeled
- Each item has a consistent format (name, description, price)
- The way you order (HTTP methods) is always the same

### REST Principles

1. **Stateless**: Each request contains all info needed; server doesn't remember previous requests
2. **Client-Server**: Clear separation between frontend and backend
3. **Uniform Interface**: Consistent URL patterns and HTTP methods
4. **Resource-Based**: Everything is a resource with a unique URL

### Why This Matters

RESTful APIs are the standard for web development because:
- They're predictable (developers can guess endpoints)
- They scale well (stateless = easier load balancing)
- They're language-agnostic (any language can consume them)
- They map naturally to CRUD operations

---

# Demonstration

## Example 1: RESTful URL Design

```javascript
// GOOD REST URLs - Nouns, not verbs
GET    /users           // Get all users
GET    /users/123       // Get user 123
POST   /users           // Create a user
PUT    /users/123       // Update user 123
DELETE /users/123       // Delete user 123

// Nested resources
GET    /users/123/posts     // Get posts by user 123
POST   /users/123/posts     // Create post for user 123
GET    /users/123/posts/456 // Get specific post

// Query parameters for filtering
GET /users?role=admin              // Filter by role
GET /users?sort=createdAt&order=desc  // Sort results
GET /posts?author=123&status=published // Multiple filters

// BAD URLs - Avoid these patterns
GET /getUsers           // Verb in URL
GET /users/delete/123   // Action in URL
POST /createNewUser     // Redundant with POST
GET /user_posts/123     // Inconsistent naming
```

## Example 2: Complete REST API with Express

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// In-memory database
let posts = [];
let nextId = 1;

// GET /posts - List all posts with pagination
app.get('/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;

    const paginatedPosts = posts.slice(start, start + limit);

    res.json({
        data: paginatedPosts,
        meta: {
            total: posts.length,
            page,
            limit,
            totalPages: Math.ceil(posts.length / limit)
        }
    });
});

// GET /posts/:id - Get single post
app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));

    if (!post) {
        return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `Post with ID ${req.params.id} not found`
            }
        });
    }

    res.json({ data: post });
});

// POST /posts - Create new post
app.post('/posts', (req, res) => {
    const { title, content, authorId } = req.body;

    // Validation
    if (!title || !content) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Title and content are required',
                fields: {
                    title: !title ? 'Required' : null,
                    content: !content ? 'Required' : null
                }
            }
        });
    }

    const post = {
        id: nextId++,
        title,
        content,
        authorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    posts.push(post);

    res.status(201).json({ data: post });
});

// PUT /posts/:id - Full update
app.put('/posts/:id', (req, res) => {
    const index = posts.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Post not found' }
        });
    }

    posts[index] = {
        ...posts[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    res.json({ data: posts[index] });
});

// DELETE /posts/:id
app.delete('/posts/:id', (req, res) => {
    const index = posts.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Post not found' }
        });
    }

    posts.splice(index, 1);
    res.status(204).send();
});

app.listen(3000);
```

**Key Takeaways:**
- Use consistent response format (`{ data: ... }` or `{ error: ... }`)
- Include metadata for paginated responses
- Return appropriate HTTP status codes
- Provide clear error messages

---

# Imitation

### Challenge 1: Add Search Endpoint

**Task:** Add a search endpoint that finds posts by title or content.

```javascript
GET /posts/search?q=javascript
// Returns posts containing "javascript" in title or content
```

<details>
<summary>Solution</summary>

```javascript
app.get('/posts/search', (req, res) => {
    const query = (req.query.q || '').toLowerCase();

    if (!query) {
        return res.status(400).json({
            error: { code: 'MISSING_QUERY', message: 'Search query required' }
        });
    }

    const results = posts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
    );

    res.json({ data: results, meta: { query, count: results.length } });
});
```

</details>

### Challenge 2: Implement PATCH

**Task:** Add a PATCH endpoint for partial updates (unlike PUT which replaces everything).

<details>
<summary>Solution</summary>

```javascript
app.patch('/posts/:id', (req, res) => {
    const index = posts.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Post not found' }
        });
    }

    // Only update provided fields
    const allowedFields = ['title', 'content'];
    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    posts[index] = {
        ...posts[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    res.json({ data: posts[index] });
});
```

</details>

---

# Practice

### Exercise 1: Design a Bookstore API
**Difficulty:** Beginner

**Task:** Design the URL structure for a bookstore API with:
- Books (with categories)
- Authors
- Reviews for books
- User wishlists

Write out all the endpoints you would need.

### Exercise 2: Implement Filtering
**Difficulty:** Intermediate

**Task:** Extend the posts API with advanced filtering:

```javascript
GET /posts?status=published&author=123&createdAfter=2024-01-01&sort=-createdAt
```

**Requirements:**
- Filter by status, author, date range
- Sort by any field (prefix `-` for descending)
- Combine multiple filters

---

## Summary

**What you learned:**
- REST principles and conventions
- Designing clean, predictable URLs
- Proper use of HTTP methods and status codes
- Consistent response formatting

**Next Steps:**
- Read: [MVC Pattern](/api/guides/concepts/mvc)
- Practice: Build a REST API for a real project
- Build: Add authentication to your API

---

## Resources

- [REST API Best Practices](https://restfulapi.net/resource-naming/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
