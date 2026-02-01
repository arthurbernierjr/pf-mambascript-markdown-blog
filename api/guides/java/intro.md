---
title: "Java Introduction"
subTitle: "Write Once, Run Anywhere"
excerpt: "Java: enterprise-grade, battle-tested, everywhere."
featureImage: "/img/java-intro.png"
date: "2026-02-01"
order: 600
---

# Explanation

## Why Java?

Java has been a cornerstone of software development for decades. It powers Android apps, enterprise systems, and millions of backends. It's statically typed, garbage collected, and incredibly reliable.

### Key Concepts

- **Platform Independence**: JVM runs Java anywhere
- **Strong Typing**: Types checked at compile time
- **Object-Oriented**: Everything is a class
- **Garbage Collection**: Automatic memory management

### Java vs JavaScript

```javascript
// JavaScript
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
```

```java
// Java
List<Integer> numbers = List.of(1, 2, 3);
List<Integer> doubled = numbers.stream()
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

---

# Demonstration

## Example 1: Java Basics

```java
public class Basics {
    public static void main(String[] args) {
        // Variables
        String name = "Arthur";
        int age = 30;
        double score = 95.5;
        boolean isDeveloper = true;

        // var keyword (Java 10+)
        var message = "Hello, World!";

        // String operations
        System.out.println("Hello, " + name + "!");
        System.out.printf("Age: %d, Score: %.1f%n", age, score);

        // String methods
        String upper = name.toUpperCase();
        boolean contains = name.contains("Art");

        // Text blocks (Java 15+)
        String json = """
            {
                "name": "Arthur",
                "age": 30
            }
            """;

        // Arrays
        int[] numbers = {1, 2, 3, 4, 5};
        String[] fruits = new String[]{"apple", "banana"};

        // For loop
        for (int num : numbers) {
            System.out.println(num);
        }

        // Lists
        List<String> skills = new ArrayList<>();
        skills.add("Java");
        skills.add("JavaScript");

        // List.of (immutable)
        var languages = List.of("Java", "Python", "Go");

        // Maps
        Map<String, Integer> scores = new HashMap<>();
        scores.put("math", 90);
        scores.put("english", 85);

        // Map.of (immutable)
        var config = Map.of(
            "host", "localhost",
            "port", "8080"
        );

        // Conditional
        String status = age >= 18 ? "adult" : "minor";

        // Switch expression (Java 14+)
        String day = "MONDAY";
        String type = switch (day) {
            case "SATURDAY", "SUNDAY" -> "weekend";
            default -> "weekday";
        };
    }
}
```

## Example 2: Classes and Objects

```java
// User.java
public class User {
    // Fields
    private final int id;
    private String name;
    private String email;
    private boolean active;

    // Static field
    private static int counter = 0;

    // Constructor
    public User(String name, String email) {
        this.id = ++counter;
        this.name = name;
        this.email = email;
        this.active = true;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isActive() {
        return active;
    }

    // Methods
    public String greet() {
        return "Hello, I'm " + name + "!";
    }

    public void deactivate() {
        this.active = false;
    }

    // Static method
    public static int getCount() {
        return counter;
    }

    // toString override
    @Override
    public String toString() {
        return String.format("User{id=%d, name='%s', active=%b}",
            id, name, active);
    }
}

// Records (Java 16+) - immutable data classes
public record UserDTO(int id, String name, String email) {
    // Compact constructor for validation
    public UserDTO {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name required");
        }
    }
}
```

## Example 3: Interfaces and Inheritance

```java
// Interface
public interface Authenticatable {
    boolean authenticate(String password);
    String getAuthIdentifier();
}

// Abstract class
public abstract class Entity {
    protected final int id;
    protected final LocalDateTime createdAt;

    public Entity(int id) {
        this.id = id;
        this.createdAt = LocalDateTime.now();
    }

    public int getId() {
        return id;
    }

    // Abstract method
    public abstract String getType();
}

// Implementation
public class Admin extends User implements Authenticatable {
    private List<String> permissions;
    private String passwordHash;

    public Admin(String name, String email, String password) {
        super(name, email);
        this.permissions = new ArrayList<>(List.of("read", "write", "delete"));
        this.passwordHash = hashPassword(password);
    }

    public boolean hasPermission(String permission) {
        return permissions.contains(permission);
    }

    @Override
    public boolean authenticate(String password) {
        return passwordHash.equals(hashPassword(password));
    }

    @Override
    public String getAuthIdentifier() {
        return getEmail();
    }

