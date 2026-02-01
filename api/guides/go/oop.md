---
title: "Go Object-Oriented Programming"
subTitle: "Structs, Methods, and Interfaces"
excerpt: "Go isn't object-oriented in the traditional sense - it's better."
featureImage: "/img/go-oop.png"
date: "2026-02-01"
order: 202
---

# Explanation

## OOP in Go

Go doesn't have classes, but it has something more powerful: composition over inheritance. Instead of complex class hierarchies, Go uses structs, methods, and interfaces.

Think of it this way:
- **Structs** = Data containers (like classes without methods)
- **Methods** = Functions attached to structs
- **Interfaces** = Contracts that define behavior

### Key Concepts

- **Struct**: A collection of fields
- **Method**: A function with a receiver
- **Interface**: A set of method signatures
- **Embedding**: Go's alternative to inheritance
- **Composition**: Building complex types from simple ones

### Go vs Traditional OOP

| Concept | Java/C# | Go |
|---------|---------|-----|
| Classes | `class User {}` | `type User struct {}` |
| Inheritance | `extends` | Embedding |
| Polymorphism | Interfaces | Interfaces (implicit) |
| Constructors | `new User()` | `NewUser()` function |

---

# Demonstration

## Example 1: Structs and Methods

```go
package main

import (
    "fmt"
    "time"
)

// Define a struct
type User struct {
    ID        int
    Name      string
    Email     string
    CreatedAt time.Time
    active    bool // lowercase = private
}

// Constructor function (Go convention)
func NewUser(name, email string) *User {
    return &User{
        ID:        generateID(),
        Name:      name,
        Email:     email,
        CreatedAt: time.Now(),
        active:    true,
    }
}

// Method with value receiver (doesn't modify original)
func (u User) Greet() string {
    return fmt.Sprintf("Hello, I'm %s!", u.Name)
}

// Method with pointer receiver (can modify original)
func (u *User) Deactivate() {
    u.active = false
}

// Getter for private field
func (u User) IsActive() bool {
    return u.active
}

// Method that returns formatted string
func (u User) String() string {
    status := "active"
    if !u.active {
        status = "inactive"
    }
    return fmt.Sprintf("User{ID: %d, Name: %s, Status: %s}", u.ID, u.Name, status)
}

var idCounter = 0

func generateID() int {
    idCounter++
    return idCounter
}

func main() {
    // Create user
    user := NewUser("Arthur", "art@bpc.com")

    fmt.Println(user.Greet())     // Hello, I'm Arthur!
    fmt.Println(user.IsActive())  // true

    user.Deactivate()
    fmt.Println(user.IsActive())  // false
    fmt.Println(user)             // User{ID: 1, Name: Arthur, Status: inactive}
}
```

## Example 2: Interfaces

```go
package main

import (
    "fmt"
    "math"
)

// Interface definition
type Shape interface {
    Area() float64
    Perimeter() float64
}

// Circle struct
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

// Rectangle struct
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

// Triangle struct
type Triangle struct {
    A, B, C float64 // sides
}

func (t Triangle) Area() float64 {
    // Heron's formula
    s := (t.A + t.B + t.C) / 2
    return math.Sqrt(s * (s - t.A) * (s - t.B) * (s - t.C))
}

func (t Triangle) Perimeter() float64 {
    return t.A + t.B + t.C
}

// Function that accepts any Shape
func PrintShapeInfo(s Shape) {
    fmt.Printf("Area: %.2f, Perimeter: %.2f\n", s.Area(), s.Perimeter())
}

// Function that works with slice of shapes
func TotalArea(shapes []Shape) float64 {
    total := 0.0
    for _, s := range shapes {
        total += s.Area()
    }
    return total
}

func main() {
    circle := Circle{Radius: 5}
    rect := Rectangle{Width: 10, Height: 5}
    tri := Triangle{A: 3, B: 4, C: 5}

    // All satisfy Shape interface
    shapes := []Shape{circle, rect, tri}

    for _, shape := range shapes {
        PrintShapeInfo(shape)
    }

    fmt.Printf("Total area: %.2f\n", TotalArea(shapes))
}
```

## Example 3: Embedding (Composition)

```go
package main

import (
    "fmt"
    "time"
)

// Base type
type Entity struct {
    ID        int
    CreatedAt time.Time
    UpdatedAt time.Time
}

func (e *Entity) SetTimestamps() {
    now := time.Now()
    if e.CreatedAt.IsZero() {
        e.CreatedAt = now
    }
    e.UpdatedAt = now
}

// User embeds Entity
type User struct {
    Entity           // Embedded (anonymous field)
    Name   string
    Email  string
    Role   string
}

func NewUser(name, email string) *User {
    user := &User{
        Name:  name,
        Email: email,
        Role:  "user",
    }
    user.SetTimestamps() // Method from Entity
    return user
}

// User can have its own methods
func (u User) IsAdmin() bool {
    return u.Role == "admin"
}

// Admin embeds User (multi-level embedding)
type Admin struct {
    User
    Permissions []string
}

func NewAdmin(name, email string) *Admin {
    admin := &Admin{
        User: User{
            Name:  name,
            Email: email,
            Role:  "admin",
        },
        Permissions: []string{"read", "write", "delete"},
    }
    admin.SetTimestamps()
    return admin
}

func (a Admin) HasPermission(perm string) bool {
    for _, p := range a.Permissions {
        if p == perm {
            return true
        }
    }
    return false
}

func main() {
    user := NewUser("Arthur", "art@bpc.com")
    admin := NewAdmin("Sarah", "sarah@example.com")

    fmt.Println(user.Name)       // Arthur
    fmt.Println(user.ID)         // 0 (from Entity)
    fmt.Println(user.IsAdmin())  // false

    fmt.Println(admin.Name)              // Sarah (from User)
    fmt.Println(admin.IsAdmin())         // true (from User)
    fmt.Println(admin.HasPermission("write")) // true
}
```

