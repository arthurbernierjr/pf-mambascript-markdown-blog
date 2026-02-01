---
title: "DOM Events"
subTitle: "Making Pages Interactive"
excerpt: "Events are how users interact with your page - master them."
featureImage: "/img/dom-events.png"
date: "2026-02-01"
order: 42
---

# Explanation

## What are DOM Events?

Events are actions or occurrences that happen in the browser. JavaScript can listen for and respond to these events to create interactive experiences.

### Event Flow

1. **Capture Phase**: Event travels down from window to target
2. **Target Phase**: Event reaches the target element
3. **Bubble Phase**: Event bubbles up from target to window

---

# Demonstration

## Example 1: Event Listeners

```javascript
const button = document.querySelector('button');

// Add event listener
button.addEventListener('click', function(event) {
    console.log('Button clicked!');
    console.log('Target:', event.target);
    console.log('Current target:', event.currentTarget);
});

// Arrow function (no own 'this')
button.addEventListener('click', (e) => {
    console.log('Clicked');
});

// Named function (can be removed)
function handleClick(e) {
    console.log('Clicked');
}
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);

// Options
button.addEventListener('click', handler, {
    once: true,      // Remove after first trigger
    capture: true,   // Listen in capture phase
    passive: true    // Won't call preventDefault
});

// Multiple events
['mouseenter', 'focus'].forEach(event => {
    button.addEventListener(event, () => {
        button.classList.add('highlight');
    });
});

// Event listener with AbortController
const controller = new AbortController();

button.addEventListener('click', handleClick, {
    signal: controller.signal
});

// Remove all listeners associated with signal
controller.abort();
```

## Example 2: Event Object

```javascript
document.addEventListener('click', (event) => {
    // Target elements
    console.log(event.target);         // Element that triggered event
    console.log(event.currentTarget);  // Element listener is attached to

    // Event type
    console.log(event.type);  // 'click'

    // Mouse position
    console.log(event.clientX, event.clientY);  // Viewport coords
    console.log(event.pageX, event.pageY);      // Page coords
    console.log(event.screenX, event.screenY);  // Screen coords
    console.log(event.offsetX, event.offsetY);  // Relative to target

    // Modifier keys
    console.log(event.ctrlKey);   // Ctrl held?
    console.log(event.shiftKey);  // Shift held?
    console.log(event.altKey);    // Alt held?
    console.log(event.metaKey);   // Cmd (Mac) / Win key

    // Mouse button
    console.log(event.button);  // 0=left, 1=middle, 2=right

    // Timing
    console.log(event.timeStamp);  // Time since page load

    // Prevent default action
    event.preventDefault();

    // Stop propagation
    event.stopPropagation();
    event.stopImmediatePropagation();  // Also stops other handlers
});

// Keyboard events
document.addEventListener('keydown', (event) => {
    console.log(event.key);       // 'a', 'Enter', 'ArrowUp'
    console.log(event.code);      // 'KeyA', 'Enter', 'ArrowUp'
    console.log(event.keyCode);   // Deprecated but still used
    console.log(event.repeat);    // Key held down?

    // Common shortcuts
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        console.log('Save shortcut');
    }
});
```

## Example 3: Event Delegation

```javascript
// Instead of adding listeners to each item...
// BAD: Doesn't scale
document.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        console.log(li.textContent);
    });
});

// GOOD: Use delegation
document.querySelector('ul').addEventListener('click', (event) => {
    // Check if click was on an li
    if (event.target.matches('li')) {
        console.log(event.target.textContent);
    }
});

// Handle nested elements
document.querySelector('ul').addEventListener('click', (event) => {
    const li = event.target.closest('li');
    if (li) {
        console.log(li.textContent);
    }
});

// Delegation with data attributes
document.body.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (!action) return;

    switch (action) {
        case 'edit':
            editItem(event.target.closest('[data-id]').dataset.id);
            break;
        case 'delete':
            deleteItem(event.target.closest('[data-id]').dataset.id);
            break;
    }
});

// Works with dynamically added elements
const addNewItem = () => {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>New Item</span>
        <button data-action="edit">Edit</button>
        <button data-action="delete">Delete</button>
    `;
    li.dataset.id = Date.now();
    document.querySelector('ul').appendChild(li);
    // No need to add event listeners - delegation handles it!
};
```

## Example 4: Common Events

```javascript
// Mouse events
element.addEventListener('click', handler);
element.addEventListener('dblclick', handler);
element.addEventListener('mousedown', handler);
element.addEventListener('mouseup', handler);
element.addEventListener('mouseenter', handler);  // No bubble
element.addEventListener('mouseleave', handler);  // No bubble
element.addEventListener('mouseover', handler);   // Bubbles
element.addEventListener('mouseout', handler);    // Bubbles
element.addEventListener('mousemove', handler);
element.addEventListener('contextmenu', handler); // Right-click

// Keyboard events
document.addEventListener('keydown', handler);    // Key pressed
document.addEventListener('keyup', handler);      // Key released
document.addEventListener('keypress', handler);   // Deprecated

// Form events
form.addEventListener('submit', handler);
input.addEventListener('focus', handler);
input.addEventListener('blur', handler);
input.addEventListener('change', handler);        // After blur
input.addEventListener('input', handler);         // Every keystroke
select.addEventListener('change', handler);

