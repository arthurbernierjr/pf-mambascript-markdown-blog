---
title: "Dart API Development"
subTitle: "Building APIs with Dart and Shelf"
excerpt: "Dart isn't just for Flutter - build powerful backend APIs too."
featureImage: "/img/dart-api.png"
date: "2026-02-01"
order: 94
---

# Explanation

## Dart for Backend Development

Dart can power server-side applications with frameworks like Shelf, Angel, and Aqueduct. Its async/await model makes it excellent for handling concurrent requests.

### Framework Comparison

| Framework | Type | Best For |
|-----------|------|----------|
| Shelf | Minimal | Microservices |
| Dart Frog | Modern | APIs |
| Angel3 | Full-featured | Large apps |
| Serverpod | Full-stack | Flutter apps |

---

# Demonstration

## Example 1: Shelf Basics

```dart
import 'dart:convert';
import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart';

// Models
class User {
  final int id;
  final String name;
  final String email;

  User({required this.id, required this.name, required this.email});

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
  };

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as int,
    name: json['name'] as String,
    email: json['email'] as String,
  );
}

// In-memory storage
final users = <int, User>{};
var nextId = 1;

// Handlers
Response _jsonResponse(Object data, {int statusCode = 200}) {
  return Response(
    statusCode,
    body: jsonEncode(data),
    headers: {'content-type': 'application/json'},
  );
}

Future<Response> _listUsers(Request request) async {
  final userList = users.values.map((u) => u.toJson()).toList();
  return _jsonResponse({'data': userList});
}

Future<Response> _getUser(Request request, String id) async {
  final userId = int.tryParse(id);
  if (userId == null) {
    return _jsonResponse({'error': 'Invalid ID'}, statusCode: 400);
  }

  final user = users[userId];
  if (user == null) {
    return _jsonResponse({'error': 'User not found'}, statusCode: 404);
  }

  return _jsonResponse({'data': user.toJson()});
}

Future<Response> _createUser(Request request) async {
  final body = await request.readAsString();
  final json = jsonDecode(body) as Map<String, dynamic>;

  final user = User(
    id: nextId++,
    name: json['name'] as String,
    email: json['email'] as String,
  );

  users[user.id] = user;

  return _jsonResponse({'data': user.toJson()}, statusCode: 201);
}

Future<Response> _updateUser(Request request, String id) async {
  final userId = int.tryParse(id);
  if (userId == null || !users.containsKey(userId)) {
    return _jsonResponse({'error': 'User not found'}, statusCode: 404);
  }

  final body = await request.readAsString();
  final json = jsonDecode(body) as Map<String, dynamic>;

  final user = User(
    id: userId,
    name: json['name'] as String,
    email: json['email'] as String,
  );

  users[userId] = user;

  return _jsonResponse({'data': user.toJson()});
}

Future<Response> _deleteUser(Request request, String id) async {
  final userId = int.tryParse(id);
  if (userId == null || !users.containsKey(userId)) {
    return _jsonResponse({'error': 'User not found'}, statusCode: 404);
  }

  users.remove(userId);

  return Response(204);
}

// Router setup
Router createRouter() {
  final router = Router();

  router.get('/api/users', _listUsers);
  router.get('/api/users/<id>', _getUser);
  router.post('/api/users', _createUser);
  router.put('/api/users/<id>', _updateUser);
  router.delete('/api/users/<id>', _deleteUser);

  return router;
}

void main() async {
  final router = createRouter();
  final handler = Pipeline()
      .addMiddleware(logRequests())
      .addHandler(router);

  final server = await shelf_io.serve(handler, 'localhost', 8080);
  print('Server running on http://${server.address.host}:${server.port}');
}
```

## Example 2: Middleware and Error Handling

