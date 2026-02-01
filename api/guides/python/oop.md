---
title: "Python Object-Oriented Programming"
subTitle: "Building with Classes and Objects"
excerpt: "Code is like humor. When you have to explain it, it's bad. - Cory House"
featureImage: "/img/python-oop.png"
date: "2026-02-01"
order: 102
---

# Explanation

## OOP in Python

Object-Oriented Programming organizes code around objects (data) rather than functions (logic). Python makes OOP elegant and pythonic.

Think of a class as a blueprint for a house. Each house built from that blueprint is an object (instance). The blueprint defines what rooms exist (attributes) and what you can do in them (methods).

### Key Concepts

- **Class**: Blueprint for creating objects
- **Object/Instance**: A specific thing created from a class
- **Attribute**: Data stored in an object
- **Method**: Function that belongs to a class
- **Inheritance**: Creating new classes based on existing ones
- **Encapsulation**: Hiding internal details

### Python vs JavaScript OOP

```javascript
// JavaScript
class User {
    constructor(name) {
        this.name = name;
    }
    greet() {
        return `Hello, ${this.name}`;
    }
}
```

```python
# Python
class User:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"Hello, {self.name}"
```

---

# Demonstration

## Example 1: Basic Class

```python
class User:
    # Class attribute (shared by all instances)
    platform = "BigPoppaCode"

    # Constructor (initializer)
    def __init__(self, name, email):
        # Instance attributes
        self.name = name
        self.email = email
        self.active = True

    # Instance method
    def greet(self):
        return f"Hello, I'm {self.name}!"

    # Method that modifies state
    def deactivate(self):
        self.active = False
        return f"{self.name} has been deactivated"

    # String representation
    def __str__(self):
        status = "active" if self.active else "inactive"
        return f"User({self.name}, {status})"

    # Formal representation
    def __repr__(self):
        return f"User(name='{self.name}', email='{self.email}')"


# Creating instances
user1 = User("Arthur", "art@bpc.com")
user2 = User("Sarah", "sarah@example.com")

print(user1.greet())      # Hello, I'm Arthur!
print(user1.platform)     # BigPoppaCode (class attribute)
print(user1)              # User(Arthur, active)
print(user1.deactivate()) # Arthur has been deactivated
```

## Example 2: Inheritance

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("Subclass must implement")

    def __str__(self):
        return f"{self.__class__.__name__}: {self.name}"


class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

    def fetch(self):
        return f"{self.name} is fetching the ball"


class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

    def scratch(self):
        return f"{self.name} is scratching the furniture"


# Using inheritance
dog = Dog("Buddy")
cat = Cat("Whiskers")

print(dog.speak())   # Buddy says Woof!
print(cat.speak())   # Whiskers says Meow!
print(dog.fetch())   # Buddy is fetching the ball

# Polymorphism - same interface, different behavior
animals = [Dog("Rex"), Cat("Luna"), Dog("Max")]
for animal in animals:
    print(animal.speak())
```

## Example 3: Properties and Encapsulation

```python
class BankAccount:
    def __init__(self, owner, initial_balance=0):
        self.owner = owner
        self._balance = initial_balance  # "Protected" (convention)
        self._transactions = []

    # Property getter
    @property
    def balance(self):
        return self._balance

    # Property setter with validation
    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount
        self._transactions.append(f"+{amount}")
        return self._balance

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        self._transactions.append(f"-{amount}")
        return self._balance

    @property
    def transaction_history(self):
        return self._transactions.copy()  # Return copy to prevent modification

    # Class method - works on the class, not instances
    @classmethod
    def create_savings_account(cls, owner):
        return cls(owner, initial_balance=100)  # Bonus for savings

    # Static method - doesn't need class or instance
    @staticmethod
    def validate_amount(amount):
        return amount > 0


# Using the class
account = BankAccount("Arthur", 1000)
print(account.balance)        # 1000 (using property getter)
account.deposit(500)
account.withdraw(200)
print(account.balance)        # 1300
print(account.transaction_history)  # ['+500', '-200']

# Class method usage
savings = BankAccount.create_savings_account("Sarah")
print(savings.balance)        # 100
```

**Key Takeaways:**
- `__init__` is the constructor
- `self` refers to the instance (like `this` in JS)
- Use `@property` for computed/validated attributes
- Single underscore `_name` indicates "protected" (convention)
- Double underscore `__name` enables name mangling (true privacy)

---

# Imitation

### Challenge 1: Create a Product Class

**Task:** Create a Product class with name, price, and quantity. Include a method to calculate total value and apply discounts.

<details>
<summary>Solution</summary>

```python
class Product:
    def __init__(self, name, price, quantity=1):
        self.name = name
        self._price = price
        self.quantity = quantity

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Price cannot be negative")
        self._price = value

    @property
    def total_value(self):
        return self._price * self.quantity

    def apply_discount(self, percent):
        discount = self._price * (percent / 100)
        self._price -= discount
        return self._price

    def __str__(self):
        return f"{self.name}: ${self._price} x {self.quantity}"
```

</details>

### Challenge 2: Implement a Shape Hierarchy

**Task:** Create Shape base class with Circle and Rectangle subclasses. Each should calculate area and perimeter.

<details>
<summary>Solution</summary>

```python
import math

class Shape:
    def area(self):
        raise NotImplementedError

    def perimeter(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)
```

</details>

---

# Practice

### Exercise 1: Library System
**Difficulty:** Intermediate

Create classes for a library system:
- `Book` with title, author, isbn, available status
- `Library` that manages books (add, remove, borrow, return)
- `Member` who can borrow books

### Exercise 2: E-commerce Cart
**Difficulty:** Advanced

Build a shopping cart system:
- `Product` class with inventory tracking
- `Cart` class that holds items and calculates totals
- `Order` class created from cart with status tracking

---

## Summary

**What you learned:**
- Creating classes with `__init__`
- Instance vs class attributes
- Inheritance and polymorphism
- Properties for encapsulation
- Class and static methods

**Next Steps:**
- Read: [Python APIs](/api/guides/python/api)
- Practice: Refactor procedural code to OOP
- Build: Create a game with OOP principles

---

## Resources

- [Python OOP Tutorial](https://docs.python.org/3/tutorial/classes.html)
- [Real Python: OOP](https://realpython.com/python3-object-oriented-programming/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
