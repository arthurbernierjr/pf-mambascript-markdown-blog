---
title: "DOM Selectors"
subTitle: "Finding Elements in the Document"
excerpt: "Master DOM selection to manipulate any element on the page."
featureImage: "/img/dom-selectors.png"
date: "2026-02-01"
order: 40
---

# Explanation

## What is the DOM?

The Document Object Model (DOM) is a programming interface for web documents. It represents the page as a tree of nodes that JavaScript can read and manipulate.

### Selection Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| getElementById | Single element | Unique ID |
| querySelector | First match | CSS selector |
| querySelectorAll | NodeList | Multiple elements |
| getElementsByClassName | HTMLCollection | Class-based |
| getElementsByTagName | HTMLCollection | Tag-based |

---

# Demonstration

## Example 1: Basic Selectors

```javascript
// By ID (fastest)
const header = document.getElementById('header');

// By CSS selector (most flexible)
const firstButton = document.querySelector('button');
const navLink = document.querySelector('nav a.active');
const dataElement = document.querySelector('[data-id="123"]');

// All matching elements
const allButtons = document.querySelectorAll('button');
const listItems = document.querySelectorAll('ul > li');

// By class name (returns live HTMLCollection)
const cards = document.getElementsByClassName('card');

// By tag name
const paragraphs = document.getElementsByTagName('p');

// Complex selectors
const element = document.querySelector(`
    .container > .content:not(.hidden)
    article:first-of-type
    p.intro
`);

// Multiple selectors
const interactive = document.querySelectorAll('button, a, input, select');
```

## Example 2: Traversing the DOM

```javascript
const element = document.querySelector('.target');

// Parent
const parent = element.parentElement;
const parentNode = element.parentNode;  // Includes text nodes

// Children
const children = element.children;      // HTMLCollection
const childNodes = element.childNodes;  // Includes text nodes
const firstChild = element.firstElementChild;
const lastChild = element.lastElementChild;

// Siblings
const nextSibling = element.nextElementSibling;
const prevSibling = element.previousElementSibling;

// Closest ancestor matching selector
const closestSection = element.closest('section');
const closestForm = element.closest('form');

// Check if contains another element
const container = document.querySelector('.container');
const isContained = container.contains(element);

// Find within element
const form = document.querySelector('form');
const inputs = form.querySelectorAll('input');
const submitBtn = form.querySelector('[type="submit"]');

// Traversal utilities
function getAllParents(element) {
    const parents = [];
    let current = element.parentElement;

    while (current) {
        parents.push(current);
        current = current.parentElement;
    }

    return parents;
}

function getAllSiblings(element) {
    return [...element.parentElement.children]
        .filter(child => child !== element);
}
```

## Example 3: NodeList vs HTMLCollection

```javascript
// querySelectorAll returns NodeList (static)
const nodeList = document.querySelectorAll('.item');
console.log(nodeList instanceof NodeList);  // true

// NodeList is static - doesn't update when DOM changes
document.body.innerHTML += '<div class="item">New</div>';
console.log(nodeList.length);  // Same as before

// NodeList can use forEach
nodeList.forEach(item => console.log(item));

// Convert to array for more methods
const nodeArray = [...nodeList];
const filtered = nodeArray.filter(item => item.classList.contains('active'));

// getElementsBy* returns HTMLCollection (live)
const htmlCollection = document.getElementsByClassName('item');
console.log(htmlCollection instanceof HTMLCollection);  // true

// HTMLCollection updates automatically
document.body.innerHTML += '<div class="item">New</div>';
console.log(htmlCollection.length);  // Increased by 1

// HTMLCollection doesn't have forEach - convert first
[...htmlCollection].forEach(item => console.log(item));

// Or use for...of
for (const item of htmlCollection) {
    console.log(item);
}
```

## Example 4: Attribute and State Selectors

```javascript
// By attribute
const dataElements = document.querySelectorAll('[data-type]');
const specificData = document.querySelectorAll('[data-type="user"]');
const startsWith = document.querySelectorAll('[href^="https"]');
const endsWith = document.querySelectorAll('[src$=".png"]');
const contains = document.querySelectorAll('[class*="btn"]');

// Form states
const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
const disabledInputs = document.querySelectorAll('input:disabled');
const requiredFields = document.querySelectorAll('input:required');
const invalidFields = document.querySelectorAll('input:invalid');
const focusedElement = document.querySelector(':focus');

// Structural pseudo-classes
const firstItems = document.querySelectorAll('li:first-child');
const lastItems = document.querySelectorAll('li:last-child');
const oddRows = document.querySelectorAll('tr:nth-child(odd)');
const everyThird = document.querySelectorAll('li:nth-child(3n)');
const emptyElements = document.querySelectorAll('div:empty');

// Negation
const notHidden = document.querySelectorAll('.item:not(.hidden)');
const notDisabled = document.querySelectorAll('button:not(:disabled)');

// Check if element matches selector
const element = document.querySelector('.card');
console.log(element.matches('.card.active'));  // true/false
console.log(element.matches(':hover'));         // Check hover state
```

