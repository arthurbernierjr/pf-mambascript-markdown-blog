---
title: "Rust API Development"
subTitle: "Building High-Performance APIs with Rust"
excerpt: "Rust APIs are blazing fast and memory safe - the best of both worlds."
featureImage: "/img/rust-api.png"
date: "2026-02-01"
order: 74
---

# Explanation

## Rust Web Frameworks

Rust offers several excellent frameworks for building APIs. Each has different trade-offs between ergonomics, performance, and features.

### Framework Comparison

| Framework | Async | Performance | Learning Curve |
|-----------|-------|-------------|----------------|
| Actix Web | Yes | Excellent | Moderate |
| Axum | Yes | Excellent | Moderate |
| Rocket | Yes | Good | Low |
| Warp | Yes | Excellent | High |

---

# Demonstration

## Example 1: Axum Basics

```rust
use axum::{
    extract::{Path, Query, State, Json},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, put, delete},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

// Models
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
    email: String,
}

#[derive(Debug, Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

#[derive(Debug, Deserialize)]
struct QueryParams {
    page: Option<u32>,
    per_page: Option<u32>,
}

// Application state
type AppState = Arc<RwLock<Vec<User>>>;

// Handlers
async fn list_users(
    State(state): State<AppState>,
    Query(params): Query<QueryParams>,
) -> impl IntoResponse {
    let users = state.read().await;
    let page = params.page.unwrap_or(1);
    let per_page = params.per_page.unwrap_or(10);

    let start = ((page - 1) * per_page) as usize;
    let end = (start + per_page as usize).min(users.len());

    let paginated: Vec<_> = users[start..end].to_vec();

    Json(serde_json::json!({
        "data": paginated,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": users.len()
        }
    }))
}

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> Result<Json<User>, StatusCode> {
    let users = state.read().await;

    users
        .iter()
        .find(|u| u.id == id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn create_user(
    State(state): State<AppState>,
    Json(input): Json<CreateUser>,
) -> impl IntoResponse {
    let mut users = state.write().await;

    let id = users.len() as u64 + 1;
    let user = User {
        id,
        name: input.name,
        email: input.email,
    };

    users.push(user.clone());

    (StatusCode::CREATED, Json(user))
}

async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    Json(input): Json<CreateUser>,
) -> Result<Json<User>, StatusCode> {
    let mut users = state.write().await;

    if let Some(user) = users.iter_mut().find(|u| u.id == id) {
        user.name = input.name;
        user.email = input.email;
        Ok(Json(user.clone()))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn delete_user(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> StatusCode {
    let mut users = state.write().await;

    if let Some(pos) = users.iter().position(|u| u.id == id) {
        users.remove(pos);
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}

#[tokio::main]
async fn main() {
    let state: AppState = Arc::new(RwLock::new(Vec::new()));

    let app = Router::new()
        .route("/users", get(list_users).post(create_user))
        .route("/users/:id", get(get_user).put(update_user).delete(delete_user))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

## Example 2: Error Handling

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

// Custom error type
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Internal error")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_code, message) = match &self {
            AppError::NotFound(msg) => {
                (StatusCode::NOT_FOUND, "NOT_FOUND", msg.clone())
            }
            AppError::Validation(msg) => {
                (StatusCode::BAD_REQUEST, "VALIDATION_ERROR", msg.clone())
            }
            AppError::Unauthorized => {
                (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized".to_string())
            }
            AppError::Database(e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "DATABASE_ERROR", "Database error".to_string())
            }
            AppError::Internal(e) => {
                tracing::error!("Internal error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal error".to_string())
            }
        };

        let body = Json(json!({
            "error": {
                "code": error_code,
                "message": message
            }
        }));

        (status, body).into_response()
    }
}

// Result type alias
pub type AppResult<T> = Result<T, AppError>;

// Handler using AppResult
async fn get_user(Path(id): Path<u64>) -> AppResult<Json<User>> {
    let user = find_user(id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("User {}", id)))?;

    Ok(Json(user))
}

async fn create_user(Json(input): Json<CreateUser>) -> AppResult<Json<User>> {
    // Validation
    if input.name.is_empty() {
        return Err(AppError::Validation("Name is required".to_string()));
    }

    if !input.email.contains('@') {
        return Err(AppError::Validation("Invalid email".to_string()));
    }

    let user = save_user(input).await?;
    Ok(Json(user))
}
```

## Example 3: Middleware and Extractors

