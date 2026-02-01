---
title: "API Design Principles"
subTitle: "Building APIs Developers Love"
excerpt: "A well-designed API is a joy to use."
featureImage: "/img/api-design.png"
date: "2026-02-01"
order: 903
---

# Explanation

## What Makes a Good API?

A good API is consistent, predictable, and well-documented. It follows conventions, handles errors gracefully, and evolves without breaking clients.

### Key Principles

- **Consistency**: Same patterns everywhere
- **Predictability**: No surprises
- **Simplicity**: Easy to understand
- **Flexibility**: Accommodates different use cases

### REST vs GraphQL

| Aspect | REST | GraphQL |
|--------|------|---------|
| Endpoints | Multiple | Single |
| Data fetching | Fixed structure | Client specifies |
| Caching | HTTP caching | Custom |
| Learning curve | Lower | Higher |

---

# Demonstration

## Example 1: RESTful URL Design

```javascript
// Resource naming - nouns, not verbs
// GOOD
GET    /users              // List users
POST   /users              // Create user
GET    /users/123          // Get user
PUT    /users/123          // Update user
DELETE /users/123          // Delete user

// BAD
GET    /getUsers
POST   /createUser
GET    /getUserById/123
POST   /deleteUser/123

// Nested resources
GET    /users/123/posts           // User's posts
POST   /users/123/posts           // Create post for user
GET    /users/123/posts/456       // Specific post
GET    /posts/456/comments        // Post's comments

// Filtering, sorting, pagination
GET /users?role=admin&status=active
GET /posts?sort=-createdAt
GET /products?page=2&limit=20
GET /search?q=javascript&category=books

// Actions that don't fit CRUD
POST /users/123/activate
POST /orders/456/cancel
POST /payments/789/refund
```

## Example 2: Request/Response Design

```javascript
// Consistent response structure
// Success response
{
    "data": {
        "id": 123,
        "name": "Arthur",
        "email": "art@bpc.com"
    }
}

// Collection response
{
    "data": [
        { "id": 1, "name": "Arthur" },
        { "id": 2, "name": "Sarah" }
    ],
    "meta": {
        "page": 1,
        "perPage": 10,
        "total": 42,
        "totalPages": 5
    }
}

// Error response
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": [
            { "field": "email", "message": "Invalid email format" }
        ]
    }
}

// HTTP status codes
200 OK              // Success
201 Created         // Resource created
204 No Content      // Success, no body (DELETE)
400 Bad Request     // Client error
401 Unauthorized    // Not authenticated
403 Forbidden       // Not authorized
404 Not Found       // Resource doesn't exist
422 Unprocessable   // Validation failed
429 Too Many Requests // Rate limited
500 Internal Error  // Server error

// Express implementation
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        res.json({ data: user });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong'
            }
        });
    }
});
```

## Example 3: Versioning

```javascript
// URL versioning (most common)
GET /api/v1/users
GET /api/v2/users

// Header versioning
GET /api/users
Accept: application/vnd.myapi.v2+json

// Query parameter versioning
GET /api/users?version=2

// Implementation with Express
const v1Router = express.Router();
const v2Router = express.Router();

// V1 routes
v1Router.get('/users', (req, res) => {
    res.json({
        data: users.map(u => ({
            id: u.id,
            name: u.name
            // V1 structure
        }))
    });
});

// V2 routes with different structure
v2Router.get('/users', (req, res) => {
    res.json({
        data: users.map(u => ({
            id: u.id,
            fullName: u.name,  // Renamed field
            email: u.email,    // New field
            createdAt: u.createdAt
        })),
        meta: { version: 2 }
    });
});

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

## Example 4: Field Selection and Expansion

```javascript
// Sparse fieldsets
GET /users?fields=id,name,email

// Implementation
app.get('/users', async (req, res) => {
    const fields = req.query.fields?.split(',') || null;

    let query = User.find();

    if (fields) {
        query = query.select(fields.join(' '));
    }

    const users = await query;
    res.json({ data: users });
});

// Resource expansion
GET /posts?expand=author,comments

// Implementation
app.get('/posts', async (req, res) => {
    const expand = req.query.expand?.split(',') || [];

    let query = Post.find();

    if (expand.includes('author')) {
        query = query.populate('author', 'name email');
    }

    if (expand.includes('comments')) {
        query = query.populate({
            path: 'comments',
            options: { limit: 10 },
            populate: { path: 'author', select: 'name' }
        });
    }

    const posts = await query;
    res.json({ data: posts });
});

// GraphQL approach
const query = `
    query {
        posts {
            id
            title
            author {
                name
            }
            comments(first: 10) {
                content
                author {
                    name
                }
            }
        }
    }
`;
```

## Example 5: Documentation (OpenAPI/Swagger)

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: API for managing users

servers:
  - url: https://api.example.com/v1

paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
            maximum: 100
      responses:
        '200':
          description: Users list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    $ref: '#/components/schemas/Pagination'

    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/ValidationError'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time

    CreateUser:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 2
        email:
          type: string
          format: email

  responses:
    ValidationError:
      description: Validation error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
                  details:
                    type: array
```

**Key Takeaways:**
- Use nouns for resources, HTTP methods for actions
- Be consistent with response structure
- Version your API from day one
- Document with OpenAPI/Swagger
- Provide filtering, sorting, pagination

---

# Imitation

### Challenge 1: Design a Blog API

**Task:** Design REST endpoints for a blog with posts, comments, and tags.

<details>
<summary>Solution</summary>

```
# Posts
GET    /posts                    # List posts
GET    /posts?author=123         # Filter by author
GET    /posts?tag=javascript     # Filter by tag
GET    /posts?sort=-createdAt    # Sort by date desc
POST   /posts                    # Create post
GET    /posts/:id                # Get post
PUT    /posts/:id                # Update post
DELETE /posts/:id                # Delete post

# Post actions
POST   /posts/:id/publish        # Publish draft
POST   /posts/:id/archive        # Archive post

# Comments (nested under posts)
GET    /posts/:id/comments       # List comments
POST   /posts/:id/comments       # Add comment
PUT    /posts/:id/comments/:cid  # Update comment
DELETE /posts/:id/comments/:cid  # Delete comment

# Tags
GET    /tags                     # List tags
GET    /tags/:slug               # Get tag
GET    /tags/:slug/posts         # Posts with tag

# Search
GET    /search?q=javascript      # Full-text search

# Response structure
{
    "data": {
        "id": 1,
        "title": "Getting Started",
        "content": "...",
        "author": {
            "id": 123,
            "name": "Arthur"
        },
        "tags": ["javascript", "tutorial"],
        "commentsCount": 5,
        "createdAt": "2024-01-15T10:00:00Z"
    }
}
```

</details>

---

# Practice

### Exercise 1: API Versioning Strategy
**Difficulty:** Intermediate

Design a versioning strategy that:
- Supports breaking changes
- Maintains backwards compatibility
- Has clear deprecation policy

### Exercise 2: Rate Limiting Design
**Difficulty:** Advanced

Design rate limiting with:
- Different limits per endpoint
- User-specific quotas
- Clear headers for clients

---

## Summary

**What you learned:**
- RESTful URL design
- Response structure standards
- API versioning approaches
- Field selection and expansion
- API documentation

**Next Steps:**
- Read: [Authentication](/api/guides/concepts/authentication)
- Practice: Document an existing API
- Build: Create an API client library

---

## Resources

- [REST API Design](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
