---
title: "Svelte Fundamentals"
subTitle: "The Disappearing Framework"
excerpt: "Svelte shifts work from runtime to compile time."
featureImage: "/img/svelte.png"
date: "2026-02-01"
order: 753
---

# Explanation

## Why Svelte?

Svelte is different. While React and Vue do their work in the browser, Svelte compiles your code to vanilla JavaScript at build time. No virtual DOM, no framework overhead - just efficient, minimal code.

Think of it this way:
- React/Vue: Ship framework + your code
- Svelte: Ship just your code (compiled)

### Key Concepts

- **Reactivity**: Automatic with assignments (`count += 1`)
- **Components**: `.svelte` files with HTML, CSS, JS
- **Stores**: Built-in state management
- **Transitions**: First-class animation support
- **No Virtual DOM**: Direct DOM updates

### Svelte vs React

| Feature | Svelte | React |
|---------|--------|-------|
| Bundle size | Tiny | Larger |
| Reactivity | Automatic | useState/useEffect |
| Syntax | HTML-like | JSX |
| Learning curve | Easy | Moderate |
| Virtual DOM | No | Yes |

---

# Demonstration

## Example 1: Basic Component

```svelte
<!-- Counter.svelte -->
<script>
  let count = 0;

  // Reactive declaration (computed value)
  $: doubled = count * 2;

  // Reactive statement (runs when count changes)
  $: if (count > 10) {
    console.log('Count is getting high!');
  }

  function increment() {
    count += 1;
  }

  function decrement() {
    count -= 1;
  }

  function reset() {
    count = 0;
  }
</script>

<div class="counter">
  <h1>Count: {count}</h1>
  <p>Doubled: {doubled}</p>

  <button on:click={decrement}>-</button>
  <button on:click={reset}>Reset</button>
  <button on:click={increment}>+</button>
</div>

<style>
  .counter {
    text-align: center;
    padding: 20px;
  }

  button {
    margin: 0 5px;
    padding: 10px 20px;
    font-size: 16px;
  }
</style>
```

## Example 2: Props and Events

```svelte
<!-- UserCard.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  export let user;
  export let selected = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('select', { user });
  }

  function handleDelete() {
    dispatch('delete', { id: user.id });
  }
</script>

<div class="card" class:selected on:click={handleClick}>
  <img src={user.avatar} alt={user.name}>
  <h3>{user.name}</h3>
  <p>{user.email}</p>
  <button on:click|stopPropagation={handleDelete}>Delete</button>
</div>

<style>
  .card {
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
  }

  .card.selected {
    border-color: #007bff;
    background: #f0f7ff;
  }
</style>

<!-- App.svelte -->
<script>
  import UserCard from './UserCard.svelte';

  let users = [
    { id: 1, name: 'Arthur', email: 'art@bpc.com', avatar: '/avatar1.png' },
    { id: 2, name: 'Sarah', email: 'sarah@example.com', avatar: '/avatar2.png' }
  ];

  let selectedId = null;

  function handleSelect(event) {
    selectedId = event.detail.user.id;
  }

  function handleDelete(event) {
    users = users.filter(u => u.id !== event.detail.id);
  }
</script>

{#each users as user (user.id)}
  <UserCard
    {user}
    selected={user.id === selectedId}
    on:select={handleSelect}
    on:delete={handleDelete}
  />
{/each}
```

## Example 3: Stores

```svelte
<!-- stores.js -->
<script context="module">
  import { writable, derived, readable } from 'svelte/store';

  // Writable store
  export const count = writable(0);

  // Derived store (computed)
  export const doubled = derived(count, $count => $count * 2);

  // Custom store with methods
  function createTodoStore() {
    const { subscribe, set, update } = writable([]);

    return {
      subscribe,
      add: (text) => update(todos => [...todos, {
        id: Date.now(),
        text,
        completed: false
      }]),
      toggle: (id) => update(todos =>
        todos.map(t => t.id === id ? {...t, completed: !t.completed} : t)
      ),
      remove: (id) => update(todos => todos.filter(t => t.id !== id)),
      clear: () => set([])
    };
  }

  export const todos = createTodoStore();

  // Readable store (external data)
  export const time = readable(new Date(), set => {
    const interval = setInterval(() => set(new Date()), 1000);
    return () => clearInterval(interval);
  });
</script>

<!-- TodoApp.svelte -->
<script>
  import { todos } from './stores.js';

  let newTodo = '';

  function addTodo() {
    if (newTodo.trim()) {
      todos.add(newTodo);
      newTodo = '';
    }
  }
</script>

<input bind:value={newTodo} on:keydown={e => e.key === 'Enter' && addTodo()}>
<button on:click={addTodo}>Add</button>

<ul>
  {#each $todos as todo (todo.id)}
    <li class:completed={todo.completed}>
      <span on:click={() => todos.toggle(todo.id)}>{todo.text}</span>
      <button on:click={() => todos.remove(todo.id)}>×</button>
    </li>
  {/each}
</ul>

<style>
  .completed {
    text-decoration: line-through;
    opacity: 0.5;
  }
</style>
```

## Example 4: Transitions and Animations

