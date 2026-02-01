---
title: "PHP Introduction"
subTitle: "The Language That Powers the Web"
excerpt: "PHP runs 80% of the web - there's a reason for that."
featureImage: "/img/php-intro.png"
date: "2026-02-01"
order: 300
---

# Explanation

## Why PHP?

PHP has powered the web for decades. WordPress, Laravel, Facebook's backend - all PHP. It's easy to learn, deploy anywhere, and gets things done. Modern PHP (8+) is fast, type-safe, and elegant.

### Key Concepts

- **Server-Side**: PHP runs on the server, not the browser
- **Embedded**: Can mix PHP with HTML
- **Interpreted**: No compilation needed
- **Ecosystem**: Composer packages, Laravel, WordPress

### PHP vs JavaScript

```javascript
// JavaScript
const name = "Arthur";
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
console.log(`Hello, ${name}`);
```

```php
// PHP
$name = "Arthur";
$numbers = [1, 2, 3];
$doubled = array_map(fn($n) => $n * 2, $numbers);
echo "Hello, $name";
```

---

# Demonstration

## Example 1: PHP Basics

```php
<?php
// Variables ($ prefix required)
$name = "Arthur";
$age = 30;
$isDeveloper = true;
$skills = ["PHP", "JavaScript", "Python"];

// String interpolation
echo "Hello, $name! You are $age years old.\n";

// Arrays (indexed)
$fruits = ["apple", "banana", "cherry"];
echo $fruits[0];  // apple

// Associative arrays (like objects/dicts)
$user = [
    "name" => "Arthur",
    "email" => "art@bpc.com",
    "role" => "admin"
];
echo $user["name"];  // Arthur

// Array functions
$numbers = [1, 2, 3, 4, 5];

// Map
$doubled = array_map(fn($n) => $n * 2, $numbers);
// [2, 4, 6, 8, 10]

// Filter
$evens = array_filter($numbers, fn($n) => $n % 2 === 0);
// [2, 4]

// Reduce
$sum = array_reduce($numbers, fn($acc, $n) => $acc + $n, 0);
// 15

// Spread operator (PHP 7.4+)
$more = [...$numbers, 6, 7, 8];

// Null coalescing
$username = $user["username"] ?? "guest";

// Null safe operator (PHP 8+)
$length = $user["address"]?->street?->length;
```

## Example 2: Functions and Types

```php
<?php
// Basic function
function greet(string $name): string {
    return "Hello, $name!";
}

// Default parameters
function greetWithTime(string $name, string $time = "day"): string {
    return "Good $time, $name!";
}

// Named arguments (PHP 8+)
greetWithTime(time: "morning", name: "Arthur");

// Arrow functions (short closures)
$double = fn(int $n): int => $n * 2;

// Type declarations
function createUser(
    string $name,
    string $email,
    ?int $age = null  // Nullable
): array {
    return [
        "name" => $name,
        "email" => $email,
        "age" => $age
    ];
}

// Union types (PHP 8+)
function process(int|string $value): string {
    return is_int($value) ? "Number: $value" : "String: $value";
}

// Variadic functions
function sum(int ...$numbers): int {
    return array_sum($numbers);
}
echo sum(1, 2, 3, 4, 5);  // 15

// Higher-order functions
function withLogging(callable $fn): callable {
    return function(...$args) use ($fn) {
        echo "Calling function...\n";
        $result = $fn(...$args);
        echo "Done!\n";
        return $result;
    };
}

$loggedDouble = withLogging(fn($n) => $n * 2);
echo $loggedDouble(5);  // 10
```

## Example 3: Classes and OOP

