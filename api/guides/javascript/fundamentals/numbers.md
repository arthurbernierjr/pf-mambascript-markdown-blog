---
title: "JavaScript Numbers"
subTitle: "Working with Numeric Data"
excerpt: "Numbers in JavaScript - from integers to floating-point precision."
featureImage: "/img/js-numbers.png"
date: "2026-02-01"
order: 15
---

# Explanation

## Numbers in JavaScript

JavaScript has a single number type that represents both integers and floating-point numbers. It uses IEEE 754 double-precision format, which can lead to some surprising behaviors.

### Key Concepts

- **Single Type**: No separate int/float distinction
- **Precision**: 64-bit floating point
- **BigInt**: For arbitrary precision integers
- **Special Values**: Infinity, -Infinity, NaN

---

# Demonstration

## Example 1: Number Basics

```javascript
// Number literals
const integer = 42;
const float = 3.14;
const negative = -17;
const exponential = 2.5e6;  // 2,500,000

// Number separators (ES2021)
const billion = 1_000_000_000;
const bytes = 0xFF_FF_FF_FF;

// Different bases
const binary = 0b1010;     // 10
const octal = 0o755;       // 493
const hex = 0xFF;          // 255

// Special values
console.log(Infinity);           // Infinity
console.log(-Infinity);          // -Infinity
console.log(NaN);                // NaN
console.log(1 / 0);              // Infinity
console.log(-1 / 0);             // -Infinity
console.log(0 / 0);              // NaN
console.log('hello' * 2);        // NaN

// Checking special values
console.log(Number.isFinite(100));       // true
console.log(Number.isFinite(Infinity));  // false
console.log(Number.isNaN(NaN));          // true
console.log(Number.isNaN('NaN'));        // false (use this, not global isNaN)

// Number limits
console.log(Number.MAX_VALUE);           // ~1.79e308
console.log(Number.MIN_VALUE);           // ~5e-324
console.log(Number.MAX_SAFE_INTEGER);    // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER);    // -9007199254740991
```

## Example 2: Floating Point Precision

```javascript
// The classic problem
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);   // false

// Why? IEEE 754 binary representation
// 0.1 in binary is repeating: 0.0001100110011...

// Solutions
// 1. Use epsilon for comparison
function almostEqual(a, b, epsilon = Number.EPSILON) {
    return Math.abs(a - b) < epsilon;
}

console.log(almostEqual(0.1 + 0.2, 0.3));  // true

// 2. Work with integers (cents instead of dollars)
const priceInCents = 1999;  // $19.99
const total = priceInCents * 3;  // 5997 cents = $59.97

// 3. Use toFixed() for display (returns string)
console.log((0.1 + 0.2).toFixed(2));  // '0.30'

// 4. Round to fixed decimal places
function round(num, decimals) {
    return Math.round(num * 10 ** decimals) / 10 ** decimals;
}

console.log(round(0.1 + 0.2, 2));  // 0.3

// Precision loss with large numbers
console.log(9007199254740992 === 9007199254740993);  // true! (beyond safe integer)
console.log(Number.isSafeInteger(9007199254740991));  // true
console.log(Number.isSafeInteger(9007199254740992));  // false
```

## Example 3: Math Object

```javascript
// Constants
console.log(Math.PI);     // 3.141592653589793
console.log(Math.E);      // 2.718281828459045
console.log(Math.LN2);    // 0.6931471805599453

// Rounding
console.log(Math.round(4.5));   // 5
console.log(Math.round(4.4));   // 4
console.log(Math.floor(4.9));   // 4
console.log(Math.ceil(4.1));    // 5
console.log(Math.trunc(4.9));   // 4
console.log(Math.trunc(-4.9));  // -4

// Min/Max
console.log(Math.min(1, 2, 3));      // 1
console.log(Math.max(1, 2, 3));      // 3
console.log(Math.max(...[1, 2, 3])); // 3

// Power and roots
console.log(Math.pow(2, 8));     // 256
console.log(2 ** 8);             // 256 (ES7)
console.log(Math.sqrt(16));      // 4
console.log(Math.cbrt(27));      // 3

// Absolute value
console.log(Math.abs(-5));  // 5

// Trigonometry
console.log(Math.sin(Math.PI / 2));  // 1
console.log(Math.cos(0));            // 1
console.log(Math.atan2(1, 1));       // 0.785... (PI/4)

// Random numbers
console.log(Math.random());  // 0 to 0.999...

// Random integer in range [min, max]
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log(randomInt(1, 10));  // 1 to 10

// Sign
console.log(Math.sign(-5));  // -1
console.log(Math.sign(0));   // 0
console.log(Math.sign(5));   // 1
```

## Example 4: Number Conversion

