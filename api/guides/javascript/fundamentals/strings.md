---
title: "JavaScript Strings"
subTitle: "Working with Text"
excerpt: "Strings are everywhere - master them to manipulate text like a pro."
featureImage: "/img/js-strings.png"
date: "2026-02-01"
order: 14
---

# Explanation

## Strings in JavaScript

Strings are sequences of characters used to represent text. JavaScript provides powerful methods for string manipulation, searching, and transformation.

### Key Concepts

- **Immutability**: Strings cannot be changed after creation
- **Template Literals**: ES6 syntax for string interpolation
- **Unicode**: Full Unicode support
- **Methods**: Rich set of built-in methods

---

# Demonstration

## Example 1: String Basics

```javascript
// String creation
const single = 'Hello';
const double = "World";
const template = `Hello ${double}`;
const multiline = `
    Line 1
    Line 2
`;

// String properties
console.log('Hello'.length);  // 5

// Character access
const str = 'JavaScript';
console.log(str[0]);          // 'J'
console.log(str.charAt(0));   // 'J'
console.log(str.at(-1));      // 't' (ES2022)

// Strings are immutable
let text = 'Hello';
text[0] = 'h';  // Does nothing
console.log(text);  // 'Hello'

// Must create new string
text = 'h' + text.slice(1);  // 'hello'

// Unicode
const emoji = '😀';
console.log(emoji.length);       // 2 (surrogate pair)
console.log([...emoji].length);  // 1
console.log(emoji.codePointAt(0));  // 128512
```

## Example 2: Search Methods

```javascript
const text = 'The quick brown fox jumps over the lazy dog';

// includes() - check if substring exists
console.log(text.includes('fox'));     // true
console.log(text.includes('cat'));     // false
console.log(text.includes('THE'));     // false (case-sensitive)

// indexOf() / lastIndexOf() - find position
console.log(text.indexOf('the'));      // 31
console.log(text.indexOf('THE'));      // -1 (not found)
console.log(text.lastIndexOf('the'));  // 31

// startsWith() / endsWith()
console.log(text.startsWith('The'));   // true
console.log(text.endsWith('dog'));     // true
console.log(text.startsWith('quick', 4));  // true (from index 4)

// search() - with regex
console.log(text.search(/fox/));       // 16
console.log(text.search(/FOX/i));      // 16 (case-insensitive)

// match() - find matches
console.log(text.match(/o/g));         // ['o', 'o', 'o', 'o']
console.log(text.match(/\b\w{4}\b/g)); // ['quick', 'brown', 'over', 'lazy']

// matchAll() - get all match details (ES2020)
const matches = [...text.matchAll(/the/gi)];
console.log(matches.map(m => ({ match: m[0], index: m.index })));
// [{ match: 'The', index: 0 }, { match: 'the', index: 31 }]
```

## Example 3: Transformation Methods

```javascript
// Case conversion
const str = 'Hello World';
console.log(str.toUpperCase());  // 'HELLO WORLD'
console.log(str.toLowerCase());  // 'hello world'

// Trim whitespace
const padded = '  hello  ';
console.log(padded.trim());       // 'hello'
console.log(padded.trimStart());  // 'hello  '
console.log(padded.trimEnd());    // '  hello'

// Padding
console.log('5'.padStart(3, '0'));   // '005'
console.log('5'.padEnd(3, '0'));     // '500'
console.log('hi'.padStart(10, '-')); // '--------hi'

// Repeat
console.log('ha'.repeat(3));  // 'hahaha'
console.log('-'.repeat(20));  // '--------------------'

// Replace
const text = 'Hello World';
console.log(text.replace('World', 'JavaScript'));  // 'Hello JavaScript'
console.log(text.replace(/o/g, '0'));              // 'Hell0 W0rld'

// replaceAll() (ES2021)
console.log('a-b-c'.replaceAll('-', '_'));  // 'a_b_c'

// Replace with function
const result = 'hello'.replace(/[aeiou]/g, (match) => match.toUpperCase());
console.log(result);  // 'hEllO'

// Split and join
const csv = 'a,b,c,d';
const arr = csv.split(',');      // ['a', 'b', 'c', 'd']
console.log(arr.join(' - '));    // 'a - b - c - d'

// Slice, substring, substr
const str2 = 'JavaScript';
console.log(str2.slice(0, 4));      // 'Java'
console.log(str2.slice(-6));        // 'Script'
console.log(str2.substring(0, 4));  // 'Java'
console.log(str2.substr(4, 6));     // 'Script' (deprecated)
```

## Example 4: Template Literals

```javascript
// Basic interpolation
const name = 'Arthur';
const age = 30;
console.log(`Hello, ${name}! You are ${age} years old.`);

// Expressions
console.log(`2 + 2 = ${2 + 2}`);
console.log(`Is adult: ${age >= 18 ? 'Yes' : 'No'}`);

// Multiline strings
const html = `
    <div class="card">
        <h1>${name}</h1>
        <p>Age: ${age}</p>
    </div>
