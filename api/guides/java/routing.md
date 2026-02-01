---
title: "Java Web Routing"
subTitle: "Building APIs with Spring Boot"
excerpt: "Spring Boot: the de facto standard for Java web development."
featureImage: "/img/java-routing.png"
date: "2026-02-01"
order: 601
---

# Explanation

## Spring Boot for Web APIs

Spring Boot simplifies Java web development with convention over configuration. It's mature, well-documented, and powers countless production systems.

### Key Concepts

- **Controllers**: Handle HTTP requests
- **Services**: Business logic layer
- **Repositories**: Data access layer
- **Dependency Injection**: Automatic wiring

### Spring Annotations

| Annotation | Purpose |
|------------|---------|
| `@RestController` | REST API controller |
| `@GetMapping` | Handle GET requests |
| `@PostMapping` | Handle POST requests |
| `@RequestBody` | Parse JSON body |
| `@PathVariable` | URL path parameter |

---

# Demonstration

## Example 1: Basic Spring Boot API

```java
// User.java
package com.example.demo.model;

public record User(
    Long id,
    String name,
    String email,
    String role
) {}

// CreateUserRequest.java
package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank @Size(min = 2, max = 50)
    String name,

    @NotBlank @Email
    String email,

    String role
) {}

// UserController.java
package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.dto.CreateUserRequest;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users
    @GetMapping
    public ResponseEntity<Map<String, Object>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(required = false) String role
    ) {
        List<User> users = userService.findAll(page, perPage, role);
        long total = userService.count(role);

        return ResponseEntity.ok(Map.of(
            "data", users,
            "page", page,
            "perPage", perPage,
            "total", total
        ));
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, User>> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(user -> ResponseEntity.ok(Map.of("data", user)))
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/users
    @PostMapping
    public ResponseEntity<Map<String, User>> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        User user = userService.create(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(Map.of("data", user));
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request
    ) {
        return userService.update(id, request)
            .map(user -> ResponseEntity.ok(Map.of("data", user)))
            .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
```

## Example 2: Service Layer

```java
// UserService.java
package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.dto.CreateUserRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {

    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(0);

    public List<User> findAll(int page, int perPage, String role) {
        return users.values().stream()
            .filter(u -> role == null || role.equals(u.role()))
            .skip((long) (page - 1) * perPage)
            .limit(perPage)
            .toList();
    }

    public long count(String role) {
        return users.values().stream()
            .filter(u -> role == null || role.equals(u.role()))
            .count();
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }

    public User create(CreateUserRequest request) {
        Long id = idCounter.incrementAndGet();
        User user = new User(
            id,
            request.name(),
            request.email(),
            request.role() != null ? request.role() : "user"
        );
        users.put(id, user);
        return user;
    }

    public Optional<User> update(Long id, CreateUserRequest request) {
        return findById(id).map(existing -> {
            User updated = new User(
                id,
                request.name(),
                request.email(),
                request.role() != null ? request.role() : existing.role()
            );
            users.put(id, updated);
            return updated;
        });
    }

    public boolean delete(Long id) {
        return users.remove(id) != null;
    }
}
```

## Example 3: Error Handling

```java
// GlobalExceptionHandler.java
package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(fieldName, message);
        });

        return ResponseEntity
            .badRequest()
            .body(Map.of(
                "error", "Validation failed",
                "details", errors
            ));
    }

    // Handle custom exceptions
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            ResourceNotFoundException ex
    ) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", ex.getMessage()));
    }

    // Handle all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(
            Exception ex
    ) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Internal server error"));
    }
}

// ResourceNotFoundException.java
package com.example.demo.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## Example 4: Interceptors and Filters

```java
// LoggingInterceptor.java
package com.example.demo.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class LoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex
    ) {
        long startTime = (Long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;

        logger.info("[{}] {} {} - {}ms",
            response.getStatus(),
            request.getMethod(),
            request.getRequestURI(),
            duration
        );
    }
}

// AuthFilter.java
package com.example.demo.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Skip auth for public endpoints
        if (req.getRequestURI().startsWith("/api/public")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().write("{\"error\": \"Unauthorized\"}");
            return;
        }

        // Validate token...
        chain.doFilter(request, response);
    }
}

// WebConfig.java
package com.example.demo.config;

import com.example.demo.interceptor.LoggingInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoggingInterceptor loggingInterceptor;

    public WebConfig(LoggingInterceptor loggingInterceptor) {
        this.loggingInterceptor = loggingInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor);
    }
}
```

**Key Takeaways:**
- Spring Boot simplifies Java web development
- Use records for DTOs (Java 16+)
- Validation annotations ensure data integrity
- Global exception handlers centralize error logic
- Interceptors/filters handle cross-cutting concerns

---

# Imitation

### Challenge 1: Add Pagination Response

**Task:** Create a generic paginated response wrapper.

<details>
<summary>Solution</summary>

```java
// PagedResponse.java
public record PagedResponse<T>(
    List<T> data,
    int page,
    int perPage,
    long total,
    int totalPages
) {
    public static <T> PagedResponse<T> of(
            List<T> data,
            int page,
            int perPage,
            long total
    ) {
        int totalPages = (int) Math.ceil((double) total / perPage);
        return new PagedResponse<>(data, page, perPage, total, totalPages);
    }
}

// Usage in controller
@GetMapping
public ResponseEntity<PagedResponse<User>> listUsers(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int perPage
) {
    List<User> users = userService.findAll(page, perPage);
    long total = userService.count();

    return ResponseEntity.ok(
        PagedResponse.of(users, page, perPage, total)
    );
}
```

</details>

---

# Practice

### Exercise 1: Complete CRUD API
**Difficulty:** Intermediate

Build a complete API with:
- Multiple resources
- Relationships between entities
- Search/filter capabilities

### Exercise 2: JWT Authentication
**Difficulty:** Advanced

Implement authentication:
- Login endpoint returning JWT
- Token validation filter
- Role-based access control

---

## Summary

**What you learned:**
- Spring Boot REST controllers
- Service layer patterns
- Validation and error handling
- Interceptors and filters
- Response standardization

**Next Steps:**
- Read: [Java OOP](/api/guides/java/oop)
- Practice: Build a complete API
- Explore: Spring Security

---

## Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Baeldung Spring Tutorials](https://www.baeldung.com/spring-boot)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
