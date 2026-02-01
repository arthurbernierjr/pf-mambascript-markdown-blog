---
title: "JavaScript Dates"
subTitle: "Working with Time"
excerpt: "Dates in JavaScript can be tricky - learn the patterns that work."
featureImage: "/img/js-dates.png"
date: "2026-02-01"
order: 16
---

# Explanation

## Dates in JavaScript

JavaScript's Date object handles date and time. While it has some quirks, understanding its behavior helps you work with time effectively.

### Key Concepts

- **UTC vs Local**: Dates can be UTC or local timezone
- **Timestamp**: Milliseconds since Jan 1, 1970 UTC
- **Months**: 0-indexed (January = 0)
- **Mutability**: Date objects are mutable

---

# Demonstration

## Example 1: Creating Dates

```javascript
// Current date/time
const now = new Date();

// From timestamp (milliseconds since epoch)
const fromTimestamp = new Date(1704067200000);

// From string (ISO 8601 preferred)
const fromISO = new Date('2024-01-01T00:00:00Z');
const fromString = new Date('January 1, 2024');

// From components (month is 0-indexed!)
const fromComponents = new Date(2024, 0, 1);  // Jan 1, 2024
const withTime = new Date(2024, 0, 1, 12, 30, 45, 100);
// year, month, day, hour, minute, second, millisecond

// UTC date
const utcDate = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));

// Current timestamp
const timestamp = Date.now();

// Parse string (returns timestamp)
const parsed = Date.parse('2024-01-01');

// Invalid date
const invalid = new Date('invalid');
console.log(invalid.toString());  // 'Invalid Date'
console.log(isNaN(invalid));      // true
```

## Example 2: Getting Date Components

```javascript
const date = new Date('2024-06-15T14:30:45.123Z');

// Local time getters
console.log(date.getFullYear());     // 2024
console.log(date.getMonth());        // 5 (June, 0-indexed!)
console.log(date.getDate());         // 15 (day of month)
console.log(date.getDay());          // 6 (Saturday, 0 = Sunday)
console.log(date.getHours());        // varies by timezone
console.log(date.getMinutes());      // varies
console.log(date.getSeconds());      // 45
console.log(date.getMilliseconds()); // 123

// UTC getters
console.log(date.getUTCFullYear());  // 2024
console.log(date.getUTCMonth());     // 5
console.log(date.getUTCDate());      // 15
console.log(date.getUTCHours());     // 14
console.log(date.getUTCMinutes());   // 30

// Timestamp
console.log(date.getTime());         // 1718458245123
console.log(+date);                  // Same (coercion)

// Timezone offset (minutes from UTC)
console.log(date.getTimezoneOffset());  // e.g., -240 for EDT

// ISO string
console.log(date.toISOString());     // '2024-06-15T14:30:45.123Z'
console.log(date.toJSON());          // Same
```

## Example 3: Setting Date Components

```javascript
const date = new Date('2024-01-15');

// Setters (mutate the date!)
date.setFullYear(2025);
date.setMonth(6);        // July
date.setDate(20);
date.setHours(10);
date.setMinutes(30);
date.setSeconds(0);
date.setMilliseconds(0);

// Chaining won't work (setters return timestamp)
// Use immutable approach instead

// Immutable pattern
function setYear(date, year) {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    return newDate;
}

// Auto-correction (overflow handling)
const jan31 = new Date(2024, 0, 31);  // Jan 31
jan31.setMonth(1);  // Feb 31 doesn't exist
console.log(jan31.getMonth());  // 2 (March!)
console.log(jan31.getDate());   // 2 (rolled over)

// Date arithmetic
const date2 = new Date('2024-01-01');
date2.setDate(date2.getDate() + 30);  // Add 30 days
date2.setMonth(date2.getMonth() - 1); // Subtract 1 month
```

## Example 4: Formatting Dates

