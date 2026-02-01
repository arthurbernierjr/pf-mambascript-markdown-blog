---
title: "Dart Web Routing"
subTitle: "Building APIs with Shelf and Dart Frog"
excerpt: "Server-side Dart: fast, modern, and type-safe."
featureImage: "/img/dart-routing.png"
date: "2026-02-01"
order: 701
---

# Explanation

## Server-Side Dart

Dart isn't just for Flutter. With frameworks like Shelf and Dart Frog, you can build fast, type-safe backend APIs that share code with your Flutter apps.

### Key Concepts

- **Shelf**: Minimal web server middleware
- **Dart Frog**: Full-featured API framework
- **Middleware**: Request/response pipeline
- **Handlers**: Process incoming requests

### Framework Comparison

| Feature | Shelf | Dart Frog |
|---------|-------|-----------|
| Type | Middleware | Full framework |
| Routing | Manual | File-based |
| CLI | None | Built-in |
| Learning | Easy | Easy |

---

# Demonstration

## Example 1: Shelf Basics

```dart
import 'dart:convert';
import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
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
    id: json['id'],
    name: json['name'],
    email: json['email'],
  );
}

// In-memory store
final users = <int, User>{};
var nextId = 1;

// Handlers
Response listUsers(Request request) {
  final userList = users.values.map((u) => u.toJson()).toList();
  return Response.ok(
    jsonEncode({'data': userList}),
    headers: {'content-type': 'application/json'},
  );
}

Response getUser(Request request, String id) {
  final userId = int.tryParse(id);
  if (userId == null || !users.containsKey(userId)) {
    return Response.notFound(
      jsonEncode({'error': 'User not found'}),
      headers: {'content-type': 'application/json'},
    );
  }

  return Response.ok(
    jsonEncode({'data': users[userId]!.toJson()}),
    headers: {'content-type': 'application/json'},
  );
}

Future<Response> createUser(Request request) async {
  try {
    final body = await request.readAsString();
    final data = jsonDecode(body) as Map<String, dynamic>;

    if (data['name'] == null || data['email'] == null) {
      return Response(
        400,
        body: jsonEncode({'error': 'Name and email required'}),
        headers: {'content-type': 'application/json'},
      );
    }

    final user = User(
      id: nextId++,
      name: data['name'],
      email: data['email'],
    );

    users[user.id] = user;

    return Response(
      201,
      body: jsonEncode({'data': user.toJson()}),
      headers: {'content-type': 'application/json'},
    );
  } catch (e) {
    return Response(
      400,
      body: jsonEncode({'error': 'Invalid JSON'}),
      headers: {'content-type': 'application/json'},
    );
  }
}

Future<Response> updateUser(Request request, String id) async {
  final userId = int.tryParse(id);
  if (userId == null || !users.containsKey(userId)) {
    return Response.notFound(
      jsonEncode({'error': 'User not found'}),
      headers: {'content-type': 'application/json'},
    );
  }

  final body = await request.readAsString();
  final data = jsonDecode(body) as Map<String, dynamic>;

  final existing = users[userId]!;
  final updated = User(
    id: userId,
    name: data['name'] ?? existing.name,
    email: data['email'] ?? existing.email,
  );

  users[userId] = updated;

  return Response.ok(
    jsonEncode({'data': updated.toJson()}),
    headers: {'content-type': 'application/json'},
  );
}

Response deleteUser(Request request, String id) {
  final userId = int.tryParse(id);
  if (userId == null || !users.containsKey(userId)) {
    return Response.notFound(
      jsonEncode({'error': 'User not found'}),
      headers: {'content-type': 'application/json'},
    );
  }

  users.remove(userId);
  return Response(204);
}

void main() async {
  final router = Router()
    ..get('/users', listUsers)
    ..get('/users/<id>', getUser)
    ..post('/users', createUser)
    ..put('/users/<id>', updateUser)
    ..delete('/users/<id>', deleteUser);

  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(corsMiddleware())
      .addHandler(router);

  final server = await io.serve(handler, 'localhost', 8080);
  print('Server running on http://${server.address.host}:${server.port}');
}

// CORS Middleware
Middleware corsMiddleware() {
  return (Handler innerHandler) {
    return (Request request) async {
      if (request.method == 'OPTIONS') {
        return Response.ok('', headers: _corsHeaders);
      }

      final response = await innerHandler(request);
      return response.change(headers: _corsHeaders);
    };
  };
}

const _corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

## Example 2: Dart Frog

```dart
// routes/index.dart
import 'package:dart_frog/dart_frog.dart';