```javascript
// String to number
console.log(Number('42'));       // 42
console.log(Number('3.14'));     // 3.14
console.log(Number(''));         // 0
console.log(Number('hello'));    // NaN
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN
console.log(Number(true));       // 1
console.log(Number(false));      // 0

// parseInt and parseFloat
console.log(parseInt('42'));           // 42
console.log(parseInt('42px'));         // 42
console.log(parseInt('px42'));         // NaN
console.log(parseInt('FF', 16));       // 255
console.log(parseInt('1010', 2));      // 10
console.log(parseFloat('3.14'));       // 3.14
console.log(parseFloat('3.14.15'));    // 3.14

// Unary plus (shortest conversion)
console.log(+'42');        // 42
console.log(+'3.14');      // 3.14
console.log(+'hello');     // NaN

// Number to string
const num = 255;
console.log(num.toString());     // '255'
console.log(num.toString(16));   // 'ff'
console.log(num.toString(2));    // '11111111'

// Formatting
const price = 1234.5678;
console.log(price.toFixed(2));        // '1234.57'
console.log(price.toPrecision(4));    // '1235'
console.log(price.toExponential(2));  // '1.23e+3'

// Locale formatting
console.log(price.toLocaleString('en-US'));  // '1,234.568'
console.log(price.toLocaleString('de-DE'));  // '1.234,568'
console.log(price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
}));  // '$1,234.57'
```

## Example 5: BigInt

```javascript
// Creating BigInt
const big1 = 9007199254740993n;  // n suffix
const big2 = BigInt(9007199254740993);
const big3 = BigInt('9007199254740993');

// Operations
console.log(big1 + 1n);  // 9007199254740994n
console.log(big1 * 2n);  // 18014398509481986n
console.log(big1 / 2n);  // 4503599627370496n (truncates)

// Cannot mix with regular numbers
// console.log(big1 + 1);  // TypeError

// Convert between types
console.log(Number(big1));  // 9007199254740992 (loses precision!)
console.log(BigInt(42) + 1n);  // 43n

// Comparison works
console.log(1n === 1);    // false (different types)
console.log(1n == 1);     // true (loose equality)
console.log(1n < 2);      // true

// Use cases
// - Cryptography
// - Large ID numbers (Twitter snowflake IDs)
// - Precise financial calculations

// Factorial with BigInt
function factorial(n) {
    let result = 1n;
    for (let i = 2n; i <= n; i++) {
        result *= i;
    }
    return result;
}

console.log(factorial(100n));
// 93326215443944152681699238856266700490715968264381621468592963895217599993229...
```

## Example 6: Practical Utilities

```javascript
// Clamp value to range
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

console.log(clamp(5, 0, 10));   // 5
console.log(clamp(-5, 0, 10));  // 0
console.log(clamp(15, 0, 10));  // 10

// Percentage
function percentage(value, total) {
    return (value / total) * 100;
}

function fromPercentage(percent, total) {
    return (percent / 100) * total;
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

console.log(lerp(0, 100, 0.5));  // 50

// Map range
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

console.log(mapRange(50, 0, 100, 0, 1));  // 0.5

// Format with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

console.log(formatBytes(1234567890));  // '1.15 GB'

// Ordinal suffix
function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

console.log(ordinal(1));   // '1st'
console.log(ordinal(2));   // '2nd'
console.log(ordinal(11));  // '11th'
console.log(ordinal(21));  // '21st'
```

**Key Takeaways:**
- JavaScript has one number type (+ BigInt)
- Floating point can be imprecise
- Use integers for money (cents)
- Math object has useful methods
- BigInt for large integers

---

# Imitation

### Challenge 1: Build a Calculator

**Task:** Create a calculator that handles basic operations safely.

<details>
<summary>Solution</summary>

```javascript
class Calculator {
    constructor(precision = 10) {
        this.precision = precision;
        this.result = 0;
    }

    round(num) {
        return Math.round(num * 10 ** this.precision) / 10 ** this.precision;
    }

    add(num) {
        this.result = this.round(this.result + num);
        return this;
    }

    subtract(num) {
        this.result = this.round(this.result - num);
        return this;
    }

    multiply(num) {
        this.result = this.round(this.result * num);
        return this;
    }

    divide(num) {
        if (num === 0) throw new Error('Division by zero');
        this.result = this.round(this.result / num);
        return this;
    }

    set(num) {
        this.result = num;
        return this;
    }

    clear() {
        this.result = 0;
        return this;
    }

    get value() {
        return this.result;
    }
}

const calc = new Calculator();
console.log(
    calc.set(0.1).add(0.2).value  // 0.3 (not 0.30000000004!)
);

console.log(
    calc.clear().set(100).multiply(0.1).add(0.1).multiply(10).value  // 11
);
```

</details>

---

# Practice

### Exercise 1: Currency Formatter
**Difficulty:** Beginner

Format numbers as currency with proper locale support.

### Exercise 2: Statistics Calculator
**Difficulty:** Intermediate

Calculate mean, median, mode, and standard deviation for an array.

---

## Summary

**What you learned:**
- Number types and limits
- Floating point precision issues
- Math object methods
- Number conversion
- BigInt for large numbers

**Next Steps:**
- Read: [Strings](/api/guides/javascript/fundamentals/strings)
- Practice: Build a unit converter
- Explore: WebGL and typed arrays

---

## Resources

- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [JavaScript.info: Numbers](https://javascript.info/number)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
