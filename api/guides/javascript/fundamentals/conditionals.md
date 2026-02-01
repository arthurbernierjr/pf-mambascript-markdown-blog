---
title: "JavaScript Conditionals"
subTitle: "Making Decisions in Code"
excerpt: "Control flow is the backbone of logic."
featureImage: "/img/js-conditionals.png"
date: "2026-02-01"
order: 6
---

# Explanation

## Why Conditionals Matter

Conditionals let your code make decisions. Without them, programs would just run straight through. They're how we handle different scenarios, validate input, and respond to user actions.

### Key Concepts

- **if/else**: Basic branching
- **switch**: Multiple specific values
- **Ternary**: Inline conditional expressions
- **Truthy/Falsy**: JavaScript's boolean coercion
- **Short-circuit**: Logical operator shortcuts

### Truthy and Falsy Values

```javascript
// Falsy values (evaluate to false)
false
0
-0
0n       // BigInt zero
""       // Empty string
null
undefined
NaN

// Everything else is truthy
true
1
"hello"
[]       // Empty array (truthy!)
{}       // Empty object (truthy!)
```

---

# Demonstration

## Example 1: If/Else Statements

```javascript
const age = 25;

// Basic if
if (age >= 18) {
    console.log('Adult');
}

// if...else
if (age >= 18) {
    console.log('Can vote');
} else {
    console.log('Too young to vote');
}

// if...else if...else
if (age < 13) {
    console.log('Child');
} else if (age < 20) {
    console.log('Teenager');
} else if (age < 65) {
    console.log('Adult');
} else {
    console.log('Senior');
}

// Multiple conditions
const hasLicense = true;
const hasInsurance = true;

if (age >= 16 && hasLicense && hasInsurance) {
    console.log('Can drive');
}

// OR condition
const isAdmin = false;
const isOwner = true;

if (isAdmin || isOwner) {
    console.log('Has access');
}

// Nested conditionals (try to avoid deep nesting)
if (age >= 18) {
    if (hasLicense) {
        if (hasInsurance) {
            console.log('Can drive');
        }
    }
}

// Better: early returns or combine conditions
function canDrive(age, hasLicense, hasInsurance) {
    if (age < 18) return false;
    if (!hasLicense) return false;
    if (!hasInsurance) return false;
    return true;
}
```

## Example 2: Switch Statements

```javascript
const day = 'Monday';

// Basic switch
switch (day) {
    case 'Monday':
        console.log('Start of work week');
        break;
    case 'Friday':
        console.log('Almost weekend!');
        break;
    case 'Saturday':
    case 'Sunday':
        console.log('Weekend!');
        break;
    default:
        console.log('Regular day');
}

// Switch with return (no break needed)
function getDayType(day) {
    switch (day) {
        case 'Saturday':
        case 'Sunday':
            return 'weekend';
        default:
            return 'weekday';
    }
}

// Switch vs if/else
// Use switch when comparing one value against many specific cases
// Use if/else for ranges, complex conditions, or few cases

// Object lookup alternative (often cleaner)
const dayMessages = {
    Monday: 'Start of work week',
    Friday: 'Almost weekend!',
    Saturday: 'Weekend!',
    Sunday: 'Weekend!'
};

console.log(dayMessages[day] || 'Regular day');
```

## Example 3: Ternary Operator

```javascript
const age = 20;

// Basic ternary
const status = age >= 18 ? 'adult' : 'minor';

// Nested ternary (use sparingly)
const category = age < 13 ? 'child'
    : age < 20 ? 'teen'
    : age < 65 ? 'adult'
    : 'senior';

// In JSX/template literals
const greeting = `Hello, ${user ? user.name : 'Guest'}`;

// With function calls
const result = isValid ? processData() : handleError();

// Default values (nullish coalescing is often better)
const name = userName ? userName : 'Anonymous';
// Better:
const name2 = userName ?? 'Anonymous';

// Ternary in array/object
const permissions = [
    'read',
    'write',
    isAdmin ? 'delete' : null
].filter(Boolean);

const config = {
    debug: process.env.NODE_ENV === 'development',
    ...(isProduction ? { minify: true } : {})
};
```

## Example 4: Short-Circuit Evaluation

