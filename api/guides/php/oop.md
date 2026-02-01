---
title: "PHP Object-Oriented Programming"
subTitle: "Modern PHP OOP Patterns"
excerpt: "PHP 8+ brings PHP OOP to a whole new level."
featureImage: "/img/php-oop.png"
date: "2026-02-01"
order: 302
---

# Explanation

## OOP in Modern PHP

PHP has evolved significantly. PHP 8 brings constructor property promotion, named arguments, attributes, and more. Modern PHP OOP rivals any language.

### Key Concepts

- **Classes and Objects**: Blueprints and instances
- **Visibility**: public, protected, private
- **Interfaces**: Contracts for classes
- **Traits**: Reusable code blocks
- **Abstract Classes**: Partial implementations

### PHP 8 Features

```php
// Constructor property promotion
class User {
    public function __construct(
        public string $name,
        public string $email,
        private ?string $password = null
    ) {}
}

// Named arguments
$user = new User(email: 'art@bpc.com', name: 'Arthur');
```

---

# Demonstration

## Example 1: Modern PHP Classes

```php
<?php

declare(strict_types=1);

class User
{
    // Constants
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    // Static property
    private static int $count = 0;

    // Constructor with property promotion (PHP 8+)
    public function __construct(
        public readonly int $id,
        public string $name,
        public string $email,
        private string $passwordHash = '',
        private string $status = self::STATUS_ACTIVE
    ) {
        self::$count++;
    }

    // Getter
    public function getStatus(): string
    {
        return $this->status;
    }

    // Setter with validation
    public function setStatus(string $status): self
    {
        if (!in_array($status, [self::STATUS_ACTIVE, self::STATUS_INACTIVE])) {
            throw new InvalidArgumentException('Invalid status');
        }
        $this->status = $status;
        return $this;
    }

    // Method
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    // Static method
    public static function getCount(): int
    {
        return self::$count;
    }

    // Magic method: string representation
    public function __toString(): string
    {
        return "{$this->name} <{$this->email}>";
    }

    // Magic method: JSON serialization
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status
        ];
    }
}

// Usage
$user = new User(
    id: 1,
    name: 'Arthur',
    email: 'art@bpc.com'
);

echo $user;  // Arthur <art@bpc.com>
echo User::getCount();  // 1
```

## Example 2: Interfaces and Abstract Classes

```php
<?php

// Interface
interface Authenticatable
{
    public function authenticate(string $password): bool;
    public function getAuthIdentifier(): string;
}

interface Notifiable
{
    public function notify(string $message): void;
}

// Abstract class
abstract class Entity
{
    protected \DateTimeImmutable $createdAt;
    protected \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    abstract public function toArray(): array;

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}

// Implementation
class User extends Entity implements Authenticatable, Notifiable
{
    public function __construct(
        public readonly int $id,
        public string $name,
        public string $email,
        private string $passwordHash
    ) {
        parent::__construct();
    }

    public function authenticate(string $password): bool
    {
        return password_verify($password, $this->passwordHash);
    }

    public function getAuthIdentifier(): string
    {
        return $this->email;
    }

    public function notify(string $message): void
    {
        // Send notification
        echo "Notifying {$this->name}: {$message}";
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->createdAt->format('c')
        ];
    }
}
```

## Example 3: Traits

```php
<?php

// Traits for reusable code
trait Timestampable
{
    protected ?\DateTimeImmutable $createdAt = null;
    protected ?\DateTimeImmutable $updatedAt = null;

    public function initTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt ??= $now;
        $this->updatedAt = $now;
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}

trait SoftDeletes
{
    protected ?\DateTimeImmutable $deletedAt = null;

    public function delete(): void
    {
        $this->deletedAt = new \DateTimeImmutable();
    }

    public function restore(): void
    {
        $this->deletedAt = null;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }
}

trait HasUuid
{
    protected string $uuid;

    public function initUuid(): void
    {
        $this->uuid = bin2hex(random_bytes(16));
    }

    public function getUuid(): string
    {
        return $this->uuid;
    }
}

// Using multiple traits
class Post
{
    use Timestampable, SoftDeletes, HasUuid;

    public function __construct(
        public string $title,
        public string $content,
        public int $authorId
    ) {
        $this->initTimestamps();
        $this->initUuid();
    }
}

$post = new Post('Hello', 'World', 1);
$post->delete();
echo $post->isDeleted();  // true
$post->restore();
echo $post->isDeleted();  // false
```

## Example 4: Enums (PHP 8.1+)

```php
<?php

// Basic enum
enum Status
{
    case Pending;
    case Active;
    case Suspended;
    case Deleted;
}

// Backed enum (with values)
enum Role: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case User = 'user';
    case Guest = 'guest';

    public function permissions(): array
    {
        return match($this) {
            self::Admin => ['read', 'write', 'delete', 'admin'],
            self::Editor => ['read', 'write', 'delete'],
            self::User => ['read', 'write'],
            self::Guest => ['read']
        };
    }

    public function canDelete(): bool
    {
        return in_array('delete', $this->permissions());
    }
}

// Integer backed enum
enum Priority: int
{
    case Low = 1;
    case Medium = 2;
    case High = 3;
    case Critical = 4;

    public function label(): string
    {
        return match($this) {
            self::Low => 'Low Priority',
            self::Medium => 'Medium Priority',
            self::High => 'High Priority',
            self::Critical => 'Critical!'
        };
    }
}

// Usage
class User
{
    public function __construct(
        public string $name,
        public Role $role = Role::User,
        public Status $status = Status::Pending
    ) {}
}

$admin = new User('Arthur', Role::Admin);
echo $admin->role->value;  // 'admin'
echo $admin->role->canDelete();  // true

// Get all cases
$roles = Role::cases();
// [Role::Admin, Role::Editor, Role::User, Role::Guest]

// From value
$role = Role::from('admin');  // Role::Admin
$role = Role::tryFrom('invalid');  // null
```

