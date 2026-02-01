---
title: "Go API Development"
subTitle: "Building Production-Ready APIs"
excerpt: "Go was built for web services - fast, concurrent, reliable."
featureImage: "/img/go-api.png"
date: "2026-02-01"
order: 203
---

# Explanation

## Why Go for APIs?

Go excels at building APIs. Fast compilation, excellent concurrency, low memory footprint, and a robust standard library make it ideal for web services.

### Key Concepts

- **net/http**: Standard library HTTP server
- **Context**: Request-scoped values and cancellation
- **JSON**: Built-in encoding/decoding
- **Middleware**: Handler wrappers for cross-cutting concerns

### Go API Stack Options

| Component | Options |
|-----------|---------|
| Router | stdlib, Gin, Chi, Echo |
| Database | database/sql, GORM, sqlx |
| Validation | go-playground/validator |
| Config | Viper, envconfig |

---

# Demonstration

## Example 1: Complete REST API

```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "sync"
    "time"

    "github.com/gorilla/mux"
)

// Models
type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

type CreateUserRequest struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

type Response struct {
    Data  interface{} `json:"data,omitempty"`
    Error string      `json:"error,omitempty"`
    Meta  *Meta       `json:"meta,omitempty"`
}

type Meta struct {
    Page       int `json:"page"`
    PerPage    int `json:"per_page"`
    Total      int `json:"total"`
    TotalPages int `json:"total_pages"`
}

// In-memory store
type UserStore struct {
    sync.RWMutex
    users  map[int]User
    nextID int
}

func NewUserStore() *UserStore {
    return &UserStore{
        users:  make(map[int]User),
        nextID: 1,
    }
}

// Handlers
type Handler struct {
    store *UserStore
}

func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
    h.store.RLock()
    defer h.store.RUnlock()

    // Pagination
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    if page < 1 {
        page = 1
    }
    perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
    if perPage < 1 || perPage > 100 {
        perPage = 10
    }

    users := make([]User, 0, len(h.store.users))
    for _, u := range h.store.users {
        users = append(users, u)
    }

    total := len(users)
    start := (page - 1) * perPage
    end := start + perPage
    if start > total {
        start = total
    }
    if end > total {
        end = total
    }

    jsonResponse(w, http.StatusOK, Response{
        Data: users[start:end],
        Meta: &Meta{
            Page:       page,
            PerPage:    perPage,
            Total:      total,
            TotalPages: (total + perPage - 1) / perPage,
        },
    })
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])

    h.store.RLock()
    user, exists := h.store.users[id]
    h.store.RUnlock()

    if !exists {
        jsonResponse(w, http.StatusNotFound, Response{
            Error: "User not found",
        })
        return
    }

    jsonResponse(w, http.StatusOK, Response{Data: user})
}

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        jsonResponse(w, http.StatusBadRequest, Response{
            Error: "Invalid JSON",
        })
        return
    }

    if req.Name == "" || req.Email == "" {
        jsonResponse(w, http.StatusBadRequest, Response{
            Error: "Name and email are required",
        })
        return
    }

    h.store.Lock()
    user := User{
        ID:        h.store.nextID,
        Name:      req.Name,
        Email:     req.Email,
        CreatedAt: time.Now(),
    }
    h.store.users[user.ID] = user
    h.store.nextID++
    h.store.Unlock()

    jsonResponse(w, http.StatusCreated, Response{Data: user})
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])

    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        jsonResponse(w, http.StatusBadRequest, Response{Error: "Invalid JSON"})
        return
    }

    h.store.Lock()
    defer h.store.Unlock()

    user, exists := h.store.users[id]
    if !exists {
        jsonResponse(w, http.StatusNotFound, Response{Error: "User not found"})
        return
    }

    if req.Name != "" {
        user.Name = req.Name
    }
    if req.Email != "" {
        user.Email = req.Email
    }
    h.store.users[id] = user

    jsonResponse(w, http.StatusOK, Response{Data: user})
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])

    h.store.Lock()
    defer h.store.Unlock()

    if _, exists := h.store.users[id]; !exists {
        jsonResponse(w, http.StatusNotFound, Response{Error: "User not found"})
        return
    }

    delete(h.store.users, id)
    w.WriteHeader(http.StatusNoContent)
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func main() {
    store := NewUserStore()
    handler := &Handler{store: store}

    r := mux.NewRouter()

    // Routes
    r.HandleFunc("/users", handler.ListUsers).Methods("GET")
    r.HandleFunc("/users", handler.CreateUser).Methods("POST")
    r.HandleFunc("/users/{id:[0-9]+}", handler.GetUser).Methods("GET")
    r.HandleFunc("/users/{id:[0-9]+}", handler.UpdateUser).Methods("PUT")
    r.HandleFunc("/users/{id:[0-9]+}", handler.DeleteUser).Methods("DELETE")

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

## Example 2: Middleware Chain

```go
package main