`;

// Tagged templates
function highlight(strings, ...values) {
    return strings.reduce((acc, str, i) => {
        const value = values[i] !== undefined ? `<mark>${values[i]}</mark>` : '';
        return acc + str + value;
    }, '');
}

const highlighted = highlight`Hello ${name}, you are ${age} years old`;
// 'Hello <mark>Arthur</mark>, you are <mark>30</mark> years old'

// SQL-like tagged template
function sql(strings, ...values) {
    const query = strings.reduce((acc, str, i) => {
        return acc + str + (i < values.length ? `$${i + 1}` : '');
    }, '');
    return { query, values };
}

const userId = 123;
const { query, values } = sql`SELECT * FROM users WHERE id = ${userId}`;
// { query: 'SELECT * FROM users WHERE id = $1', values: [123] }

// HTML escaping
function escapeHtml(strings, ...values) {
    const escape = (str) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    return strings.reduce((acc, str, i) => {
        const value = values[i] !== undefined ? escape(String(values[i])) : '';
        return acc + str + value;
    }, '');
}

const userInput = '<script>alert("xss")</script>';
const safe = escapeHtml`User said: ${userInput}`;
// 'User said: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

## Example 5: Regular Expressions

```javascript
// Creating regex
const re1 = /pattern/flags;
const re2 = new RegExp('pattern', 'flags');

// Common flags
// i - case insensitive
// g - global (all matches)
// m - multiline
// s - dotAll (. matches newlines)
// u - unicode

// Test for match
console.log(/hello/i.test('Hello World'));  // true

// Extract matches
const email = 'contact@example.com';
const [, localPart, domain] = email.match(/(.+)@(.+)/) || [];
console.log(localPart, domain);  // 'contact' 'example.com'

// Validate patterns
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-]{10,}$/,
    url: /^https?:\/\/.+/,
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

console.log(patterns.email.test('test@example.com'));  // true

// Named capture groups (ES2018)
const dateStr = '2024-01-15';
const { groups: { year, month, day } } = dateStr.match(
    /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
);
console.log(year, month, day);  // '2024' '01' '15'

// Replace with regex
const phone = '(123) 456-7890';
const cleaned = phone.replace(/\D/g, '');  // '1234567890'

// Split with regex
const words = 'hello   world\nfoo\tbar'.split(/\s+/);
// ['hello', 'world', 'foo', 'bar']
```

## Example 6: Practical Utilities

```javascript
// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Title case
function titleCase(str) {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
}

// Slugify
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

console.log(slugify('Hello World! How are you?'));  // 'hello-world-how-are-you'

// Truncate
function truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
}

// Word wrap
function wordWrap(str, width) {
    const words = str.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + word).length > width) {
            lines.push(currentLine.trim());
            currentLine = '';
        }
        currentLine += word + ' ';
    }
    lines.push(currentLine.trim());

    return lines.join('\n');
}

// Count words
function wordCount(str) {
    return str.trim().split(/\s+/).filter(Boolean).length;
}

// Reverse string (Unicode-safe)
function reverse(str) {
    return [...str].reverse().join('');
}

console.log(reverse('Hello 😀'));  // '😀 olleH'
```

**Key Takeaways:**
- Strings are immutable
- Template literals enable interpolation
- Rich set of search and transform methods
- Regular expressions for pattern matching
- Be mindful of Unicode characters

---

# Imitation

### Challenge 1: Build a String Formatter

**Task:** Create a string formatter that replaces placeholders.

<details>
<summary>Solution</summary>

```javascript
function format(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return values.hasOwnProperty(key) ? values[key] : match;
    });
}

console.log(format('Hello {name}, you have {count} messages', {
    name: 'Arthur',
    count: 5
}));
// 'Hello Arthur, you have 5 messages'

// Advanced formatter with modifiers
function formatAdvanced(template, values) {
    return template.replace(/\{(\w+)(?::(\w+))?\}/g, (match, key, modifier) => {
        if (!values.hasOwnProperty(key)) return match;

        let value = values[key];

        switch (modifier) {
            case 'upper': return String(value).toUpperCase();
            case 'lower': return String(value).toLowerCase();
            case 'title': return String(value).replace(/\w\S*/g, t =>
                t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
            );
            default: return value;
        }
    });
}

console.log(formatAdvanced('Hello {name:upper}!', { name: 'arthur' }));
// 'Hello ARTHUR!'
```

</details>

---

# Practice

### Exercise 1: Palindrome Checker
**Difficulty:** Beginner

Check if a string is a palindrome (ignoring spaces and punctuation).

### Exercise 2: Markdown Parser
**Difficulty:** Advanced

Parse basic markdown (**bold**, *italic*, `code`) to HTML.

---

## Summary

**What you learned:**
- String creation and properties
- Search and transformation methods
- Template literals and tagged templates
- Regular expressions
- Common string utilities

**Next Steps:**
- Read: [Arrays](/api/guides/javascript/fundamentals/arrays)
- Practice: Build a text processing tool
- Explore: Internationalization (i18n)

---

## Resources

- [MDN: String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [JavaScript.info: Strings](https://javascript.info/string)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
