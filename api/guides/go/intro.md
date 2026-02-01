---
title: "Go Introduction"
subTitle: "The Language of Modern Infrastructure"
excerpt: "Simplicity is prerequisite for reliability. - Edsger W. Dijkstra"
featureImage: "/img/go-intro.png"
date: "2026-02-01"
order: 200
---

# Explanation

## Why Go?

If JavaScript is the language of the web and Python is the Swiss Army knife, Go (Golang) is the high-performance sports car built for the cloud era. Created by Google, Go powers Docker, Kubernetes, and countless microservices.

Go is designed to be:
- **Simple**: Small language, easy to learn
- **Fast**: Compiles to native code, no runtime overhead
- **Concurrent**: Built-in support for parallelism with goroutines
- **Reliable**: Strong typing catches bugs at compile time

### Key Concepts

- **Static Typing**: Declare types explicitly (or let Go infer them)
- **Compiled Language**: Go compiles to a single binary - no dependencies needed
- **Goroutines**: Lightweight threads for concurrent programming
- **Pointers**: Direct memory access (simpler than C)

### Why This Matters

Go is the go-to language for:
- Cloud infrastructure (Docker, Kubernetes)
- Microservices and APIs
- CLI tools
- DevOps tooling
- High-performance backends

---

# Demonstration

## Example 1: Variables and Types

In JavaScript:
```javascript
const name = "Arthur";
let age = 30;
const skills = ["Go", "JavaScript", "Python"];
```

In Go:
```go
package main

import "fmt"

func main() {
    // Explicit type declaration
    var name string = "Arthur"
    var age int = 30

    // Type inference (shorthand)
    city := "New York"  // Go figures out it's a string

    // Arrays have fixed size
    var numbers [3]int = [3]int{1, 2, 3}

    // Slices are dynamic (like JS arrays)
    skills := []string{"Go", "JavaScript", "Python"}

    fmt.Println(name, age, city)
    fmt.Println(numbers)
    fmt.Println(skills)
}
```

**Output:**
```
Arthur 30 New York
[1 2 3]
[Go JavaScript Python]
```

**Explanation:**
- `var name string` explicitly declares type
- `:=` is shorthand for declare and assign
- Arrays have fixed size; slices are dynamic
- All code must be in a package (`main` for executables)

## Example 2: Functions

```go
package main

import "fmt"

// Basic function
func greet(name string) string {
    return "Hello, " + name + "!"
}

// Multiple return values (Go specialty!)
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return a / b, nil
}

// Named return values
func getUser() (name string, age int) {
    name = "Arthur"
    age = 30
    return  // Returns name and age automatically
}

func main() {
    // Basic call
    fmt.Println(greet("Arthur"))

    // Handling multiple returns
    result, err := divide(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }

    // Using named returns
    userName, userAge := getUser()
    fmt.Printf("%s is %d years old\n", userName, userAge)
}
```

**Key Takeaways:**
- Functions can return multiple values
- Error handling is explicit (no try/catch)
- `nil` is Go's version of null/undefined
- `Printf` is for formatted output

---

# Imitation

### Challenge 1: Create a User Struct

**Task:** Create a `User` struct with name, email, and age. Write a method to get a greeting.

**Hint:** In Go, structs are like JavaScript objects, and methods are functions attached to structs.

<details>
<summary>Solution</summary>

```go
type User struct {
    Name  string
    Email string
    Age   int
}

// Method on User struct
func (u User) Greet() string {
    return fmt.Sprintf("Hello, I'm %s!", u.Name)
}

func main() {
    user := User{Name: "Arthur", Email: "art@bpc.com", Age: 30}
    fmt.Println(user.Greet())
}
```

</details>

### Challenge 2: Error Handling

**Task:** Create a function `getPositive` that takes a number and returns an error if it's negative.

<details>
<summary>Solution</summary>

```go
func getPositive(n int) (int, error) {
    if n < 0 {
        return 0, fmt.Errorf("number must be positive, got %d", n)
    }
    return n, nil
}

func main() {
    num, err := getPositive(-5)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Number:", num)
}
```

</details>

---

# Practice

### Exercise 1: Temperature Converter
**Difficulty:** Beginner

**Task:** Create functions to convert between Celsius and Fahrenheit. Return both the result and any potential error.

### Exercise 2: Slice Operations
**Difficulty:** Intermediate

**Task:** Create a function that takes a slice of integers and returns:
- The sum
- The average
- The min and max values
- An error if the slice is empty

---

## Summary

**What you learned:**
- Go syntax basics and comparison to JavaScript
- Variables, types, and type inference
- Functions with multiple return values
- Explicit error handling

**Next Steps:**
- Read: [Go Routing](/api/guides/go/routing)
- Practice: Build a CLI tool in Go
- Build: Rewrite a Node.js script in Go

---

## Resources

- [Go Tour](https://go.dev/tour/)
- [Go by Example](https://gobyexample.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
