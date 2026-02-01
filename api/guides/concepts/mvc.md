---
title: "MVC Architecture"
subTitle: "Separating Concerns for Maintainable Code"
excerpt: "Good architecture is like a good foundation - invisible but essential."
featureImage: "/img/mvc.png"
date: "2026-02-01"
order: 802
---

# Explanation

## What is MVC?

MVC stands for **Model-View-Controller**, a design pattern that separates your application into three interconnected components. Think of it like a restaurant:

- **Model** = Kitchen (handles data and business logic)
- **View** = Dining room (what customers see)
- **Controller** = Waiter (takes requests, coordinates between kitchen and dining room)

```
┌─────────────────────────────────────────────────────────┐
│                      USER                                │
│                        │                                 │
│                        ▼                                 │
│   ┌──────────────────────────────────────────┐          │
│   │             CONTROLLER                    │          │
│   │   - Handles requests                      │          │
│   │   - Calls Model for data                  │          │
│   │   - Passes data to View                   │          │
│   └───────────┬───────────────────┬──────────┘          │
│               │                   │                      │
│               ▼                   ▼                      │
│   ┌───────────────────┐   ┌───────────────────┐         │
│   │      MODEL        │   │       VIEW        │         │
│   │   - Database      │   │   - HTML/JSX      │         │
│   │   - Business logic│   │   - Templates     │         │
│   │   - Validation    │   │   - UI components │         │
│   └───────────────────┘   └───────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Why MVC Matters

- **Separation of Concerns**: Each part has one job
- **Testability**: Test each layer independently
- **Maintainability**: Change one part without breaking others
- **Team Collaboration**: Frontend and backend can work in parallel

---

# Demonstration

## Example 1: Express.js MVC Structure

```
/my-app
├── /models
│   └── User.js
├── /views
│   └── users.ejs
├── /controllers
│   └── userController.js
├── /routes
│   └── userRoutes.js
└── server.js
```

**Model (models/User.js)**
```javascript
// Handles data and business logic
class User {
    static users = [];
    static nextId = 1;

    constructor(name, email) {
        this.id = User.nextId++;
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }

    static findAll() {
        return this.users;
    }

    static findById(id) {
        return this.users.find(u => u.id === id);
    }

    static create(data) {
        const user = new User(data.name, data.email);
        this.users.push(user);
        return user;
    }

    static delete(id) {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }
}

module.exports = User;
```

**Controller (controllers/userController.js)**
```javascript
// Handles requests and responses
const User = require('../models/User');

const userController = {
    // GET /users
    index: (req, res) => {
        const users = User.findAll();
        res.render('users/index', { users });
    },

    // GET /users/:id
    show: (req, res) => {
        const user = User.findById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).render('errors/404');
        }
        res.render('users/show', { user });
    },

    // POST /users
    create: (req, res) => {
        const { name, email } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email required' });
        }

        const user = User.create({ name, email });
        res.redirect(`/users/${user.id}`);
    },

    // DELETE /users/:id
    destroy: (req, res) => {
        const deleted = User.delete(parseInt(req.params.id));
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.redirect('/users');
    }
};

module.exports = userController;
```

**Routes (routes/userRoutes.js)**
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.index);
router.get('/:id', userController.show);
router.post('/', userController.create);
router.delete('/:id', userController.destroy);

module.exports = router;
```

**View (views/users/index.ejs)**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Users</title>
</head>
<body>
    <h1>Users</h1>

    <form action="/users" method="POST">
        <input name="name" placeholder="Name" required>
        <input name="email" type="email" placeholder="Email" required>
        <button type="submit">Add User</button>
    </form>

    <ul>
        <% users.forEach(user => { %>
            <li>
                <a href="/users/<%= user.id %>"><%= user.name %></a>
                (<%= user.email %>)
            </li>
        <% }) %>
    </ul>
</body>
</html>
```

## Example 2: API-Only MVC (No Views)

```javascript
// controllers/apiUserController.js
const User = require('../models/User');

const apiUserController = {
    // GET /api/users
    index: (req, res) => {
        const users = User.findAll();
        res.json({ data: users });
    },

    // POST /api/users
    create: (req, res) => {
        try {
            const user = User.create(req.body);
            res.status(201).json({ data: user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // GET /api/users/:id
    show: (req, res) => {
        const user = User.findById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ data: user });
    }
};
```

**Key Takeaways:**
- Model: Data + business logic (no HTTP awareness)
- View: Presentation only (no business logic)
- Controller: Coordinator (thin, delegates to Model)
- Keep controllers thin - heavy logic goes in Models or Services

---

# Imitation

### Challenge 1: Add Update Functionality

**Task:** Add an update method to the Model and Controller.

<details>
<summary>Solution</summary>

```javascript
// Model
static update(id, data) {
    const user = this.findById(id);
    if (!user) return null;
    Object.assign(user, data);
    return user;
}

// Controller
update: (req, res) => {
    const user = User.update(parseInt(req.params.id), req.body);
    if (!user) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.json({ data: user });
}
```

</details>

### Challenge 2: Add a Service Layer

**Task:** Extract business logic into a UserService class.

<details>
<summary>Solution</summary>

```javascript
// services/UserService.js
class UserService {
    static createUser(data) {
        // Validation logic
        if (!data.email.includes('@')) {
            throw new Error('Invalid email');
        }
        return User.create(data);
    }

    static getUserWithPosts(id) {
        const user = User.findById(id);
        if (!user) return null;
        const posts = Post.findByUserId(id);
        return { ...user, posts };
    }
}
```

</details>

---

# Practice

### Exercise 1: Blog MVC
**Difficulty:** Beginner

Build an MVC blog with:
- Post model (title, content, author)
- CRUD controller actions
- Views for list, single, create, edit

### Exercise 2: E-commerce MVC
**Difficulty:** Advanced

Build a product catalog:
- Product and Category models
- ProductController with filtering
- Cart functionality
- Service layer for complex operations

---

## Summary

**What you learned:**
- MVC pattern and why it matters
- Model: Data and business logic
- View: Presentation layer
- Controller: Request handler and coordinator

**Next Steps:**
- Read: [Node.js Architecture](/api/guides/concepts/nodejs-architecture)
- Practice: Refactor a messy codebase to MVC
- Build: Full MVC application with authentication

---

## Resources

- [MDN: MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [Express MVC Structure](https://expressjs.com/en/starter/generator.html)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