```svelte
<script>
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  let visible = true;
  let items = [1, 2, 3, 4, 5];

  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }

  function remove(item) {
    items = items.filter(i => i !== item);
  }
</script>

<!-- Basic transitions -->
<button on:click={() => visible = !visible}>Toggle</button>

{#if visible}
  <p transition:fade>Fades in and out</p>
  <p transition:fly={{ y: 200, duration: 500 }}>Flies from below</p>
  <p transition:slide>Slides down</p>
  <p transition:scale={{ start: 0.5 }}>Scales up</p>
{/if}

<!-- In/out transitions -->
{#if visible}
  <p in:fly={{ y: -50 }} out:fade>Different in/out</p>
{/if}

<!-- Animated list -->
<button on:click={shuffle}>Shuffle</button>

<ul>
  {#each items as item (item)}
    <li
      animate:flip={{ duration: 300 }}
      transition:scale|local
      on:click={() => remove(item)}
    >
      {item}
    </li>
  {/each}
</ul>

<style>
  li {
    padding: 10px;
    margin: 5px;
    background: #f0f0f0;
    cursor: pointer;
  }
</style>
```

## Example 5: Data Fetching

```svelte
<script>
  import { onMount } from 'svelte';

  let users = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/users');
      users = await response.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  // Or use await blocks
  async function fetchUser(id) {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  }

  let userId = 1;
  $: userPromise = fetchUser(userId);
</script>

<!-- Manual loading state -->
{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <ul>
    {#each users as user}
      <li>{user.name}</li>
    {/each}
  </ul>
{/if}

<!-- Await block -->
<input type="number" bind:value={userId}>

{#await userPromise}
  <p>Loading user...</p>
{:then user}
  <p>{user.name} ({user.email})</p>
{:catch error}
  <p class="error">{error.message}</p>
{/await}
```

**Key Takeaways:**
- Reactivity is automatic with `$:` syntax
- No virtual DOM - compiles to vanilla JS
- Stores provide simple state management
- Built-in transitions and animations
- Scoped CSS by default

---

# Imitation

### Challenge 1: Build a Tabs Component

**Task:** Create a reusable tabs component.

<details>
<summary>Solution</summary>

```svelte
<!-- Tabs.svelte -->
<script>
  export let tabs = [];
  export let activeTab = tabs[0]?.id;
</script>

<div class="tabs">
  <div class="tab-list">
    {#each tabs as tab}
      <button
        class:active={activeTab === tab.id}
        on:click={() => activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    <slot name={activeTab}></slot>
  </div>
</div>

<style>
  .tab-list {
    display: flex;
    border-bottom: 2px solid #ddd;
  }

  button {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
  }

  button.active {
    border-bottom: 2px solid #007bff;
    color: #007bff;
  }
</style>

<!-- Usage -->
<Tabs tabs={[
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' }
]} bind:activeTab>
  <div slot="profile">Profile content</div>
  <div slot="settings">Settings content</div>
</Tabs>
```

</details>

### Challenge 2: Create a Form with Validation

**Task:** Build a form with real-time validation.

<details>
<summary>Solution</summary>

```svelte
<script>
  let form = { name: '', email: '', password: '' };
  let touched = { name: false, email: false, password: false };
  let submitting = false;

  $: errors = {
    name: form.name.length < 2 ? 'Name must be at least 2 characters' : null,
    email: !form.email.includes('@') ? 'Invalid email' : null,
    password: form.password.length < 8 ? 'Password must be at least 8 characters' : null
  };

  $: isValid = !Object.values(errors).some(e => e !== null);

  function handleSubmit() {
    touched = { name: true, email: true, password: true };
    if (isValid) {
      submitting = true;
      // Submit form...
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="field">
    <input
      bind:value={form.name}
      on:blur={() => touched.name = true}
      placeholder="Name"
    >
    {#if touched.name && errors.name}
      <span class="error">{errors.name}</span>
    {/if}
  </div>

  <div class="field">
    <input
      bind:value={form.email}
      on:blur={() => touched.email = true}
      type="email"
      placeholder="Email"
    >
    {#if touched.email && errors.email}
      <span class="error">{errors.email}</span>
    {/if}
  </div>

  <div class="field">
    <input
      bind:value={form.password}
      on:blur={() => touched.password = true}
      type="password"
      placeholder="Password"
    >
    {#if touched.password && errors.password}
      <span class="error">{errors.password}</span>
    {/if}
  </div>

  <button type="submit" disabled={!isValid || submitting}>
    {submitting ? 'Saving...' : 'Submit'}
  </button>
</form>
```

</details>

---

# Practice

### Exercise 1: Todo App with Persistence
**Difficulty:** Beginner

Build a todo app with:
- Add, complete, delete todos
- Filter by status
- Save to localStorage
- Animated transitions

### Exercise 2: Dashboard with Charts
**Difficulty:** Advanced

Create a dashboard:
- Multiple data widgets
- Chart integration (Chart.js)
- Real-time updates
- Theme switching

---

## Summary

**What you learned:**
- Svelte component structure
- Reactive declarations with `$:`
- Props and events
- Stores for state management
- Transitions and animations

**Next Steps:**
- Read: [TypeScript Fundamentals](/api/guides/javascript/typescript)
- Practice: Convert a React app to Svelte
- Build: Create a SvelteKit application

---

## Resources

- [Svelte Documentation](https://svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