```javascript
const date = new Date('2024-06-15T14:30:45');

// Built-in methods
console.log(date.toString());
// 'Sat Jun 15 2024 14:30:45 GMT-0400 (Eastern Daylight Time)'

console.log(date.toDateString());      // 'Sat Jun 15 2024'
console.log(date.toTimeString());      // '14:30:45 GMT-0400 ...'
console.log(date.toISOString());       // '2024-06-15T18:30:45.000Z'
console.log(date.toLocaleDateString()); // '6/15/2024' (US)
console.log(date.toLocaleTimeString()); // '2:30:45 PM' (US)
console.log(date.toLocaleString());     // '6/15/2024, 2:30:45 PM'

// Intl.DateTimeFormat
const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
console.log(formatter.format(date));  // 'Saturday, June 15, 2024'

// Different locales
console.log(new Intl.DateTimeFormat('de-DE').format(date));  // '15.6.2024'
console.log(new Intl.DateTimeFormat('ja-JP').format(date));  // '2024/6/15'

// Custom formatting
function formatDate(date, format) {
    const map = {
        'YYYY': date.getFullYear(),
        'MM': String(date.getMonth() + 1).padStart(2, '0'),
        'DD': String(date.getDate()).padStart(2, '0'),
        'HH': String(date.getHours()).padStart(2, '0'),
        'mm': String(date.getMinutes()).padStart(2, '0'),
        'ss': String(date.getSeconds()).padStart(2, '0')
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);
}

console.log(formatDate(date, 'YYYY-MM-DD'));        // '2024-06-15'
console.log(formatDate(date, 'DD/MM/YYYY HH:mm')); // '15/06/2024 14:30'
```

## Example 5: Date Calculations

```javascript
// Difference between dates
const start = new Date('2024-01-01');
const end = new Date('2024-12-31');

const diffMs = end - start;  // Milliseconds
const diffDays = diffMs / (1000 * 60 * 60 * 24);
console.log(diffDays);  // 365

// Add/subtract time
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}

// Relative time
function relativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay < 7) return `${diffDay} days ago`;

    return date.toLocaleDateString();
}

// Using Intl.RelativeTimeFormat
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
console.log(rtf.format(-1, 'day'));    // 'yesterday'
console.log(rtf.format(-2, 'day'));    // '2 days ago'
console.log(rtf.format(1, 'week'));    // 'next week'

// Date comparison
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
```

## Example 6: Practical Utilities

```javascript
// Start/end of periods
function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfWeek(date, weekStartsOn = 0) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
}

// Date range
function* dateRange(start, end) {
    const current = new Date(start);
    while (current <= end) {
        yield new Date(current);
        current.setDate(current.getDate() + 1);
    }
}

for (const date of dateRange(new Date('2024-01-01'), new Date('2024-01-05'))) {
    console.log(date.toISOString().slice(0, 10));
}

// Business days
function addBusinessDays(date, days) {
    const result = new Date(date);
    let remaining = days;

    while (remaining > 0) {
        result.setDate(result.getDate() + 1);
        if (!isWeekend(result)) {
            remaining--;
        }
    }

    return result;
}

// Age calculation
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}
```

**Key Takeaways:**
- Months are 0-indexed
- Dates are mutable - create copies
- Use ISO 8601 strings for parsing
- Intl for locale-aware formatting
- Consider using date libraries for complex needs

---

# Imitation

### Challenge 1: Build a Date Picker Helper

**Task:** Create utilities for a date picker component.

<details>
<summary>Solution</summary>

```javascript
class DatePickerHelper {
    constructor(options = {}) {
        this.locale = options.locale || 'en-US';
        this.weekStartsOn = options.weekStartsOn || 0;  // Sunday
    }

    getMonthDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startOffset = (firstDay.getDay() - this.weekStartsOn + 7) % 7;

        // Previous month days
        for (let i = startOffset - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, currentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                currentMonth: true
            });
        }

        // Next month days (fill to 42 for 6 rows)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false
            });
        }

        return days;
    }

    getWeekdayNames(format = 'short') {
        const formatter = new Intl.DateTimeFormat(this.locale, { weekday: format });
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(2024, 0, i + this.weekStartsOn);
            return formatter.format(day);
        });
    }

    getMonthName(date, format = 'long') {
        return new Intl.DateTimeFormat(this.locale, { month: format }).format(date);
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isSelected(date, selectedDate) {
        return selectedDate && date.toDateString() === selectedDate.toDateString();
    }

    isInRange(date, start, end) {
        return start && end && date >= start && date <= end;
    }
}

const helper = new DatePickerHelper({ locale: 'en-US' });
console.log(helper.getWeekdayNames());  // ['Sun', 'Mon', ...]
console.log(helper.getMonthDays(2024, 0));  // January 2024 grid
```

</details>

---

# Practice

### Exercise 1: Countdown Timer
**Difficulty:** Beginner

Create a countdown to a specific date showing days, hours, minutes.

### Exercise 2: Calendar Generator
**Difficulty:** Intermediate

Generate a monthly calendar view with events support.

---

## Summary

**What you learned:**
- Creating and parsing dates
- Getting and setting components
- Formatting with Intl
- Date calculations
- Practical utilities

**Next Steps:**
- Read: [Numbers](/api/guides/javascript/fundamentals/numbers)
- Practice: Build a booking system
- Explore: date-fns, Luxon, Day.js

---

## Resources

- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [JavaScript.info: Date and time](https://javascript.info/date)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
