---
title: "Vue.js Fundamentals"
subTitle: "The Progressive JavaScript Framework"
excerpt: "Vue makes the simple things easy and the complex things possible."
featureImage: "/img/vue.png"
date: "2026-02-01"
order: 751
---

# Explanation

## Why Vue?

Vue.js is called the "progressive framework" because you can adopt it incrementally. Start with a simple script tag and scale up to a full SPA. It combines the best ideas from React and Angular.

Think of Vue like a well-designed tool:
- Easy to pick up
- Powerful when you need it
- Gets out of your way

### Key Concepts

- **Reactivity**: Data changes automatically update the DOM
- **Components**: Reusable, self-contained pieces
- **Directives**: Special attributes (v-if, v-for, v-bind)
- **Composition API**: Modern way to organize logic (Vue 3)

### Vue vs React

| Feature | Vue | React |
|---------|-----|-------|
| Template | HTML-based | JSX |
| Reactivity | Automatic | Manual (useState) |
| Learning curve | Gentle | Moderate |
| Two-way binding | Built-in (v-model) | Manual |
| Official router/state | Yes | Community |

---

# Demonstration

## Example 1: Vue Basics (Options API)

```vue
<template>
  <div class="counter">
    <h1>Count: {{ count }}</h1>
    <p>Double: {{ doubleCount }}</p>

    <button @click="decrement">-</button>
    <button @click="reset">Reset</button>
    <button @click="increment">+</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',

  // Reactive data
  data() {
    return {
      count: 0
    }
  },

  // Computed properties (cached)
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },

  // Methods
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    reset() {
      this.count = 0
    }
  },

  // Lifecycle hooks
  mounted() {
    console.log('Component mounted!')
  }
}
</script>

<style scoped>
.counter {
  text-align: center;
  padding: 20px;
}
button {
  margin: 0 5px;
  padding: 10px 20px;
}
</style>
```

## Example 2: Composition API (Vue 3)

```vue
<template>
  <div class="user-profile">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <button @click="refresh">Refresh</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Reactive state
const user = ref(null)
const loading = ref(true)
const error = ref(null)

// Fetch function
const fetchUser = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/users/1')
    user.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Refresh handler
const refresh = () => {
  fetchUser()
}

// Lifecycle
onMounted(() => {
  fetchUser()
})
</script>
```

## Example 3: Forms and v-model

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>Name</label>
      <input v-model="form.name" required>
    </div>

    <div class="form-group">
      <label>Email</label>
      <input v-model="form.email" type="email" required>
    </div>

    <div class="form-group">
      <label>Role</label>
      <select v-model="form.role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" v-model="form.newsletter">
        Subscribe to newsletter
      </label>
    </div>

    <button type="submit" :disabled="!isValid">
      {{ submitting ? 'Saving...' : 'Save' }}
    </button>
  </form>

  <pre>{{ form }}</pre>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  role: 'user',
  newsletter: false
})

const submitting = ref(false)

const isValid = computed(() => {
  return form.name.length > 0 && form.email.includes('@')
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    alert('Saved!')
  } finally {
    submitting.value = false
  }
}
</script>
```

**Key Takeaways:**
- `ref()` for primitives, `reactive()` for objects
- `v-model` for two-way binding
- `@click` is shorthand for `v-on:click`
- `:disabled` is shorthand for `v-bind:disabled`
- `<script setup>` is the modern, concise syntax

---

# Imitation

### Challenge 1: Build a Todo List

**Task:** Create a todo list with add, complete, and delete functionality.

<details>
<summary>Solution</summary>

```vue
<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([])

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value,
      completed: false
    })
    newTodo.value = ''
  }
}

const toggleTodo = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.completed = !todo.completed
}

const deleteTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
}
</script>

<template>
  <input v-model="newTodo" @keyup.enter="addTodo">
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span :class="{ done: todo.completed }" @click="toggleTodo(todo.id)">
        {{ todo.text }}
      </span>
      <button @click="deleteTodo(todo.id)">X</button>
    </li>
  </ul>
</template>
```

</details>

### Challenge 2: Create a Search Filter

**Task:** Filter a list of items as the user types.

<details>
<summary>Solution</summary>

```vue
<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const items = ref(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'])

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>

<template>
  <input v-model="search" placeholder="Search...">
  <ul>
    <li v-for="item in filteredItems" :key="item">{{ item }}</li>
  </ul>
</template>
```

</details>

---

# Practice

### Exercise 1: User Card Component
**Difficulty:** Beginner

Create a reusable UserCard component that accepts props:
- name, email, avatar, role
- Emit an event when clicked

### Exercise 2: Data Fetching Composable
**Difficulty:** Intermediate

Create a reusable composable for data fetching:

```javascript
const { data, loading, error, refetch } = useFetch('/api/users')
```

---

## Summary

**What you learned:**
- Vue component structure (template, script, style)
- Reactivity with ref() and reactive()
- Directives: v-if, v-for, v-model, v-bind, v-on
- Composition API for organizing logic

**Next Steps:**
- Read: [Angular Fundamentals](/api/guides/frontend/angular)
- Practice: Build a weather app with Vue
- Build: Create a full SPA with Vue Router

---

## Resources

- [Vue.js Documentation](https://vuejs.org/)
- [Vue School](https://vueschool.io/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
