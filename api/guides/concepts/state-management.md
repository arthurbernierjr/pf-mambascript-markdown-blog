---
title: "State Management"
subTitle: "Managing Application State"
excerpt: "Good state management is the foundation of maintainable apps."
featureImage: "/img/state-management.png"
date: "2026-02-01"
order: 816
---

# Explanation

## What is State Management?

State management is how applications track and update data over time. As apps grow complex, organizing state becomes critical for maintainability.

### State Types

| Type | Scope | Examples |
|------|-------|----------|
| Local | Single component | Form inputs, UI toggles |
| Shared | Multiple components | User data, theme |
| Server | Cached API data | Products, users |
| URL | Browser address | Filters, pagination |

---

# Demonstration

## Example 1: Simple State Store

```javascript
// Basic observable store
function createStore(initialState) {
    let state = initialState;
    const listeners = new Set();

    return {
        getState() {
            return state;
        },

        setState(newState) {
            state = typeof newState === 'function'
                ? newState(state)
                : { ...state, ...newState };
            listeners.forEach(listener => listener(state));
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}

// Usage
const store = createStore({
    user: null,
    theme: 'light',
    notifications: []
});

// Subscribe to changes
const unsubscribe = store.subscribe(state => {
    console.log('State changed:', state);
});

// Update state
store.setState({ theme: 'dark' });
store.setState(state => ({
    notifications: [...state.notifications, { id: 1, text: 'Hello' }]
}));

// Get current state
console.log(store.getState().theme);  // 'dark'
```

## Example 2: Redux-like Pattern

```javascript
// Action types
const ActionTypes = {
    ADD_TODO: 'ADD_TODO',
    TOGGLE_TODO: 'TOGGLE_TODO',
    DELETE_TODO: 'DELETE_TODO',
    SET_FILTER: 'SET_FILTER'
};

// Action creators
const actions = {
    addTodo: (text) => ({
        type: ActionTypes.ADD_TODO,
        payload: { id: Date.now(), text, completed: false }
    }),
    toggleTodo: (id) => ({
        type: ActionTypes.TOGGLE_TODO,
        payload: id
    }),
    deleteTodo: (id) => ({
        type: ActionTypes.DELETE_TODO,
        payload: id
    }),
    setFilter: (filter) => ({
        type: ActionTypes.SET_FILTER,
        payload: filter
    })
};

// Reducer
function todoReducer(state, action) {
    switch (action.type) {
        case ActionTypes.ADD_TODO:
            return {
                ...state,
                todos: [...state.todos, action.payload]
            };
        case ActionTypes.TOGGLE_TODO:
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.payload
                        ? { ...todo, completed: !todo.completed }
                        : todo
                )
            };
        case ActionTypes.DELETE_TODO:
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.payload)
            };
        case ActionTypes.SET_FILTER:
            return {
                ...state,
                filter: action.payload
            };
        default:
            return state;
    }
}

// Store with reducer
function createReduxStore(reducer, initialState) {
    let state = initialState;
    const listeners = new Set();

    return {
        getState: () => state,
        dispatch(action) {
            state = reducer(state, action);
            listeners.forEach(listener => listener());
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}

// Usage
const store = createReduxStore(todoReducer, {
    todos: [],
    filter: 'all'
});

store.subscribe(() => {
    console.log('State:', store.getState());
});

store.dispatch(actions.addTodo('Learn state management'));
store.dispatch(actions.toggleTodo(store.getState().todos[0].id));
```

## Example 3: React State Management

