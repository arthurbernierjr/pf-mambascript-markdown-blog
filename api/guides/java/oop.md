---
title: "Java Object-Oriented Programming"
subTitle: "Classical OOP in Java"
excerpt: "Java was built for OOP - learn it the right way."
featureImage: "/img/java-oop.png"
date: "2026-02-01"
order: 83
---

# Explanation

## OOP in Java

Java is a class-based, object-oriented language. It supports encapsulation, inheritance, polymorphism, and abstraction as core principles.

### Key Concepts

| Concept | Java Implementation |
|---------|---------------------|
| Encapsulation | Access modifiers |
| Inheritance | extends keyword |
| Polymorphism | Method overriding |
| Abstraction | Abstract classes, interfaces |

---

# Demonstration

## Example 1: Classes and Objects

```java
// User.java
public class User {
    // Instance fields
    private String name;
    private String email;
    private int age;

    // Static field
    private static int userCount = 0;

    // Constants
    public static final String DEFAULT_ROLE = "user";

    // Constructor
    public User(String name, String email) {
        this.name = name;
        this.email = email;
        this.age = 0;
        userCount++;
    }

    // Overloaded constructor
    public User(String name, String email, int age) {
        this(name, email);  // Call other constructor
        this.age = age;
    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
        this.email = email;
    }

    // Instance method
    public String greet() {
        return "Hello, I'm " + name + "!";
    }

    // Static method
    public static int getUserCount() {
        return userCount;
    }

    // toString override
    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email + "', age=" + age + "}";
    }

    // equals override
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        User user = (User) obj;
        return email.equals(user.email);
    }

    // hashCode override
    @Override
    public int hashCode() {
        return email.hashCode();
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        User user1 = new User("Arthur", "art@bpc.com");
        User user2 = new User("Sarah", "sarah@example.com", 25);

        System.out.println(user1.greet());
        System.out.println(User.getUserCount());  // 2
    }
}
```

## Example 2: Inheritance

```java
// Base class
public abstract class Animal {
    protected String name;
    protected int age;

    public Animal(String name) {
        this.name = name;
        this.age = 0;
    }

    // Abstract method - must be implemented by subclasses
    public abstract String speak();

    // Concrete method
    public String describe() {
        return getClass().getSimpleName() + ": " + name;
    }

    // Final method - cannot be overridden
    public final String getIdentity() {
        return name + " (" + getClass().getSimpleName() + ")";
    }
}

// Subclass
public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name);  // Call parent constructor
        this.breed = breed;
    }

    @Override
    public String speak() {
        return name + " says Woof!";
    }

    public String fetch() {
        return name + " is fetching the ball";
    }

    public String getBreed() {
        return breed;
    }
}

public class Cat extends Animal {
    private boolean indoor;

    public Cat(String name, boolean indoor) {
        super(name);
        this.indoor = indoor;
    }

    @Override
    public String speak() {
        return name + " says Meow!";
    }

    public String scratch() {
        return name + " is scratching";
    }
}

// Polymorphism
public class Main {
    public static void main(String[] args) {
        Animal[] animals = {
            new Dog("Buddy", "Golden Retriever"),
            new Cat("Whiskers", true),
            new Dog("Max", "German Shepherd")
        };

        for (Animal animal : animals) {
            System.out.println(animal.speak());  // Polymorphic call
            System.out.println(animal.describe());

            // Type checking and casting
            if (animal instanceof Dog) {
                Dog dog = (Dog) animal;
                System.out.println(dog.fetch());
            }
        }

        // Java 16+ pattern matching
        for (Animal animal : animals) {
            if (animal instanceof Dog dog) {
                System.out.println(dog.getBreed());
            }
        }
    }
}
```

## Example 3: Interfaces

