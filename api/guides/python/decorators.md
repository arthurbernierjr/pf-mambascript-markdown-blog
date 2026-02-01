---
title: "Python Decorators"
subTitle: "Enhancing Functions with Style"
excerpt: "Decorators let you modify functions elegantly."
featureImage: "/img/python-decorators.png"
date: "2026-02-01"
order: 45
---

# Explanation

## What are Decorators?

Decorators are functions that modify the behavior of other functions. They use the `@` syntax and are fundamental to Python's expressiveness.

### Key Concepts

- **First-class functions**: Functions can be passed around
- **Closures**: Functions remember their environment
- **Wrapper pattern**: Wrap original function with new behavior

---

# Demonstration

## Example 1: Basic Decorators

```python
# Simple decorator
def my_decorator(func):
    def wrapper():
        print("Before function")
        func()
        print("After function")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# Output:
# Before function
# Hello!
# After function

# Without @ syntax (equivalent)
def say_hello():
    print("Hello!")
say_hello = my_decorator(say_hello)

# Decorator with arguments
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper

@my_decorator
def add(a, b):
    return a + b

result = add(3, 5)  # Calling add, Finished add
print(result)       # 8

# Preserving function metadata
from functools import wraps

def my_decorator(func):
    @wraps(func)  # Preserves __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def documented_function():
    """This is my docstring."""
    pass

print(documented_function.__name__)  # 'documented_function'
print(documented_function.__doc__)   # 'This is my docstring.'
```

## Example 2: Decorators with Arguments

```python
from functools import wraps

# Decorator factory (decorator that takes arguments)
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("Arthur")
# Hello, Arthur!
# Hello, Arthur!
# Hello, Arthur!

# Optional arguments pattern
def repeat(times=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

# Both work:
@repeat()
def func1(): pass

@repeat(5)
def func2(): pass

# Flexible decorator (with or without args)
def flexible_decorator(func=None, *, option="default"):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"Option: {option}")
            return func(*args, **kwargs)
        return wrapper

    if func is not None:
        return decorator(func)
    return decorator

@flexible_decorator
def no_args(): pass

@flexible_decorator(option="custom")
def with_args(): pass
```

## Example 3: Common Decorator Patterns

```python
import time
from functools import wraps

# Timing decorator
def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"

# Caching/memoization
def memoize(func):
    cache = {}

    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))  # Instant due to memoization

# Retry decorator
def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts == max_attempts:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def unreliable_api_call():
    import random
    if random.random() < 0.7:
        raise ConnectionError("Failed!")
    return "Success!"

# Validation decorator
def validate_types(*type_args, **type_kwargs):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for arg, expected_type in zip(args, type_args):
                if not isinstance(arg, expected_type):
                    raise TypeError(f"Expected {expected_type}, got {type(arg)}")
            for key, value in kwargs.items():
                if key in type_kwargs:
                    if not isinstance(value, type_kwargs[key]):
                        raise TypeError(f"Expected {type_kwargs[key]} for {key}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@validate_types(str, int)
def greet_times(name, times):
    for _ in range(times):
        print(f"Hello, {name}!")
```

## Example 4: Class-Based Decorators

```python
from functools import wraps

# Class as decorator
class CountCalls:
    def __init__(self, func):
        wraps(func)(self)
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"Call {self.count} to {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def say_hi():
    print("Hi!")

say_hi()  # Call 1 to say_hi, Hi!
say_hi()  # Call 2 to say_hi, Hi!
print(say_hi.count)  # 2

# Class decorator with arguments
class Repeat:
    def __init__(self, times=2):
        self.times = times

    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(self.times):
                result = func(*args, **kwargs)
            return result
        return wrapper

@Repeat(3)
def greet():
    print("Hello!")

# Singleton decorator
def singleton(cls):
    instances = {}

    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

@singleton
class Database:
    def __init__(self):
        print("Connecting to database...")

db1 = Database()  # Connecting to database...
db2 = Database()  # No output, returns same instance
print(db1 is db2)  # True
```

## Example 5: Decorators for Classes

```python
from functools import wraps

# Method decorator
def log_method(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        print(f"{self.__class__.__name__}.{func.__name__} called")
        return func(self, *args, **kwargs)
    return wrapper

class Calculator:
    @log_method
    def add(self, a, b):
        return a + b

calc = Calculator()
calc.add(2, 3)  # Calculator.add called

# Class decorator
def add_repr(cls):
    def __repr__(self):
        attrs = ', '.join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

print(Point(1, 2))  # Point(x=1, y=2)

# Property decorator
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        return 3.14159 * self._radius ** 2

circle = Circle(5)
print(circle.area)    # 78.53975
circle.radius = 10
print(circle.area)    # 314.159
```

## Example 6: Practical Decorators

```python
from functools import wraps
import logging

# Authentication decorator (Flask-like)
def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        from flask import g, redirect, url_for
        if not g.user:
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    return wrapper

# Role-based access
def requires_role(*roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if current_user.role not in roles:
                raise PermissionError("Access denied")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@login_required
@requires_role('admin', 'moderator')
def admin_dashboard():
    return "Admin Dashboard"

# Deprecation warning
import warnings

def deprecated(message=""):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            warnings.warn(
                f"{func.__name__} is deprecated. {message}",
                DeprecationWarning,
                stacklevel=2
            )
            return func(*args, **kwargs)
        return wrapper
    return decorator

@deprecated("Use new_function instead")
def old_function():
    pass

# Rate limiting
from collections import defaultdict
import time

def rate_limit(max_calls, period):
    calls = defaultdict(list)

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            key = str(args)

            # Clean old calls
            calls[key] = [t for t in calls[key] if now - t < period]

            if len(calls[key]) >= max_calls:
                raise Exception("Rate limit exceeded")

            calls[key].append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_calls=5, period=60)
def api_call():
    return "API response"
```

**Key Takeaways:**
- Decorators wrap functions with extra behavior
- Use `@wraps` to preserve metadata
- Decorator factories allow arguments
- Class-based decorators maintain state
- Essential for auth, caching, logging

---

# Imitation

### Challenge 1: Build a Debug Decorator

**Task:** Create a decorator that logs function calls with arguments and return values.

<details>
<summary>Solution</summary>

```python
from functools import wraps
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        args_repr = [repr(a) for a in args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        signature = ", ".join(args_repr + kwargs_repr)

        logger.debug(f"Calling {func.__name__}({signature})")

        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} returned {result!r}")
            return result
        except Exception as e:
            logger.exception(f"{func.__name__} raised {e.__class__.__name__}")
            raise

    return wrapper

@debug
def calculate(x, y, operation="add"):
    if operation == "add":
        return x + y
    elif operation == "multiply":
        return x * y

calculate(5, 3)
calculate(5, 3, operation="multiply")
```

</details>

---

# Practice

### Exercise 1: Cache with Expiry
**Difficulty:** Intermediate

Create a memoize decorator with TTL expiration.

### Exercise 2: Async Decorator
**Difficulty:** Advanced

Build a decorator that works with async functions.

---

## Summary

**What you learned:**
- Basic decorator syntax
- Decorators with arguments
- Common patterns (timer, retry, memoize)
- Class-based decorators
- Practical applications

**Next Steps:**
- Read: [Python OOP](/api/guides/python/oop)
- Practice: Add logging decorators
- Explore: contextlib, functools

---

## Resources

- [Python Decorator Tutorial](https://realpython.com/primer-on-python-decorators/)
- [PEP 318 - Decorators](https://peps.python.org/pep-0318/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
