---
title: "Rust Web Routing"
subTitle: "Building APIs with Actix and Axum"
excerpt: "Rust web frameworks: blazingly fast and memory safe."
featureImage: "/img/rust-routing.png"
date: "2026-02-01"
order: 501
---

# Explanation

## Web Development in Rust

Rust's web ecosystem has matured significantly. Actix-web and Axum are production-ready frameworks that leverage Rust's safety guarantees while delivering excellent performance.

### Key Concepts

- **async/await**: Rust's async runtime (Tokio)
- **Extractors**: Type-safe request parsing
- **Middleware**: Request/response pipeline
- **State**: Shared application data

### Framework Comparison

| Feature | Actix-web | Axum |
|---------|-----------|------|
| Maturity | Older | Newer |
| Approach | Actor model | Tower-based |
| Performance | Excellent | Excellent |
| Learning | Moderate | Easier |

---

# Demonstration

## Example 1: Axum Basics

```rust
use axum::{
    routing::{get, post, put, delete},
    extract::{Path, Query, State, Json},
    response::{IntoResponse, Json as JsonResponse},
    http::StatusCode,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

// Models
#[derive(Clone, Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
    email: String,
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

#[derive(Deserialize)]
struct QueryParams {
    page: Option<u32>,
    per_page: Option<u32>,
}

// App state
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

    JsonResponse(serde_json::json!({
        "data": paginated,
        "page": page,
        "per_page": per_page,
        "total": users.len()
    }))
}

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    let users = state.read().await;

    users
        .iter()
        .find(|u| u.id == id)
        .cloned()
        .map(|user| JsonResponse(serde_json::json!({ "data": user })))
        .ok_or(StatusCode::NOT_FOUND)
}

async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUser>,
) -> impl IntoResponse {
    let mut users = state.write().await;

    let id = users.len() as u64 + 1;
    let user = User {
        id,
        name: payload.name,
        email: payload.email,
    };

    users.push(user.clone());

    (StatusCode::CREATED, JsonResponse(serde_json::json!({ "data": user })))
}

async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    Json(payload): Json<CreateUser>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut users = state.write().await;

    if let Some(user) = users.iter_mut().find(|u| u.id == id) {
        user.name = payload.name;
        user.email = payload.email;
        Ok(JsonResponse(serde_json::json!({ "data": user.clone() })))
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
    let state: AppState = Arc::new(RwLock::new(vec![]));

    let app = Router::new()
        .route("/users", get(list_users).post(create_user))
        .route("/users/:id", get(get_user).put(update_user).delete(delete_user))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Server running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
```

## Example 2: Actix-web Implementation

```rust
use actix_web::{web, App, HttpServer, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Clone, Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
    email: String,
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

struct AppState {
    users: Mutex<Vec<User>>,
}

async fn list_users(data: web::Data<AppState>) -> HttpResponse {
    let users = data.users.lock().unwrap();
    HttpResponse::Ok().json(&*users)
}

async fn get_user(
    data: web::Data<AppState>,
    path: web::Path<u64>,
) -> HttpResponse {
    let id = path.into_inner();
    let users = data.users.lock().unwrap();

    match users.iter().find(|u| u.id == id) {
        Some(user) => HttpResponse::Ok().json(user),
        None => HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"})),
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

async fn update_user(
    data: web::Data<AppState>,
    path: web::Path<u64>,
    body: web::Json<CreateUser>,
) -> HttpResponse {
    let id = path.into_inner();
    let mut users = data.users.lock().unwrap();

    if let Some(user) = users.iter_mut().find(|u| u.id == id) {
        user.name = body.name.clone();
        user.email = body.email.clone();
        HttpResponse::Ok().json(user.clone())
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"}))
    }
}

async fn delete_user(
    data: web::Data<AppState>,
    path: web::Path<u64>,
) -> HttpResponse {
    let id = path.into_inner();
    let mut users = data.users.lock().unwrap();

    if let Some(pos) = users.iter().position(|u| u.id == id) {
        users.remove(pos);
        HttpResponse::NoContent().finish()
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"}))
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = web::Data::new(AppState {
        users: Mutex::new(vec![]),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .route("/users", web::get().to(list_users))
            .route("/users", web::post().to(create_user))
            .route("/users/{id}", web::get().to(get_user))
            .route("/users/{id}", web::put().to(update_user))
            .route("/users/{id}", web::delete().to(delete_user))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

## Example 3: Middleware and Error Handling

```rust
use axum::{
    extract::Request,
    http::{StatusCode, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    Json, Router,
};
use serde_json::json;

// Custom error type
#[derive(Debug)]
enum ApiError {
    NotFound(String),
    BadRequest(String),
    Unauthorized,
    InternalError(String),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            ApiError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}

// Logging middleware
async fn logging_middleware(request: Request, next: Next) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();

    let start = std::time::Instant::now();
    let response = next.run(request).await;
    let duration = start.elapsed();

    println!(
        "{} {} - {:?} - {}ms",
        method,
        uri,
        response.status(),
        duration.as_millis()
    );

    response
}