```rust
use axum::{
    extract::{FromRequestParts, State},
    http::{request::Parts, StatusCode, header},
    middleware::{self, Next},
    response::Response,
    Router,
};
use jsonwebtoken::{decode, DecodingKey, Validation};

// JWT claims
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: u64,  // user id
    exp: usize,
}

// Custom extractor for authenticated user
struct AuthUser {
    user_id: u64,
}

#[async_trait::async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|h| h.to_str().ok())
            .ok_or(AppError::Unauthorized)?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or(AppError::Unauthorized)?;

        let key = DecodingKey::from_secret(b"secret");
        let token_data = decode::<Claims>(token, &key, &Validation::default())
            .map_err(|_| AppError::Unauthorized)?;

        Ok(AuthUser {
            user_id: token_data.claims.sub,
        })
    }
}

// Use in handler
async fn get_profile(auth: AuthUser) -> AppResult<Json<User>> {
    let user = find_user(auth.user_id)
        .await
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(user))
}

// Logging middleware
async fn logging_middleware(
    request: axum::http::Request<axum::body::Body>,
    next: Next,
) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();
    let start = std::time::Instant::now();

    let response = next.run(request).await;

    let duration = start.elapsed();
    tracing::info!(
        "{} {} {} {:?}",
        method,
        uri,
        response.status(),
        duration
    );

    response
}

// Rate limiting middleware
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};

#[derive(Clone)]
struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window,
        }
    }

    async fn check(&self, key: &str) -> bool {
        let mut requests = self.requests.lock().await;
        let now = Instant::now();

        let entry = requests.entry(key.to_string()).or_insert_with(Vec::new);
        entry.retain(|&t| now.duration_since(t) < self.window);

        if entry.len() >= self.max_requests {
            false
        } else {
            entry.push(now);
            true
        }
    }
}

// Apply middlewares
fn create_router() -> Router {
    Router::new()
        .route("/users", get(list_users).post(create_user))
        .route("/profile", get(get_profile))
        .layer(middleware::from_fn(logging_middleware))
}
```

## Example 4: Database Integration with SQLx

```rust
use sqlx::{postgres::PgPoolOptions, PgPool, FromRow};

#[derive(Debug, FromRow, Serialize)]
struct User {
    id: i64,
    name: String,
    email: String,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

// Repository
struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    async fn find_all(&self, page: i64, per_page: i64) -> Result<Vec<User>, sqlx::Error> {
        let offset = (page - 1) * per_page;

        sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            per_page,
            offset
        )
        .fetch_all(&self.pool)
        .await
    }

    async fn find_by_id(&self, id: i64) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, created_at
            FROM users
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
    }

    async fn create(&self, input: CreateUser) -> Result<User, sqlx::Error> {
        sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (name, email)
            VALUES ($1, $2)
            RETURNING id, name, email, created_at
            "#,
            input.name,
            input.email
        )
        .fetch_one(&self.pool)
        .await
    }

    async fn update(&self, id: i64, input: CreateUser) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET name = $2, email = $3
            WHERE id = $1
            RETURNING id, name, email, created_at
            "#,
            id,
            input.name,
            input.email
        )
        .fetch_optional(&self.pool)
        .await
    }

    async fn delete(&self, id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query!("DELETE FROM users WHERE id = $1", id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}

// Setup
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("DATABASE_URL")?)
        .await?;

    // Run migrations
    sqlx::migrate!("./migrations").run(&pool).await?;

    let repo = UserRepository { pool: pool.clone() };

    let app = Router::new()
        .route("/users", get(list_users).post(create_user))
        .with_state(Arc::new(repo));

    Ok(())
}
```

## Example 5: Actix Web Alternative