import (
    "context"
    "log"
    "net/http"
    "time"
)

// Context keys
type contextKey string

const userIDKey contextKey = "userID"

// Logging middleware
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        // Wrap response writer to capture status
        wrapped := &responseWriter{ResponseWriter: w, status: 200}

        next.ServeHTTP(wrapped, r)

        log.Printf(
            "[%d] %s %s - %v",
            wrapped.status,
            r.Method,
            r.URL.Path,
            time.Since(start),
        )
    })
}

type responseWriter struct {
    http.ResponseWriter
    status int
}

func (rw *responseWriter) WriteHeader(code int) {
    rw.status = code
    rw.ResponseWriter.WriteHeader(code)
}

// CORS middleware
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}

// Auth middleware
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")

        if token == "" {
            http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
            return
        }

        // Validate token and extract user ID
        userID, err := validateToken(token)
        if err != nil {
            http.Error(w, `{"error":"Invalid token"}`, http.StatusUnauthorized)
            return
        }

        // Add user ID to context
        ctx := context.WithValue(r.Context(), userIDKey, userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func validateToken(token string) (int, error) {
    // Token validation logic
    return 1, nil
}

// Recovery middleware
func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic recovered: %v", err)
                http.Error(w, `{"error":"Internal server error"}`, http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

// Rate limiting middleware
type RateLimiter struct {
    requests map[string][]time.Time
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

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr

        now := time.Now()
        windowStart := now.Add(-rl.window)

        // Clean old requests
        var valid []time.Time
        for _, t := range rl.requests[ip] {
            if t.After(windowStart) {
                valid = append(valid, t)
            }
        }
        rl.requests[ip] = valid

        if len(rl.requests[ip]) >= rl.limit {
            http.Error(w, `{"error":"Rate limit exceeded"}`, http.StatusTooManyRequests)
            return
        }

        rl.requests[ip] = append(rl.requests[ip], now)
        next.ServeHTTP(w, r)
    })
}

// Chain middleware
func Chain(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        h = middlewares[i](h)
    }
    return h
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello!"))
    })

    limiter := NewRateLimiter(100, time.Minute)

    handler := Chain(
        mux,
        RecoveryMiddleware,
        LoggingMiddleware,
        CORSMiddleware,
        limiter.Middleware,
    )

    http.ListenAndServe(":8080", handler)
}
```

## Example 3: Validation and Error Handling

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "regexp"
)

// Custom errors
type APIError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}

func (e *APIError) Error() string {
    return e.Message
}

var (
    ErrNotFound     = &APIError{404, "Resource not found"}
    ErrBadRequest   = &APIError{400, "Invalid request"}
    ErrUnauthorized = &APIError{401, "Unauthorized"}
)

// Validation
type Validator struct {
    errors []string
}

func NewValidator() *Validator {
    return &Validator{}
}

func (v *Validator) Required(field, value string) *Validator {
    if value == "" {
        v.errors = append(v.errors, fmt.Sprintf("%s is required", field))
    }
    return v
}

func (v *Validator) Email(field, value string) *Validator {
    emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    if value != "" && !emailRegex.MatchString(value) {
        v.errors = append(v.errors, fmt.Sprintf("%s must be a valid email", field))
    }
    return v
}

func (v *Validator) MinLength(field, value string, min int) *Validator {
    if len(value) < min {
        v.errors = append(v.errors, fmt.Sprintf("%s must be at least %d characters", field, min))
    }
    return v
}

func (v *Validator) IsValid() bool {
    return len(v.errors) == 0
}

func (v *Validator) Errors() []string {
    return v.errors
}

// Usage
type CreateUserRequest struct {
    Name     string `json:"name"`
    Email    string `json:"email"`
    Password string `json:"password"`
}

func (r *CreateUserRequest) Validate() *Validator {
    v := NewValidator()
    v.Required("name", r.Name).MinLength("name", r.Name, 2)
    v.Required("email", r.Email).Email("email", r.Email)
    v.Required("password", r.Password).MinLength("password", r.Password, 8)
    return v
}

// Error handler wrapper
func HandleErrors(handler func(w http.ResponseWriter, r *http.Request) error) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        err := handler(w, r)
        if err == nil {
            return
        }

        w.Header().Set("Content-Type", "application/json")

        if apiErr, ok := err.(*APIError); ok {
            w.WriteHeader(apiErr.Code)
            json.NewEncoder(w).Encode(map[string]string{"error": apiErr.Message})
            return
        }

        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Internal server error"})
    }
}

// Handler with validation
func CreateUserHandler(w http.ResponseWriter, r *http.Request) error {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        return &APIError{400, "Invalid JSON"}
    }

    v := req.Validate()
    if !v.IsValid() {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        return json.NewEncoder(w).Encode(map[string]interface{}{
            "error":  "Validation failed",
            "errors": v.Errors(),
        })
    }

    // Create user...
    w.WriteHeader(http.StatusCreated)
    return json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}
```