```dart
import 'dart:convert';
import 'package:shelf/shelf.dart';

// Custom middleware
Middleware corsMiddleware() {
  return (Handler handler) {
    return (Request request) async {
      if (request.method == 'OPTIONS') {
        return Response.ok('', headers: _corsHeaders);
      }

      final response = await handler(request);
      return response.change(headers: _corsHeaders);
    };
  };
}

const _corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization',
};

// Authentication middleware
Middleware authMiddleware() {
  return (Handler handler) {
    return (Request request) async {
      // Skip auth for public routes
      if (request.url.path.startsWith('api/public/')) {
        return handler(request);
      }

      final authHeader = request.headers['authorization'];
      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        return Response(401,
          body: jsonEncode({'error': 'Unauthorized'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final token = authHeader.substring(7);
      final user = await validateToken(token);

      if (user == null) {
        return Response(401,
          body: jsonEncode({'error': 'Invalid token'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Add user to request context
      final updatedRequest = request.change(context: {
        'user': user,
        ...request.context,
      });

      return handler(updatedRequest);
    };
  };
}

// Error handling middleware
Middleware errorHandler() {
  return (Handler handler) {
    return (Request request) async {
      try {
        return await handler(request);
      } on FormatException catch (e) {
        return Response(400,
          body: jsonEncode({'error': 'Invalid request format: ${e.message}'}),
          headers: {'content-type': 'application/json'},
        );
      } on NotFoundException catch (e) {
        return Response(404,
          body: jsonEncode({'error': e.message}),
          headers: {'content-type': 'application/json'},
        );
      } catch (e, stackTrace) {
        print('Error: $e\n$stackTrace');
        return Response(500,
          body: jsonEncode({'error': 'Internal server error'}),
          headers: {'content-type': 'application/json'},
        );
      }
    };
  };
}

// Custom exceptions
class NotFoundException implements Exception {
  final String message;
  NotFoundException(this.message);
}

class ValidationException implements Exception {
  final Map<String, String> errors;
  ValidationException(this.errors);
}

// Logging middleware
Middleware requestLogger() {
  return (Handler handler) {
    return (Request request) async {
      final stopwatch = Stopwatch()..start();

      final response = await handler(request);

      stopwatch.stop();
      print('${request.method} ${request.url} - '
            '${response.statusCode} - ${stopwatch.elapsedMilliseconds}ms');

      return response;
    };
  };
}

// Pipeline setup
Handler createHandler(Router router) {
  return Pipeline()
      .addMiddleware(requestLogger())
      .addMiddleware(corsMiddleware())
      .addMiddleware(errorHandler())
      .addMiddleware(authMiddleware())
      .addHandler(router);
}
```

## Example 3: Service Layer Pattern

```dart
// Repository interface
abstract class Repository<T, ID> {
  Future<T?> findById(ID id);
  Future<List<T>> findAll();
  Future<T> save(T entity);
  Future<void> delete(ID id);
}

// User repository
class UserRepository implements Repository<User, int> {
  final Map<int, User> _storage = {};
  int _nextId = 1;

  @override
  Future<User?> findById(int id) async => _storage[id];

  @override
  Future<List<User>> findAll() async => _storage.values.toList();

  @override
  Future<User> save(User user) async {
    final id = user.id == 0 ? _nextId++ : user.id;
    final savedUser = User(id: id, name: user.name, email: user.email);
    _storage[id] = savedUser;
    return savedUser;
  }

  @override
  Future<void> delete(int id) async => _storage.remove(id);

  Future<User?> findByEmail(String email) async {
    return _storage.values.cast<User?>().firstWhere(
      (u) => u?.email == email,
      orElse: () => null,
    );
  }
}

// Service layer
class UserService {
  final UserRepository _repository;

  UserService(this._repository);

  Future<List<User>> getAllUsers() => _repository.findAll();

  Future<User> getUserById(int id) async {
    final user = await _repository.findById(id);
    if (user == null) {
      throw NotFoundException('User not found');
    }
    return user;
  }

  Future<User> createUser(CreateUserDto dto) async {
    // Validation
    final errors = <String, String>{};
    if (dto.name.isEmpty) errors['name'] = 'Name is required';
    if (!dto.email.contains('@')) errors['email'] = 'Invalid email';

    if (errors.isNotEmpty) {
      throw ValidationException(errors);
    }

    // Check for duplicate email
    final existing = await _repository.findByEmail(dto.email);
    if (existing != null) {
      throw ValidationException({'email': 'Email already in use'});
    }

    final user = User(id: 0, name: dto.name, email: dto.email);
    return _repository.save(user);
  }

  Future<User> updateUser(int id, UpdateUserDto dto) async {
    final existing = await _repository.findById(id);
    if (existing == null) {
      throw NotFoundException('User not found');
    }

    final user = User(
      id: id,
      name: dto.name ?? existing.name,
      email: dto.email ?? existing.email,
    );

    return _repository.save(user);
  }

  Future<void> deleteUser(int id) async {
    final existing = await _repository.findById(id);
    if (existing == null) {
      throw NotFoundException('User not found');
    }
    await _repository.delete(id);
  }
}

// DTOs
class CreateUserDto {
  final String name;
  final String email;

  CreateUserDto({required this.name, required this.email});

  factory CreateUserDto.fromJson(Map<String, dynamic> json) => CreateUserDto(
    name: json['name'] as String? ?? '',
    email: json['email'] as String? ?? '',
  );
}

class UpdateUserDto {
  final String? name;
  final String? email;

  UpdateUserDto({this.name, this.email});

  factory UpdateUserDto.fromJson(Map<String, dynamic> json) => UpdateUserDto(
    name: json['name'] as String?,
    email: json['email'] as String?,
  );
}
```

