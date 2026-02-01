---
title: "PHP Routing"
subTitle: "Building Web Applications with PHP"
excerpt: "From simple scripts to elegant frameworks."
featureImage: "/img/php-routing.png"
date: "2026-02-01"
order: 301
---

# Explanation

## Web Routing in PHP

PHP was born for the web. While you can handle routing manually with `$_SERVER['REQUEST_URI']`, frameworks like Laravel and Slim make it elegant. Let's explore both approaches.

### Key Concepts

- **Request**: Incoming HTTP request (method, path, headers)
- **Response**: What you send back (HTML, JSON, redirect)
- **Middleware**: Code that runs before/after route handlers
- **Controller**: Class that groups related route handlers

### Native PHP vs Framework

| Feature | Native PHP | Laravel/Slim |
|---------|-----------|--------------|
| Setup | None | Composer |
| Routing | Manual | Elegant |
| Middleware | Manual | Built-in |
| Validation | Manual | Built-in |

---

# Demonstration

## Example 1: Native PHP Routing

```php
<?php
// index.php - Simple router

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Helper functions
function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_json_body(): array {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

// In-memory "database"
$users = [
    1 => ['id' => 1, 'name' => 'Arthur', 'email' => 'art@bpc.com'],
    2 => ['id' => 2, 'name' => 'Sarah', 'email' => 'sarah@example.com'],
];

// Route handling
switch (true) {
    // GET /users
    case $method === 'GET' && $path === '/users':
        json_response(['data' => array_values($users)]);
        break;

    // GET /users/{id}
    case $method === 'GET' && preg_match('/^\/users\/(\d+)$/', $path, $matches):
        $id = (int) $matches[1];
        if (!isset($users[$id])) {
            json_response(['error' => 'User not found'], 404);
        }
        json_response(['data' => $users[$id]]);
        break;

    // POST /users
    case $method === 'POST' && $path === '/users':
        $data = get_json_body();
        if (empty($data['name']) || empty($data['email'])) {
            json_response(['error' => 'Name and email required'], 400);
        }
        $id = max(array_keys($users)) + 1;
        $users[$id] = [
            'id' => $id,
            'name' => $data['name'],
            'email' => $data['email']
        ];
        json_response(['data' => $users[$id]], 201);
        break;

    // Default - 404
    default:
        json_response(['error' => 'Not found'], 404);
}
```

## Example 2: Slim Framework

```php
<?php
// composer require slim/slim slim/psr7

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// In-memory storage
$users = [];
$nextId = 1;

// GET /users
$app->get('/users', function (Request $request, Response $response) use (&$users) {
    $response->getBody()->write(json_encode(['data' => array_values($users)]));
    return $response->withHeader('Content-Type', 'application/json');
});

// GET /users/{id}
$app->get('/users/{id}', function (Request $request, Response $response, array $args) use (&$users) {
    $id = (int) $args['id'];

    if (!isset($users[$id])) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(404);
    }

    $response->getBody()->write(json_encode(['data' => $users[$id]]));
    return $response->withHeader('Content-Type', 'application/json');
});

// POST /users
$app->post('/users', function (Request $request, Response $response) use (&$users, &$nextId) {
    $data = $request->getParsedBody();

    if (empty($data['name']) || empty($data['email'])) {
        $response->getBody()->write(json_encode(['error' => 'Name and email required']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(400);
    }

    $user = [
        'id' => $nextId++,
        'name' => $data['name'],
        'email' => $data['email']
    ];
    $users[$user['id']] = $user;

    $response->getBody()->write(json_encode(['data' => $user]));
    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withStatus(201);
});

// PUT /users/{id}
$app->put('/users/{id}', function (Request $request, Response $response, array $args) use (&$users) {
    $id = (int) $args['id'];

    if (!isset($users[$id])) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(404);
    }

    $data = $request->getParsedBody();
    $users[$id] = array_merge($users[$id], $data);

    $response->getBody()->write(json_encode(['data' => $users[$id]]));
    return $response->withHeader('Content-Type', 'application/json');
});

// DELETE /users/{id}
$app->delete('/users/{id}', function (Request $request, Response $response, array $args) use (&$users) {
    $id = (int) $args['id'];

    if (!isset($users[$id])) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(404);
    }

    unset($users[$id]);
    return $response->withStatus(204);
});

$app->run();
```

## Example 3: Laravel Routes

```php
<?php
// routes/api.php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Resource routes (generates all CRUD routes)
Route::apiResource('users', UserController::class);

// Custom routes
Route::get('/users/search', [UserController::class, 'search']);
Route::post('/users/{user}/activate', [UserController::class, 'activate']);

// Route groups
Route::prefix('admin')->middleware('auth:admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
});

// app/Http/Controllers/UserController.php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role, fn($q, $role) => $q->where('role', $role))
            ->paginate($request->per_page ?? 10);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8'
        ]);

        $user = User::create($validated);

        return response()->json(['data' => $user], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['data' => $user]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id
        ]);

        $user->update($validated);

        return response()->json(['data' => $user]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(null, 204);
    }

    public function search(Request $request): JsonResponse
    {
        $users = User::where('name', 'like', "%{$request->q}%")
            ->orWhere('email', 'like', "%{$request->q}%")
            ->limit(20)
            ->get();

        return response()->json(['data' => $users]);
    }
}
```