**Key Takeaways:**
- Use interfaces for testability
- Middleware chains handle cross-cutting concerns
- Custom error types improve error handling
- Validation should be explicit
- Context carries request-scoped data

---

# Imitation

### Challenge 1: Add Search Endpoint

**Task:** Implement a search endpoint with query filters.

<details>
<summary>Solution</summary>

```go
func (h *Handler) SearchUsers(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query()
    name := query.Get("name")
    email := query.Get("email")

    h.store.RLock()
    defer h.store.RUnlock()

    var results []User
    for _, user := range h.store.users {
        if name != "" && !strings.Contains(strings.ToLower(user.Name), strings.ToLower(name)) {
            continue
        }
        if email != "" && !strings.Contains(strings.ToLower(user.Email), strings.ToLower(email)) {
            continue
        }
        results = append(results, user)
    }

    jsonResponse(w, http.StatusOK, Response{
        Data: results,
        Meta: &Meta{Total: len(results)},
    })
}
```

</details>

### Challenge 2: Implement Caching Middleware

**Task:** Create middleware that caches GET responses.

<details>
<summary>Solution</summary>

```go
type CacheMiddleware struct {
    cache map[string]cachedResponse
    ttl   time.Duration
    mu    sync.RWMutex
}

type cachedResponse struct {
    body      []byte
    status    int
    headers   http.Header
    expiresAt time.Time
}

func NewCacheMiddleware(ttl time.Duration) *CacheMiddleware {
    return &CacheMiddleware{
        cache: make(map[string]cachedResponse),
        ttl:   ttl,
    }
}

func (c *CacheMiddleware) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
            next.ServeHTTP(w, r)
            return
        }

        key := r.URL.String()

        c.mu.RLock()
        cached, exists := c.cache[key]
        c.mu.RUnlock()

        if exists && time.Now().Before(cached.expiresAt) {
            for k, v := range cached.headers {
                w.Header()[k] = v
            }
            w.Header().Set("X-Cache", "HIT")
            w.WriteHeader(cached.status)
            w.Write(cached.body)
            return
        }

        rec := &responseRecorder{ResponseWriter: w, body: &bytes.Buffer{}}
        next.ServeHTTP(rec, r)

        if rec.status == http.StatusOK {
            c.mu.Lock()
            c.cache[key] = cachedResponse{
                body:      rec.body.Bytes(),
                status:    rec.status,
                headers:   w.Header().Clone(),
                expiresAt: time.Now().Add(c.ttl),
            }
            c.mu.Unlock()
        }
    })
}
```

</details>

---

# Practice

### Exercise 1: Build a Todo API
**Difficulty:** Intermediate

Create a complete Todo API with:
- CRUD operations
- User authentication
- Todo ownership
- Status filtering

### Exercise 2: Implement WebSocket Support
**Difficulty:** Advanced

Add real-time updates:
- WebSocket connections
- Broadcast on changes
- Connection management
- Heartbeat/ping-pong

---

## Summary

**What you learned:**
- Building REST APIs with Go
- Middleware patterns
- Validation and error handling
- Thread-safe data stores
- Response standardization

**Next Steps:**
- Read: [Go Testing](/api/guides/go/testing)
- Practice: Build a complete API
- Deploy: Containerize with Docker

---

## Resources

- [Go Web Examples](https://gowebexamples.com/)
- [Gorilla Mux](https://github.com/gorilla/mux)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
