---
title: "Dart Object-Oriented Programming"
subTitle: "OOP for Flutter and Beyond"
excerpt: "Dart's OOP model powers Flutter - master it for better apps."
featureImage: "/img/dart-oop.png"
date: "2026-02-01"
order: 93
---

# Explanation

## OOP in Dart

Dart is a pure object-oriented language where everything is an object. It supports classes, mixins, abstract classes, and interfaces to build robust applications.

### Key Concepts

| Concept | Dart Implementation |
|---------|---------------------|
| Classes | class keyword |
| Inheritance | extends |
| Interfaces | implicit (all classes) |
| Mixins | with keyword |
| Encapsulation | _ prefix for private |

---

# Demonstration

## Example 1: Classes and Objects

```dart
// Basic class
class User {
  // Instance fields
  String name;
  String email;
  int _age;  // Private (underscore prefix)

  // Static field
  static int userCount = 0;

  // Constant
  static const String defaultRole = 'user';

  // Constructor
  User(this.name, this.email, [this._age = 0]) {
    userCount++;
  }

  // Named constructor
  User.guest() : name = 'Guest', email = 'guest@example.com', _age = 0 {
    userCount++;
  }

  // Factory constructor
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      json['name'] as String,
      json['email'] as String,
      json['age'] as int? ?? 0,
    );
  }

  // Getter
  int get age => _age;

  // Setter with validation
  set age(int value) {
    if (value < 0) throw ArgumentError('Age cannot be negative');
    _age = value;
  }

  // Computed property
  String get displayName => '$name <$email>';

  // Instance method
  String greet() => 'Hello, I\'m $name!';

  // Static method
  static int getUserCount() => userCount;

  // toString override
  @override
  String toString() => 'User{name: $name, email: $email, age: $_age}';

  // Equality override
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is User &&
          runtimeType == other.runtimeType &&
          email == other.email;

  @override
  int get hashCode => email.hashCode;
}

// Usage
void main() {
  final user1 = User('Arthur', 'art@bpc.com', 30);
  final user2 = User.guest();
  final user3 = User.fromJson({'name': 'Sarah', 'email': 'sarah@example.com'});

  print(user1.greet());
  print(User.getUserCount());  // 3

  // Cascade notation
  final user = User('Test', 'test@example.com')
    ..age = 25
    ..name = 'Test User';
}
```

## Example 2: Inheritance

```dart
// Base class
abstract class Animal {
  final String name;
  int _age = 0;

  Animal(this.name);

  // Abstract method
  String speak();

  // Concrete method
  String describe() => '${runtimeType}: $name';

  // Getter
  int get age => _age;

  // Protected-like (accessible in subclasses)
  void incrementAge() => _age++;
}

// Subclass
class Dog extends Animal {
  final String breed;

  Dog(String name, this.breed) : super(name);

  @override
  String speak() => '$name says Woof!';

  String fetch() => '$name is fetching the ball';
}

class Cat extends Animal {
  final bool indoor;

  Cat(String name, {this.indoor = true}) : super(name);

  @override
  String speak() => '$name says Meow!';

  String scratch() => '$name is scratching';
}

// Polymorphism
void main() {
  final animals = <Animal>[
    Dog('Buddy', 'Golden Retriever'),
    Cat('Whiskers', indoor: true),
    Dog('Max', 'German Shepherd'),
  ];

  for (final animal in animals) {
    print(animal.speak());  // Polymorphic call
    print(animal.describe());

    // Type checking
    if (animal is Dog) {
      print(animal.fetch());  // Smart cast
    }
  }
}
```

## Example 3: Mixins

```dart
// Mixin definition
mixin Flyable {
  double altitude = 0;

  void fly() {
    altitude += 100;
    print('Flying at $altitude meters');
  }

  void land() {
    altitude = 0;
    print('Landed');
  }
}

mixin Swimmable {
  double depth = 0;

  void swim() {
    depth += 10;
    print('Swimming at $depth meters deep');
  }

  void surface() {
    depth = 0;
    print('Surfaced');
  }
}

// Mixin with constraints
mixin Trainable on Animal {
  bool trained = false;

  void train() {
    trained = true;
    print('$name is now trained');
  }
}

// Using mixins
class Bird extends Animal with Flyable {
  Bird(String name) : super(name);

  @override
  String speak() => '$name chirps';
}

class Duck extends Animal with Flyable, Swimmable {
  Duck(String name) : super(name);

  @override
  String speak() => '$name quacks';
}

class TrainedDog extends Animal with Trainable {
  TrainedDog(String name) : super(name);

  @override
  String speak() => '$name barks';
}

void main() {
  final duck = Duck('Donald');
  duck.fly();   // From Flyable
  duck.swim();  // From Swimmable

  final dog = TrainedDog('Buddy');
  dog.train();  // From Trainable
}
```

