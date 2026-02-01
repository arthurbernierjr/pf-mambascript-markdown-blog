---
title: "CRUD Operations"
subTitle: "The Four Pillars of Data Management"
excerpt: "Simplicity is the ultimate sophistication. - Leonardo da Vinci"
featureImage: "/img/crud.png"
date: "2026-02-01"
order: 800
---

# Explanation

## What is CRUD?

CRUD stands for **Create, Read, Update, Delete** - the four basic operations you can perform on data. Whether you're building a todo app, social network, or enterprise system, everything comes back to CRUD.

Think of CRUD like the basic verbs of data:
- **Create**: Add new data (like posting a tweet)
- **Read**: Retrieve existing data (like viewing your feed)
- **Update**: Modify existing data (like editing a post)
- **Delete**: Remove data (like deleting a comment)

### HTTP Methods Map to CRUD

| Operation | HTTP Method | SQL Command | Description |
|-----------|------------|-------------|-------------|
| Create | POST | INSERT | Add new record |
| Read | GET | SELECT | Retrieve records |
| Update | PUT/PATCH | UPDATE | Modify record |
| Delete | DELETE | DELETE | Remove record |

### Why This Matters

Understanding CRUD is essential because:
- Every database interaction boils down to CRUD
- REST APIs are built around CRUD operations
- Most application features are CRUD at their core
- Job interviews frequently ask about CRUD implementations

---

# Demonstration

## Example 1: CRUD with an Array (In-Memory)

```javascript
// Our "database" - an array
let users = [
    { id: 1, name: "Arthur", email: "arthur@bpc.com" },
    { id: 2, name: "Sarah", email: "sarah@example.com" }
];

// CREATE - Add a new user
const createUser = (name, email) => {
    const newUser = {
        id: users.length + 1,
        name,
        email
    };
    users.push(newUser);
    return newUser;
};

// READ - Get all users
const getAllUsers = () => users;

// READ - Get user by ID
const getUserById = (id) => {
    return users.find(user => user.id === id);
};

// UPDATE - Modify a user
const updateUser = (id, updates) => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    return users[index];
};

// DELETE - Remove a user
const deleteUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
};

// Usage:
console.log(createUser("Mike", "mike@test.com"));
console.log(getAllUsers());
console.log(updateUser(1, { name: "Big Poppa" }));
console.log(deleteUser(2));
```

## Example 2: CRUD with Express.js REST API

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

// CREATE - POST /todos
app.post('/todos', (req, res) => {
    const todo = {
        id: nextId++,
        text: req.body.text,
        completed: false,
        createdAt: new Date()
    };
    todos.push(todo);
    res.status(201).json(todo);
});

// READ ALL - GET /todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// READ ONE - GET /todos/:id
app.get('/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
});

// UPDATE - PUT /todos/:id
app.put('/todos/:id', (req, res) => {
    const index = todos.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Not found' });

    todos[index] = { ...todos[index], ...req.body };
    res.json(todos[index]);
});

// DELETE - DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
    const index = todos.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Not found' });

    todos.splice(index, 1);
    res.status(204).send();
});

app.listen(3000);
```

**Key Takeaways:**
- POST returns 201 (Created) with the new resource
- GET returns 200 with the data
- PUT returns 200 with the updated resource
- DELETE returns 204 (No Content)
- Always validate and handle errors

---

# Imitation

### Challenge 1: Add Search to Read

**Task:** Modify the `getAllUsers` function to accept an optional search query that filters by name.

```javascript
getAllUsers("art"); // Returns users with "art" in their name
getAllUsers();      // Returns all users
```

<details>
<summary>Solution</summary>

```javascript
const getAllUsers = (search = "") => {
    if (!search) return users;
    return users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );
};
```

</details>

### Challenge 2: Add Soft Delete

**Task:** Instead of actually removing users, implement a "soft delete" that marks them as deleted but keeps the data.

<details>
<summary>Solution</summary>

```javascript
const softDeleteUser = (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return false;

    user.deleted = true;
    user.deletedAt = new Date();
    return true;
};

const getAllUsers = (includeDeleted = false) => {
    if (includeDeleted) return users;
    return users.filter(u => !u.deleted);
};
```

</details>

---

# Practice

### Exercise 1: Build a Notes API
**Difficulty:** Beginner

**Task:** Create CRUD operations for a notes app with:
- `id`, `title`, `content`, `createdAt`, `updatedAt`

**Requirements:**
- `createNote(title, content)` - Create new note
- `getNotes()` - Get all notes
- `getNoteById(id)` - Get single note
- `updateNote(id, updates)` - Update note, set updatedAt
- `deleteNote(id)` - Delete note

### Exercise 2: Add Pagination
**Difficulty:** Intermediate

**Task:** Modify your READ operation to support pagination.

```javascript
getNotes({ page: 1, limit: 10 }); // Returns first 10 notes
getNotes({ page: 2, limit: 10 }); // Returns notes 11-20
```

**Requirements:**
- Accept `page` and `limit` parameters
- Return total count along with results
- Handle edge cases (invalid page, empty results)

---

## Summary

**What you learned:**
- CRUD = Create, Read, Update, Delete
- How CRUD maps to HTTP methods and SQL
- Implementing CRUD with arrays and Express
- Best practices for API responses

**Next Steps:**
- Read: [REST API Design](/api/guides/concepts/rest)
- Practice: Build a full CRUD API with a database
- Build: Create a bookmark manager with CRUD operations

---

## Resources

- [MDN: HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [REST API Tutorial](https://restfulapi.net/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
