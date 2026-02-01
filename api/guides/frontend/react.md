---
title: "React Fundamentals"
subTitle: "Building User Interfaces with Components"
excerpt: "Make it work, make it right, make it fast. - Kent Beck"
featureImage: "/img/react.png"
date: "2026-02-01"
order: 750
---

# Explanation

## Why React?

React changed how we build user interfaces. Instead of manipulating the DOM directly, you describe what you want, and React figures out how to make it happen efficiently.

Think of React like building with LEGO:
- **Components** are individual LEGO pieces
- **Props** are how you customize each piece
- **State** is what makes pieces interactive
- **JSX** is the instruction manual

### Key Concepts

- **Components**: Reusable, self-contained pieces of UI
- **Props**: Data passed from parent to child (read-only)
- **State**: Data that changes over time (triggers re-renders)
- **JSX**: HTML-like syntax in JavaScript
- **Virtual DOM**: React's efficient update mechanism

### Why This Matters

React powers Facebook, Instagram, Netflix, Airbnb, and countless other apps. Understanding React opens doors to:
- Frontend development roles
- Mobile development (React Native)
- Full-stack development (Next.js)

---

# Demonstration

## Example 1: Your First Component

```jsx
// Functional Component
function Greeting({ name }) {
    return (
        <div className="greeting">
            <h1>Hello, {name}!</h1>
            <p>Welcome to React</p>
        </div>
    );
}

// Using the component
function App() {
    return (
        <div>
            <Greeting name="Arthur" />
            <Greeting name="Sarah" />
        </div>
    );
}
```

**Explanation:**
- Components are functions that return JSX
- Props are passed like HTML attributes
- `{name}` interpolates JavaScript in JSX
- Components must return a single parent element

## Example 2: State with useState

```jsx
import { useState } from 'react';

function Counter() {
    // useState returns [currentValue, setterFunction]
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);

    return (
        <div className="counter">
            <h2>Count: {count}</h2>
            <button onClick={decrement}>-</button>
            <button onClick={reset}>Reset</button>
            <button onClick={increment}>+</button>
        </div>
    );
}
```

**Key Takeaways:**
- `useState` creates reactive state
- Never modify state directly; use the setter
- State changes trigger re-renders
- Event handlers use camelCase (`onClick`, not `onclick`)

## Example 3: useEffect for Side Effects

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset state when userId changes
        setLoading(true);
        setError(null);

        fetch(`/api/users/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [userId]); // Dependency array - re-run when userId changes

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>No user found</div>;

    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}
```

**Key Takeaways:**
- `useEffect` runs after render
- Dependency array controls when it re-runs
- Empty array `[]` = run once on mount
- No array = run on every render (usually wrong)

---

# Imitation

### Challenge 1: Build a Toggle Component

**Task:** Create a component that toggles between light and dark mode.

```jsx
// Should toggle between "Light Mode" and "Dark Mode"
// Background should change accordingly
```

<details>
<summary>Solution</summary>

```jsx
function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    const style = {
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        color: isDark ? '#ffffff' : '#1a1a1a',
        padding: '20px',
        minHeight: '100vh'
    };

    return (
        <div style={style}>
            <h1>{isDark ? 'Dark' : 'Light'} Mode</h1>
            <button onClick={() => setIsDark(!isDark)}>
                Toggle Theme
            </button>
        </div>
    );
}
```

</details>

### Challenge 2: Build a List with Filter

**Task:** Create a list of items with a search filter.

<details>
<summary>Solution</summary>

```jsx
function FilteredList() {
    const [search, setSearch] = useState('');
    const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

    const filteredItems = items.filter(item =>
        item.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <ul>
                {filteredItems.map(item => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
```

</details>

---

# Practice

### Exercise 1: Todo List
**Difficulty:** Beginner

Build a todo list with:
- Add new todos
- Mark as complete (strikethrough)
- Delete todos
- Show count of remaining items

### Exercise 2: Fetch and Display
**Difficulty:** Intermediate

Create a component that:
- Fetches posts from JSONPlaceholder API
- Shows loading state
- Handles errors
- Displays posts in cards
- Has pagination (10 per page)

---

## Summary

**What you learned:**
- React components and JSX syntax
- Managing state with useState
- Side effects with useEffect
- Props for component communication

**Next Steps:**
- Read: [Vue Fundamentals](/api/guides/frontend/vue)
- Practice: Build a weather app with React
- Build: Create a portfolio site with React

---

## Resources

- [React Official Docs](https://react.dev/)
- [React Hooks Cheatsheet](https://react.dev/reference/react)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
