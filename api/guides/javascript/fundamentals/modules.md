---
title: "JavaScript Modules"
subTitle: "Organizing Code at Scale"
excerpt: "Modules turn chaos into structure - essential for any real project."
featureImage: "/img/js-modules.png"
date: "2026-02-01"
order: 13
---

# Explanation

## What are Modules?

Modules are reusable pieces of code that can be exported from one file and imported into another. They help organize code, prevent naming conflicts, and enable code reuse.

### Module Systems

| System | Environment | Syntax |
|--------|-------------|--------|
| ES Modules (ESM) | Modern browsers, Node.js | import/export |
| CommonJS (CJS) | Node.js (traditional) | require/module.exports |
| AMD | Browsers (legacy) | define/require |
| UMD | Universal | Wrapper pattern |

---

# Demonstration

## Example 1: ES Modules (ESM)

```javascript
// math.js - Named exports
export const PI = 3.14159;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

export class Calculator {
    add(a, b) { return a + b; }
    subtract(a, b) { return a - b; }
}

// Default export (one per module)
export default function subtract(a, b) {
    return a - b;
}

// main.js - Importing
// Named imports (must match export names)
import { add, multiply, PI } from './math.js';

console.log(add(2, 3));  // 5
console.log(PI);         // 3.14159

// Default import (can use any name)
import subtract from './math.js';
import minus from './math.js';  // Same thing, different name

// Import all as namespace
import * as math from './math.js';

console.log(math.add(1, 2));
console.log(math.PI);
console.log(math.default(5, 3));  // Default export

// Mixed imports
import subtract, { add, multiply } from './math.js';

// Rename imports
import { add as sum, multiply as mult } from './math.js';
console.log(sum(1, 2));  // 3

// Re-exporting
// utils/index.js
export { add, multiply } from './math.js';
export { formatDate } from './date.js';
export { default as http } from './http.js';
```

## Example 2: CommonJS (Node.js)

```javascript
// math.js - Exporting
// Single export
module.exports = function add(a, b) {
    return a + b;
};

// Multiple exports
module.exports = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    PI: 3.14159
};

// Or use exports shorthand
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
exports.PI = 3.14159;

// main.js - Importing
const math = require('./math');
console.log(math.add(2, 3));

// Destructuring
const { add, subtract, PI } = require('./math');
console.log(add(2, 3));

// Conditional imports (not possible with ESM)
let config;
if (process.env.NODE_ENV === 'production') {
    config = require('./config.prod');
} else {
    config = require('./config.dev');
}

// Dynamic require
const moduleName = 'math';
const dynamicModule = require(`./${moduleName}`);
```

## Example 3: Dynamic Imports

```javascript
// Static import - loaded at parse time
import { heavy } from './heavy-module.js';

// Dynamic import - loaded at runtime
async function loadModule() {
    const module = await import('./heavy-module.js');
    module.doSomething();
}

// Conditional dynamic import
async function getParser(format) {
    if (format === 'json') {
        const { parse } = await import('./json-parser.js');
        return parse;
    } else if (format === 'xml') {
        const { parse } = await import('./xml-parser.js');
        return parse;
    }
}

// Lazy loading routes (React)
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Suspense>
    );
}

// Code splitting with webpack magic comments
const AdminPanel = lazy(() =>
    import(/* webpackChunkName: "admin" */ './AdminPanel')
);
```

## Example 4: Module Patterns

```javascript
// Barrel exports (index.js)
// components/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { default as Form } from './Form';

// Usage
import { Button, Input, Modal, Form } from './components';

// Feature-based organization
// features/auth/index.js
export { login, logout, register } from './api';
export { AuthProvider, useAuth } from './context';
export { LoginForm, RegisterForm } from './components';

// Singleton pattern
// database.js
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        this.connection = null;
        Database.instance = this;
    }

    connect(url) {
        this.connection = url;
        console.log('Connected to:', url);
    }
}

export default new Database();

// Usage - same instance everywhere
import db from './database.js';
db.connect('mongodb://localhost');

// Namespace pattern
// api/index.js
import * as users from './users.js';
import * as posts from './posts.js';
import * as comments from './comments.js';

export const api = {
    users,
    posts,
    comments
};

// Usage
import { api } from './api';
api.users.getAll();
api.posts.create({ title: 'Hello' });
```

## Example 5: Circular Dependencies