```java
// Interface definition
public interface Drawable {
    // Constants (implicitly public static final)
    int DEFAULT_COLOR = 0x000000;

    // Abstract methods (implicitly public abstract)
    void draw();
    void resize(double factor);

    // Default method (Java 8+)
    default String getDescription() {
        return "A drawable object";
    }

    // Static method (Java 8+)
    static Drawable empty() {
        return new Drawable() {
            @Override
            public void draw() {}

            @Override
            public void resize(double factor) {}
        };
    }
}

public interface Clickable {
    void onClick();
    void onDoubleClick();
}

// Multiple interface implementation
public class Button implements Drawable, Clickable {
    private String label;
    private int width;
    private int height;

    public Button(String label) {
        this.label = label;
        this.width = 100;
        this.height = 30;
    }

    @Override
    public void draw() {
        System.out.println("Drawing button: " + label);
    }

    @Override
    public void resize(double factor) {
        this.width = (int)(width * factor);
        this.height = (int)(height * factor);
    }

    @Override
    public void onClick() {
        System.out.println("Button clicked: " + label);
    }

    @Override
    public void onDoubleClick() {
        System.out.println("Button double-clicked: " + label);
    }
}

// Functional interface (one abstract method)
@FunctionalInterface
public interface Calculator {
    int calculate(int a, int b);
}

// Lambda usage
public class Main {
    public static void main(String[] args) {
        Calculator add = (a, b) -> a + b;
        Calculator multiply = (a, b) -> a * b;

        System.out.println(add.calculate(5, 3));      // 8
        System.out.println(multiply.calculate(5, 3)); // 15
    }
}
```

## Example 4: Generics

```java
// Generic class
public class Box<T> {
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }

    public boolean isEmpty() {
        return content == null;
    }
}

// Generic with bounds
public class NumberBox<T extends Number> {
    private T value;

    public NumberBox(T value) {
        this.value = value;
    }

    public double doubleValue() {
        return value.doubleValue();
    }
}

// Generic interface
public interface Repository<T, ID> {
    T findById(ID id);
    List<T> findAll();
    T save(T entity);
    void delete(ID id);
}

// Implementation
public class UserRepository implements Repository<User, Long> {
    private Map<Long, User> storage = new HashMap<>();
    private long nextId = 1;

    @Override
    public User findById(Long id) {
        return storage.get(id);
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public User save(User user) {
        // Set ID if new
        storage.put(nextId++, user);
        return user;
    }

    @Override
    public void delete(Long id) {
        storage.remove(id);
    }
}

// Generic methods
public class Utils {
    public static <T> T firstOrNull(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) > 0 ? a : b;
    }

    // Wildcard types
    public static void printAll(List<?> list) {
        for (Object item : list) {
            System.out.println(item);
        }
    }

    public static double sum(List<? extends Number> numbers) {
        return numbers.stream()
            .mapToDouble(Number::doubleValue)
            .sum();
    }
}
```

## Example 5: Inner Classes and Records

```java
// Outer class with inner classes
public class OuterClass {
    private String name = "Outer";

    // Inner class
    public class InnerClass {
        public void printName() {
            System.out.println(name);  // Access outer field
        }
    }

    // Static nested class
    public static class StaticNestedClass {
        public void print() {
            System.out.println("Static nested");
        }
    }

    public void doSomething() {
        // Local class
        class LocalClass {
            void print() {
                System.out.println("Local class");
            }
        }

        new LocalClass().print();

        // Anonymous class
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                System.out.println("Anonymous class");
            }
        };
        runnable.run();

        // Lambda (preferred for functional interfaces)
        Runnable lambda = () -> System.out.println("Lambda");
        lambda.run();
    }
}

// Records (Java 16+) - immutable data classes
public record Point(int x, int y) {
    // Compact constructor for validation
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Coordinates must be positive");
        }
    }

    // Additional methods
    public double distanceFromOrigin() {
        return Math.sqrt(x * x + y * y);
    }

    // Static factory
    public static Point origin() {
        return new Point(0, 0);
    }
}

public record User(String name, String email) {
    // Automatically gets:
    // - Constructor
    // - Getters (name(), email())
    // - equals(), hashCode(), toString()
}

// Usage
var user = new User("Arthur", "art@bpc.com");
System.out.println(user.name());   // Arthur
System.out.println(user);          // User[name=Arthur, email=art@bpc.com]
```

## Example 6: Design Patterns