## Example 4: Dart Frog Framework

```dart
// routes/index.dart
import 'package:dart_frog/dart_frog.dart';

Response onRequest(RequestContext context) {
  return Response.json({'message': 'Welcome to the API'});
}

// routes/users/index.dart
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';

Future<Response> onRequest(RequestContext context) async {
  final userService = context.read<UserService>();

  switch (context.request.method) {
    case HttpMethod.get:
      final users = await userService.getAllUsers();
      return Response.json({'data': users.map((u) => u.toJson()).toList()});

    case HttpMethod.post:
      final body = await context.request.json() as Map<String, dynamic>;
      final dto = CreateUserDto.fromJson(body);
      final user = await userService.createUser(dto);
      return Response.json(
        {'data': user.toJson()},
        statusCode: HttpStatus.created,
      );

    default:
      return Response(statusCode: HttpStatus.methodNotAllowed);
  }
}

// routes/users/[id].dart
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final userService = context.read<UserService>();
  final userId = int.tryParse(id);

  if (userId == null) {
    return Response.json(
      {'error': 'Invalid ID'},
      statusCode: HttpStatus.badRequest,
    );
  }

  switch (context.request.method) {
    case HttpMethod.get:
      try {
        final user = await userService.getUserById(userId);
        return Response.json({'data': user.toJson()});
      } on NotFoundException {
        return Response.json(
          {'error': 'User not found'},
          statusCode: HttpStatus.notFound,
        );
      }

    case HttpMethod.put:
      final body = await context.request.json() as Map<String, dynamic>;
      final dto = UpdateUserDto.fromJson(body);
      final user = await userService.updateUser(userId, dto);
      return Response.json({'data': user.toJson()});

    case HttpMethod.delete:
      await userService.deleteUser(userId);
      return Response(statusCode: HttpStatus.noContent);

    default:
      return Response(statusCode: HttpStatus.methodNotAllowed);
  }
}

// main.dart (middleware setup)
import 'package:dart_frog/dart_frog.dart';

Handler middleware(Handler handler) {
  return handler
      .use(requestLogger())
      .use(provider<UserService>((context) => UserService(UserRepository())));
}
```

## Example 5: Database Integration