Response onRequest(RequestContext context) {
  return Response.json({'message': 'Welcome to the API'});
}

// routes/users/index.dart
import 'package:dart_frog/dart_frog.dart';

Future<Response> onRequest(RequestContext context) async {
  final userRepository = context.read<UserRepository>();

  return switch (context.request.method) {
    HttpMethod.get => _listUsers(context, userRepository),
    HttpMethod.post => _createUser(context, userRepository),
    _ => Response(statusCode: 405),
  };
}

Response _listUsers(RequestContext context, UserRepository repo) {
  final users = repo.findAll();
  return Response.json({'data': users.map((u) => u.toJson()).toList()});
}

Future<Response> _createUser(
  RequestContext context,
  UserRepository repo,
) async {
  final body = await context.request.json() as Map<String, dynamic>;

  if (body['name'] == null || body['email'] == null) {
    return Response.json(
      {'error': 'Name and email required'},
      statusCode: 400,
    );
  }

  final user = repo.create(
    name: body['name'] as String,
    email: body['email'] as String,
  );

  return Response.json({'data': user.toJson()}, statusCode: 201);
}

// routes/users/[id].dart
import 'package:dart_frog/dart_frog.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final userRepository = context.read<UserRepository>();
  final userId = int.tryParse(id);

  if (userId == null) {
    return Response.json({'error': 'Invalid ID'}, statusCode: 400);
  }

  return switch (context.request.method) {
    HttpMethod.get => _getUser(userRepository, userId),
    HttpMethod.put => _updateUser(context, userRepository, userId),
    HttpMethod.delete => _deleteUser(userRepository, userId),
    _ => Response(statusCode: 405),
  };
}

Response _getUser(UserRepository repo, int id) {
  final user = repo.findById(id);
  if (user == null) {
    return Response.json({'error': 'User not found'}, statusCode: 404);
  }
  return Response.json({'data': user.toJson()});
}

Future<Response> _updateUser(
  RequestContext context,
  UserRepository repo,
  int id,
) async {
  final body = await context.request.json() as Map<String, dynamic>;
  final user = repo.update(id, body);

  if (user == null) {
    return Response.json({'error': 'User not found'}, statusCode: 404);
  }

  return Response.json({'data': user.toJson()});
}

Response _deleteUser(UserRepository repo, int id) {
  final deleted = repo.delete(id);
  if (!deleted) {
    return Response.json({'error': 'User not found'}, statusCode: 404);
  }
  return Response(statusCode: 204);
}

// main.dart
import 'package:dart_frog/dart_frog.dart';

Handler middleware(Handler handler) {
  return handler
      .use(requestLogger())
      .use(provider<UserRepository>((_) => UserRepository()));
}
```

## Example 3: Middleware and Dependencies

```dart
import 'package:shelf/shelf.dart';

// Logging middleware
Middleware logRequests() {
  return (Handler innerHandler) {
    return (Request request) async {
      final stopwatch = Stopwatch()..start();

      final response = await innerHandler(request);

      stopwatch.stop();
      print('[${response.statusCode}] ${request.method} ${request.url} - ${stopwatch.elapsedMilliseconds}ms');

      return response;
    };
  };
}

