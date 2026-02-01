---
title: "TypeScript Essentials"
subTitle: "JavaScript with Types"
excerpt: "TypeScript catches errors before they reach production."
featureImage: "/img/typescript.png"
date: "2026-02-01"
order: 817
---

# Explanation

## What is TypeScript?

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing, classes, and modules to help build robust applications.

### Benefits

| Benefit | Description |
|---------|-------------|
| Type Safety | Catch errors at compile time |
| Better IDE Support | Autocomplete, refactoring |
| Documentation | Types document code |
| Scalability | Easier to maintain large codebases |

---

# Demonstration

## Example 1: Basic Types

```typescript
// Primitive types
const name: string = 'Arthur';
const age: number = 30;
const isActive: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// Arrays
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ['a', 'b', 'c'];

// Tuples
const tuple: [string, number] = ['hello', 42];
const [greeting, count] = tuple;

// Enums
enum Status {
    Pending,
    Active,
    Completed
}
const status: Status = Status.Active;

// String enums
enum Direction {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right = 'RIGHT'
}

// Any (avoid if possible)
let anything: any = 'hello';
anything = 42;

// Unknown (safer than any)
let unknown: unknown = 'hello';
if (typeof unknown === 'string') {
    console.log(unknown.toUpperCase());  // Type guard
}

// Void and never
function log(message: string): void {
    console.log(message);
}

function throwError(message: string): never {
    throw new Error(message);
}

// Literal types
type Theme = 'light' | 'dark';
const theme: Theme = 'light';

// Type assertions
const input = document.getElementById('input') as HTMLInputElement;
const input2 = <HTMLInputElement>document.getElementById('input');
```

## Example 2: Objects and Interfaces

```typescript
// Object type
const user: { name: string; age: number } = {
    name: 'Arthur',
    age: 30
};

// Interface
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;  // Optional
    readonly createdAt: Date;  // Read-only
}

const user1: User = {
    id: 1,
    name: 'Arthur',
    email: 'art@bpc.com',
    createdAt: new Date()
};

// Extending interfaces
interface Admin extends User {
    role: 'admin';
    permissions: string[];
}

// Interface for functions
interface GreetFunction {
    (name: string): string;
}

const greet: GreetFunction = (name) => `Hello, ${name}!`;

// Index signatures
interface Dictionary {
    [key: string]: string;
}

const dict: Dictionary = {
    hello: 'world',
    foo: 'bar'
};

// Type aliases
type ID = string | number;
type Point = { x: number; y: number };

// Intersection types
type Employee = User & {
    department: string;
    salary: number;
};

// Type vs Interface
// - Interfaces can be extended and merged
// - Types can use unions and mapped types
// - Use interfaces for objects, types for everything else
```

## Example 3: Functions

```typescript
// Function types
function add(a: number, b: number): number {
    return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
    return `${greeting || 'Hello'}, ${name}!`;
}

// Default parameters
function createUser(name: string, role: string = 'user'): User {
    return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}

// Function overloading
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
    if (typeof value === 'string') {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}

// Generic functions
function identity<T>(value: T): T {
    return value;
}

const str = identity<string>('hello');
const num = identity(42);  // Type inferred

// Generic constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: 'Arthur', age: 30 };
const name = getProperty(user, 'name');  // string
```

## Example 4: Generics

```typescript
// Generic interface
interface Response<T> {
    data: T;
    status: number;
    message: string;
}

interface User {
    id: number;
    name: string;
}

const userResponse: Response<User> = {
    data: { id: 1, name: 'Arthur' },
    status: 200,
    message: 'Success'
};

// Generic class
class Container<T> {
    private value: T;

    constructor(value: T) {
        this.value = value;
    }

    getValue(): T {
        return this.value;
    }

    setValue(value: T): void {
        this.value = value;
    }
}

const numberContainer = new Container<number>(42);
const stringContainer = new Container('hello');

// Generic constraints
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(value: T): void {
    console.log(value.length);
}

logLength('hello');     // OK
logLength([1, 2, 3]);   // OK
// logLength(42);       // Error: number has no length

// Multiple type parameters
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
    return array.map(fn);
}

const numbers = [1, 2, 3];
const strings = map(numbers, n => n.toString());

// Default type parameters
interface Pagination<T = any> {
    items: T[];
    page: number;
    total: number;
}
```

## Example 5: Utility Types

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    role: 'admin' | 'user';
}

// Partial - all properties optional
type PartialUser = Partial<User>;
const update: PartialUser = { name: 'New Name' };

// Required - all properties required
type RequiredUser = Required<User>;

