---
title: "Rust Object-Oriented Patterns"
subTitle: "OOP Concepts in a Systems Language"
excerpt: "Rust takes a unique approach to object-oriented programming."
featureImage: "/img/rust-oop.png"
date: "2026-02-01"
order: 73
---

# Explanation

## OOP in Rust

Rust doesn't have traditional classes, but achieves similar patterns through structs, traits, and enums. It favors composition over inheritance and uses traits for polymorphism.

### Key Concepts

| Concept | Rust Equivalent |
|---------|-----------------|
| Classes | Structs + impl |
| Inheritance | Traits + Default impl |
| Interfaces | Traits |
| Polymorphism | Trait objects |
| Encapsulation | Module visibility |

---

# Demonstration

## Example 1: Structs and Methods

```rust
// Define a struct (like a class)
#[derive(Debug, Clone)]
pub struct User {
    pub name: String,
    pub email: String,
    age: u32,  // Private by default
}

impl User {
    // Associated function (like static method)
    pub fn new(name: String, email: String, age: u32) -> Self {
        Self { name, email, age }
    }

    // Builder pattern
    pub fn builder() -> UserBuilder {
        UserBuilder::default()
    }

    // Instance method (takes &self)
    pub fn greet(&self) -> String {
        format!("Hello, I'm {}!", self.name)
    }

    // Mutable method (takes &mut self)
    pub fn set_email(&mut self, email: String) {
        self.email = email;
    }

    // Getter for private field
    pub fn age(&self) -> u32 {
        self.age
    }

    // Method that consumes self
    pub fn into_parts(self) -> (String, String, u32) {
        (self.name, self.email, self.age)
    }
}

// Builder pattern
#[derive(Default)]
pub struct UserBuilder {
    name: Option<String>,
    email: Option<String>,
    age: Option<u32>,
}

impl UserBuilder {
    pub fn name(mut self, name: impl Into<String>) -> Self {
        self.name = Some(name.into());
        self
    }

    pub fn email(mut self, email: impl Into<String>) -> Self {
        self.email = Some(email.into());
        self
    }

    pub fn age(mut self, age: u32) -> Self {
        self.age = Some(age);
        self
    }

    pub fn build(self) -> Result<User, &'static str> {
        Ok(User {
            name: self.name.ok_or("name is required")?,
            email: self.email.ok_or("email is required")?,
            age: self.age.unwrap_or(0),
        })
    }
}

// Usage
fn main() {
    let user = User::new("Arthur".to_string(), "art@bpc.com".to_string(), 30);
    println!("{}", user.greet());

    // Builder
    let user2 = User::builder()
        .name("Sarah")
        .email("sarah@example.com")
        .age(25)
        .build()
        .unwrap();
}
```

## Example 2: Traits (Interfaces)

```rust
// Define a trait (interface)
pub trait Drawable {
    fn draw(&self);

    // Default implementation
    fn description(&self) -> String {
        String::from("A drawable object")
    }
}

pub trait Resizable {
    fn resize(&mut self, factor: f64);
}

// Implement traits for structs
#[derive(Debug)]
pub struct Circle {
    pub x: f64,
    pub y: f64,
    pub radius: f64,
}

impl Drawable for Circle {
    fn draw(&self) {
        println!("Drawing circle at ({}, {}) with radius {}",
                 self.x, self.y, self.radius);
    }

    fn description(&self) -> String {
        format!("Circle with radius {}", self.radius)
    }
}

impl Resizable for Circle {
    fn resize(&mut self, factor: f64) {
        self.radius *= factor;
    }
}

#[derive(Debug)]
pub struct Rectangle {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

impl Drawable for Rectangle {
    fn draw(&self) {
        println!("Drawing rectangle at ({}, {}) {}x{}",
                 self.x, self.y, self.width, self.height);
    }
}

impl Resizable for Rectangle {
    fn resize(&mut self, factor: f64) {
        self.width *= factor;
        self.height *= factor;
    }
}

// Trait bounds for generics
fn draw_shape<T: Drawable>(shape: &T) {
    shape.draw();
}

// Multiple trait bounds
fn draw_and_resize<T: Drawable + Resizable>(shape: &mut T) {
    shape.draw();
    shape.resize(1.5);
    shape.draw();
}

// Trait objects for runtime polymorphism
fn draw_all(shapes: &[&dyn Drawable]) {
    for shape in shapes {
        shape.draw();
    }
}

fn main() {
    let circle = Circle { x: 0.0, y: 0.0, radius: 5.0 };
    let rect = Rectangle { x: 10.0, y: 10.0, width: 20.0, height: 30.0 };

    // Static dispatch
    draw_shape(&circle);
    draw_shape(&rect);

    // Dynamic dispatch with trait objects
    let shapes: Vec<&dyn Drawable> = vec![&circle, &rect];
    draw_all(&shapes);
}
```

