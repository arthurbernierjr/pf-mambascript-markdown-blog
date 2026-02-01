---
title: "DOM Manipulation"
subTitle: "Creating and Modifying Elements"
excerpt: "Change the page dynamically with DOM manipulation techniques."
featureImage: "/img/dom-manipulation.png"
date: "2026-02-01"
order: 41
---

# Explanation

## What is DOM Manipulation?

DOM manipulation is the process of using JavaScript to modify the document structure, content, or styling. It's the foundation of dynamic web pages.

### Key Operations

| Operation | Methods |
|-----------|---------|
| Create | createElement, createTextNode |
| Insert | appendChild, insertBefore, append |
| Remove | remove, removeChild |
| Modify | textContent, innerHTML, attributes |
| Clone | cloneNode |

---

# Demonstration

## Example 1: Creating Elements

```javascript
// Create element
const div = document.createElement('div');
div.className = 'card';
div.id = 'my-card';

// Set content
div.textContent = 'Hello World';  // Safe, escapes HTML
div.innerHTML = '<strong>Hello</strong> World';  // Parses HTML

// Set attributes
div.setAttribute('data-id', '123');
div.dataset.category = 'featured';  // data-category="featured"
div.setAttribute('aria-label', 'Card description');

// Set styles
div.style.backgroundColor = 'blue';
div.style.padding = '20px';
div.style.cssText = 'background: blue; padding: 20px;';

// Create complex structure
const card = document.createElement('div');
card.className = 'card';

const header = document.createElement('header');
header.textContent = 'Card Title';

const body = document.createElement('div');
body.className = 'card-body';
body.textContent = 'Card content here';

card.appendChild(header);
card.appendChild(body);

// Using template literals (careful with XSS!)
function createCard(data) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <header>${escapeHtml(data.title)}</header>
        <div class="card-body">${escapeHtml(data.content)}</div>
    `;
    return div;
}

// HTML escaping utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

## Example 2: Inserting Elements

```javascript
const container = document.getElementById('container');
const newElement = document.createElement('div');

// appendChild - add as last child
container.appendChild(newElement);

// insertBefore - insert before reference node
const reference = container.firstChild;
container.insertBefore(newElement, reference);

// Modern insertion methods (more flexible)
container.append(element1, element2, 'text');  // Adds at end
container.prepend(element);  // Adds at beginning
container.after(element);    // Insert after container
container.before(element);   // Insert before container

// Replace element
const oldElement = document.getElementById('old');
const newEl = document.createElement('div');
oldElement.replaceWith(newEl);
// Or: oldElement.parentNode.replaceChild(newEl, oldElement);

// Insert at specific position
container.insertAdjacentHTML('beforebegin', '<div>Before</div>');
container.insertAdjacentHTML('afterbegin', '<div>First child</div>');
container.insertAdjacentHTML('beforeend', '<div>Last child</div>');
container.insertAdjacentHTML('afterend', '<div>After</div>');

// insertAdjacentElement (safer than innerHTML)
const el = document.createElement('div');
container.insertAdjacentElement('beforeend', el);

// Insert text
container.insertAdjacentText('beforeend', 'Some text');

// Batch insertion with DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);
```

## Example 3: Removing and Cloning

```javascript
// Remove element
const element = document.getElementById('to-remove');
element.remove();  // Modern way

// Or from parent
element.parentNode.removeChild(element);

// Remove all children
const container = document.getElementById('container');

// Method 1: innerHTML (fast but loses event listeners)
container.innerHTML = '';

// Method 2: Loop removal
while (container.firstChild) {
    container.removeChild(container.firstChild);
}

// Method 3: replaceChildren (modern)
container.replaceChildren();  // Empty
container.replaceChildren(newChild1, newChild2);  // Replace with new

// Clone element
const original = document.getElementById('template');
const shallowClone = original.cloneNode(false);  // Element only
const deepClone = original.cloneNode(true);      // With children

// Clone with event listeners (use delegation instead)
// Event listeners are NOT cloned

// Using template element
const template = document.getElementById('card-template');
const clone = template.content.cloneNode(true);
document.body.appendChild(clone);
```

## Example 4: Modifying Attributes

```javascript
const element = document.querySelector('.my-element');

// Standard attributes
element.id = 'new-id';
element.className = 'class1 class2';

// classList API
element.classList.add('active');
element.classList.remove('inactive');
element.classList.toggle('visible');
element.classList.toggle('active', shouldBeActive);  // Force add/remove
element.classList.replace('old-class', 'new-class');
element.classList.contains('active');  // Check

// Multiple classes
element.classList.add('class1', 'class2', 'class3');

// Generic attribute methods
element.getAttribute('data-id');
element.setAttribute('data-id', '123');
element.removeAttribute('data-id');
element.hasAttribute('data-id');

// Data attributes
element.dataset.userId = '123';      // Sets data-user-id
console.log(element.dataset.userId); // Gets data-user-id
delete element.dataset.userId;       // Removes

// Form element properties
const input = document.querySelector('input');
input.value = 'Hello';
input.checked = true;
input.disabled = false;
input.required = true;

// Boolean attributes
const checkbox = document.querySelector('[type="checkbox"]');
checkbox.checked = true;   // Check
checkbox.checked = false;  // Uncheck

// Custom properties (not reflected in HTML)
element.customData = { foo: 'bar' };
```