## Example 5: Performance Optimization

```javascript
// Cache selectors
const elements = {
    header: document.getElementById('header'),
    nav: document.getElementById('nav'),
    main: document.querySelector('main'),
    footer: document.getElementById('footer')
};

// Scope queries to parent element
const form = document.getElementById('user-form');
const inputs = form.querySelectorAll('input');  // Only searches within form

// Use specific selectors
// Slower: document.querySelectorAll('.card')
// Faster: document.getElementById('container').getElementsByClassName('card')

// Avoid querying in loops
// Bad
for (let i = 0; i < 100; i++) {
    document.getElementById('output').textContent += i;
}

// Good
const output = document.getElementById('output');
let text = '';
for (let i = 0; i < 100; i++) {
    text += i;
}
output.textContent = text;

// Use DocumentFragment for batch operations
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);

// Delegation instead of many listeners
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.matches('li')) {
        console.log('Clicked:', e.target.textContent);
    }
});
```

## Example 6: Utility Functions

```javascript
// Shorthand selectors (like jQuery)
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Usage
const header = $('#header');
const buttons = $$('button');
const formInputs = $$('input', $('#my-form'));

// Find by text content
function findByText(selector, text) {
    return [...document.querySelectorAll(selector)]
        .find(el => el.textContent.includes(text));
}

const aboutLink = findByText('a', 'About');

// Find visible elements
function findVisible(selector) {
    return [...document.querySelectorAll(selector)]
        .filter(el => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return style.display !== 'none' &&
                   style.visibility !== 'hidden' &&
                   rect.width > 0 &&
                   rect.height > 0;
        });
}

// Wait for element to exist
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found`));
        }, timeout);
    });
}

// Usage
const dynamicElement = await waitForElement('.lazy-loaded');

// Find element by XPath (rarely needed)
function findByXPath(xpath) {
    return document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
}
```

**Key Takeaways:**
- querySelector/All for most cases
- getElementById is fastest for IDs
- NodeList is static, HTMLCollection is live
- Cache selections for performance
- Use delegation for dynamic content

---

# Imitation

### Challenge 1: Build a DOM Query Library

**Task:** Create a mini jQuery-like library for DOM manipulation.

<details>
<summary>Solution</summary>

```javascript
class Query {
    constructor(selector) {
        if (typeof selector === 'string') {
            this.elements = [...document.querySelectorAll(selector)];
        } else if (selector instanceof Element) {
            this.elements = [selector];
        } else if (Array.isArray(selector)) {
            this.elements = selector;
        }
    }

    // Selection
    find(selector) {
        const found = this.elements.flatMap(el =>
            [...el.querySelectorAll(selector)]
        );
        return new Query(found);
    }

    filter(selector) {
        const filtered = this.elements.filter(el => el.matches(selector));
        return new Query(filtered);
    }

    first() {
        return new Query(this.elements[0] ? [this.elements[0]] : []);
    }

    last() {
        return new Query(this.elements.length
            ? [this.elements[this.elements.length - 1]]
            : []);
    }

    // Traversal
    parent() {
        return new Query(this.elements.map(el => el.parentElement).filter(Boolean));
    }

    children(selector) {
        const children = this.elements.flatMap(el => [...el.children]);
        return selector
            ? new Query(children.filter(c => c.matches(selector)))
            : new Query(children);
    }

    closest(selector) {
        const closest = this.elements.map(el => el.closest(selector)).filter(Boolean);
        return new Query([...new Set(closest)]);
    }

    // Iteration
    each(callback) {
        this.elements.forEach((el, i) => callback(el, i));
        return this;
    }

    // DOM manipulation helpers
    addClass(className) {
        return this.each(el => el.classList.add(className));
    }

    removeClass(className) {
        return this.each(el => el.classList.remove(className));
    }

    toggleClass(className) {
        return this.each(el => el.classList.toggle(className));
    }
}

// Factory function
const $ = selector => new Query(selector);

// Usage
$('.card').addClass('active').find('button').each(btn => {
    console.log(btn.textContent);
});
```

</details>

---

# Practice

### Exercise 1: Form Validator
**Difficulty:** Beginner

Select and validate all form fields using DOM methods.

### Exercise 2: Table Filter
**Difficulty:** Intermediate

Filter table rows based on search input using selectors.

---

## Summary

**What you learned:**
- Various selection methods
- DOM traversal
- NodeList vs HTMLCollection
- Attribute selectors
- Performance best practices

**Next Steps:**
- Read: [DOM Manipulation](/api/guides/javascript/dom/manipulation)
- Practice: Build interactive components
- Explore: MutationObserver

---

## Resources

- [MDN: Document](https://developer.mozilla.org/en-US/docs/Web/API/Document)
- [JavaScript.info: Searching](https://javascript.info/searching-elements-dom)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