## Example 3: Enums for State Machines

```rust
// Enums can hold data (like union types)
#[derive(Debug)]
pub enum ConnectionState {
    Disconnected,
    Connecting { attempt: u32 },
    Connected { session_id: String },
    Error { message: String },
}

pub struct Connection {
    state: ConnectionState,
    url: String,
}

impl Connection {
    pub fn new(url: String) -> Self {
        Self {
            state: ConnectionState::Disconnected,
            url,
        }
    }

    pub fn connect(&mut self) -> Result<(), String> {
        match &self.state {
            ConnectionState::Disconnected => {
                self.state = ConnectionState::Connecting { attempt: 1 };
                // Simulate connection
                self.state = ConnectionState::Connected {
                    session_id: "abc123".to_string(),
                };
                Ok(())
            }
            ConnectionState::Connected { .. } => {
                Err("Already connected".to_string())
            }
            ConnectionState::Connecting { .. } => {
                Err("Connection in progress".to_string())
            }
            ConnectionState::Error { message } => {
                Err(format!("Previous error: {}", message))
            }
        }
    }

    pub fn disconnect(&mut self) {
        self.state = ConnectionState::Disconnected;
    }

    pub fn is_connected(&self) -> bool {
        matches!(self.state, ConnectionState::Connected { .. })
    }

    pub fn session_id(&self) -> Option<&str> {
        match &self.state {
            ConnectionState::Connected { session_id } => Some(session_id),
            _ => None,
        }
    }
}

// Result and Option for error handling
pub fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}

pub fn find_user(id: u64) -> Option<User> {
    // Returns None if not found
    if id == 1 {
        Some(User::new("Arthur".to_string(), "art@bpc.com".to_string(), 30))
    } else {
        None
    }
}
```

## Example 4: Composition over Inheritance

```rust
// Rust uses composition instead of inheritance
pub trait Logger {
    fn log(&self, message: &str);
}

pub struct ConsoleLogger;

impl Logger for ConsoleLogger {
    fn log(&self, message: &str) {
        println!("[LOG] {}", message);
    }
}

pub struct FileLogger {
    path: String,
}

impl Logger for FileLogger {
    fn log(&self, message: &str) {
        // Write to file
        println!("[FILE:{}] {}", self.path, message);
    }
}

// Compose with trait objects
pub struct Service {
    logger: Box<dyn Logger>,
    name: String,
}

impl Service {
    pub fn new(name: String, logger: Box<dyn Logger>) -> Self {
        Self { logger, name }
    }

    pub fn do_work(&self) {
        self.logger.log(&format!("{} doing work", self.name));
    }
}

// Or use generics for static dispatch
pub struct GenericService<L: Logger> {
    logger: L,
    name: String,
}

impl<L: Logger> GenericService<L> {
    pub fn new(name: String, logger: L) -> Self {
        Self { logger, name }
    }

    pub fn do_work(&self) {
        self.logger.log(&format!("{} doing work", self.name));
    }
}

// Newtype pattern for extending functionality
pub struct EmailAddress(String);

impl EmailAddress {
    pub fn new(email: &str) -> Result<Self, &'static str> {
        if email.contains('@') {
            Ok(Self(email.to_string()))
        } else {
            Err("Invalid email format")
        }
    }

    pub fn domain(&self) -> &str {
        self.0.split('@').nth(1).unwrap_or("")
    }
}

impl std::fmt::Display for EmailAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
```

## Example 5: Smart Pointers

```rust
use std::rc::Rc;
use std::cell::RefCell;

// Reference counting for shared ownership
#[derive(Debug)]
struct Node {
    value: i32,
    children: Vec<Rc<Node>>,
}

impl Node {
    fn new(value: i32) -> Rc<Self> {
        Rc::new(Self {
            value,
            children: Vec::new(),
        })
    }
}

// Interior mutability with RefCell
#[derive(Debug)]
struct Counter {
    count: RefCell<u32>,
}

impl Counter {
    fn new() -> Self {
        Self {
            count: RefCell::new(0),
        }
    }

    fn increment(&self) {
        *self.count.borrow_mut() += 1;
    }

    fn get(&self) -> u32 {
        *self.count.borrow()
    }
}

// Rc<RefCell<T>> for shared mutable state
type SharedState = Rc<RefCell<Vec<String>>>;

fn create_shared_state() -> SharedState {
    Rc::new(RefCell::new(Vec::new()))
}

fn add_item(state: &SharedState, item: String) {
    state.borrow_mut().push(item);
}

// Box for heap allocation
trait Animal {
    fn speak(&self) -> String;
}

struct Dog;
struct Cat;

impl Animal for Dog {
    fn speak(&self) -> String { "Woof!".to_string() }
}

impl Animal for Cat {
    fn speak(&self) -> String { "Meow!".to_string() }
}

fn create_animal(is_dog: bool) -> Box<dyn Animal> {
    if is_dog {
        Box::new(Dog)
    } else {
        Box::new(Cat)
    }
}
```

