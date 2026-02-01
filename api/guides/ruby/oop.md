---
title: "Ruby Object-Oriented Programming"
subTitle: "Everything is an Object"
excerpt: "Ruby takes OOP seriously - even numbers are objects."
featureImage: "/img/ruby-oop.png"
date: "2026-02-01"
order: 402
---

# Explanation

## OOP in Ruby

Ruby is a pure object-oriented language. Everything is an object, including numbers and strings. This makes Ruby's OOP intuitive and consistent.

### Key Concepts

- **Classes**: Blueprints for objects
- **Modules**: Mixins and namespaces
- **Inheritance**: Single inheritance with mixins
- **Duck Typing**: If it quacks like a duck...

### Ruby vs JavaScript OOP

```javascript
// JavaScript
class User {
    constructor(name) {
        this.name = name;
    }
}
```

```ruby
# Ruby
class User
  def initialize(name)
    @name = name
  end
end
```

---

# Demonstration

## Example 1: Classes and Objects

```ruby
class User
  # Class attribute (shared across all instances)
  @@count = 0

  # Attribute accessors (creates getter/setter)
  attr_accessor :name, :email
  attr_reader :id        # Read-only
  attr_writer :password  # Write-only

  # Constructor
  def initialize(name, email)
    @id = generate_id
    @name = name
    @email = email
    @active = true
    @@count += 1
  end

  # Instance method
  def greet
    "Hello, I'm #{@name}!"
  end

  # Instance method with predicate (?)
  def active?
    @active
  end

  # Instance method with mutation (!)
  def deactivate!
    @active = false
    self
  end

  # Class method
  def self.count
    @@count
  end

  # Another way to define class methods
  class << self
    def create_guest
      new("Guest", "guest@example.com")
    end

    def find(id)
      # Find user by id...
    end
  end

  # Private methods
  private

  def generate_id
    SecureRandom.uuid
  end

  # Protected methods (accessible in subclasses)
  protected

  def internal_data
    { id: @id, active: @active }
  end
end

# Usage
user = User.new("Arthur", "art@bpc.com")
puts user.greet         # Hello, I'm Arthur!
puts user.active?       # true
user.deactivate!
puts user.active?       # false
puts User.count         # 1

guest = User.create_guest
puts guest.name         # Guest
```

## Example 2: Inheritance

```ruby
# Base class
class Animal
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def speak
    raise NotImplementedError, "Subclass must implement speak"
  end

  def describe
    "#{self.class}: #{@name}"
  end
end

# Inheritance with <
class Dog < Animal
  def speak
    "#{@name} says Woof!"
  end

  def fetch
    "#{@name} is fetching the ball"
  end
end

class Cat < Animal
  def initialize(name, indoor: true)
    super(name)  # Call parent constructor
    @indoor = indoor
  end

  def speak
    "#{@name} says Meow!"
  end

  def indoor?
    @indoor
  end
end

# Polymorphism
animals = [
  Dog.new("Buddy"),
  Cat.new("Whiskers"),
  Dog.new("Max")
]

animals.each do |animal|
  puts animal.speak
end

# Output:
# Buddy says Woof!
# Whiskers says Meow!
# Max says Woof!
```

## Example 3: Modules and Mixins

```ruby
# Module as mixin (shared behavior)
module Timestampable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def timestamped_attributes
      [:created_at, :updated_at]
    end
  end

  def touch
    @created_at ||= Time.now
    @updated_at = Time.now
    self
  end

  def created_at
    @created_at
  end

  def updated_at
    @updated_at
  end
end

# Module as namespace
module Authentication
  class User
    def authenticate(password)
      # ...
    end
  end

  class Session
    def valid?
      # ...
    end
  end
end

# Module with instance and class methods
module Searchable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def search(query)
      all.select { |item| item.matches?(query) }
    end
  end

  def matches?(query)
    to_s.downcase.include?(query.downcase)
  end
end

# Using modules
class Post
  include Timestampable  # Instance methods
  include Searchable
  extend Comparable      # Class methods

  attr_accessor :title, :content

  def initialize(title, content)
    @title = title
    @content = content
    touch
  end

  def to_s
    "#{@title}: #{@content}"
  end
end

post = Post.new("Hello", "World")
puts post.created_at
puts post.matches?("hello")  # true
```

## Example 4: Advanced OOP Patterns

```ruby
# Struct for simple data classes
Person = Struct.new(:name, :age) do
  def adult?
    age >= 18
  end
end

person = Person.new("Arthur", 30)
puts person.adult?  # true

# OpenStruct for dynamic attributes
require 'ostruct'

config = OpenStruct.new(
  host: 'localhost',
  port: 3000
)
config.debug = true
puts config.host  # localhost

# Comparable module
class Product
  include Comparable

  attr_reader :price

  def initialize(name, price)
    @name = name
    @price = price
  end

  def <=>(other)
    @price <=> other.price
  end
end

products = [
  Product.new("Book", 20),
  Product.new("Laptop", 1000),
  Product.new("Pen", 5)
]

puts products.sort.map { |p| p.instance_variable_get(:@name) }
# ["Pen", "Book", "Laptop"]

# Enumerable module
class TodoList
  include Enumerable

  def initialize
    @todos = []
  end

  def add(todo)
    @todos << todo
    self
  end

  def each(&block)
    @todos.each(&block)
  end
end

list = TodoList.new
list.add("Buy milk").add("Walk dog").add("Code")
puts list.select { |t| t.length > 5 }  # ["Buy milk", "Walk dog"]
```