// Readonly - all properties readonly
type ReadonlyUser = Readonly<User>;
const user: ReadonlyUser = { id: 1, name: 'Arthur', /* ... */ };
// user.name = 'New';  // Error!

// Pick - select properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit - exclude properties
type UserWithoutId = Omit<User, 'id'>;

// Record - create object type
type RolePermissions = Record<User['role'], string[]>;
const permissions: RolePermissions = {
    admin: ['read', 'write', 'delete'],
    user: ['read']
};

// Extract - extract from union
type AdminRole = Extract<User['role'], 'admin'>;

// Exclude - exclude from union
type NonAdminRole = Exclude<User['role'], 'admin'>;

// NonNullable
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;

// ReturnType
function getUser() {
    return { id: 1, name: 'Arthur' };
}
type UserFromFunction = ReturnType<typeof getUser>;

// Parameters
function createUser(name: string, age: number): User { /* ... */ }
type CreateUserParams = Parameters<typeof createUser>;  // [string, number]

// Awaited (for Promise types)
type ResolvedUser = Awaited<Promise<User>>;  // User
```

## Example 6: Advanced Patterns

```typescript
// Discriminated unions
interface Circle {
    kind: 'circle';
    radius: number;
}

interface Rectangle {
    kind: 'rectangle';
    width: number;
    height: number;
}

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case 'circle':
            return Math.PI * shape.radius ** 2;
        case 'rectangle':
            return shape.width * shape.height;
    }
}

// Type guards
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function process(value: string | number) {
    if (isString(value)) {
        console.log(value.toUpperCase());  // TypeScript knows it's string
    } else {
        console.log(value.toFixed(2));     // TypeScript knows it's number
    }
}

// Mapped types
type Nullable<T> = { [K in keyof T]: T[K] | null };
type NullableUser = Nullable<User>;

// Template literal types
type EventName = `on${Capitalize<string>}`;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/${string}`;
type Route = `${HttpMethod} ${Endpoint}`;

// Conditional types
type IsString<T> = T extends string ? true : false;
type Test1 = IsString<string>;  // true
type Test2 = IsString<number>;  // false

// infer keyword
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type Unwrapped = UnwrapPromise<Promise<string>>;  // string

// Const assertions
const config = {
    endpoint: '/api',
    timeout: 5000
} as const;
// config.endpoint is now '/api', not string
```

**Key Takeaways:**
- Types catch errors early
- Use interfaces for objects
- Generics for reusable code
- Utility types save time
- Type guards for runtime checks

---

# Imitation

### Challenge 1: Type a REST API Client

**Task:** Create types for a generic API client.

<details>
<summary>Solution</summary>

```typescript
// API types
interface ApiResponse<T> {
    data: T;
    meta: {
        timestamp: string;
        requestId: string;
    };
}

interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
    timeout?: number;
}

// API Client
class ApiClient {
    constructor(private baseUrl: string) {}

    private async request<T>(
        method: HttpMethod,
        path: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        const url = new URL(path, this.baseUrl);

        if (config?.params) {
            Object.entries(config.params).forEach(([key, value]) => {
                url.searchParams.set(key, String(value));
            });
        }

        const response = await fetch(url.toString(), {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers
            },
            body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json();
    }

    get<T>(path: string, config?: RequestConfig) {
        return this.request<T>('GET', path, undefined, config);
    }

    post<T, D = unknown>(path: string, data: D, config?: RequestConfig) {
        return this.request<T>('POST', path, data, config);
    }

    put<T, D = unknown>(path: string, data: D, config?: RequestConfig) {
        return this.request<T>('PUT', path, data, config);
    }

    delete<T>(path: string, config?: RequestConfig) {
        return this.request<T>('DELETE', path, undefined, config);
    }
}

// Usage
interface User {
    id: number;
    name: string;
    email: string;
}

const api = new ApiClient('https://api.example.com');

const { data: user } = await api.get<User>('/users/1');
const { data: newUser } = await api.post<User>('/users', {
    name: 'Arthur',
    email: 'art@bpc.com'
});
```

</details>

---

# Practice

### Exercise 1: Type a Form Handler
**Difficulty:** Intermediate

Create types for a type-safe form handling system.

### Exercise 2: Build a Type-Safe Event Emitter
**Difficulty:** Advanced

Create an event emitter with typed events.

---

## Summary

**What you learned:**
- Basic and advanced types
- Interfaces and type aliases
- Generics and constraints
- Utility types
- Type guards and narrowing

**Next Steps:**
- Read: [Testing](/api/guides/concepts/testing)
- Practice: Migrate a JS project
- Explore: Strict mode, declaration files

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