## Example 6: Error Handling Patterns

```rust
use std::error::Error;
use std::fmt;

// Custom error type
#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    Validation(String),
    Database(String),
    Unauthorized,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AppError::Database(msg) => write!(f, "Database error: {}", msg),
            AppError::Unauthorized => write!(f, "Unauthorized"),
        }
    }
}

impl Error for AppError {}

// Result type alias
pub type AppResult<T> = Result<T, AppError>;

// Service with error handling
pub struct UserService;

impl UserService {
    pub fn find_by_id(&self, id: u64) -> AppResult<User> {
        if id == 0 {
            return Err(AppError::Validation("Invalid ID".to_string()));
        }

        // Simulate database lookup
        if id == 999 {
            return Err(AppError::NotFound(format!("User {}", id)));
        }

        Ok(User::new(
            "Arthur".to_string(),
            "art@bpc.com".to_string(),
            30,
        ))
    }

    pub fn create(&self, name: &str, email: &str) -> AppResult<User> {
        if name.is_empty() {
            return Err(AppError::Validation("Name required".to_string()));
        }

        if !email.contains('@') {
            return Err(AppError::Validation("Invalid email".to_string()));
        }

        Ok(User::new(name.to_string(), email.to_string(), 0))
    }
}

// Using the ? operator
pub fn get_user_email(service: &UserService, id: u64) -> AppResult<String> {
    let user = service.find_by_id(id)?;
    Ok(user.email)
}

// Using thiserror crate (recommended)
// use thiserror::Error;
//
// #[derive(Error, Debug)]
// pub enum AppError {
//     #[error("not found: {0}")]
//     NotFound(String),
//     #[error("validation error: {0}")]
//     Validation(String),
// }
```

**Key Takeaways:**
- Structs + impl for encapsulation
- Traits for polymorphism and interfaces
- Enums for state machines and variants
- Composition over inheritance
- Smart pointers for complex ownership

---

# Imitation

### Challenge 1: Implement a Repository Pattern

**Task:** Create a generic repository trait with in-memory implementation.

<details>
<summary>Solution</summary>

```rust
use std::collections::HashMap;
use std::hash::Hash;

pub trait Entity {
    type Id: Eq + Hash + Clone;
    fn id(&self) -> Self::Id;
}

pub trait Repository<T: Entity> {
    fn find(&self, id: &T::Id) -> Option<&T>;
    fn find_all(&self) -> Vec<&T>;
    fn save(&mut self, entity: T) -> &T;
    fn delete(&mut self, id: &T::Id) -> Option<T>;
}

pub struct InMemoryRepository<T: Entity> {
    data: HashMap<T::Id, T>,
}

impl<T: Entity> InMemoryRepository<T> {
    pub fn new() -> Self {
        Self {
            data: HashMap::new(),
        }
    }
}

impl<T: Entity> Repository<T> for InMemoryRepository<T> {
    fn find(&self, id: &T::Id) -> Option<&T> {
        self.data.get(id)
    }

    fn find_all(&self) -> Vec<&T> {
        self.data.values().collect()
    }

    fn save(&mut self, entity: T) -> &T {
        let id = entity.id();
        self.data.insert(id.clone(), entity);
        self.data.get(&id).unwrap()
    }

    fn delete(&mut self, id: &T::Id) -> Option<T> {
        self.data.remove(id)
    }
}

// Usage
#[derive(Clone)]
struct User {
    id: u64,
    name: String,
}

impl Entity for User {
    type Id = u64;
    fn id(&self) -> Self::Id {
        self.id
    }
}

fn main() {
    let mut repo: InMemoryRepository<User> = InMemoryRepository::new();

    repo.save(User { id: 1, name: "Arthur".to_string() });
    repo.save(User { id: 2, name: "Sarah".to_string() });

    if let Some(user) = repo.find(&1) {
        println!("Found: {}", user.name);
    }
}
```

</details>

---

# Practice

### Exercise 1: Observer Pattern
**Difficulty:** Intermediate

Implement an event system:
- Subject trait with subscribe/notify
- Observer trait
- Type-safe events

### Exercise 2: Plugin System
**Difficulty:** Advanced

Create a plugin architecture:
- Plugin trait with lifecycle
- Dynamic loading support
- Dependency resolution

---

## Summary

**What you learned:**
- Structs and impl blocks
- Traits for polymorphism
- Enums for state machines
- Composition patterns
- Error handling

**Next Steps:**
- Read: [Rust API](/api/guides/rust/api)
- Practice: Build a CLI tool
- Explore: Async Rust

---

## Resources

- [Rust Book: OOP](https://doc.rust-lang.org/book/ch17-00-oop.html)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
