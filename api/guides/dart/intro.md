---
title: "Dart Introduction"
subTitle: "The Language Behind Flutter"
excerpt: "Dart: optimized for building beautiful UIs."
featureImage: "/img/dart-intro.png"
date: "2026-02-01"
order: 700
---

# Explanation

## Why Dart?

Dart powers Flutter, Google's UI toolkit for building natively compiled apps. It's designed for client development with features like hot reload, sound null safety, and excellent async support.

### Key Concepts

- **Sound Null Safety**: No null pointer exceptions
- **Hot Reload**: See changes instantly
- **Async/Await**: First-class async support
- **Strong Typing**: With type inference

### Dart vs JavaScript

```javascript
// JavaScript
const user = { name: "Arthur", age: 30 };
const doubled = [1, 2, 3].map(n => n * 2);
```

```dart
// Dart
final user = {'name': 'Arthur', 'age': 30};
final doubled = [1, 2, 3].map((n) => n * 2).toList();
```

---

# Demonstration

## Example 1: Dart Basics

```dart
void main() {
  // Variables
  String name = 'Arthur';  // Explicit type
  var age = 30;            // Type inference
  final email = 'art@bpc.com';  // Runtime constant
  const pi = 3.14159;      // Compile-time constant

  // Null safety
  String? nullable;        // Can be null
  String nonNull = 'hello'; // Cannot be null

  // Late initialization
  late String lateValue;
  lateValue = 'initialized later';

  // String interpolation
  print('Hello, $name!');
  print('Age in months: ${age * 12}');

  // Multi-line strings
  var multiLine = '''
    This is a
    multi-line string
  ''';

  // Lists
  List<int> numbers = [1, 2, 3, 4, 5];
  var fruits = ['apple', 'banana', 'cherry'];

  // List operations
  fruits.add('date');
  fruits.remove('apple');

  // Spread operator
  var more = [...numbers, 6, 7, 8];

  // Collection if
  var nav = [
    'Home',
    'Products',
    if (isAdmin) 'Admin',
  ];

  // Collection for
  var squared = [
    for (var n in numbers) n * n
  ];

  // Maps
  Map<String, dynamic> user = {
    'name': 'Arthur',
    'age': 30,
    'active': true,
  };

  // Sets
  Set<String> tags = {'dart', 'flutter', 'mobile'};

  // Conditional expressions
  var status = age >= 18 ? 'adult' : 'minor';

  // Null-aware operators
  String? maybeName;
  var displayName = maybeName ?? 'Guest';  // If null, use 'Guest'
  var length = maybeName?.length ?? 0;      // Null-safe access
}

bool get isAdmin => true;
```

## Example 2: Functions

```dart
// Basic function
String greet(String name) {
  return 'Hello, $name!';
}

// Arrow function
String greetArrow(String name) => 'Hello, $name!';

// Optional positional parameters
String greetWithTime(String name, [String time = 'day']) {
  return 'Good $time, $name!';
}

// Named parameters
String createUser({
  required String name,
  required String email,
  String role = 'user',
}) {
  return '$name ($email) - $role';
}

// First-class functions
void processUsers(List<String> users, Function(String) callback) {
  for (var user in users) {
    callback(user);
  }
}

// Higher-order function
Function(int) multiplier(int factor) {
  return (int n) => n * factor;
}

void main() {
  print(greet('Arthur'));
  print(greetWithTime('Sarah', 'morning'));
  print(createUser(name: 'Arthur', email: 'art@bpc.com'));

  // Lambda/anonymous function
  var numbers = [1, 2, 3, 4, 5];
  var doubled = numbers.map((n) => n * 2).toList();

  // Function as variable
  var triple = multiplier(3);
  print(triple(5));  // 15

  // Callbacks
  processUsers(['Alice', 'Bob'], (user) => print('Processing $user'));
}
```

## Example 3: Classes

```dart
class User {
  // Properties
  final int id;
  String name;
  String email;
  bool _active = true;  // Private (underscore)

  // Static
  static int _counter = 0;

  // Constructor
  User(this.name, this.email) : id = ++_counter;

  // Named constructor
  User.guest() : this('Guest', 'guest@example.com');

  // Factory constructor
  factory User.fromJson(Map<String, dynamic> json) {
    return User(json['name'], json['email']);
  }

  // Getter
  bool get isActive => _active;

  // Setter
  set active(bool value) {
    _active = value;
  }

  // Methods
  String greet() => 'Hello, I\'m $name!';

  void deactivate() {
    _active = false;
  }

  // Static method
  static int get count => _counter;

  @override
  String toString() => 'User($name, ${_active ? "active" : "inactive"})';
}

// Inheritance
class Admin extends User {
  List<String> permissions;

  Admin(String name, String email, {this.permissions = const []})
      : super(name, email);

  bool hasPermission(String perm) => permissions.contains(perm);

  @override
  String greet() => 'Admin ${super.greet()}';
}

// Mixins
mixin Timestamped {
  DateTime? createdAt;
  DateTime? updatedAt;

  void touch() {
    final now = DateTime.now();
    createdAt ??= now;
    updatedAt = now;
  }
}

class Post with Timestamped {
  String title;
  String content;

  Post(this.title, this.content);
}

// Abstract class / Interface
abstract class Repository<T> {
  Future<T?> findById(int id);
  Future<List<T>> findAll();
  Future<T> save(T entity);
  Future<void> delete(int id);
}

void main() {
  var user = User('Arthur', 'art@bpc.com');
  print(user.greet());

  var guest = User.guest();
  print(guest.name);  // Guest

  var admin = Admin('Sarah', 'sarah@example.com',
    permissions: ['read', 'write', 'delete']);
  print(admin.hasPermission('write'));  // true

  var post = Post('Hello', 'World');
  post.touch();
  print(post.createdAt);
}
```