```jsx
// Context + useReducer pattern
import React, { createContext, useContext, useReducer } from 'react';

// Context
const TodoContext = createContext();

// Reducer
function todoReducer(state, action) {
    switch (action.type) {
        case 'ADD':
            return [...state, {
                id: Date.now(),
                text: action.text,
                completed: false
            }];
        case 'TOGGLE':
            return state.map(todo =>
                todo.id === action.id
                    ? { ...todo, completed: !todo.completed }
                    : todo
            );
        case 'DELETE':
            return state.filter(todo => todo.id !== action.id);
        default:
            return state;
    }
}

// Provider
function TodoProvider({ children }) {
    const [todos, dispatch] = useReducer(todoReducer, []);

    const value = {
        todos,
        addTodo: (text) => dispatch({ type: 'ADD', text }),
        toggleTodo: (id) => dispatch({ type: 'TOGGLE', id }),
        deleteTodo: (id) => dispatch({ type: 'DELETE', id })
    };

    return (
        <TodoContext.Provider value={value}>
            {children}
        </TodoContext.Provider>
    );
}

// Hook
function useTodos() {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodos must be used within TodoProvider');
    }
    return context;
}

// Usage in components
function TodoList() {
    const { todos, toggleTodo, deleteTodo } = useTodos();

    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                    />
                    {todo.text}
                    <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}

function AddTodo() {
    const { addTodo } = useTodos();
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        addTodo(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={text} onChange={e => setText(e.target.value)} />
            <button type="submit">Add</button>
        </form>
    );
}
```

## Example 4: Zustand (Modern Approach)

```javascript
// Zustand-like store
function create(initializer) {
    let state;
    const listeners = new Set();

    const setState = (partial) => {
        const nextState = typeof partial === 'function'
            ? partial(state)
            : partial;

        if (nextState !== state) {
            state = { ...state, ...nextState };
            listeners.forEach(listener => listener(state));
        }
    };

    const getState = () => state;

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    // Initialize
    state = initializer(setState, getState);

    return { getState, setState, subscribe };
}

// Store definition
const useStore = create((set, get) => ({
    // State
    bears: 0,
    fish: [],

    // Actions
    addBear: () => set(state => ({ bears: state.bears + 1 })),
    removeBear: () => set(state => ({ bears: Math.max(0, state.bears - 1) })),

    addFish: (fish) => set(state => ({
        fish: [...state.fish, fish]
    })),

    // Computed (via getter)
    get totalAnimals() {
        const state = get();
        return state.bears + state.fish.length;
    },

    // Async action
    fetchFish: async () => {
        const response = await fetch('/api/fish');
        const fish = await response.json();
        set({ fish });
    },

    // Reset
    reset: () => set({ bears: 0, fish: [] })
}));

// React hook (simplified)
function useStoreHook(selector) {
    const [, forceRender] = React.useState(0);

    React.useEffect(() => {
        return useStore.subscribe(() => forceRender(n => n + 1));
    }, []);

    return selector(useStore.getState());
}

// Usage
function BearCounter() {
    const bears = useStoreHook(state => state.bears);
    const addBear = useStoreHook(state => state.addBear);

    return (
        <div>
            <span>{bears} bears</span>
            <button onClick={addBear}>Add bear</button>
        </div>
    );
}
```

## Example 5: Server State (React Query Pattern)

```javascript
// Simple query cache
class QueryCache {
    constructor() {
        this.cache = new Map();
        this.listeners = new Map();
    }

    getQuery(key) {
        return this.cache.get(key);
    }

    setQuery(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        this.notify(key);
    }

    invalidate(key) {
        this.cache.delete(key);
        this.notify(key);
    }

    subscribe(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(listener);
        return () => this.listeners.get(key).delete(listener);
    }

    notify(key) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener());
        }
    }
}

// Query hook
function useQuery(key, fetcher, options = {}) {
    const { staleTime = 5000 } = options;
    const [state, setState] = useState({
        data: undefined,
        error: undefined,
        isLoading: true
    });

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            const cached = queryCache.getQuery(key);

            // Return cached if fresh
            if (cached && Date.now() - cached.timestamp < staleTime) {
                setState({ data: cached.data, error: undefined, isLoading: false });
                return;
            }

            setState(s => ({ ...s, isLoading: true }));

            try {
                const data = await fetcher();
                if (!cancelled) {
                    queryCache.setQuery(key, data);
                    setState({ data, error: undefined, isLoading: false });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({ data: undefined, error, isLoading: false });
                }
            }
        };

        fetchData();

        return () => { cancelled = true; };
    }, [key]);

    return state;
}

// Usage
function UserProfile({ userId }) {
    const { data: user, isLoading, error } = useQuery(
        `user-${userId}`,
        () => fetch(`/api/users/${userId}`).then(r => r.json())
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>{user.name}</div>;
}
```