    private String hashPassword(String password) {
        // Simplified - use proper hashing in production
        return Integer.toHexString(password.hashCode());
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        User user = new User("Arthur", "art@bpc.com");
        Admin admin = new Admin("Sarah", "sarah@example.com", "password123");

        System.out.println(user.greet());
        System.out.println(admin.hasPermission("delete"));

        // Polymorphism
        List<User> users = List.of(user, admin);
        for (User u : users) {
            System.out.println(u.greet());
        }
    }
}
```

## Example 4: Streams and Lambdas

```java
import java.util.stream.*;
import java.util.*;

public class StreamExamples {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // Map
        List<Integer> doubled = numbers.stream()
            .map(n -> n * 2)
            .collect(Collectors.toList());

        // Filter
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());

        // Reduce
        int sum = numbers.stream()
            .reduce(0, Integer::sum);

        // Chaining
        int result = numbers.stream()
            .filter(n -> n % 2 == 1)  // Odd numbers
            .map(n -> n * 2)           // Double them
            .reduce(0, Integer::sum);  // Sum up

        // Find
        Optional<Integer> first = numbers.stream()
            .filter(n -> n > 5)
            .findFirst();

        first.ifPresent(System.out::println);

        // Count
        long count = numbers.stream()
            .filter(n -> n > 5)
            .count();

        // Any/All match
        boolean anyEven = numbers.stream().anyMatch(n -> n % 2 == 0);
        boolean allPositive = numbers.stream().allMatch(n -> n > 0);

        // Collect to Map
        List<User> users = List.of(
            new User("Arthur", "art@bpc.com"),
            new User("Sarah", "sarah@example.com")
        );

        Map<Integer, User> userMap = users.stream()
            .collect(Collectors.toMap(User::getId, u -> u));

        // Group by
        Map<Boolean, List<Integer>> partitioned = numbers.stream()
            .collect(Collectors.partitioningBy(n -> n % 2 == 0));

        // Method references
        List<String> names = users.stream()
            .map(User::getName)
            .collect(Collectors.toList());
    }
}
```

**Key Takeaways:**
- Java is statically typed - declare types explicitly
- Classes are blueprints for objects
- Interfaces define contracts
- Streams provide functional-style operations
- Records simplify immutable data classes

---

# Imitation

### Challenge 1: Create a Product Class

**Task:** Build a Product class with validation and a discount method.

<details>
<summary>Solution</summary>

```java
public class Product {
    private final int id;
    private String name;
    private double price;
    private int stock;

    private static int counter = 0;

    public Product(String name, double price, int stock) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name required");
        }
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }

        this.id = ++counter;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    public double applyDiscount(double percent) {
        if (percent < 0 || percent > 100) {
            throw new IllegalArgumentException("Invalid discount");
        }
        this.price -= this.price * (percent / 100);
        return this.price;
    }

    public boolean isInStock() {
        return stock > 0;
    }

    public void reduceStock(int quantity) {
        if (quantity > stock) {
            throw new IllegalStateException("Insufficient stock");
        }
        this.stock -= quantity;
    }

    // Getters...
    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }

    @Override
    public String toString() {
        return String.format("Product{id=%d, name='%s', price=%.2f, stock=%d}",
            id, name, price, stock);
    }
}
```

</details>

### Challenge 2: Implement a Generic Repository

**Task:** Create a generic Repository interface with common CRUD operations.

<details>
<summary>Solution</summary>

```java
public interface Repository<T, ID> {
    T save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
    boolean existsById(ID id);
}

public class InMemoryUserRepository implements Repository<User, Integer> {
    private final Map<Integer, User> store = new HashMap<>();

    @Override
    public User save(User user) {
        store.put(user.getId(), user);
        return user;
    }

    @Override
    public Optional<User> findById(Integer id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void deleteById(Integer id) {
        store.remove(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return store.containsKey(id);
    }
}
```

</details>

---

# Practice

### Exercise 1: Shopping Cart
**Difficulty:** Intermediate

Build a ShoppingCart class with:
- Add/remove items
- Calculate total
- Apply discounts
- Stream operations for filtering

### Exercise 2: Library System
**Difficulty:** Advanced

Create a library system:
- Book, Author, Member classes
- Borrowing logic with due dates
- Fine calculation
- Search functionality

---

## Summary

**What you learned:**
- Java syntax and types
- Classes, interfaces, and inheritance
- Records for data classes
- Streams and lambdas
- Collections framework

**Next Steps:**
- Read: [Java Routing (Spring Boot)](/api/guides/java/routing)
- Practice: Build a console application
- Explore: Spring Boot framework

---

## Resources

- [Java Documentation](https://docs.oracle.com/en/java/)
- [Baeldung](https://www.baeldung.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
