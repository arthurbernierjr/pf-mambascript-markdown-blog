---
title: "Go Routing"
subTitle: "Building Web Servers with Go"
excerpt: "Go was built for the web - fast, simple, and concurrent."
featureImage: "/img/go-routing.png"
date: "2026-02-01"
order: 201
---

# Explanation

## Web Routing in Go

Go's standard library includes everything you need to build web servers. The `net/http` package is powerful enough for production use, and frameworks like Gin and Echo add convenience without sacrificing performance.

### Key Concepts

- **Handler**: A function that processes HTTP requests
- **Mux/Router**: Routes requests to the right handler
- **Middleware**: Functions that wrap handlers for cross-cutting concerns
- **Context**: Carries request-scoped values and cancellation

### Standard Library vs Frameworks

| Feature | net/http | Gin | Echo |
|---------|----------|-----|------|
| Routing | Basic | Advanced | Advanced |
| Parameters | Manual | Built-in | Built-in |
| Middleware | Manual | Built-in | Built-in |
| Performance | Excellent | Excellent | Excellent |
| Learning | Medium | Easy | Easy |

---

# Demonstration

## Example 1: Standard Library (net/http)

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strings"
)

// Response helper
func jsonResponse(w http.ResponseWriter, data interface{}, status int) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

// User handlers
func handleUsers(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        users := []map[string]string{
            {"id": "1", "name": "Arthur"},
            {"id": "2", "name": "Sarah"},
        }
        jsonResponse(w, users, http.StatusOK)

    case http.MethodPost:
        var user map[string]string
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            jsonResponse(w, map[string]string{"error": "Invalid JSON"}, http.StatusBadRequest)
            return
        }
        user["id"] = "3"
        jsonResponse(w, user, http.StatusCreated)

    default:
        jsonResponse(w, map[string]string{"error": "Method not allowed"}, http.StatusMethodNotAllowed)
    }
}

// Extract path parameter manually
func handleUser(w http.ResponseWriter, r *http.Request) {
    // URL: /users/123
    path := strings.TrimPrefix(r.URL.Path, "/users/")
    if path == "" {
        jsonResponse(w, map[string]string{"error": "ID required"}, http.StatusBadRequest)
        return
    }

    user := map[string]string{
        "id":   path,
        "name": fmt.Sprintf("User %s", path),
    }
    jsonResponse(w, user, http.StatusOK)
}

// Query parameters
func handleSearch(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query()
    q := query.Get("q")
    limit := query.Get("limit")

    if q == "" {
        q = "*"
    }
    if limit == "" {
        limit = "10"
    }

    jsonResponse(w, map[string]string{
        "query": q,
        "limit": limit,
    }, http.StatusOK)
}