## Example 5: Modifying Styles

```javascript
const element = document.querySelector('.box');

// Inline styles
element.style.backgroundColor = 'red';
element.style.marginTop = '20px';
element.style.setProperty('--custom-color', 'blue');
element.style.cssText = 'background: red; padding: 10px;';

// Get computed style
const styles = getComputedStyle(element);
console.log(styles.backgroundColor);
console.log(styles.getPropertyValue('margin-top'));

// Toggle class for styling (preferred)
element.classList.toggle('highlighted');

// Animate with styles
async function fadeOut(element) {
    element.style.transition = 'opacity 0.5s';
    element.style.opacity = '0';

    await new Promise(resolve =>
        element.addEventListener('transitionend', resolve, { once: true })
    );

    element.remove();
}

// CSS custom properties
document.documentElement.style.setProperty('--primary-color', '#007bff');

// Style multiple elements
document.querySelectorAll('.card').forEach(card => {
    card.style.border = '1px solid gray';
});

// Add stylesheet dynamically
const style = document.createElement('style');
style.textContent = `
    .dynamic-class {
        color: red;
        font-weight: bold;
    }
`;
document.head.appendChild(style);
```

## Example 6: Working with Templates

```html
<!-- HTML Template -->
<template id="card-template">
    <div class="card">
        <h2 class="card-title"></h2>
        <p class="card-body"></p>
        <button class="card-btn">Learn More</button>
    </div>
</template>
```

```javascript
// Using the template
function createCardFromTemplate(data) {
    const template = document.getElementById('card-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.card-title').textContent = data.title;
    clone.querySelector('.card-body').textContent = data.body;
    clone.querySelector('.card-btn').addEventListener('click', () => {
        console.log('Clicked:', data.title);
    });

    return clone;
}

// Render multiple cards
const cards = [
    { title: 'Card 1', body: 'Content 1' },
    { title: 'Card 2', body: 'Content 2' },
];

const container = document.getElementById('cards');
const fragment = document.createDocumentFragment();

cards.forEach(card => {
    fragment.appendChild(createCardFromTemplate(card));
});

container.appendChild(fragment);

// Component pattern
class Card {
    constructor(data) {
        this.data = data;
        this.element = this.render();
    }

    render() {
        const template = document.getElementById('card-template');
        const clone = template.content.cloneNode(true);

        clone.querySelector('.card-title').textContent = this.data.title;
        clone.querySelector('.card-body').textContent = this.data.body;

        // Store reference for updates
        this.titleEl = clone.querySelector('.card-title');
        this.bodyEl = clone.querySelector('.card-body');

        return clone.firstElementChild;
    }

    update(data) {
        this.data = { ...this.data, ...data };
        this.titleEl.textContent = this.data.title;
        this.bodyEl.textContent = this.data.body;
    }

    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    unmount() {
        this.element.remove();
    }
}

const card = new Card({ title: 'Hello', body: 'World' });
card.mount(document.body);
card.update({ title: 'Updated Title' });
```

**Key Takeaways:**
- createElement for safe element creation
- textContent over innerHTML for security
- Use DocumentFragment for batch operations
- classList for managing classes
- Templates for reusable structures

---

# Imitation

### Challenge 1: Build a Todo List

**Task:** Create a todo list with add, remove, and toggle functionality.

<details>
<summary>Solution</summary>

```javascript
class TodoList {
    constructor(container) {
        this.container = container;
        this.todos = [];
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <form class="todo-form">
                <input type="text" placeholder="Add todo..." required>
                <button type="submit">Add</button>
            </form>
            <ul class="todo-list"></ul>
        `;

        this.form = this.container.querySelector('.todo-form');
        this.input = this.container.querySelector('input');
        this.list = this.container.querySelector('.todo-list');

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo(this.input.value);
            this.input.value = '';
        });

        this.list.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (!li) return;

            if (e.target.matches('.delete-btn')) {
                this.removeTodo(li.dataset.id);
            } else {
                this.toggleTodo(li.dataset.id);
            }
        });
    }

    addTodo(text) {
        const todo = {
            id: Date.now().toString(),
            text,
            completed: false
        };
        this.todos.push(todo);
        this.renderTodo(todo);
    }

    renderTodo(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        li.className = todo.completed ? 'completed' : '';
        li.innerHTML = `
            <span>${escapeHtml(todo.text)}</span>
            <button class="delete-btn">×</button>
        `;
        this.list.appendChild(li);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            const li = this.list.querySelector(`[data-id="${id}"]`);
            li.classList.toggle('completed');
        }
    }

    removeTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        const li = this.list.querySelector(`[data-id="${id}"]`);
        li.remove();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

new TodoList(document.getElementById('app'));
```

</details>

---

# Practice

### Exercise 1: Dynamic Table
**Difficulty:** Beginner

Create a function that generates a table from an array of objects.

### Exercise 2: Modal Component
**Difficulty:** Intermediate

Build a reusable modal component with open/close functionality.

---

## Summary

**What you learned:**
- Creating elements
- Inserting and removing
- Modifying attributes and styles
- Working with templates
- Component patterns

**Next Steps:**
- Read: [DOM Events](/api/guides/javascript/dom/events)
- Practice: Build UI components
- Explore: Virtual DOM concepts

---

## Resources

- [MDN: Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [JavaScript.info: Modifying the document](https://javascript.info/modifying-document)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
