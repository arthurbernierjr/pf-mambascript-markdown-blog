---
title: "Python Testing"
subTitle: "Testing Python Applications"
excerpt: "Tests give you confidence to ship code fearlessly."
featureImage: "/img/python-testing.png"
date: "2026-02-01"
order: 46
---

# Explanation

## Why Test Python Code?

Testing ensures code works correctly and continues to work as you make changes. Python has excellent testing tools built-in and in the ecosystem.

### Testing Frameworks

| Framework | Use Case |
|-----------|----------|
| unittest | Built-in, xUnit style |
| pytest | Most popular, simple syntax |
| doctest | Tests in docstrings |

---

# Demonstration

## Example 1: pytest Basics

```python
# test_math.py
import pytest

# Simple test function
def test_addition():
    assert 1 + 1 == 2

def test_subtraction():
    assert 5 - 3 == 2

# Test with expected exception
def test_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        1 / 0

# Parametrized tests
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert a + b == expected

# Fixtures
@pytest.fixture
def sample_list():
    return [1, 2, 3, 4, 5]

def test_list_sum(sample_list):
    assert sum(sample_list) == 15

def test_list_length(sample_list):
    assert len(sample_list) == 5

# Fixture with teardown
@pytest.fixture
def database_connection():
    conn = create_connection()
    yield conn  # Provide to test
    conn.close()  # Cleanup after test

# Fixture scope
@pytest.fixture(scope="module")
def expensive_resource():
    # Created once per module
    return load_large_data()

# Run tests:
# pytest test_math.py -v
# pytest -k "test_add"  # Run specific tests
```

## Example 2: Testing Classes

```python
# user.py
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self._password = None

    def set_password(self, password):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        self._password = self._hash(password)

    def check_password(self, password):
        return self._password == self._hash(password)

    def _hash(self, password):
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

    @property
    def display_name(self):
        return f"{self.name} <{self.email}>"


# test_user.py
import pytest
from user import User

class TestUser:
    @pytest.fixture
    def user(self):
        return User("Arthur", "art@bpc.com")

    def test_init(self, user):
        assert user.name == "Arthur"
        assert user.email == "art@bpc.com"

    def test_display_name(self, user):
        assert user.display_name == "Arthur <art@bpc.com>"

    def test_set_password(self, user):
        user.set_password("securepassword123")
        assert user._password is not None

    def test_short_password_raises(self, user):
        with pytest.raises(ValueError, match="at least 8 characters"):
            user.set_password("short")

    def test_check_password(self, user):
        user.set_password("securepassword123")
        assert user.check_password("securepassword123") is True
        assert user.check_password("wrongpassword") is False
```

## Example 3: Mocking

```python
from unittest.mock import Mock, patch, MagicMock
import pytest

# Function to test
def get_user_data(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    response.raise_for_status()
    return response.json()

# Mock external API
def test_get_user_data():
    with patch('requests.get') as mock_get:
        mock_get.return_value.json.return_value = {
            'id': 1,
            'name': 'Arthur'
        }
        mock_get.return_value.raise_for_status = Mock()

        result = get_user_data(1)

        assert result['name'] == 'Arthur'
        mock_get.assert_called_once_with("https://api.example.com/users/1")

# Mock as decorator
@patch('requests.get')
def test_get_user_data_decorator(mock_get):
    mock_get.return_value.json.return_value = {'id': 1, 'name': 'Test'}
    mock_get.return_value.raise_for_status = Mock()

    result = get_user_data(1)
    assert result['name'] == 'Test'

# Mock context manager
def test_file_read():
    mock_data = "test content"
    mock_file = MagicMock()
    mock_file.__enter__.return_value.read.return_value = mock_data

    with patch('builtins.open', return_value=mock_file):
        with open('test.txt') as f:
            content = f.read()

    assert content == "test content"

# Mock class method
class EmailService:
    def send(self, to, subject, body):
        # Actually sends email
        pass

def send_welcome_email(user, email_service):
    email_service.send(
        to=user.email,
        subject="Welcome!",
        body=f"Hello {user.name}"
    )

def test_send_welcome_email():
    user = User("Arthur", "art@bpc.com")
    mock_service = Mock(spec=EmailService)

    send_welcome_email(user, mock_service)

    mock_service.send.assert_called_once_with(
        to="art@bpc.com",
        subject="Welcome!",
        body="Hello Arthur"
    )
```

## Example 4: Testing Flask/FastAPI

```python
# Flask testing
from flask import Flask
import pytest

app = Flask(__name__)

@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    return {'id': user_id, 'name': 'Test User'}

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_user(client):
    response = client.get('/api/users/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == 1
    assert data['name'] == 'Test User'

# FastAPI testing
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id, "name": "Test User"}

@pytest.fixture
def client():
    return TestClient(app)

def test_get_user(client):
    response = client.get("/api/users/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Test User"}

# Test with database
@pytest.fixture
async def db():
    # Setup test database
    database = await setup_test_db()
    yield database
    # Cleanup
    await database.drop_all()

@pytest.mark.asyncio
async def test_create_user(client, db):
    response = client.post("/api/users", json={
        "name": "Arthur",
        "email": "art@bpc.com"
    })
    assert response.status_code == 201

    # Verify in database
    user = await db.users.find_one({"email": "art@bpc.com"})
    assert user is not None
```