```javascript
// Circular dependency problem
// a.js
import { b } from './b.js';
export const a = 'A' + b;

// b.js
import { a } from './a.js';
export const b = 'B' + a;  // 'a' is undefined here!

// Solution 1: Restructure to avoid cycles
// shared.js
export const shared = 'shared';

// a.js
import { shared } from './shared.js';
export const a = 'A' + shared;

// b.js
import { shared } from './shared.js';
export const b = 'B' + shared;

// Solution 2: Lazy evaluation
// a.js
import { getB } from './b.js';
export const a = 'A';
export const getA = () => a + getB();

// b.js
import { getA } from './a.js';
export const b = 'B';
export const getB = () => b;

// Solution 3: Dependency injection
// service.js
class UserService {
    constructor(postService) {
        this.postService = postService;
    }

    getUserPosts(userId) {
        return this.postService.getByUser(userId);
    }
}

// main.js - Wire up dependencies
import { UserService } from './user-service.js';
import { PostService } from './post-service.js';

const postService = new PostService();
const userService = new UserService(postService);
```

## Example 6: Node.js ESM Configuration

```javascript
// package.json
{
    "name": "my-app",
    "type": "module",  // Enable ESM
    "exports": {
        ".": "./src/index.js",
        "./utils": "./src/utils/index.js"
    }
}

// Or use .mjs extension
// math.mjs (ESM)
export const add = (a, b) => a + b;

// math.cjs (CommonJS)
module.exports.add = (a, b) => a + b;

// Import CommonJS in ESM
import pkg from './commonjs-module.cjs';
const { named } = pkg;

// Top-level await (ESM only)
// config.js
const response = await fetch('/api/config');
export const config = await response.json();

// main.js
import { config } from './config.js';  // Waits for fetch

// Import assertions (JSON)
import data from './data.json' assert { type: 'json' };

// Import.meta
console.log(import.meta.url);  // File URL
console.log(import.meta.resolve('./other.js'));

// Node.js specific
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

**Key Takeaways:**
- ESM is the modern standard
- Named exports for multiple values
- Default export for main value
- Dynamic imports for code splitting
- Avoid circular dependencies

---

# Imitation

### Challenge 1: Create a Plugin System

**Task:** Build a module system that dynamically loads plugins.

<details>
<summary>Solution</summary>

```javascript
// plugin-manager.js
class PluginManager {
    #plugins = new Map();
    #hooks = new Map();

    async load(name, path) {
        const module = await import(path);
        const plugin = module.default || module;

        if (typeof plugin.init === 'function') {
            await plugin.init(this);
        }

        this.#plugins.set(name, plugin);
        console.log(`Plugin loaded: ${name}`);
    }

    get(name) {
        return this.#plugins.get(name);
    }

    registerHook(hookName, callback) {
        if (!this.#hooks.has(hookName)) {
            this.#hooks.set(hookName, []);
        }
        this.#hooks.get(hookName).push(callback);
    }

    async runHook(hookName, ...args) {
        const hooks = this.#hooks.get(hookName) || [];
        for (const hook of hooks) {
            await hook(...args);
        }
    }
}

export const pluginManager = new PluginManager();

// plugins/logger.js
export default {
    name: 'logger',

    init(manager) {
        manager.registerHook('beforeRequest', (req) => {
            console.log(`Request: ${req.method} ${req.url}`);
        });

        manager.registerHook('afterResponse', (res) => {
            console.log(`Response: ${res.status}`);
        });
    }
};

// main.js
import { pluginManager } from './plugin-manager.js';

await pluginManager.load('logger', './plugins/logger.js');
await pluginManager.load('auth', './plugins/auth.js');

await pluginManager.runHook('beforeRequest', { method: 'GET', url: '/api' });
```

</details>

---

# Practice

### Exercise 1: Module Bundler Basics
**Difficulty:** Intermediate

Implement a simple module resolver that:
- Reads import statements
- Resolves relative paths
- Builds a dependency graph

### Exercise 2: Lazy Module Registry
**Difficulty:** Advanced

Create a module registry that:
- Registers modules by name
- Lazy loads on first access
- Handles circular dependencies

---

## Summary

**What you learned:**
- ES Modules vs CommonJS
- Named and default exports
- Dynamic imports for code splitting
- Module organization patterns
- Handling circular dependencies

**Next Steps:**
- Read: [Build Tools](/api/guides/concepts/build-tools)
- Practice: Refactor to ESM
- Explore: Webpack, Vite, Rollup

---

## Resources

- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js ESM](https://nodejs.org/api/esm.html)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
