---
title: "Rust Introduction"
subTitle: "Memory Safety Without Garbage Collection"
excerpt: "Rust: fast, safe, and fearless concurrency."
featureImage: "/img/rust-intro.png"
date: "2026-02-01"
order: 500
---

# Explanation

## Why Rust?

Rust gives you C-level performance with memory safety guaranteed at compile time. No garbage collector, no runtime overhead, no null pointer exceptions. If it compiles, it works.

### Key Concepts

- **Ownership**: Each value has one owner
- **Borrowing**: References without taking ownership
- **Lifetimes**: How long references are valid
- **Zero-Cost Abstractions**: High-level code, low-level performance

### Rust vs JavaScript

```javascript
// JavaScript - runtime errors possible
let numbers = [1, 2, 3];
let first = numbers[10]; // undefined, not an error
```

```rust
// Rust - compile-time safety
let numbers = vec![1, 2, 3];
// let first = numbers[10]; // Compile error!
let first = numbers.get(10); // Returns Option<&i32>
```

---

# Demonstration

## Example 1: Rust Basics

```rust
fn main() {
    // Variables are immutable by default
    let name = "Arthur";
    let mut age = 30;  // mut for mutable

    // Type annotations (usually inferred)
    let score: i32 = 100;
    let pi: f64 = 3.14159;
    let active: bool = true;

    // Strings
    let greeting = "Hello";           // &str (string slice)
    let message = String::from("Hi"); // String (owned)

    // String interpolation with format!
    println!("Hello, {}! Age: {}", name, age);

    // Arrays (fixed size)
    let numbers: [i32; 5] = [1, 2, 3, 4, 5];

    // Vectors (dynamic)
    let mut fruits = vec!["apple", "banana"];
    fruits.push("cherry");

    // Tuples
    let person = ("Arthur", 30, true);
    let (n, a, _) = person; // Destructuring

    // Option type (no null!)
    let maybe_value: Option<i32> = Some(42);
    let nothing: Option<i32> = None;

    // Match expression
    match maybe_value {
        Some(v) => println!("Got: {}", v),
        None => println!("Nothing"),
    }

    // If let (shorthand)
    if let Some(v) = maybe_value {
        println!("Value: {}", v);
    }

    // Result type (for errors)
    let result: Result<i32, &str> = Ok(42);
    // let error: Result<i32, &str> = Err("something went wrong");
}
```

## Example 2: Ownership and Borrowing

```rust
fn main() {
    // Ownership
    let s1 = String::from("hello");
    let s2 = s1;  // s1 moved to s2, s1 no longer valid
    // println!("{}", s1); // Error! s1 was moved

    // Clone for deep copy
    let s3 = String::from("hello");
    let s4 = s3.clone();  // Both valid
    println!("{} {}", s3, s4);

    // Borrowing (references)
    let s5 = String::from("hello");
    let len = calculate_length(&s5);  // Borrow s5
    println!("{} has length {}", s5, len);  // s5 still valid

    // Mutable borrowing
    let mut s6 = String::from("hello");
    change(&mut s6);
    println!("{}", s6);  // "hello, world"
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}

// Rules:
// 1. One mutable reference OR any number of immutable references
// 2. References must always be valid
```

## Example 3: Structs and Methods

```rust
// Struct definition
struct User {
    id: u32,
    name: String,
    email: String,
    active: bool,
}

impl User {
    // Associated function (constructor)
    fn new(name: String, email: String) -> Self {
        Self {
            id: 0,
            name,
            email,
            active: true,
        }
    }

    // Method (takes &self)
    fn greet(&self) -> String {
        format!("Hello, I'm {}!", self.name)
    }

    // Mutable method
    fn deactivate(&mut self) {
        self.active = false;
    }

    // Method that consumes self
    fn into_name(self) -> String {
        self.name
    }
}

// Traits (like interfaces)
trait Greetable {
    fn greet(&self) -> String;
}

impl Greetable for User {
    fn greet(&self) -> String {
        format!("Hi, I'm {}", self.name)
    }
}

// Generic function
fn print_greeting<T: Greetable>(item: &T) {
    println!("{}", item.greet());
}

fn main() {
    let mut user = User::new(
        String::from("Arthur"),
        String::from("art@bpc.com")
    );

    println!("{}", user.greet());
    user.deactivate();

    print_greeting(&user);
}
```

## Example 4: Error Handling