// Window events
window.addEventListener('load', handler);         // All loaded
window.addEventListener('DOMContentLoaded', handler); // DOM ready
window.addEventListener('resize', handler);
window.addEventListener('scroll', handler);
window.addEventListener('beforeunload', handler);
window.addEventListener('hashchange', handler);
window.addEventListener('popstate', handler);     // History

// Touch events
element.addEventListener('touchstart', handler);
element.addEventListener('touchmove', handler);
element.addEventListener('touchend', handler);
element.addEventListener('touchcancel', handler);

// Drag events
draggable.addEventListener('dragstart', handler);
draggable.addEventListener('drag', handler);
draggable.addEventListener('dragend', handler);
dropzone.addEventListener('dragenter', handler);
dropzone.addEventListener('dragover', handler);
dropzone.addEventListener('dragleave', handler);
dropzone.addEventListener('drop', handler);
```

## Example 5: Custom Events

```javascript
// Create custom event
const customEvent = new CustomEvent('myevent', {
    bubbles: true,
    cancelable: true,
    detail: { message: 'Hello!' }
});

// Dispatch event
element.dispatchEvent(customEvent);

// Listen for custom event
element.addEventListener('myevent', (event) => {
    console.log(event.detail.message);  // 'Hello!'
});

// Event-based communication
class EventBus {
    constructor() {
        this.target = new EventTarget();
    }

    on(event, callback) {
        this.target.addEventListener(event, callback);
    }

    off(event, callback) {
        this.target.removeEventListener(event, callback);
    }

    emit(event, data) {
        this.target.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
}

const bus = new EventBus();

bus.on('user:login', (e) => {
    console.log('User logged in:', e.detail);
});

bus.emit('user:login', { id: 1, name: 'Arthur' });

// Component communication
class Counter extends HTMLElement {
    constructor() {
        super();
        this.count = 0;
    }

    increment() {
        this.count++;
        this.dispatchEvent(new CustomEvent('countchange', {
            bubbles: true,
            detail: { count: this.count }
        }));
    }
}

document.addEventListener('countchange', (e) => {
    console.log('Count changed to:', e.detail.count);
});
```

## Example 6: Event Patterns

```javascript
// Debounce - wait for pause
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

const handleSearch = debounce((query) => {
    console.log('Searching:', query);
}, 300);

searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

// Throttle - limit rate
function throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.addEventListener('scroll', throttle(() => {
    console.log('Scroll position:', window.scrollY);
}, 100));

// Once helper
function once(element, event, handler) {
    element.addEventListener(event, handler, { once: true });
}

// Promise-based event
function waitForEvent(element, event) {
    return new Promise(resolve => {
        element.addEventListener(event, resolve, { once: true });
    });
}

const click = await waitForEvent(button, 'click');
console.log('Button was clicked!', click);

// Async iteration over events
async function* eventIterator(element, event) {
    while (true) {
        yield await waitForEvent(element, event);
    }
}

for await (const event of eventIterator(button, 'click')) {
    console.log('Click:', event);
}
```

**Key Takeaways:**
- Use addEventListener, not inline handlers
- Event delegation for dynamic content
- Understand capture vs bubble
- Debounce/throttle for performance
- Custom events for component communication

---

# Imitation

### Challenge 1: Build a Keyboard Shortcut System

**Task:** Create a system to register and handle keyboard shortcuts.

<details>
<summary>Solution</summary>

```javascript
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    register(combo, callback, description = '') {
        const key = this.normalizeCombo(combo);
        this.shortcuts.set(key, { callback, description, combo });
        return () => this.shortcuts.delete(key);  // Unregister function
    }

    normalizeCombo(combo) {
        return combo
            .toLowerCase()
            .split('+')
            .map(k => k.trim())
            .sort()
            .join('+');
    }

    getActiveCombo(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        parts.push(event.key.toLowerCase());
        return parts.sort().join('+');
    }

    handleKeydown(event) {
        const combo = this.getActiveCombo(event);
        const shortcut = this.shortcuts.get(combo);

        if (shortcut) {
            event.preventDefault();
            shortcut.callback(event);
        }
    }

    list() {
        return [...this.shortcuts.values()]
            .map(({ combo, description }) => ({ combo, description }));
    }
}

const shortcuts = new KeyboardShortcuts();

shortcuts.register('ctrl+s', () => {
    console.log('Save!');
}, 'Save document');

shortcuts.register('ctrl+shift+p', () => {
    console.log('Command palette');
}, 'Open command palette');

const unregister = shortcuts.register('ctrl+z', () => {
    console.log('Undo');
}, 'Undo last action');

// Later: unregister()
```

</details>

---

# Practice

### Exercise 1: Drag and Drop
**Difficulty:** Intermediate

Implement drag and drop list reordering.

### Exercise 2: Gesture Recognition
**Difficulty:** Advanced

Detect swipe gestures using touch events.

---

## Summary

**What you learned:**
- Adding and removing listeners
- Event object properties
- Event delegation
- Common event types
- Custom events and patterns

**Next Steps:**
- Read: [DOM Selectors](/api/guides/javascript/dom/selectors)
- Practice: Build interactive components
- Explore: Pointer events, Intersection Observer

---

## Resources

- [MDN: Events](https://developer.mozilla.org/en-US/docs/Web/Events)
- [JavaScript.info: Events](https://javascript.info/events)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