func main() {
    http.HandleFunc("/users", handleUsers)
    http.HandleFunc("/users/", handleUser)
    http.HandleFunc("/search", handleSearch)

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Example 2: Gin Framework

```go
package main

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
)

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
}

var users = []User{
    {ID: 1, Name: "Arthur", Email: "art@bpc.com"},
    {ID: 2, Name: "Sarah", Email: "sarah@example.com"},
}
var nextID = 3

func main() {
    r := gin.Default()

    // GET /users - List all
    r.GET("/users", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"data": users})
    })

    // GET /users/:id - Get one
    r.GET("/users/:id", func(c *gin.Context) {
        id, err := strconv.Atoi(c.Param("id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
            return
        }

        for _, user := range users {
            if user.ID == id {
                c.JSON(http.StatusOK, gin.H{"data": user})
                return
            }
        }

        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
    })

    // POST /users - Create
    r.POST("/users", func(c *gin.Context) {
        var input User
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        input.ID = nextID
        nextID++
        users = append(users, input)

        c.JSON(http.StatusCreated, gin.H{"data": input})
    })

    // PUT /users/:id - Update
    r.PUT("/users/:id", func(c *gin.Context) {
        id, _ := strconv.Atoi(c.Param("id"))

        var input User
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        for i, user := range users {
            if user.ID == id {
                users[i].Name = input.Name
                users[i].Email = input.Email
                c.JSON(http.StatusOK, gin.H{"data": users[i]})
                return
            }
        }

        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
    })

    // DELETE /users/:id - Delete
    r.DELETE("/users/:id", func(c *gin.Context) {
        id, _ := strconv.Atoi(c.Param("id"))

        for i, user := range users {
            if user.ID == id {
                users = append(users[:i], users[i+1:]...)
                c.Status(http.StatusNoContent)
                return
            }
        }

        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
    })

    // Query parameters
    r.GET("/search", func(c *gin.Context) {
        q := c.DefaultQuery("q", "*")
        limit := c.DefaultQuery("limit", "10")

        c.JSON(http.StatusOK, gin.H{
            "query": q,
            "limit": limit,
        })
    })

    r.Run(":8080")
}
```

## Example 3: Middleware

```go
package main

import (
    "log"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

// Custom logging middleware
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path

        // Process request
        c.Next()

        // Log after response
        duration := time.Since(start)
        status := c.Writer.Status()

        log.Printf("[%d] %s %s - %v", status, c.Request.Method, path, duration)
    }
}

// Auth middleware
func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")

        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Authorization required",
            })
            return
        }

        // Validate token (simplified)
        if token != "Bearer valid-token" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid token",
            })
            return
        }

        // Set user in context
        c.Set("userID", 1)
        c.Next()
    }
}

// CORS middleware
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}

func main() {
    r := gin.New()

    // Global middleware
    r.Use(Logger())
    r.Use(CORS())
    r.Use(gin.Recovery())

    // Public routes
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
    })

    // Protected routes
    api := r.Group("/api")
    api.Use(AuthRequired())
    {
        api.GET("/profile", func(c *gin.Context) {
            userID := c.GetInt("userID")
            c.JSON(http.StatusOK, gin.H{
                "userID": userID,
                "name":   "Arthur",
            })
        })

        api.GET("/settings", func(c *gin.Context) {
            c.JSON(http.StatusOK, gin.H{
                "theme": "dark",
                "lang":  "en",
            })
        })
    }

    r.Run(":8080")
}
```

**Key Takeaways:**
- Standard library is production-ready
- Gin adds convenience (routing, binding, middleware)
- Use middleware for cross-cutting concerns
- Group routes for organization and shared middleware

---

# Imitation

### Challenge 1: Add Pagination

**Task:** Add pagination to the list users endpoint.

<details>
<summary>Solution</summary>

```go
r.GET("/users", func(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

    start := (page - 1) * perPage
    end := start + perPage

    if start > len(users) {
        start = len(users)
    }
    if end > len(users) {
        end = len(users)
    }

    c.JSON(http.StatusOK, gin.H{
        "data":       users[start:end],
        "page":       page,
        "per_page":   perPage,
        "total":      len(users),
        "total_pages": (len(users) + perPage - 1) / perPage,
    })
})
```

</details>

### Challenge 2: Rate Limiting Middleware

**Task:** Create middleware that limits requests to 100 per minute per IP.

<details>
<summary>Solution</summary>

```go
import (
    "sync"
    "time"
)

type RateLimiter struct {
    requests map[string][]time.Time
    mu       sync.Mutex
    limit    int
    window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
    return &RateLimiter{
        requests: make(map[string][]time.Time),
        limit:    limit,
        window:   window,
    }
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        ip := c.ClientIP()

        rl.mu.Lock()
        now := time.Now()
        cutoff := now.Add(-rl.window)

        // Clean old requests
        var valid []time.Time
        for _, t := range rl.requests[ip] {
            if t.After(cutoff) {
                valid = append(valid, t)
            }
        }
        rl.requests[ip] = valid

        if len(rl.requests[ip]) >= rl.limit {
            rl.mu.Unlock()
            c.AbortWithStatusJSON(429, gin.H{"error": "Rate limit exceeded"})
            return
        }

        rl.requests[ip] = append(rl.requests[ip], now)
        rl.mu.Unlock()

        c.Next()
    }
}

// Usage
limiter := NewRateLimiter(100, time.Minute)
r.Use(limiter.Middleware())
```

</details>

---

# Practice

### Exercise 1: RESTful API
**Difficulty:** Intermediate

Build a complete REST API for a blog:
- Posts (CRUD operations)
- Comments on posts
- Tags with many-to-many relationship
- Pagination and filtering

### Exercise 2: File Upload API
**Difficulty:** Advanced

Create an API for file uploads:
- Upload single/multiple files
- File type validation
- Size limits
- Generate thumbnails for images

---

## Summary

**What you learned:**
- HTTP routing with standard library
- Gin framework for web APIs
- Request binding and validation
- Middleware patterns
- Route grouping

**Next Steps:**
- Read: [Go OOP](/api/guides/go/oop)
- Practice: Build a REST API
- Deploy: Containerize with Docker

---

## Resources

- [Go net/http Package](https://pkg.go.dev/net/http)
- [Gin Framework](https://gin-gonic.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