## Example 4: Middleware

```php
<?php
// Slim middleware

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response;

// Logging middleware
$loggingMiddleware = function (Request $request, Handler $handler) {
    $start = microtime(true);

    $response = $handler->handle($request);

    $duration = microtime(true) - $start;
    error_log(sprintf(
        '[%s] %s %s - %.4fs',
        date('Y-m-d H:i:s'),
        $request->getMethod(),
        $request->getUri()->getPath(),
        $duration
    ));

    return $response;
};

// Auth middleware
$authMiddleware = function (Request $request, Handler $handler) {
    $token = $request->getHeaderLine('Authorization');

    if (!$token || !str_starts_with($token, 'Bearer ')) {
        $response = new Response();
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }

    // Validate token and set user
    $request = $request->withAttribute('userId', 1);

    return $handler->handle($request);
};

// CORS middleware
$corsMiddleware = function (Request $request, Handler $handler) {
    $response = $handler->handle($request);

    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Apply middleware
$app->add($loggingMiddleware);
$app->add($corsMiddleware);

// Apply to specific routes
$app->group('/api', function ($group) {
    $group->get('/profile', function ($request, $response) {
        $userId = $request->getAttribute('userId');
        // ...
    });
})->add($authMiddleware);
```

**Key Takeaways:**
- Native PHP works but requires boilerplate
- Slim is lightweight and PSR-compliant
- Laravel provides full-featured routing
- Middleware handles cross-cutting concerns
- Use route groups for organization

---

# Imitation

### Challenge 1: Add Query Parameters

**Task:** Add pagination and filtering to the users endpoint.

<details>
<summary>Solution</summary>

```php
<?php
$app->get('/users', function (Request $request, Response $response) use (&$users) {
    $params = $request->getQueryParams();

    $page = (int) ($params['page'] ?? 1);
    $perPage = (int) ($params['per_page'] ?? 10);
    $role = $params['role'] ?? null;

    $filtered = array_values($users);

    if ($role) {
        $filtered = array_filter($filtered, fn($u) => $u['role'] === $role);
    }

    $total = count($filtered);
    $offset = ($page - 1) * $perPage;
    $paginated = array_slice($filtered, $offset, $perPage);

    $response->getBody()->write(json_encode([
        'data' => $paginated,
        'meta' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => ceil($total / $perPage)
        ]
    ]));

    return $response->withHeader('Content-Type', 'application/json');
});
```

</details>

### Challenge 2: Create a Router Class

**Task:** Build a simple Router class that maps paths to handlers.

<details>
<summary>Solution</summary>

```php
<?php
class Router {
    private array $routes = [];

    public function get(string $path, callable $handler): self {
        $this->routes['GET'][$path] = $handler;
        return $this;
    }

    public function post(string $path, callable $handler): self {
        $this->routes['POST'][$path] = $handler;
        return $this;
    }

    public function dispatch(string $method, string $path): mixed {
        // Check exact match
        if (isset($this->routes[$method][$path])) {
            return $this->routes[$method][$path]([]);
        }

        // Check pattern match
        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $route);
            if (preg_match("#^$pattern$#", $path, $matches)) {
                return $handler(array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));
            }
        }

        http_response_code(404);
        return ['error' => 'Not found'];
    }
}

// Usage
$router = new Router();

$router->get('/users', fn($params) => ['users' => []]);
$router->get('/users/{id}', fn($params) => ['user' => $params['id']]);
$router->post('/users', fn($params) => ['created' => true]);

$result = $router->dispatch($_SERVER['REQUEST_METHOD'], $path);
echo json_encode($result);
```

</details>

---

# Practice

### Exercise 1: Blog API
**Difficulty:** Intermediate

Build a blog API with:
- Posts CRUD
- Comments on posts
- Categories/tags
- Search functionality

### Exercise 2: Authentication System
**Difficulty:** Advanced

Create auth endpoints:
- Register with validation
- Login with JWT tokens
- Password reset flow
- Protected routes

---

## Summary

**What you learned:**
- Native PHP routing
- Slim framework basics
- Laravel routing patterns
- Middleware implementation
- Route groups and parameters

**Next Steps:**
- Read: [PHP OOP](/api/guides/php/oop)
- Practice: Build a complete REST API
- Explore: Laravel documentation

---

## Resources

- [Slim Framework](https://www.slimframework.com/)
- [Laravel Routing](https://laravel.com/docs/routing)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