## Example 5: Design Patterns

```php
<?php

// Singleton
class Database
{
    private static ?self $instance = null;
    private \PDO $connection;

    private function __construct()
    {
        $this->connection = new \PDO(
            'mysql:host=localhost;dbname=app',
            'user',
            'password'
        );
    }

    public static function getInstance(): self
    {
        return self::$instance ??= new self();
    }

    public function query(string $sql): array
    {
        return $this->connection->query($sql)->fetchAll();
    }

    // Prevent cloning
    private function __clone() {}
}

// Factory
interface PaymentProcessor
{
    public function charge(float $amount): bool;
}

class StripeProcessor implements PaymentProcessor
{
    public function charge(float $amount): bool
    {
        // Stripe implementation
        return true;
    }
}

class PayPalProcessor implements PaymentProcessor
{
    public function charge(float $amount): bool
    {
        // PayPal implementation
        return true;
    }
}

class PaymentFactory
{
    public static function create(string $provider): PaymentProcessor
    {
        return match($provider) {
            'stripe' => new StripeProcessor(),
            'paypal' => new PayPalProcessor(),
            default => throw new \InvalidArgumentException("Unknown provider: $provider")
        };
    }
}

// Repository Pattern
interface UserRepository
{
    public function find(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function save(User $user): void;
    public function delete(User $user): void;
}

class DatabaseUserRepository implements UserRepository
{
    public function __construct(private \PDO $db) {}

    public function find(int $id): ?User
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $data = $stmt->fetch();

        return $data ? $this->hydrate($data) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $data = $stmt->fetch();

        return $data ? $this->hydrate($data) : null;
    }

    public function save(User $user): void
    {
        // Insert or update logic
    }

    public function delete(User $user): void
    {
        $stmt = $this->db->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$user->id]);
    }

    private function hydrate(array $data): User
    {
        return new User(
            id: $data['id'],
            name: $data['name'],
            email: $data['email'],
            passwordHash: $data['password_hash']
        );
    }
}
```

**Key Takeaways:**
- PHP 8 makes OOP cleaner
- Constructor promotion reduces boilerplate
- Traits enable code reuse
- Enums replace magic strings/numbers
- Interfaces define contracts

---

# Imitation

### Challenge 1: Create a Validation System

**Task:** Build a validation system using OOP principles.

<details>
<summary>Solution</summary>

```php
<?php

interface Rule
{
    public function passes(mixed $value): bool;
    public function message(): string;
}

class Required implements Rule
{
    public function passes(mixed $value): bool
    {
        return $value !== null && $value !== '';
    }

    public function message(): string
    {
        return 'This field is required';
    }
}

class Email implements Rule
{
    public function passes(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function message(): string
    {
        return 'Invalid email address';
    }
}

class MinLength implements Rule
{
    public function __construct(private int $min) {}

    public function passes(mixed $value): bool
    {
        return strlen($value) >= $this->min;
    }

    public function message(): string
    {
        return "Must be at least {$this->min} characters";
    }
}

class Validator
{
    private array $errors = [];

    public function __construct(
        private array $data,
        private array $rules
    ) {}

    public function validate(): bool
    {
        $this->errors = [];

        foreach ($this->rules as $field => $fieldRules) {
            $value = $this->data[$field] ?? null;

            foreach ($fieldRules as $rule) {
                if (!$rule->passes($value)) {
                    $this->errors[$field][] = $rule->message();
                }
            }
        }

        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }
}

// Usage
$validator = new Validator(
    ['email' => 'invalid', 'password' => '123'],
    [
        'email' => [new Required(), new Email()],
        'password' => [new Required(), new MinLength(8)]
    ]
);

if (!$validator->validate()) {
    print_r($validator->errors());
}
```

</details>

---

# Practice

### Exercise 1: Event System
**Difficulty:** Intermediate

Build an event dispatcher:
- Register event listeners
- Dispatch events
- Support priorities

### Exercise 2: Dependency Container
**Difficulty:** Advanced

Create a simple DI container:
- Register services
- Auto-resolve dependencies
- Singleton support

---

## Summary

**What you learned:**
- Modern PHP class features
- Interfaces and abstract classes
- Traits for code reuse
- PHP 8.1 enums
- Common design patterns

**Next Steps:**
- Read: [PHP APIs](/api/guides/php/api)
- Practice: Build a small framework
- Explore: Laravel internals

---

## Resources

- [PHP Documentation](https://www.php.net/manual/en/language.oop5.php)
- [PHP: The Right Way](https://phptherightway.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