## Example 4: Interface Composition

```go
package main

import "fmt"

// Small, focused interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Composed interfaces
type ReadWriter interface {
    Reader
    Writer
}

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}

// Implementation
type Buffer struct {
    data []byte
}

func (b *Buffer) Read(p []byte) (int, error) {
    n := copy(p, b.data)
    b.data = b.data[n:]
    return n, nil
}

func (b *Buffer) Write(p []byte) (int, error) {
    b.data = append(b.data, p...)
    return len(p), nil
}

func (b *Buffer) Close() error {
    b.data = nil
    return nil
}

// Functions can accept specific interfaces
func CopyData(dst Writer, src Reader) error {
    buf := make([]byte, 1024)
    n, err := src.Read(buf)
    if err != nil {
        return err
    }
    _, err = dst.Write(buf[:n])
    return err
}

func main() {
    src := &Buffer{data: []byte("Hello, World!")}
    dst := &Buffer{}

    CopyData(dst, src)

    result := make([]byte, 100)
    n, _ := dst.Read(result)
    fmt.Println(string(result[:n])) // Hello, World!
}
```

**Key Takeaways:**
- Use structs for data, methods for behavior
- Interfaces are implicit (no `implements` keyword)
- Prefer composition over inheritance
- Keep interfaces small and focused
- Use pointer receivers when modifying state

---

# Imitation

### Challenge 1: Create a Repository Pattern

**Task:** Create a `Repository` interface and implement it for users.

<details>
<summary>Solution</summary>

```go
type Repository[T any] interface {
    FindAll() []T
    FindByID(id int) (*T, error)
    Create(item T) (*T, error)
    Update(id int, item T) (*T, error)
    Delete(id int) error
}

type UserRepository struct {
    users  map[int]User
    nextID int
}

func NewUserRepository() *UserRepository {
    return &UserRepository{
        users:  make(map[int]User),
        nextID: 1,
    }
}

func (r *UserRepository) FindAll() []User {
    result := make([]User, 0, len(r.users))
    for _, u := range r.users {
        result = append(result, u)
    }
    return result
}

func (r *UserRepository) FindByID(id int) (*User, error) {
    user, ok := r.users[id]
    if !ok {
        return nil, fmt.Errorf("user %d not found", id)
    }
    return &user, nil
}

func (r *UserRepository) Create(user User) (*User, error) {
    user.ID = r.nextID
    r.nextID++
    r.users[user.ID] = user
    return &user, nil
}
```

</details>

### Challenge 2: Implement the Stringer Interface

**Task:** Make a `Product` struct that formats nicely when printed.

<details>
<summary>Solution</summary>

```go
import "fmt"

type Product struct {
    ID       int
    Name     string
    Price    float64
    Category string
    InStock  bool
}

func (p Product) String() string {
    stock := "In Stock"
    if !p.InStock {
        stock = "Out of Stock"
    }
    return fmt.Sprintf(
        "Product #%d: %s ($%.2f) [%s] - %s",
        p.ID, p.Name, p.Price, p.Category, stock,
    )
}

// Usage
product := Product{
    ID:       1,
    Name:     "Laptop",
    Price:    999.99,
    Category: "Electronics",
    InStock:  true,
}
fmt.Println(product)
// Product #1: Laptop ($999.99) [Electronics] - In Stock
```

</details>

---

# Practice

### Exercise 1: Banking System
**Difficulty:** Intermediate

Create a banking system with:
- `Account` interface with `Deposit`, `Withdraw`, `Balance` methods
- `SavingsAccount` with interest calculation
- `CheckingAccount` with overdraft protection
- `Transaction` history

### Exercise 2: Plugin System
**Difficulty:** Advanced

Build a plugin system:
- `Plugin` interface with `Name`, `Execute`, `Cleanup` methods
- Plugin registry to manage plugins
- Plugin loading and execution order
- Error handling for failed plugins

---

## Summary

**What you learned:**
- Structs as data containers
- Methods with value and pointer receivers
- Interfaces for polymorphism
- Embedding for composition
- Interface composition patterns

**Next Steps:**
- Read: [Go API Development](/api/guides/go/api)
- Practice: Refactor code to use interfaces
- Build: Create a modular application

---

## Resources

- [Effective Go](https://go.dev/doc/effective_go)
- [Go by Example](https://gobyexample.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