## Example 5: Metaprogramming

```ruby
# Define methods dynamically
class Model
  ATTRIBUTES = [:name, :email, :role]

  ATTRIBUTES.each do |attr|
    define_method(attr) do
      instance_variable_get("@#{attr}")
    end

    define_method("#{attr}=") do |value|
      instance_variable_set("@#{attr}", value)
    end
  end
end

# method_missing for dynamic dispatch
class DynamicFinder
  def initialize(data)
    @data = data
  end

  def method_missing(method_name, *args, &block)
    if method_name.to_s.start_with?('find_by_')
      attribute = method_name.to_s.sub('find_by_', '')
      value = args.first
      @data.find { |item| item[attribute.to_sym] == value }
    else
      super
    end
  end

  def respond_to_missing?(method_name, include_private = false)
    method_name.to_s.start_with?('find_by_') || super
  end
end

users = [
  { name: 'Arthur', role: 'admin' },
  { name: 'Sarah', role: 'user' }
]

finder = DynamicFinder.new(users)
puts finder.find_by_name('Arthur')  # { name: 'Arthur', role: 'admin' }
puts finder.find_by_role('user')    # { name: 'Sarah', role: 'user' }

# Class macros
class ApplicationRecord
  def self.validates(attribute, **options)
    @validations ||= []
    @validations << { attribute: attribute, **options }
  end

  def self.validations
    @validations || []
  end
end

class User < ApplicationRecord
  validates :name, presence: true
  validates :email, format: /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
end

puts User.validations
```

**Key Takeaways:**
- Everything in Ruby is an object
- Use modules for mixins and namespaces
- Single inheritance + mixins = flexible OOP
- attr_accessor creates getter/setter
- Metaprogramming enables DSLs and frameworks

---

# Imitation

### Challenge 1: Create a Validation Module

**Task:** Build a module that adds validation to any class.

<details>
<summary>Solution</summary>

```ruby
module Validatable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def validations
      @validations ||= []
    end

    def validates(attribute, **options)
      validations << { attribute: attribute, options: options }
    end
  end

  def valid?
    errors.clear
    self.class.validations.each do |validation|
      attr = validation[:attribute]
      value = send(attr)
      options = validation[:options]

      if options[:presence] && (value.nil? || value.empty?)
        errors << "#{attr} can't be blank"
      end

      if options[:length] && value
        min = options[:length][:minimum]
        max = options[:length][:maximum]
        errors << "#{attr} is too short" if min && value.length < min
        errors << "#{attr} is too long" if max && value.length > max
      end

      if options[:format] && value && !value.match?(options[:format])
        errors << "#{attr} is invalid"
      end
    end
    errors.empty?
  end

  def errors
    @errors ||= []
  end
end

class User
  include Validatable

  attr_accessor :name, :email

  validates :name, presence: true, length: { minimum: 2 }
  validates :email, presence: true, format: /\A[\w+\-.]+@[a-z\d\-]+\.[a-z]+\z/i
end
```

</details>

### Challenge 2: Implement Active Record Pattern

**Task:** Create a simple ORM-like pattern.

<details>
<summary>Solution</summary>

```ruby
class ActiveModel
  class << self
    def all
      @records ||= []
    end

    def create(attributes = {})
      instance = new(attributes)
      instance.save
      instance
    end

    def find(id)
      all.find { |r| r.id == id }
    end

    def where(**conditions)
      all.select do |record|
        conditions.all? { |k, v| record.send(k) == v }
      end
    end
  end

  attr_reader :id

  def initialize(attributes = {})
    @id = nil
    attributes.each do |key, value|
      send("#{key}=", value) if respond_to?("#{key}=")
    end
  end

  def save
    if @id.nil?
      @id = self.class.all.length + 1
      self.class.all << self
    end
    true
  end

  def update(attributes = {})
    attributes.each do |key, value|
      send("#{key}=", value) if respond_to?("#{key}=")
    end
    save
  end

  def destroy
    self.class.all.delete(self)
  end
end

class User < ActiveModel
  attr_accessor :name, :email, :role

  def initialize(attributes = {})
    @role = 'user'
    super
  end
end

# Usage
user = User.create(name: 'Arthur', email: 'art@bpc.com')
User.create(name: 'Sarah', email: 'sarah@example.com', role: 'admin')

puts User.all.length  # 2
puts User.find(1).name  # Arthur
puts User.where(role: 'admin').first.name  # Sarah
```

</details>

---

# Practice

### Exercise 1: Build a Plugin System
**Difficulty:** Intermediate

Create a system where:
- Plugins can be registered
- Plugins add methods to host class
- Plugins can have lifecycle hooks

### Exercise 2: DSL Builder
**Difficulty:** Advanced

Build a configuration DSL:
```ruby
Config.define do
  setting :app_name, 'MyApp'
  setting :port, 3000
  group :database do
    setting :host, 'localhost'
    setting :name, 'myapp_dev'
  end
end
```

---

## Summary

**What you learned:**
- Ruby class fundamentals
- Inheritance and mixins
- Module patterns
- Metaprogramming basics
- Ruby OOP conventions

**Next Steps:**
- Read: [Ruby APIs](/api/guides/ruby/api)
- Practice: Build a gem with Ruby OOP
- Explore: Rails Active Record

---

## Resources

- [Ruby OOP](https://ruby-doc.org/docs/ruby-doc-bundle/Tutorial/part_02/user_class.html)
- [Metaprogramming Ruby](https://pragprog.com/titles/ppmetr2/metaprogramming-ruby-2/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