## Example 5: Test Coverage

```python
# pytest.ini or pyproject.toml
# [tool.pytest.ini_options]
# addopts = "--cov=src --cov-report=html --cov-report=term-missing"

# Run with coverage:
# pytest --cov=myproject --cov-report=html

# Example project structure
"""
myproject/
├── src/
│   ├── __init__.py
│   ├── calculator.py
│   └── utils.py
├── tests/
│   ├── __init__.py
│   ├── test_calculator.py
│   └── test_utils.py
├── pytest.ini
└── setup.py
"""

# conftest.py - shared fixtures
import pytest

@pytest.fixture(scope="session")
def app():
    """Create application for testing."""
    from myproject import create_app
    app = create_app(testing=True)
    yield app

@pytest.fixture
def db(app):
    """Create database for testing."""
    from myproject.database import init_db, drop_db
    with app.app_context():
        init_db()
        yield
        drop_db()

# Markers for categorizing tests
@pytest.mark.slow
def test_slow_operation():
    # Long running test
    pass

@pytest.mark.integration
def test_external_api():
    # Integration test
    pass

# Run specific markers:
# pytest -m "not slow"
# pytest -m integration
```

## Example 6: Property-Based Testing

```python
from hypothesis import given, strategies as st

# Generate random test cases
@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert a + b == b + a

@given(st.lists(st.integers()))
def test_sort_idempotent(lst):
    assert sorted(sorted(lst)) == sorted(lst)

@given(st.text())
def test_string_reversible(s):
    assert s == s[::-1][::-1]

# Custom strategies
@st.composite
def user_strategy(draw):
    name = draw(st.text(min_size=1, max_size=50))
    email = draw(st.emails())
    age = draw(st.integers(min_value=0, max_value=120))
    return {"name": name, "email": email, "age": age}

@given(user_strategy())
def test_user_creation(user_data):
    user = User(**user_data)
    assert user.name == user_data["name"]
    assert user.email == user_data["email"]

# Assume for filtering
from hypothesis import assume

@given(st.integers(), st.integers())
def test_division(a, b):
    assume(b != 0)  # Skip when b is 0
    result = a / b
    assert result * b == pytest.approx(a)
```

**Key Takeaways:**
- pytest is the standard for Python testing
- Use fixtures for setup/teardown
- Mock external dependencies
- Aim for high test coverage
- Property-based testing finds edge cases

---

# Imitation

### Challenge 1: Test a User Service

**Task:** Write comprehensive tests for a user service with database interactions.

<details>
<summary>Solution</summary>

```python
import pytest
from unittest.mock import Mock, patch

class UserService:
    def __init__(self, db):
        self.db = db

    def create_user(self, name, email):
        if self.db.find_by_email(email):
            raise ValueError("Email already exists")
        user = {"name": name, "email": email}
        return self.db.create(user)

    def get_user(self, user_id):
        user = self.db.find_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        return user

class TestUserService:
    @pytest.fixture
    def mock_db(self):
        return Mock()

    @pytest.fixture
    def service(self, mock_db):
        return UserService(mock_db)

    def test_create_user_success(self, service, mock_db):
        mock_db.find_by_email.return_value = None
        mock_db.create.return_value = {"id": 1, "name": "Arthur", "email": "art@bpc.com"}

        user = service.create_user("Arthur", "art@bpc.com")

        assert user["name"] == "Arthur"
        mock_db.create.assert_called_once()

    def test_create_user_duplicate_email(self, service, mock_db):
        mock_db.find_by_email.return_value = {"id": 1, "email": "art@bpc.com"}

        with pytest.raises(ValueError, match="Email already exists"):
            service.create_user("Arthur", "art@bpc.com")

    def test_get_user_not_found(self, service, mock_db):
        mock_db.find_by_id.return_value = None

        with pytest.raises(ValueError, match="User not found"):
            service.get_user(999)
```

</details>

---

# Practice

### Exercise 1: Test API Endpoints
**Difficulty:** Intermediate

Write tests for a REST API with authentication.

### Exercise 2: Integration Tests
**Difficulty:** Advanced

Create integration tests with a real database.

---

## Summary

**What you learned:**
- pytest basics and fixtures
- Testing classes and methods
- Mocking dependencies
- Web framework testing
- Property-based testing

**Next Steps:**
- Read: [Python API](/api/guides/python/api)
- Practice: Add tests to your project
- Explore: tox, nox, CI/CD

---

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [Python Testing with pytest](https://pragprog.com/titles/bopytest/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