```rust
use std::fs::File;
use std::io::{self, Read};

// Custom error type
#[derive(Debug)]
enum AppError {
    NotFound(String),
    InvalidInput(String),
    IoError(io::Error),
}

impl From<io::Error> for AppError {
    fn from(err: io::Error) -> Self {
        AppError::IoError(err)
    }
}

// Function that can fail
fn read_username(path: &str) -> Result<String, AppError> {
    let mut file = File::open(path)?;  // ? propagates errors
    let mut username = String::new();
    file.read_to_string(&mut username)?;

    if username.is_empty() {
        return Err(AppError::InvalidInput("Username empty".into()));
    }

    Ok(username.trim().to_string())
}

// Using the function
fn main() {
    match read_username("user.txt") {
        Ok(name) => println!("User: {}", name),
        Err(AppError::NotFound(path)) => println!("File not found: {}", path),
        Err(AppError::InvalidInput(msg)) => println!("Invalid: {}", msg),
        Err(AppError::IoError(e)) => println!("IO error: {}", e),
    }

    // Or use unwrap_or_default
    let name = read_username("user.txt").unwrap_or_default();

    // Or expect (panics with message)
    // let name = read_username("user.txt").expect("Failed to read user");
}
```

## Example 5: Iterators and Closures

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Map
    let doubled: Vec<i32> = numbers
        .iter()
        .map(|n| n * 2)
        .collect();

    // Filter
    let evens: Vec<i32> = numbers
        .iter()
        .filter(|n| *n % 2 == 0)
        .cloned()
        .collect();

    // Fold (reduce)
    let sum: i32 = numbers
        .iter()
        .fold(0, |acc, n| acc + n);

    // Chaining
    let result: i32 = numbers
        .iter()
        .filter(|n| *n % 2 == 1)  // Odd numbers
        .map(|n| n * 2)            // Double them
        .sum();                     // Sum up

    // For loop
    for num in &numbers {
        println!("{}", num);
    }

    // Enumerate
    for (i, num) in numbers.iter().enumerate() {
        println!("{}: {}", i, num);
    }

    // Closures with captures
    let multiplier = 3;
    let multiply = |n: i32| n * multiplier;
    println!("{}", multiply(5));  // 15
}
```

**Key Takeaways:**
- Variables are immutable by default
- Ownership prevents memory bugs
- `Option` replaces null, `Result` handles errors
- Traits are like interfaces
- Iterators are zero-cost abstractions

---

# Imitation

### Challenge 1: Create a Todo Struct

**Task:** Build a Todo struct with methods for completion and display.

<details>
<summary>Solution</summary>

```rust
#[derive(Debug)]
struct Todo {
    id: u32,
    text: String,
    completed: bool,
}

impl Todo {
    fn new(id: u32, text: String) -> Self {
        Self {
            id,
            text,
            completed: false,
        }
    }

    fn toggle(&mut self) {
        self.completed = !self.completed;
    }

    fn display(&self) -> String {
        let status = if self.completed { "✓" } else { " " };
        format!("[{}] {}: {}", status, self.id, self.text)
    }
}

struct TodoList {
    todos: Vec<Todo>,
    next_id: u32,
}

impl TodoList {
    fn new() -> Self {
        Self { todos: vec![], next_id: 1 }
    }

    fn add(&mut self, text: String) -> &Todo {
        let todo = Todo::new(self.next_id, text);
        self.next_id += 1;
        self.todos.push(todo);
        self.todos.last().unwrap()
    }

    fn toggle(&mut self, id: u32) -> Option<&Todo> {
        self.todos
            .iter_mut()
            .find(|t| t.id == id)
            .map(|t| { t.toggle(); &*t })
    }

    fn list(&self) -> impl Iterator<Item = &Todo> {
        self.todos.iter()
    }
}
```

</details>

### Challenge 2: Implement a Simple Stack

**Task:** Create a generic Stack with push, pop, and peek.

<details>
<summary>Solution</summary>

```rust
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Self { items: vec![] }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }

    fn peek(&self) -> Option<&T> {
        self.items.last()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut stack: Stack<i32> = Stack::new();
    stack.push(1);
    stack.push(2);
    stack.push(3);

    assert_eq!(stack.peek(), Some(&3));
    assert_eq!(stack.pop(), Some(3));
    assert_eq!(stack.len(), 2);
}
```

</details>

---

# Practice

### Exercise 1: Temperature Converter
**Difficulty:** Beginner

Create functions to convert between Celsius and Fahrenheit:
- Handle invalid input with Result
- Support both directions
- Add a Temperature enum

### Exercise 2: File Word Counter
**Difficulty:** Intermediate

Build a program that:
- Reads a file
- Counts words, lines, characters
- Uses proper error handling
- Outputs statistics

---

## Summary

**What you learned:**
- Rust syntax and types
- Ownership and borrowing
- Structs and traits
- Error handling with Result
- Iterators and closures

**Next Steps:**
- Read: [Rust Routing](/api/guides/rust/routing)
- Practice: Complete Rustlings exercises
- Build: Create a CLI tool

---

## Resources

- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