## Example 4: Abstract Classes and Interfaces

```dart
// Abstract class
abstract class Shape {
  double get area;
  double get perimeter;

  void draw();

  // Concrete method
  String describe() => '${runtimeType} with area $area';
}

// Interface (implicit - every class is an interface)
class Drawable {
  void draw() {
    print('Drawing...');
  }
}

class Clickable {
  void onClick() {}
}

// Implementing multiple interfaces
class Circle extends Shape implements Drawable, Clickable {
  final double radius;

  Circle(this.radius);

  @override
  double get area => 3.14159 * radius * radius;

  @override
  double get perimeter => 2 * 3.14159 * radius;

  @override
  void draw() {
    print('Drawing circle with radius $radius');
  }

  @override
  void onClick() {
    print('Circle clicked');
  }
}

class Rectangle extends Shape {
  final double width;
  final double height;

  Rectangle(this.width, this.height);

  @override
  double get area => width * height;

  @override
  double get perimeter => 2 * (width + height);

  @override
  void draw() {
    print('Drawing rectangle ${width}x$height');
  }
}

// Using implements for interface-like behavior
abstract class Repository<T> {
  Future<T?> findById(int id);
  Future<List<T>> findAll();
  Future<T> save(T entity);
  Future<void> delete(int id);
}

class UserRepository implements Repository<User> {
  final List<User> _storage = [];

  @override
  Future<User?> findById(int id) async {
    return _storage.firstWhereOrNull((u) => u.id == id);
  }

  @override
  Future<List<User>> findAll() async => List.unmodifiable(_storage);

  @override
  Future<User> save(User entity) async {
    _storage.add(entity);
    return entity;
  }

  @override
  Future<void> delete(int id) async {
    _storage.removeWhere((u) => u.id == id);
  }
}
```

## Example 5: Generics

```dart
// Generic class
class Box<T> {
  T? _content;

  void put(T item) => _content = item;

  T? get() => _content;

  bool get isEmpty => _content == null;
}

// Generic with constraints
class NumberBox<T extends num> {
  T value;

  NumberBox(this.value);

  double toDouble() => value.toDouble();

  T add(T other) => (value + other) as T;
}

// Generic methods
T firstOrNull<T>(List<T> list) {
  return list.isEmpty ? null as T : list.first;
}

T max<T extends Comparable<T>>(T a, T b) {
  return a.compareTo(b) > 0 ? a : b;
}

// Generic interface
abstract class Cache<K, V> {
  V? get(K key);
  void set(K key, V value);
  void remove(K key);
  void clear();
}

class InMemoryCache<K, V> implements Cache<K, V> {
  final Map<K, V> _storage = {};

  @override
  V? get(K key) => _storage[key];

  @override
  void set(K key, V value) => _storage[key] = value;

  @override
  void remove(K key) => _storage.remove(key);

  @override
  void clear() => _storage.clear();
}

void main() {
  final stringBox = Box<String>();
  stringBox.put('Hello');
  print(stringBox.get());

  final numberBox = NumberBox<int>(42);
  print(numberBox.toDouble());

  final cache = InMemoryCache<String, int>();
  cache.set('count', 100);
}
```

## Example 6: Extension Methods

