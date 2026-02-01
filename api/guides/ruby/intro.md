---
title: "Ruby Introduction"
subTitle: "A Language Designed for Developer Happiness"
excerpt: "Ruby is designed to make programmers happy. - Matz"
featureImage: "/img/ruby-intro.png"
date: "2026-02-01"
order: 400
---

# Explanation

## Why Ruby?

Ruby was designed with one goal: developer happiness. Its creator, Yukihiro "Matz" Matsumoto, wanted programming to be fun. Ruby reads almost like English and gets out of your way so you can focus on solving problems.

Ruby is famous for:
- **Rails**: The web framework that changed everything
- **Elegant syntax**: Code that reads like poetry
- **Duck typing**: If it walks like a duck and quacks like a duck...
- **Gems**: Thousands of packages for any task

### Key Concepts

- **Everything is an Object**: Even numbers and strings
- **Blocks**: Anonymous functions passed to methods
- **Symbols**: Lightweight, immutable identifiers
- **Convention over Configuration**: Rails mantra

### Ruby vs JavaScript

```javascript
// JavaScript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
```

```ruby
# Ruby
numbers = [1, 2, 3, 4, 5]
doubled = numbers.map { |n| n * 2 }
evens = numbers.select { |n| n.even? }
```

---

# Demonstration

## Example 1: Ruby Basics

```ruby
# Variables (no declaration keyword needed)
name = "Arthur"
age = 30
is_developer = true
skills = ["Ruby", "JavaScript", "Python"]

# String interpolation
puts "Hello, #{name}! You are #{age} years old."

# Everything is an object
puts 5.class          # Integer
puts "hello".class    # String
puts [1, 2, 3].class  # Array

# Methods on everything
puts 5.times { |i| puts i }  # 0, 1, 2, 3, 4
puts "hello".upcase          # HELLO
puts "hello".reverse         # olleh

# Symbols (immutable identifiers)
status = :active
user = { name: "Arthur", role: :admin }

# Conditional expressions return values
message = if age >= 18
            "Welcome!"
          else
            "Too young"
          end

# One-line conditionals
puts "Adult" if age >= 18
puts "Teen" unless age >= 18
```

## Example 2: Methods and Blocks

```ruby
# Method definition
def greet(name)
  "Hello, #{name}!"  # Implicit return (last expression)
end

# Default parameters
def greet_with_time(name, time_of_day = "day")
  "Good #{time_of_day}, #{name}!"
end

# Keyword arguments
def create_user(name:, email:, role: :user)
  { name: name, email: email, role: role }
end

user = create_user(name: "Arthur", email: "art@bpc.com")

# Blocks - anonymous functions
[1, 2, 3].each do |num|
  puts num * 2
end

# Short block syntax
[1, 2, 3].each { |num| puts num * 2 }

# Methods that take blocks
def with_timing
  start = Time.now
  result = yield  # Execute the block
  elapsed = Time.now - start
  puts "Took #{elapsed} seconds"
  result
end

with_timing do
  sleep(1)
  "Done!"
end

# Procs and Lambdas (stored blocks)
double = ->(n) { n * 2 }
puts double.call(5)  # 10
```

## Example 3: Classes

```ruby
class User
  # Class-level accessor methods
  attr_accessor :name, :email
  attr_reader :id  # Read-only

  # Class variable
  @@count = 0

  # Constructor
  def initialize(name, email)
    @id = generate_id
    @name = name
    @email = email
    @@count += 1
  end

  # Instance method
  def greet
    "Hello, I'm #{@name}!"
  end

  # Class method
  def self.count
    @@count
  end

  # Private methods
  private

  def generate_id
    SecureRandom.uuid
  end
end

# Inheritance
class Admin < User
  def initialize(name, email)
    super  # Call parent constructor
    @role = :admin
  end

  def permissions
    [:read, :write, :delete, :admin]
  end
end

# Usage
user = User.new("Arthur", "art@bpc.com")
puts user.greet
puts User.count

admin = Admin.new("Sarah", "sarah@example.com")
puts admin.permissions
```

**Key Takeaways:**
- No semicolons or `var`/`let`/`const` needed
- Last expression is automatically returned
- Blocks are powerful - use them everywhere
- `attr_accessor` creates getter/setter methods
- Ruby favors convention (snake_case, meaningful names)

---

# Imitation

### Challenge 1: Create a Calculator Class

**Task:** Build a calculator with chainable methods.

```ruby
calc = Calculator.new(10)
result = calc.add(5).multiply(2).subtract(3).result
# => 27
```

<details>
<summary>Solution</summary>

```ruby
class Calculator
  def initialize(value = 0)
    @value = value
  end

  def add(n)
    @value += n
    self  # Return self for chaining
  end

  def subtract(n)
    @value -= n
    self
  end

  def multiply(n)
    @value *= n
    self
  end

  def divide(n)
    @value /= n unless n.zero?
    self
  end

  def result
    @value
  end
end
```

</details>

### Challenge 2: Implement Enumerable Methods

**Task:** Implement `my_map` and `my_select` on Array.

<details>
<summary>Solution</summary>

```ruby
class Array
  def my_map
    result = []
    each { |item| result << yield(item) }
    result
  end

  def my_select
    result = []
    each { |item| result << item if yield(item) }
    result
  end
end

[1, 2, 3].my_map { |n| n * 2 }     # [2, 4, 6]
[1, 2, 3, 4].my_select { |n| n.even? }  # [2, 4]
```

</details>

---

# Practice

### Exercise 1: Bank Account
**Difficulty:** Beginner

Create a BankAccount class with:
- Deposit and withdraw methods
- Balance tracking
- Transaction history
- Validation (can't withdraw more than balance)

### Exercise 2: Todo CLI
**Difficulty:** Intermediate

Build a command-line todo app:
- Add, complete, delete todos
- Save to file (JSON or YAML)
- Filter by status
- Pretty output

---

## Summary

**What you learned:**
- Ruby syntax and conventions
- Everything is an object
- Methods, blocks, and iterators
- Classes and inheritance

**Next Steps:**
- Read: [Ruby Routing (Rails/Sinatra)](/api/guides/ruby/routing)
- Practice: Solve Ruby koans
- Build: Create a CLI tool in Ruby

---

## Resources

- [Ruby Documentation](https://ruby-doc.org/)
- [Ruby Koans](http://rubykoans.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
