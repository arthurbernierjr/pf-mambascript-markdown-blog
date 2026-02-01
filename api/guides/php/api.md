---
title: "PHP API Development"
subTitle: "Building Modern APIs with PHP"
excerpt: "PHP powers the web - learn to build robust APIs with it."
featureImage: "/img/php-api.png"
date: "2026-02-01"
order: 54
---

# Explanation

## PHP API Frameworks

PHP has evolved into a powerful language for API development. Modern frameworks like Laravel and Slim make building APIs straightforward and maintainable.

### Framework Comparison

| Feature | Laravel | Slim | Symfony |
|---------|---------|------|---------|
| Learning Curve | Moderate | Low | High |
| Features | Full-stack | Minimal | Enterprise |
| Performance | Good | Fast | Good |
| Best For | Most apps | Microservices | Large apps |

---

# Demonstration

## Example 1: Laravel API Basics

```php
<?php
// routes/api.php
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PostController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('posts', PostController::class);
        Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
        Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    });
});

// app/Http/Controllers/Api/UserController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->role, fn($q, $role) => $q->where('role', $role))
            ->when($request->search, fn($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )
            ->paginate($request->per_page ?? 15);

        return UserResource::collection($users);
    }

    public function store(UserRequest $request)
    {
        $user = User::create($request->validated());

        return new UserResource($user);
    }

    public function show(User $user)
    {
        return new UserResource($user->load('posts', 'comments'));
    }

    public function update(UserRequest $request, User $user)
    {
        $user->update($request->validated());

        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->noContent();
    }
}
```

## Example 2: API Resources and Collections

```php
<?php
// app/Http/Resources/UserResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            'created_at' => $this->created_at->toISOString(),

            // Conditional attributes
            'email_verified_at' => $this->when(
                $request->user()?->isAdmin(),
                $this->email_verified_at
            ),

            // Relationships
            'posts' => PostResource::collection($this->whenLoaded('posts')),
            'posts_count' => $this->when(
                $this->posts_count !== null,
                $this->posts_count
            ),

            // Links
            'links' => [
                'self' => route('users.show', $this->id),
                'posts' => route('users.posts', $this->id),
            ],
        ];
    }

    public function with(Request $request): array
    {
        return [
            'meta' => [
                'version' => '1.0',
            ],
        ];
    }
}

// app/Http/Resources/PostResource.php
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => str($this->body)->limit(150),
            'body' => $this->when(
                $request->routeIs('posts.show'),
                $this->body
            ),
            'published_at' => $this->published_at?->toISOString(),
            'reading_time' => $this->reading_time,

            'author' => new UserResource($this->whenLoaded('author')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'comments_count' => $this->whenCounted('comments'),
        ];
    }
}

// app/Http/Resources/UserCollection.php
class UserCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->total(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
            ],
            'links' => [
                'first' => $this->url(1),
                'last' => $this->url($this->lastPage()),
                'prev' => $this->previousPageUrl(),
                'next' => $this->nextPageUrl(),
            ],
        ];
    }
}
```

## Example 3: Authentication with Sanctum

```php
<?php
// app/Http/Controllers/Api/AuthController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke previous tokens (optional)
        $user->tokens()->delete();

        $token = $user->createToken('auth-token', $this->getAbilities($user))
                      ->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('posts'));
    }

    private function getAbilities(User $user): array
    {
        $abilities = ['read'];

        if ($user->isAdmin()) {
            $abilities = array_merge($abilities, ['create', 'update', 'delete']);
        }

        return $abilities;
    }
}

// Middleware for ability checking
// app/Http/Middleware/CheckAbility.php
class CheckAbility
{
    public function handle(Request $request, Closure $next, string $ability)
    {
        if (!$request->user()->tokenCan($ability)) {
            abort(403, 'Insufficient permissions');
        }

        return $next($request);
    }
}

// Usage in routes
Route::middleware(['auth:sanctum', 'ability:delete'])
    ->delete('/posts/{post}', [PostController::class, 'destroy']);
```

## Example 4: Slim Framework API

```php
<?php
// public/index.php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Middleware
$app->add(function (Request $request, $handler): Response {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withHeader('Access-Control-Allow-Origin', '*');
});

// Routes
$app->get('/api/users', function (Request $request, Response $response) {
    $users = Database::query('SELECT * FROM users');

    $response->getBody()->write(json_encode([
        'data' => $users
    ]));

    return $response;
});

$app->get('/api/users/{id}', function (Request $request, Response $response, array $args) {
    $user = Database::query('SELECT * FROM users WHERE id = ?', [$args['id']]);

    if (!$user) {
        return $response
            ->withStatus(404)
            ->getBody()
            ->write(json_encode(['error' => 'User not found']));
    }

    $response->getBody()->write(json_encode(['data' => $user]));
    return $response;
});

$app->post('/api/users', function (Request $request, Response $response) {
    $data = $request->getParsedBody();

    // Validation
    $errors = validate($data, [
        'name' => 'required|min:2',
        'email' => 'required|email|unique:users',
    ]);

    if ($errors) {
        $response->getBody()->write(json_encode(['errors' => $errors]));
        return $response->withStatus(422);
    }

    $id = Database::insert('users', $data);
    $user = Database::find('users', $id);

    $response->getBody()->write(json_encode(['data' => $user]));
    return $response->withStatus(201);
});

$app->put('/api/users/{id}', function (Request $request, Response $response, array $args) {
    $data = $request->getParsedBody();

    Database::update('users', $args['id'], $data);
    $user = Database::find('users', $args['id']);

    $response->getBody()->write(json_encode(['data' => $user]));
    return $response;
});

$app->delete('/api/users/{id}', function (Request $request, Response $response, array $args) {
    Database::delete('users', $args['id']);
    return $response->withStatus(204);
});

$app->run();
```