```dart
// Extension on existing class
extension StringExtensions on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  String truncate(int length, {String suffix = '...'}) {
    if (this.length <= length) return this;
    return '${substring(0, length)}$suffix';
  }

  bool get isEmail => contains('@') && contains('.');
}

extension ListExtensions<T> on List<T> {
  T? firstWhereOrNull(bool Function(T) test) {
    for (final element in this) {
      if (test(element)) return element;
    }
    return null;
  }

  List<T> distinctBy<K>(K Function(T) keyOf) {
    final seen = <K>{};
    return where((element) => seen.add(keyOf(element))).toList();
  }
}

extension DateTimeExtensions on DateTime {
  String toIso8601DateString() {
    return '${year.toString().padLeft(4, '0')}-'
           '${month.toString().padLeft(2, '0')}-'
           '${day.toString().padLeft(2, '0')}';
  }

  bool isSameDay(DateTime other) {
    return year == other.year &&
           month == other.month &&
           day == other.day;
  }
}

// Named extension for organization
extension NumericIterable on Iterable<num> {
  num get sum => fold(0, (a, b) => a + b);
  double get average => isEmpty ? 0 : sum / length;
}

void main() {
  print('hello'.capitalize());  // Hello
  print('Hello World'.truncate(5));  // Hello...
  print('test@example.com'.isEmail);  // true

  final users = [User('A'), User('B'), User('A')];
  final distinct = users.distinctBy((u) => u.name);

  final numbers = [1, 2, 3, 4, 5];
  print(numbers.sum);      // 15
  print(numbers.average);  // 3.0
}
```

**Key Takeaways:**
- Everything in Dart is an object
- Use mixins for code reuse
- Interfaces are implicit
- Extension methods add functionality
- Generics provide type safety

---

# Imitation

### Challenge 1: Build a Task System

**Task:** Create a task management system with different task types and states.

<details>
<summary>Solution</summary>

```dart
// Task status enum
enum TaskStatus { pending, inProgress, completed, cancelled }

// Base task class
abstract class Task {
  final String id;
  String title;
  String description;
  TaskStatus _status;
  final DateTime createdAt;
  DateTime? completedAt;

  Task({
    required this.title,
    this.description = '',
  }) : id = DateTime.now().millisecondsSinceEpoch.toString(),
       _status = TaskStatus.pending,
       createdAt = DateTime.now();

  TaskStatus get status => _status;

  int get priority;

  void start() {
    if (_status != TaskStatus.pending) {
      throw StateError('Task already started');
    }
    _status = TaskStatus.inProgress;
  }

  void complete() {
    if (_status != TaskStatus.inProgress) {
      throw StateError('Task not in progress');
    }
    _status = TaskStatus.completed;
    completedAt = DateTime.now();
  }

  void cancel() {
    if (_status == TaskStatus.completed) {
      throw StateError('Cannot cancel completed task');
    }
    _status = TaskStatus.cancelled;
  }
}

// Specific task types
class BugTask extends Task {
  final String severity;

  BugTask({
    required String title,
    String description = '',
    required this.severity,
  }) : super(title: title, description: description);

  @override
  int get priority {
    switch (severity) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      default: return 4;
    }
  }
}

class FeatureTask extends Task {
  final int storyPoints;

  FeatureTask({
    required String title,
    String description = '',
    required this.storyPoints,
  }) : super(title: title, description: description);

  @override
  int get priority => storyPoints > 8 ? 2 : 3;
}

// Task manager
class TaskManager {
  final List<Task> _tasks = [];

  void addTask(Task task) => _tasks.add(task);

  List<Task> getByStatus(TaskStatus status) {
    return _tasks
        .where((t) => t.status == status)
        .toList()
      ..sort((a, b) => a.priority.compareTo(b.priority));
  }

  Task? findById(String id) {
    return _tasks.firstWhereOrNull((t) => t.id == id);
  }
}

void main() {
  final manager = TaskManager();

  manager.addTask(BugTask(
    title: 'Fix login',
    severity: 'critical',
  ));

  manager.addTask(FeatureTask(
    title: 'Add dark mode',
    storyPoints: 5,
  ));

  for (final task in manager.getByStatus(TaskStatus.pending)) {
    print('${task.title} - Priority: ${task.priority}');
  }
}
```

</details>

---

# Practice

### Exercise 1: Implement Observable Pattern
**Difficulty:** Intermediate

Create an observable class:
- Subscribe/unsubscribe listeners
- Notify on changes
- Type-safe events

### Exercise 2: Build a State Machine
**Difficulty:** Advanced

Create a generic state machine:
- Define states and transitions
- Guards for transitions
- Event hooks

---

## Summary

**What you learned:**
- Dart class fundamentals
- Inheritance and polymorphism
- Mixins for code reuse
- Extension methods
- Generics for type safety

**Next Steps:**
- Read: [Dart API](/api/guides/dart/api)
- Practice: Build a Flutter widget
- Explore: Dart isolates

---

## Resources

- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