```rust
use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
    email: String,
}

// Handlers
async fn list_users(data: web::Data<AppState>) -> HttpResponse {
    let users = data.users.lock().unwrap();
    HttpResponse::Ok().json(&*users)
}

async fn get_user(
    data: web::Data<AppState>,
    path: web::Path<u64>,
) -> HttpResponse {
    let users = data.users.lock().unwrap();
    let id = path.into_inner();

    match users.iter().find(|u| u.id == id) {
        Some(user) => HttpResponse::Ok().json(user),
        None => HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        })),
    }
}

async fn create_user(
    data: web::Data<AppState>,
    body: web::Json<CreateUser>,
) -> HttpResponse {
    let mut users = data.users.lock().unwrap();

    let user = User {
        id: users.len() as u64 + 1,
        name: body.name.clone(),
        email: body.email.clone(),
    };

    users.push(user.clone());

    HttpResponse::Created().json(user)
}

// State
struct AppState {
    users: std::sync::Mutex<Vec<User>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = web::Data::new(AppState {
        users: std::sync::Mutex::new(Vec::new()),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(middleware::Logger::default())
            .route("/users", web::get().to(list_users))
            .route("/users", web::post().to(create_user))
            .route("/users/{id}", web::get().to(get_user))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

## Example 6: Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt;

    fn create_app() -> Router {
        let state: AppState = Arc::new(RwLock::new(vec![
            User {
                id: 1,
                name: "Test User".to_string(),
                email: "test@example.com".to_string(),
            },
        ]));

        Router::new()
            .route("/users", get(list_users).post(create_user))
            .route("/users/:id", get(get_user))
            .with_state(state)
    }

    #[tokio::test]
    async fn test_list_users() {
        let app = create_app();

        let response = app
            .oneshot(Request::builder().uri("/users").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = axum::body::to_bytes(response.into_body(), 1024 * 1024)
            .await
            .unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();

        assert_eq!(json["data"].as_array().unwrap().len(), 1);
    }

    #[tokio::test]
    async fn test_get_user() {
        let app = create_app();

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/users/1")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_user_not_found() {
        let app = create_app();

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/users/999")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_create_user() {
        let app = create_app();

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/users")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        r#"{"name": "New User", "email": "new@example.com"}"#,
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::CREATED);
    }
}
```

**Key Takeaways:**
- Axum is modern and ergonomic
- Type-safe extractors prevent errors
- Custom error types simplify handling
- SQLx provides compile-time query checking
- Testing is straightforward with tower

---

# Imitation

### Challenge 1: Build a Todo API

**Task:** Create a complete CRUD API for todos with validation.

<details>
<summary>Solution</summary>

```rust
use axum::{
    extract::{Path, State, Json},
    http::StatusCode,
    routing::{get, post, put, delete},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Todo {
    id: u64,
    title: String,
    completed: bool,
}

#[derive(Debug, Deserialize)]
struct CreateTodo {
    title: String,
}

#[derive(Debug, Deserialize)]
struct UpdateTodo {
    title: Option<String>,
    completed: Option<bool>,
}

type AppState = Arc<RwLock<Vec<Todo>>>;

async fn list_todos(State(state): State<AppState>) -> Json<Vec<Todo>> {
    Json(state.read().await.clone())
}

async fn create_todo(
    State(state): State<AppState>,
    Json(input): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), StatusCode> {
    if input.title.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut todos = state.write().await;
    let todo = Todo {
        id: todos.len() as u64 + 1,
        title: input.title,
        completed: false,
    };
    todos.push(todo.clone());

    Ok((StatusCode::CREATED, Json(todo)))
}

async fn update_todo(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    Json(input): Json<UpdateTodo>,
) -> Result<Json<Todo>, StatusCode> {
    let mut todos = state.write().await;

    let todo = todos
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or(StatusCode::NOT_FOUND)?;

    if let Some(title) = input.title {
        todo.title = title;
    }
    if let Some(completed) = input.completed {
        todo.completed = completed;
    }

    Ok(Json(todo.clone()))
}

async fn delete_todo(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> StatusCode {
    let mut todos = state.write().await;
    if let Some(pos) = todos.iter().position(|t| t.id == id) {
        todos.remove(pos);
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}

#[tokio::main]
async fn main() {
    let state: AppState = Arc::new(RwLock::new(Vec::new()));

    let app = Router::new()
        .route("/todos", get(list_todos).post(create_todo))
        .route("/todos/:id", put(update_todo).delete(delete_todo))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

</details>

---

# Practice

### Exercise 1: Add Authentication
**Difficulty:** Intermediate

Add JWT authentication:
- Login endpoint
- Auth middleware
- Protected routes

### Exercise 2: Add Caching
**Difficulty:** Advanced

Implement caching:
- Redis integration
- Cache middleware
- Cache invalidation

---

## Summary

**What you learned:**
- Axum and Actix Web
- Type-safe extractors
- Error handling
- Database integration
- Testing APIs

**Next Steps:**
- Read: [Rust OOP](/api/guides/rust/oop)
- Practice: Add WebSocket support
- Explore: gRPC with Tonic

---

## Resources

- [Axum Documentation](https://docs.rs/axum)
- [Actix Web](https://actix.rs/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