## Example 4: Async Programming

```dart
import 'dart:async';

// Future - single async value
Future<String> fetchUser(int id) async {
  // Simulate API call
  await Future.delayed(Duration(seconds: 1));
  return 'User $id';
}

// Multiple async operations
Future<Map<String, dynamic>> fetchUserData(int id) async {
  // Parallel execution
  final results = await Future.wait([
    fetchUser(id),
    fetchUserPosts(id),
    fetchUserComments(id),
  ]);

  return {
    'user': results[0],
    'posts': results[1],
    'comments': results[2],
  };
}

Future<List<String>> fetchUserPosts(int id) async {
  await Future.delayed(Duration(milliseconds: 500));
  return ['Post 1', 'Post 2'];
}

Future<List<String>> fetchUserComments(int id) async {
  await Future.delayed(Duration(milliseconds: 300));
  return ['Comment 1'];
}

// Stream - multiple async values
Stream<int> countDown(int from) async* {
  for (var i = from; i >= 0; i--) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// Stream controller
class EventBus {
  final _controller = StreamController<String>.broadcast();

  Stream<String> get events => _controller.stream;

  void emit(String event) {
    _controller.add(event);
  }

  void dispose() {
    _controller.close();
  }
}

void main() async {
  // Await
  try {
    final user = await fetchUser(1);
    print(user);
  } catch (e) {
    print('Error: $e');
  }

  // Then (callback style)
  fetchUser(2).then((user) => print(user)).catchError((e) => print(e));

  // Stream listening
  await for (var count in countDown(5)) {
    print(count);
  }

  // Stream with listen
  final bus = EventBus();
  final subscription = bus.events.listen((event) => print('Event: $event'));

  bus.emit('user_logged_in');
  bus.emit('page_viewed');

  await Future.delayed(Duration(seconds: 1));
  subscription.cancel();
  bus.dispose();
}
```

**Key Takeaways:**
- Dart has sound null safety built-in
- Use `final` for runtime constants, `const` for compile-time
- Classes support constructors, named constructors, factories
- Mixins enable code reuse without inheritance
- async/await and Streams for async programming

---

# Imitation

### Challenge 1: Create a Todo Class

**Task:** Build a Todo class with completion toggling and JSON serialization.

<details>
<summary>Solution</summary>

```dart
class Todo {
  final int id;
  String text;
  bool completed;
  DateTime createdAt;

  static int _counter = 0;

  Todo(this.text)
      : id = ++_counter,
        completed = false,
        createdAt = DateTime.now();

  Todo.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        text = json['text'],
        completed = json['completed'],
        createdAt = DateTime.parse(json['createdAt']);

  void toggle() {
    completed = !completed;
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'text': text,
    'completed': completed,
    'createdAt': createdAt.toIso8601String(),
  };

  @override
  String toString() => '[${completed ? "✓" : " "}] $text';
}

class TodoList {
  final List<Todo> _todos = [];

  void add(String text) => _todos.add(Todo(text));

  void toggle(int id) {
    final todo = _todos.firstWhere((t) => t.id == id);
    todo.toggle();
  }

  void remove(int id) {
    _todos.removeWhere((t) => t.id == id);
  }

  List<Todo> get all => List.unmodifiable(_todos);
  List<Todo> get active => _todos.where((t) => !t.completed).toList();
  List<Todo> get completed => _todos.where((t) => t.completed).toList();
}
```

</details>

### Challenge 2: Create an Async Data Loader

**Task:** Build a generic DataLoader with caching and error handling.

<details>
<summary>Solution</summary>

```dart
class DataLoader<T> {
  final Future<T> Function() _fetcher;
  T? _cache;
  DateTime? _cacheTime;
  final Duration _cacheDuration;
  bool _loading = false;

  DataLoader(this._fetcher, {Duration? cacheDuration})
      : _cacheDuration = cacheDuration ?? Duration(minutes: 5);

  bool get _isCacheValid {
    if (_cache == null || _cacheTime == null) return false;
    return DateTime.now().difference(_cacheTime!) < _cacheDuration;
  }

  Future<T> load({bool forceRefresh = false}) async {
    if (!forceRefresh && _isCacheValid) {
      return _cache!;
    }

    if (_loading) {
      // Wait for existing request
      while (_loading) {
        await Future.delayed(Duration(milliseconds: 100));
      }
      return _cache!;
    }

    _loading = true;
    try {
      _cache = await _fetcher();
      _cacheTime = DateTime.now();
      return _cache!;
    } finally {
      _loading = false;
    }
  }

  void invalidate() {
    _cache = null;
    _cacheTime = null;
  }
}

// Usage
final userLoader = DataLoader<User>(() => fetchUser(1));
final user = await userLoader.load();
```

</details>

---

# Practice

### Exercise 1: Shopping Cart
**Difficulty:** Intermediate

Build a ShoppingCart class with:
- Add/remove items
- Quantity management
- Price calculation
- JSON serialization

### Exercise 2: State Management
**Difficulty:** Advanced

Create a simple state management solution:
- Observable state container
- Stream-based updates
- Undo/redo support
- Persistence

---

## Summary

**What you learned:**
- Dart syntax and null safety
- Functions and closures
- Classes, inheritance, and mixins
- Async programming with Future and Stream
- Collection operations

**Next Steps:**
- Read: [Flutter Fundamentals](/api/guides/dart/flutter)
- Practice: Build a console app
- Explore: Flutter documentation

---

## Resources

- [Dart Documentation](https://dart.dev/guides)
- [DartPad](https://dartpad.dev/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