// Auth middleware
async fn auth_middleware(request: Request, next: Next) -> Result<Response, ApiError> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    match auth_header {
        Some(token) if token.starts_with("Bearer ") => {
            // Validate token...
            Ok(next.run(request).await)
        }
        _ => Err(ApiError::Unauthorized),
    }
}

// CORS middleware
async fn cors_middleware(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;

    response.headers_mut().insert(
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        "*".parse().unwrap(),
    );
    response.headers_mut().insert(
        header::ACCESS_CONTROL_ALLOW_METHODS,
        "GET, POST, PUT, DELETE, OPTIONS".parse().unwrap(),
    );

    response
}

// Using middleware
fn create_router() -> Router {
    let public_routes = Router::new()
        .route("/health", axum::routing::get(|| async { "OK" }))
        .route("/login", axum::routing::post(login_handler));

    let protected_routes = Router::new()
        .route("/users", axum::routing::get(list_users))
        .layer(middleware::from_fn(auth_middleware));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(middleware::from_fn(logging_middleware))
        .layer(middleware::from_fn(cors_middleware))
}

async fn login_handler() -> impl IntoResponse {
    Json(json!({ "token": "your-jwt-token" }))
}

async fn list_users() -> impl IntoResponse {
    Json(json!({ "users": [] }))
}
```

**Key Takeaways:**
- Axum and Actix-web are production-ready
- Extractors provide type-safe request parsing
- Use Arc<RwLock> for shared mutable state
- Custom error types improve API consistency
- Middleware handles cross-cutting concerns

---

# Imitation

### Challenge 1: Add Request Validation

**Task:** Create a validation extractor for request bodies.

<details>
<summary>Solution</summary>

```rust
use axum::{
    async_trait,
    extract::{FromRequest, Request},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::de::DeserializeOwned;
use validator::Validate;

struct ValidatedJson<T>(pub T);

#[async_trait]
impl<S, T> FromRequest<S> for ValidatedJson<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value) = Json::<T>::from_request(req, state)
            .await
            .map_err(|e| {
                (StatusCode::BAD_REQUEST, Json(serde_json::json!({
                    "error": "Invalid JSON"
                }))).into_response()
            })?;

        value.validate().map_err(|e| {
            (StatusCode::BAD_REQUEST, Json(serde_json::json!({
                "error": "Validation failed",
                "details": e.to_string()
            }))).into_response()
        })?;

        Ok(ValidatedJson(value))
    }
}

// Usage
#[derive(Deserialize, Validate)]
struct CreateUser {
    #[validate(length(min = 2))]
    name: String,
    #[validate(email)]
    email: String,
}

async fn create_user(ValidatedJson(payload): ValidatedJson<CreateUser>) -> impl IntoResponse {
    // Payload is already validated
    Json(serde_json::json!({ "name": payload.name }))
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
- Database persistence (SQLx)

### Exercise 2: WebSocket Chat
**Difficulty:** Advanced

Implement a chat server:
- WebSocket connections
- Room-based messaging
- Connection management

---

## Summary

**What you learned:**
- Axum and Actix-web basics
- Type-safe extractors
- Error handling patterns
- Middleware implementation
- State management

**Next Steps:**
- Read: [Rust OOP](/api/guides/rust/oop)
- Practice: Build a REST API
- Explore: SQLx for databases

---

## Resources

- [Axum Documentation](https://docs.rs/axum)
- [Actix-web](https://actix.rs/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