## Example 6: URL State

```javascript
// URL state management
function useURLState(key, defaultValue) {
    const [value, setValue] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const param = params.get(key);
        return param !== null ? JSON.parse(param) : defaultValue;
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (value === defaultValue) {
            params.delete(key);
        } else {
            params.set(key, JSON.stringify(value));
        }

        const newURL = params.toString()
            ? `${window.location.pathname}?${params}`
            : window.location.pathname;

        window.history.replaceState({}, '', newURL);
    }, [key, value, defaultValue]);

    return [value, setValue];
}

// Usage
function ProductList() {
    const [filters, setFilters] = useURLState('filters', {
        category: 'all',
        sort: 'newest'
    });

    const [page, setPage] = useURLState('page', 1);

    return (
        <div>
            <select
                value={filters.category}
                onChange={e => setFilters({
                    ...filters,
                    category: e.target.value
                })}
            >
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
            </select>

            <button onClick={() => setPage(page + 1)}>
                Page {page} - Next
            </button>
        </div>
    );
}
```

**Key Takeaways:**
- Choose state location wisely (local vs global)
- Immutability prevents bugs
- Actions make changes predictable
- Server state needs different handling
- URL state for shareable views

---

# Imitation

### Challenge 1: Build a Shopping Cart Store

**Task:** Create a state management system for a shopping cart.

<details>
<summary>Solution</summary>

```javascript
const createCartStore = () => {
    let state = {
        items: [],
        isOpen: false
    };
    const listeners = new Set();

    const notify = () => listeners.forEach(l => l(state));

    return {
        getState: () => state,

        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },

        addItem: (product, quantity = 1) => {
            const existing = state.items.find(i => i.id === product.id);

            if (existing) {
                state = {
                    ...state,
                    items: state.items.map(i =>
                        i.id === product.id
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    )
                };
            } else {
                state = {
                    ...state,
                    items: [...state.items, { ...product, quantity }]
                };
            }
            notify();
        },

        removeItem: (productId) => {
            state = {
                ...state,
                items: state.items.filter(i => i.id !== productId)
            };
            notify();
        },

        updateQuantity: (productId, quantity) => {
            if (quantity <= 0) return cartStore.removeItem(productId);

            state = {
                ...state,
                items: state.items.map(i =>
                    i.id === productId ? { ...i, quantity } : i
                )
            };
            notify();
        },

        toggleCart: () => {
            state = { ...state, isOpen: !state.isOpen };
            notify();
        },

        clear: () => {
            state = { ...state, items: [] };
            notify();
        },

        get total() {
            return state.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        },

        get itemCount() {
            return state.items.reduce((sum, item) => sum + item.quantity, 0);
        }
    };
};

const cartStore = createCartStore();
```

</details>

---

# Practice

### Exercise 1: Undo/Redo
**Difficulty:** Intermediate

Add undo/redo functionality to a store.

### Exercise 2: State Persistence
**Difficulty:** Intermediate

Persist state to localStorage with hydration.

---

## Summary

**What you learned:**
- Observable store pattern
- Redux-like architecture
- React Context + useReducer
- Modern approaches (Zustand)
- Server and URL state

**Next Steps:**
- Read: [Testing](/api/guides/concepts/testing)
- Practice: Build a complex app
- Explore: Redux, Zustand, Jotai

---

## Resources

- [Redux Documentation](https://redux.js.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