## Example 5: Error Handling

```php
<?php
// app/Exceptions/Handler.php
namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $e)
    {
        if ($request->expectsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException($request, Throwable $e)
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'The given data was invalid.',
                    'details' => $e->errors(),
                ],
            ], 422);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated.',
                ],
            ], 401);
        }

        if ($e instanceof HttpException) {
            return response()->json([
                'error' => [
                    'code' => $this->getErrorCode($e->getStatusCode()),
                    'message' => $e->getMessage() ?: 'An error occurred.',
                ],
            ], $e->getStatusCode());
        }

        // Log the actual error
        report($e);

        // Return generic error in production
        return response()->json([
            'error' => [
                'code' => 'SERVER_ERROR',
                'message' => config('app.debug')
                    ? $e->getMessage()
                    : 'An unexpected error occurred.',
            ],
        ], 500);
    }

    private function getErrorCode(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            422 => 'UNPROCESSABLE_ENTITY',
            429 => 'TOO_MANY_REQUESTS',
            default => 'ERROR',
        };
    }
}

// Custom exceptions
// app/Exceptions/ApiException.php
class ApiException extends \Exception
{
    protected string $errorCode;
    protected array $details;

    public function __construct(
        string $message,
        string $errorCode,
        int $statusCode = 400,
        array $details = []
    ) {
        parent::__construct($message, $statusCode);
        $this->errorCode = $errorCode;
        $this->details = $details;
    }

    public function render()
    {
        return response()->json([
            'error' => [
                'code' => $this->errorCode,
                'message' => $this->getMessage(),
                'details' => $this->details ?: null,
            ],
        ], $this->getCode());
    }
}

// Usage
throw new ApiException(
    'Insufficient balance',
    'INSUFFICIENT_BALANCE',
    400,
    ['current_balance' => 50, 'required' => 100]
);
```

## Example 6: API Testing

```php
<?php
// tests/Feature/Api/UserTest.php
namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_can_list_users(): void
    {
        User::factory()->count(10)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/users');

        $response->assertOk()
            ->assertJsonCount(11, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'created_at'],
                ],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_can_create_user(): void
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->withToken($this->token)
            ->postJson('/api/v1/users', $data);

        $response->assertCreated()
            ->assertJson([
                'data' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }

    public function test_validation_errors_returned_correctly(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/users', [
                'name' => '',
                'email' => 'invalid',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/v1/users');

        $response->assertUnauthorized();
    }
}
```

**Key Takeaways:**
- Laravel excels for full-featured APIs
- Use API Resources for consistent responses
- Sanctum provides simple token authentication
- Proper error handling is crucial
- Always test your API endpoints

---

# Imitation

### Challenge 1: Build a Task API

**Task:** Create a RESTful API for managing tasks with authentication and validation.

<details>
<summary>Solution</summary>

```php
<?php
// app/Http/Controllers/Api/TaskController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $tasks = $request->user()
            ->tasks()
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn($q, $p) => $q->where('priority', $p))
            ->orderBy($request->sort ?? 'created_at', $request->order ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return TaskResource::collection($tasks);
    }

    public function store(TaskRequest $request)
    {
        $task = $request->user()->tasks()->create($request->validated());

        return new TaskResource($task);
    }

    public function show(Task $task)
    {
        $this->authorize('view', $task);

        return new TaskResource($task->load('subtasks', 'tags'));
    }

    public function update(TaskRequest $request, Task $task)
    {
        $this->authorize('update', $task);

        $task->update($request->validated());

        return new TaskResource($task);
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->noContent();
    }

    public function complete(Task $task)
    {
        $this->authorize('update', $task);

        $task->update(['status' => 'completed', 'completed_at' => now()]);

        return new TaskResource($task);
    }
}
```

</details>

---

# Practice

### Exercise 1: API Rate Limiting
**Difficulty:** Intermediate

Implement custom rate limiting:
- Different limits per endpoint
- User-specific quotas
- Rate limit headers

### Exercise 2: API Caching
**Difficulty:** Advanced

Add caching layer:
- Cache GET responses
- Invalidate on updates
- ETags for conditional requests

---

## Summary

**What you learned:**
- Laravel API development
- API Resources and Collections
- Sanctum authentication
- Error handling patterns
- API testing

**Next Steps:**
- Read: [PHP OOP](/api/guides/php/oop)
- Practice: Add API documentation
- Explore: GraphQL with Laravel

---

## Resources

- [Laravel API Documentation](https://laravel.com/docs/eloquent-resources)
- [Slim Framework](https://www.slimframework.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