```php
<?php
class User {
    // Properties with types
    private int $id;
    public string $name;
    public string $email;
    private bool $active = true;

    // Static property
    private static int $count = 0;

    // Constructor with property promotion (PHP 8+)
    public function __construct(
        string $name,
        string $email,
        private string $role = "user"  // Promoted property
    ) {
        $this->id = ++self::$count;
        $this->name = $name;
        $this->email = $email;
    }

    // Instance method
    public function greet(): string {
        return "Hello, I'm {$this->name}!";
    }

    // Getter
    public function getId(): int {
        return $this->id;
    }

    // Static method
    public static function getCount(): int {
        return self::$count;
    }

    // Magic method for string conversion
    public function __toString(): string {
        return "User({$this->name}, {$this->email})";
    }
}

// Inheritance
class Admin extends User {
    private array $permissions = [];

    public function __construct(string $name, string $email) {
        parent::__construct($name, $email, "admin");
        $this->permissions = ["read", "write", "delete"];
    }

    public function hasPermission(string $perm): bool {
        return in_array($perm, $this->permissions);
    }
}

// Interface
interface Authenticatable {
    public function authenticate(string $password): bool;
    public function getAuthIdentifier(): string;
}

// Trait (reusable code)
trait HasTimestamps {
    private ?DateTime $createdAt = null;
    private ?DateTime $updatedAt = null;

    public function touch(): void {
        $now = new DateTime();
        $this->createdAt ??= $now;
        $this->updatedAt = $now;
    }
}

// Usage
$user = new User("Arthur", "art@bpc.com");
echo $user->greet();
echo User::getCount();  // 1

$admin = new Admin("Sarah", "sarah@example.com");
echo $admin->hasPermission("delete");  // true
```

**Key Takeaways:**
- Variables start with `$`
- `->` for object properties/methods (not `.`)
- `=>` for array key-value pairs
- Modern PHP has types, arrow functions, null safety
- Constructor property promotion reduces boilerplate

---

# Imitation

### Challenge 1: Create a Shopping Cart

**Task:** Build a ShoppingCart class with add, remove, and total calculation.

<details>
<summary>Solution</summary>

```php
<?php
class CartItem {
    public function __construct(
        public string $name,
        public float $price,
        public int $quantity = 1
    ) {}

    public function getSubtotal(): float {
        return $this->price * $this->quantity;
    }
}

class ShoppingCart {
    private array $items = [];

    public function add(string $name, float $price, int $quantity = 1): self {
        $key = strtolower($name);

        if (isset($this->items[$key])) {
            $this->items[$key]->quantity += $quantity;
        } else {
            $this->items[$key] = new CartItem($name, $price, $quantity);
        }

        return $this;
    }

    public function remove(string $name): self {
        unset($this->items[strtolower($name)]);
        return $this;
    }

    public function getTotal(): float {
        return array_reduce(
            $this->items,
            fn($sum, $item) => $sum + $item->getSubtotal(),
            0
        );
    }

    public function getItems(): array {
        return array_values($this->items);
    }
}

$cart = new ShoppingCart();
$cart->add("Laptop", 999.99)
     ->add("Mouse", 29.99, 2)
     ->add("Keyboard", 79.99);

echo $cart->getTotal();  // 1139.96
```

</details>

### Challenge 2: Implement Array Methods

**Task:** Create a Collection class with map, filter, and reduce methods.

<details>
<summary>Solution</summary>

```php
<?php
class Collection {
    public function __construct(private array $items = []) {}

    public function map(callable $fn): self {
        return new self(array_map($fn, $this->items));
    }

    public function filter(callable $fn): self {
        return new self(array_values(array_filter($this->items, $fn)));
    }

    public function reduce(callable $fn, mixed $initial = null): mixed {
        return array_reduce($this->items, $fn, $initial);
    }

    public function first(): mixed {
        return $this->items[0] ?? null;
    }

    public function toArray(): array {
        return $this->items;
    }
}

$numbers = new Collection([1, 2, 3, 4, 5]);

$result = $numbers
    ->map(fn($n) => $n * 2)
    ->filter(fn($n) => $n > 4)
    ->reduce(fn($sum, $n) => $sum + $n, 0);

echo $result;  // 24 (6 + 8 + 10)
```

</details>

---

# Practice

### Exercise 1: User Validator
**Difficulty:** Beginner

Create a UserValidator class that:
- Validates email format
- Checks password strength
- Validates username (alphanumeric, 3-20 chars)
- Returns array of errors

### Exercise 2: File Cache System
**Difficulty:** Intermediate

Build a Cache class that:
- Stores data with expiration
- Uses file system for persistence
- Implements get, set, delete, clear
- Handles serialization

---

## Summary

**What you learned:**
- PHP syntax and variables
- Arrays and array functions
- Functions with types
- Classes, inheritance, traits
- Modern PHP features (8+)

**Next Steps:**
- Read: [PHP Routing](/api/guides/php/routing)
- Practice: Build a simple CRUD app
- Explore: Laravel framework

---

## Resources

- [PHP Documentation](https://www.php.net/docs.php)
- [PHP The Right Way](https://phptherightway.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