```javascript
// AND (&&) - returns first falsy or last value
console.log(true && 'hello');     // 'hello'
console.log(false && 'hello');    // false
console.log('a' && 'b' && 'c');   // 'c'

// OR (||) - returns first truthy or last value
console.log(false || 'default'); // 'default'
console.log('value' || 'default'); // 'value'
console.log(0 || 'default');      // 'default' (0 is falsy)

// Nullish coalescing (??) - only null/undefined
console.log(0 ?? 'default');      // 0 (0 is not nullish)
console.log(null ?? 'default');   // 'default'
console.log(undefined ?? 'default'); // 'default'

// Common patterns
// Conditional execution
isLoggedIn && showDashboard();

// Default values
const port = process.env.PORT || 3000;
const name = user.name ?? 'Anonymous';

// Guard clauses
function processUser(user) {
    if (!user) return null;
    if (!user.email) return null;
    // Process user...
}

// Optional chaining with nullish coalescing
const city = user?.address?.city ?? 'Unknown';
const first = arr?.[0] ?? 'empty';
const result = obj?.method?.() ?? 'no method';
```

## Example 5: Pattern Matching (Advanced)

```javascript
// Object pattern matching with destructuring
function handleResponse({ status, data, error }) {
    if (status === 'success' && data) {
        return processData(data);
    }
    if (status === 'error' && error) {
        return handleError(error);
    }
    return handleUnknown();
}

// Type checking
function processValue(value) {
    if (typeof value === 'string') {
        return value.toUpperCase();
    }
    if (typeof value === 'number') {
        return value * 2;
    }
    if (Array.isArray(value)) {
        return value.length;
    }
    if (value && typeof value === 'object') {
        return Object.keys(value);
    }
    return null;
}

// instanceof for classes
if (error instanceof TypeError) {
    console.log('Type error occurred');
} else if (error instanceof RangeError) {
    console.log('Range error occurred');
}

// Pattern matching with Map
const handlers = new Map([
    ['string', (v) => v.toUpperCase()],
    ['number', (v) => v * 2],
    ['boolean', (v) => !v]
]);

function process(value) {
    const type = typeof value;
    const handler = handlers.get(type);
    return handler ? handler(value) : value;
}
```

**Key Takeaways:**
- Use `if/else` for complex conditions
- Use `switch` for many specific value checks
- Ternary is great for simple inline conditions
- Know your truthy/falsy values
- `??` is better than `||` for defaults when 0 or '' is valid

---

# Imitation

### Challenge 1: Grade Calculator

**Task:** Write a function that returns a letter grade for a numeric score.

<details>
<summary>Solution</summary>

```javascript
function getGrade(score) {
    if (score < 0 || score > 100) {
        return 'Invalid score';
    }

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

// Or with switch
function getGradeSwitch(score) {
    if (score < 0 || score > 100) return 'Invalid';

    switch (true) {
        case score >= 90: return 'A';
        case score >= 80: return 'B';
        case score >= 70: return 'C';
        case score >= 60: return 'D';
        default: return 'F';
    }
}
```

</details>

### Challenge 2: Permission Checker

**Task:** Create a function that checks if a user can perform an action based on role and ownership.

<details>
<summary>Solution</summary>

```javascript
function canPerformAction(user, resource, action) {
    // Admins can do anything
    if (user.role === 'admin') return true;

    // Must be logged in for any action
    if (!user.id) return false;

    // Owners can do anything to their resources
    if (resource.ownerId === user.id) return true;

    // Check specific permissions
    const permissions = {
        read: ['admin', 'editor', 'viewer'],
        write: ['admin', 'editor'],
        delete: ['admin']
    };

    return permissions[action]?.includes(user.role) ?? false;
}

// Usage
const user = { id: 1, role: 'editor' };
const post = { id: 100, ownerId: 2 };

console.log(canPerformAction(user, post, 'read'));   // true
console.log(canPerformAction(user, post, 'delete')); // false
```

</details>

---

# Practice

### Exercise 1: Leap Year Checker
**Difficulty:** Beginner

Write a function to check if a year is a leap year:
- Divisible by 4
- BUT not by 100
- UNLESS also divisible by 400

### Exercise 2: Traffic Light State Machine
**Difficulty:** Intermediate

Create a traffic light that cycles through states:
- Green → Yellow → Red → Green
- Include timing for each state
- Handle pedestrian crossing requests

---

## Summary

**What you learned:**
- if/else for branching logic
- switch for multiple value checks
- Ternary for inline conditions
- Short-circuit evaluation patterns
- Truthy/falsy behavior

**Next Steps:**
- Read: [JavaScript Scope](/api/guides/javascript/fundamentals/scope)
- Practice: Build a form validator
- Build: Create a quiz app with scoring

---

## Resources

- [MDN: Control flow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [JavaScript.info: Conditionals](https://javascript.info/ifelse)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