```dart
import 'package:postgres/postgres.dart';

// Database connection
class Database {
  late PostgreSQLConnection _connection;

  Future<void> connect() async {
    _connection = PostgreSQLConnection(
      'localhost',
      5432,
      'mydb',
      username: 'user',
      password: 'password',
    );
    await _connection.open();
  }

  PostgreSQLConnection get connection => _connection;

  Future<void> close() => _connection.close();
}

// User repository with PostgreSQL
class PostgresUserRepository implements Repository<User, int> {
  final Database _db;

  PostgresUserRepository(this._db);

  @override
  Future<User?> findById(int id) async {
    final results = await _db.connection.query(
      'SELECT id, name, email, created_at FROM users WHERE id = @id',
      substitutionValues: {'id': id},
    );

    if (results.isEmpty) return null;

    return _mapRow(results.first);
  }

  @override
  Future<List<User>> findAll() async {
    final results = await _db.connection.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC',
    );

    return results.map(_mapRow).toList();
  }

  @override
  Future<User> save(User user) async {
    if (user.id == 0) {
      // Insert
      final results = await _db.connection.query(
        '''
        INSERT INTO users (name, email)
        VALUES (@name, @email)
        RETURNING id, name, email, created_at
        ''',
        substitutionValues: {
          'name': user.name,
          'email': user.email,
        },
      );
      return _mapRow(results.first);
    } else {
      // Update
      final results = await _db.connection.query(
        '''
        UPDATE users
        SET name = @name, email = @email
        WHERE id = @id
        RETURNING id, name, email, created_at
        ''',
        substitutionValues: {
          'id': user.id,
          'name': user.name,
          'email': user.email,
        },
      );
      return _mapRow(results.first);
    }
  }

  @override
  Future<void> delete(int id) async {
    await _db.connection.query(
      'DELETE FROM users WHERE id = @id',
      substitutionValues: {'id': id},
    );
  }

  User _mapRow(PostgreSQLResultRow row) {
    return User(
      id: row[0] as int,
      name: row[1] as String,
      email: row[2] as String,
    );
  }
}
```

## Example 6: Testing

```dart
import 'package:test/test.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

void main() {
  late UserRepository repository;
  late UserService service;
  late Router router;

  setUp(() {
    repository = UserRepository();
    service = UserService(repository);
    router = createRouter(service);
  });

  group('User API', () {
    test('GET /api/users returns empty list initially', () async {
      final request = Request('GET', Uri.parse('http://localhost/api/users'));
      final response = await router(request);

      expect(response.statusCode, equals(200));

      final body = jsonDecode(await response.readAsString());
      expect(body['data'], isEmpty);
    });

    test('POST /api/users creates a user', () async {
      final request = Request(
        'POST',
        Uri.parse('http://localhost/api/users'),
        body: jsonEncode({'name': 'Arthur', 'email': 'art@bpc.com'}),
        headers: {'content-type': 'application/json'},
      );
      final response = await router(request);

      expect(response.statusCode, equals(201));

      final body = jsonDecode(await response.readAsString());
      expect(body['data']['name'], equals('Arthur'));
      expect(body['data']['id'], isNotNull);
    });

    test('GET /api/users/:id returns user', () async {
      // Create user first
      await service.createUser(CreateUserDto(name: 'Test', email: 'test@example.com'));

      final request = Request('GET', Uri.parse('http://localhost/api/users/1'));
      final response = await router(request);

      expect(response.statusCode, equals(200));
    });

    test('GET /api/users/:id returns 404 for missing user', () async {
      final request = Request('GET', Uri.parse('http://localhost/api/users/999'));
      final response = await router(request);

      expect(response.statusCode, equals(404));
    });

    test('DELETE /api/users/:id removes user', () async {
      await service.createUser(CreateUserDto(name: 'Test', email: 'test@example.com'));

      final request = Request('DELETE', Uri.parse('http://localhost/api/users/1'));
      final response = await router(request);

      expect(response.statusCode, equals(204));

      // Verify deletion
      final users = await service.getAllUsers();
      expect(users, isEmpty);
    });
  });

  group('UserService', () {
    test('createUser validates email', () async {
      expect(
        () => service.createUser(CreateUserDto(name: 'Test', email: 'invalid')),
        throwsA(isA<ValidationException>()),
      );
    });

    test('createUser prevents duplicate emails', () async {
      await service.createUser(CreateUserDto(name: 'First', email: 'test@example.com'));

      expect(
        () => service.createUser(CreateUserDto(name: 'Second', email: 'test@example.com')),
        throwsA(isA<ValidationException>()),
      );
    });
  });
}
```