```java
// Singleton
public class Singleton {
    private static volatile Singleton instance;
    private String value;

    private Singleton(String value) {
        this.value = value;
    }

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton("Default");
                }
            }
        }
        return instance;
    }
}

// Builder pattern
public class UserBuilder {
    private String name;
    private String email;
    private int age;
    private String role = "user";

    public UserBuilder name(String name) {
        this.name = name;
        return this;
    }

    public UserBuilder email(String email) {
        this.email = email;
        return this;
    }

    public UserBuilder age(int age) {
        this.age = age;
        return this;
    }

    public UserBuilder role(String role) {
        this.role = role;
        return this;
    }

    public User build() {
        if (name == null || email == null) {
            throw new IllegalStateException("Name and email are required");
        }
        return new User(name, email, age, role);
    }
}

// Usage
User user = new UserBuilder()
    .name("Arthur")
    .email("art@bpc.com")
    .age(30)
    .build();

// Factory pattern
public interface Animal {
    String speak();
}

public class AnimalFactory {
    public static Animal create(String type) {
        return switch (type.toLowerCase()) {
            case "dog" -> new Dog();
            case "cat" -> new Cat();
            case "bird" -> new Bird();
            default -> throw new IllegalArgumentException("Unknown animal: " + type);
        };
    }
}

// Strategy pattern
public interface PaymentStrategy {
    void pay(double amount);
}

public class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;

    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " with credit card");
    }
}

public class PayPalPayment implements PaymentStrategy {
    private String email;

    public PayPalPayment(String email) {
        this.email = email;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " with PayPal");
    }
}

public class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }

    public void checkout(double total) {
        paymentStrategy.pay(total);
    }
}
```

**Key Takeaways:**
- Java is strongly class-based OOP
- Use interfaces for abstraction
- Generics provide type safety
- Records simplify data classes
- Design patterns solve common problems

---

# Imitation

### Challenge 1: Implement a Task Management System

**Task:** Create a task system with different task types and statuses.

<details>
<summary>Solution</summary>

```java
// Task status enum
public enum TaskStatus {
    PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}

// Base task class
public abstract class Task {
    protected final String id;
    protected String title;
    protected String description;
    protected TaskStatus status;
    protected LocalDateTime createdAt;
    protected LocalDateTime completedAt;

    public Task(String title, String description) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.description = description;
        this.status = TaskStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public abstract int getPriority();

    public void start() {
        if (status != TaskStatus.PENDING) {
            throw new IllegalStateException("Task already started");
        }
        status = TaskStatus.IN_PROGRESS;
    }

    public void complete() {
        if (status != TaskStatus.IN_PROGRESS) {
            throw new IllegalStateException("Task not in progress");
        }
        status = TaskStatus.COMPLETED;
        completedAt = LocalDateTime.now();
    }

    // Getters...
}

// Specific task types
public class BugTask extends Task {
    private String severity;

    public BugTask(String title, String description, String severity) {
        super(title, description);
        this.severity = severity;
    }

    @Override
    public int getPriority() {
        return switch (severity) {
            case "critical" -> 1;
            case "high" -> 2;
            case "medium" -> 3;
            default -> 4;
        };
    }
}

public class FeatureTask extends Task {
    private int storyPoints;

    public FeatureTask(String title, String description, int storyPoints) {
        super(title, description);
        this.storyPoints = storyPoints;
    }

    @Override
    public int getPriority() {
        return storyPoints > 8 ? 2 : 3;
    }
}

// Task manager
public class TaskManager {
    private final List<Task> tasks = new ArrayList<>();

    public void addTask(Task task) {
        tasks.add(task);
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return tasks.stream()
            .filter(t -> t.getStatus() == status)
            .sorted(Comparator.comparingInt(Task::getPriority))
            .toList();
    }
}
```

</details>

---

# Practice

### Exercise 1: Implement Observer Pattern
**Difficulty:** Intermediate

Create an event system:
- Observable base class
- Observer interface
- Type-safe events

### Exercise 2: Build a DI Container
**Difficulty:** Advanced

Create a simple dependency injection container:
- Register types
- Resolve dependencies
- Singleton vs transient

---

## Summary

**What you learned:**
- Classes, objects, and inheritance
- Interfaces and polymorphism
- Generics for type safety
- Records for data classes
- Common design patterns

**Next Steps:**
- Read: [Java API](/api/guides/java/api)
- Practice: Build a library system
- Explore: Spring Framework

---

## Resources

- [Oracle Java Tutorials](https://docs.oracle.com/javase/tutorial/)
- [Effective Java](https://www.oreilly.com/library/view/effective-java/9780134686097/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