// Auth middleware
Middleware authMiddleware() {
  return (Handler innerHandler) {
    return (Request request) async {
      // Skip auth for public routes
      if (request.url.path.startsWith('public/')) {
        return innerHandler(request);
      }

      final authHeader = request.headers['authorization'];

      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        return Response(
          401,
          body: jsonEncode({'error': 'Unauthorized'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final token = authHeader.substring(7);

      try {
        final userId = validateToken(token);
        // Add user to request context
        final updatedRequest = request.change(
          context: {...request.context, 'userId': userId},
        );
        return innerHandler(updatedRequest);
      } catch (e) {
        return Response(
          401,
          body: jsonEncode({'error': 'Invalid token'}),
          headers: {'content-type': 'application/json'},
        );
      }
    };
  };
}

int validateToken(String token) {
  // Validate JWT and return user ID
  return 1;
}

// Rate limiting middleware
Middleware rateLimiter({int maxRequests = 100, Duration window = const Duration(minutes: 1)}) {
  final requests = <String, List<DateTime>>{};

  return (Handler innerHandler) {
    return (Request request) async {
      final ip = request.headers['x-forwarded-for'] ?? 'unknown';
      final now = DateTime.now();
      final windowStart = now.subtract(window);

      // Clean old requests
      requests[ip] = (requests[ip] ?? [])
          .where((time) => time.isAfter(windowStart))
          .toList();

      if (requests[ip]!.length >= maxRequests) {
        return Response(
          429,
          body: jsonEncode({'error': 'Rate limit exceeded'}),
          headers: {'content-type': 'application/json'},
        );
      }

      requests[ip]!.add(now);

      return innerHandler(request);
    };
  };
}

// Compose middleware
void main() async {
  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(rateLimiter())
      .addMiddleware(corsMiddleware())
      .addMiddleware(authMiddleware())
      .addHandler(router);

  await io.serve(handler, 'localhost', 8080);
}
```

**Key Takeaways:**
- Shelf provides flexible middleware composition
- Dart Frog offers file-based routing
- Both are type-safe and fast
- Share code between frontend and backend
- Middleware handles cross-cutting concerns

---

# Imitation

### Challenge 1: Add Validation

**Task:** Create a validation middleware for request bodies.

<details>
<summary>Solution</summary>

```dart
typedef Validator = String? Function(dynamic value);

class ValidationSchema {
  final Map<String, List<Validator>> rules;

  ValidationSchema(this.rules);

  Map<String, List<String>>? validate(Map<String, dynamic> data) {
    final errors = <String, List<String>>{};

    for (final field in rules.keys) {
      final value = data[field];
      final fieldErrors = <String>[];

      for (final validator in rules[field]!) {
        final error = validator(value);
        if (error != null) fieldErrors.add(error);
      }

      if (fieldErrors.isNotEmpty) {
        errors[field] = fieldErrors;
      }
    }

    return errors.isEmpty ? null : errors;
  }
}

// Validators
Validator required() => (value) =>
    value == null || (value is String && value.isEmpty)
        ? 'This field is required'
        : null;

Validator minLength(int min) => (value) =>
    value is String && value.length < min
        ? 'Must be at least $min characters'
        : null;

Validator email() => (value) =>
    value is String && !RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)
        ? 'Invalid email address'
        : null;

// Usage
final userSchema = ValidationSchema({
  'name': [required(), minLength(2)],
  'email': [required(), email()],
});

Future<Response> createUser(Request request) async {
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final errors = userSchema.validate(body);

  if (errors != null) {
    return Response(
      400,
      body: jsonEncode({'error': 'Validation failed', 'details': errors}),
      headers: {'content-type': 'application/json'},
    );
  }

  // Create user...
}
```

</details>

---

# Practice

### Exercise 1: Build a Todo API
**Difficulty:** Intermediate

Create a complete Todo API with Dart Frog:
- CRUD operations
- User authentication
- Todo ownership

### Exercise 2: WebSocket Chat
**Difficulty:** Advanced

Implement real-time chat:
- WebSocket connections
- Room-based messaging
- User presence

---

## Summary

**What you learned:**
- Shelf for minimal APIs
- Dart Frog for full-featured APIs
- Middleware composition
- Request validation
- Authentication patterns

**Next Steps:**
- Read: [Dart OOP](/api/guides/dart/oop)
- Practice: Build a REST API
- Explore: Share code with Flutter

---

## Resources

- [Shelf Package](https://pub.dev/packages/shelf)
- [Dart Frog](https://dartfrog.vgv.dev/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
