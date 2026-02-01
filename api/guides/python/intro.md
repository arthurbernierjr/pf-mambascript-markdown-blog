---
title: "Python Introduction"
subTitle: "Your Gateway to a New Programming Language"
excerpt: "The best time to plant a tree was 20 years ago. The second best time is now."
featureImage: "/img/python-intro.png"
date: "2026-02-01"
order: 100
---

# Explanation

## Why Python?

Think of programming languages like vehicles. JavaScript is your sports car - fast, flashy, and great for the web. Python? Python is your Swiss Army knife on wheels. It can do almost anything: web development, data science, AI/ML, automation, scripting, and more.

If you already know JavaScript, learning Python is like learning Spanish when you already speak Portuguese. Many concepts transfer directly - you're just learning new syntax and some new tricks.

### Key Concepts

- **Dynamic Typing**: Like JavaScript, Python doesn't require you to declare variable types
- **Indentation Matters**: Unlike JavaScript's curly braces, Python uses whitespace to define code blocks
- **Readable Syntax**: Python reads almost like English, making it beginner-friendly
- **Batteries Included**: Python's standard library is massive - you can do a lot without external packages

### Why This Matters

Python consistently ranks as one of the top programming languages for:
- Data Science and Machine Learning
- Backend web development (Django, Flask, FastAPI)
- Automation and scripting
- Scientific computing
- DevOps and infrastructure

Learning Python makes you a **polyglot developer** - someone who can solve problems with multiple tools.

---

# Demonstration

## Example 1: Variables and Data Types

In JavaScript:
```javascript
const name = "Arthur";
let age = 30;
const isAwesome = true;
const skills = ["JavaScript", "Python", "Go"];
const person = { name: "Arthur", role: "Developer" };
```

In Python:
```python
# Variables - no const/let, just assign
name = "Arthur"
age = 30
is_awesome = True  # Note: True/False are capitalized
skills = ["JavaScript", "Python", "Go"]
person = {"name": "Arthur", "role": "Developer"}

# Print to console
print(name)
print(f"Age: {age}")  # f-strings are like template literals
```

**Output:**
```
Arthur
Age: 30
```

**Explanation:**
- Python uses `snake_case` by convention (not `camelCase`)
- Booleans are `True` and `False` (capitalized)
- Lists are like JavaScript arrays
- Dictionaries are like JavaScript objects
- `print()` replaces `console.log()`
- f-strings (`f"..."`) work like template literals

### Example 2: Functions

In JavaScript:
```javascript
const greet = (name) => {
    return `Hello, ${name}!`;
};

const add = (a, b) => a + b;
```

In Python:
```python
# Regular function
def greet(name):
    return f"Hello, {name}!"

# Simple one-liner (lambda)
add = lambda a, b: a + b

# Function with default parameters
def greet_with_title(name, title="Mr."):
    return f"Hello, {title} {name}!"

print(greet("Arthur"))
print(add(5, 3))
print(greet_with_title("Bernier", "Dr."))
```

**Output:**
```
Hello, Arthur!
8
Hello, Dr. Bernier!
```

**Key Takeaways:**
- Use `def` keyword to define functions
- Colon `:` starts the function body
- Indentation (4 spaces) defines the scope
- `lambda` creates anonymous functions (like arrow functions)

---

# Imitation

Now it's your turn! Try modifying the examples above.

### Challenge 1: Create a User Profile

**Task:** Create variables for a user profile with name, email, age, and a list of hobbies. Print a formatted introduction.

**Hint:** Use an f-string to combine multiple variables.

<details>
<summary>Solution</summary>

```python
name = "Sarah"
email = "sarah@example.com"
age = 28
hobbies = ["coding", "hiking", "photography"]

print(f"Hi, I'm {name}!")
print(f"Email: {email}")
print(f"Age: {age}")
print(f"Hobbies: {', '.join(hobbies)}")
```

**Explanation:** The `', '.join(hobbies)` converts the list to a comma-separated string.

</details>

### Challenge 2: Build a Calculator Function

**Task:** Create a function called `calculate` that takes three parameters: `a`, `b`, and `operation` (default: "add"). Return the result based on the operation.

**Requirements:**
- Support "add", "subtract", "multiply", "divide"
- Handle division by zero

<details>
<summary>Solution</summary>

```python
def calculate(a, b, operation="add"):
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        if b == 0:
            return "Error: Division by zero"
        return a / b
    else:
        return "Unknown operation"

print(calculate(10, 5))           # 15
print(calculate(10, 5, "subtract"))  # 5
print(calculate(10, 0, "divide"))    # Error message
```

</details>

---

# Practice

### Exercise 1: Temperature Converter
**Difficulty:** Beginner

**Scenario:** You're building a weather app that needs to convert temperatures.

**Your Task:**
1. Create a function `celsius_to_fahrenheit(celsius)` that converts Celsius to Fahrenheit
2. Create a function `fahrenheit_to_celsius(fahrenheit)` that does the reverse
3. Formula: `F = C × 9/5 + 32`

**Tests to pass:**
1. `celsius_to_fahrenheit(0)` should return `32`
2. `celsius_to_fahrenheit(100)` should return `212`
3. `fahrenheit_to_celsius(32)` should return `0`

### Exercise 2: List Processor
**Difficulty:** Intermediate

**Scenario:** Process a list of numbers and return statistics.

**Your Task:**
Create a function `analyze_numbers(numbers)` that returns a dictionary with:
- `count`: total numbers
- `sum`: sum of all numbers
- `average`: average value
- `min`: minimum value
- `max`: maximum value

**Bonus:**
- Handle empty list case
- Add `even_count` and `odd_count`

---

## Summary

**What you learned:**
- Python syntax basics and how they compare to JavaScript
- Variables, data types, and f-strings
- Function definitions with `def` and `lambda`
- Indentation-based scoping

**Next Steps:**
- Read: [Python Routing](/api/guides/python/routing)
- Practice: Build a simple CLI todo app
- Build: Port one of your JavaScript projects to Python

---

## Resources

- [Python Official Tutorial](https://docs.python.org/3/tutorial/)
- [Real Python](https://realpython.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
