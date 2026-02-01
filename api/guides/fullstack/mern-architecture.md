---
title: "MERN Stack Architecture"
subTitle: "Building Full-Stack Apps with MongoDB, Express, React, Node"
excerpt: "The whole is greater than the sum of its parts. - Aristotle"
featureImage: "/img/mern.png"
date: "2026-02-01"
order: 900
---

# Explanation

## What is the MERN Stack?

MERN is a full-stack JavaScript framework combining four technologies:

- **M**ongoDB: NoSQL database for storing data as JSON-like documents
- **E**xpress: Backend web framework for Node.js
- **R**eact: Frontend library for building user interfaces
- **N**ode.js: JavaScript runtime for the server

Think of it like building a house:
- MongoDB is the foundation (data storage)
- Express is the plumbing and electrical (backend logic)
- React is the interior design (what users see)
- Node.js is the construction crew (runs everything)

### Why MERN?

- **One Language**: JavaScript everywhere (frontend + backend)
- **JSON Everywhere**: Data flows as JSON from DB to UI
- **Large Ecosystem**: npm has packages for everything
- **Hot Job Market**: MERN skills are highly sought after

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│          React (Port 3000)                   │
│    Components, State, API Calls             │
└────────────────────┬────────────────────────┘
                     │ HTTP Requests (fetch/axios)
                     ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                     │
│       Express + Node.js (Port 5000)         │
│    Routes, Controllers, Middleware          │
└────────────────────┬────────────────────────┘
                     │ Mongoose ODM
                     ▼
┌─────────────────────────────────────────────┐
│                 DATABASE                     │
│         MongoDB (Port 27017)                 │
│     Collections, Documents, Indexes         │
└─────────────────────────────────────────────┘
```

---

# Demonstration

## Example 1: Backend Setup (Express + MongoDB)

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Error:', err));

// User Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Example 2: Frontend (React)

```jsx
// App.jsx
import { useState, useEffect } from 'react';

function App() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            if (response.ok) {
                setName('');
                setEmail('');
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="app">
            <h1>User Management</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Add User</button>
            </form>

            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
```

**Key Takeaways:**
- Backend runs on one port (5000), frontend on another (3000)
- CORS middleware allows cross-origin requests
- React fetches data using `fetch()` or axios
- MongoDB documents have `_id` (not `id`)

---

# Imitation

### Challenge 1: Add Delete Functionality

**Task:** Add a delete button for each user that removes them from the database.

<details>
<summary>Solution</summary>

Backend route:
```javascript
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

Frontend:
```jsx
const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE'
    });
    fetchUsers();
};

// In the JSX:
<button onClick={() => handleDelete(user._id)}>Delete</button>
```

</details>

### Challenge 2: Add Error Handling

**Task:** Display error messages to the user when API calls fail.

---

# Practice

### Exercise 1: Build a Todo App
**Difficulty:** Beginner

Build a complete MERN todo app with:
- Add todos
- Mark as complete
- Delete todos
- Filter by status

### Exercise 2: Add Authentication
**Difficulty:** Advanced

Add user authentication with:
- Registration endpoint
- Login with JWT
- Protected routes
- Logout functionality

---

## Summary

**What you learned:**
- MERN stack components and how they connect
- Setting up Express with MongoDB
- Building React frontend to consume APIs
- Full CRUD operations across the stack

**Next Steps:**
- Read: [SSR vs CSR](/api/guides/fullstack/ssr-vs-csr)
- Practice: Build a blog with MERN
- Deploy: Put your MERN app on Railway or Render

---

## Resources

- [MongoDB University](https://university.mongodb.com/)
- [React Docs](https://react.dev/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