**Key Takeaways:**
- Shelf provides minimal, flexible API building
- Middleware pattern for cross-cutting concerns
- Service layer for business logic
- Dart Frog offers file-based routing
- Testing is straightforward with Dart

---

# Imitation

### Challenge 1: Build a Todo API

**Task:** Create a complete CRUD API for todos with filtering.

<details>
<summary>Solution</summary>

```dart
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

class Todo {
  final int id;
  String title;
  bool completed;

  Todo({required this.id, required this.title, this.completed = false});

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'completed': completed,
  };
}

class TodoService {
  final _todos = <int, Todo>{};
  int _nextId = 1;

  List<Todo> getAll({bool? completed}) {
    var todos = _todos.values.toList();
    if (completed != null) {
      todos = todos.where((t) => t.completed == completed).toList();
    }
    return todos;
  }

  Todo? getById(int id) => _todos[id];

  Todo create(String title) {
    final todo = Todo(id: _nextId++, title: title);
    _todos[todo.id] = todo;
    return todo;
  }

  Todo? update(int id, {String? title, bool? completed}) {
    final todo = _todos[id];
    if (todo == null) return null;

    if (title != null) todo.title = title;
    if (completed != null) todo.completed = completed;

    return todo;
  }

  bool delete(int id) => _todos.remove(id) != null;
}

Router createTodoRouter(TodoService service) {
  final router = Router();

  router.get('/api/todos', (Request request) {
    final completedParam = request.url.queryParameters['completed'];
    final completed = completedParam == null
        ? null
        : completedParam == 'true';

    final todos = service.getAll(completed: completed);
    return Response.ok(
      jsonEncode({'data': todos.map((t) => t.toJson()).toList()}),
      headers: {'content-type': 'application/json'},
    );
  });

  router.post('/api/todos', (Request request) async {
    final body = jsonDecode(await request.readAsString());
    final todo = service.create(body['title']);
    return Response(201,
      body: jsonEncode({'data': todo.toJson()}),
      headers: {'content-type': 'application/json'},
    );
  });

  router.put('/api/todos/<id>', (Request request, String id) async {
    final todoId = int.tryParse(id);
    if (todoId == null) {
      return Response(400, body: jsonEncode({'error': 'Invalid ID'}));
    }

    final body = jsonDecode(await request.readAsString());
    final todo = service.update(
      todoId,
      title: body['title'],
      completed: body['completed'],
    );

    if (todo == null) {
      return Response(404, body: jsonEncode({'error': 'Not found'}));
    }

    return Response.ok(
      jsonEncode({'data': todo.toJson()}),
      headers: {'content-type': 'application/json'},
    );
  });

  router.delete('/api/todos/<id>', (Request request, String id) {
    final todoId = int.tryParse(id);
    if (todoId == null || !service.delete(todoId)) {
      return Response(404);
    }
    return Response(204);
  });

  return router;
}
```

</details>

---

# Practice

### Exercise 1: Add Authentication
**Difficulty:** Intermediate

Add JWT authentication:
- Login endpoint
- Auth middleware
- Protected routes

### Exercise 2: Add WebSocket Support
**Difficulty:** Advanced

Implement real-time updates:
- WebSocket connections
- Broadcast changes
- Connection management

---

## Summary

**What you learned:**
- Shelf for API development
- Middleware patterns
- Service layer architecture
- Database integration
- Testing APIs

**Next Steps:**
- Read: [Dart OOP](/api/guides/dart/oop)
- Practice: Build a Flutter app with this API
- Explore: Serverpod

---

## Resources

- [Shelf Package](https://pub.dev/packages/shelf)
- [Dart Frog](https://dartfrog.vgv.dev/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
