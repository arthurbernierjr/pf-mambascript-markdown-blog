---
title: "Python Routing"
subTitle: "Building Web APIs with Flask and FastAPI"
excerpt: "The web is a canvas for your code."
featureImage: "/img/python-routing.png"
date: "2026-02-01"
order: 101
---

# Explanation

## Web Routing in Python

Routing is how your web application responds to different URLs. In Python, two popular frameworks handle this: Flask (simple, flexible) and FastAPI (modern, fast, type-safe).

Think of routes like a phone directory - when someone calls a number (URL), they get connected to the right department (function).

### Key Concepts

- **Route**: A URL pattern mapped to a function
- **HTTP Methods**: GET, POST, PUT, DELETE, etc.
- **Route Parameters**: Dynamic parts of the URL (`/users/123`)
- **Query Parameters**: Optional filters (`/users?role=admin`)

### Flask vs FastAPI

| Feature | Flask | FastAPI |
|---------|-------|---------|
| Speed | Good | Excellent |
| Type hints | Optional | Required |
| Auto docs | No | Yes (Swagger) |
| Async | Limited | Full support |
| Learning curve | Easy | Moderate |

---

# Demonstration

## Example 1: Flask Basics

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

# Simple route
@app.route('/')
def home():
    return 'Welcome to the API!'

# Route with parameter
@app.route('/users/<int:user_id>')
def get_user(user_id):
    return jsonify({'id': user_id, 'name': f'User {user_id}'})

# Multiple HTTP methods
@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        return jsonify({'users': ['Alice', 'Bob']})
    elif request.method == 'POST':
        data = request.json
        return jsonify({'created': data}), 201

# Query parameters
@app.route('/search')
def search():
    query = request.args.get('q', '')
    limit = request.args.get('limit', 10, type=int)
    return jsonify({'query': query, 'limit': limit})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

## Example 2: FastAPI Basics

```python
from fastapi import FastAPI, Path, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

# Pydantic model for validation
class User(BaseModel):
    name: str
    email: str
    age: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

# Simple route
@app.get("/")
def home():
    return {"message": "Welcome to the API!"}

# Path parameters with validation
@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int = Path(..., gt=0, description="The user ID")):
    return {"id": user_id, "name": f"User {user_id}", "email": "user@example.com"}

# Query parameters
@app.get("/search")
def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    return {"query": q, "limit": limit, "skip": skip}

# POST with request body validation
@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: User):
    return {"id": 1, **user.dict()}

# Error handling
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id > 100:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item_id": item_id}
```

## Example 3: Complete CRUD API (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Todo API", version="1.0.0")

class TodoCreate(BaseModel):
    title: str
    completed: bool = False

class Todo(TodoCreate):
    id: int

# In-memory storage
todos: List[Todo] = []
next_id = 1

@app.get("/todos", response_model=List[Todo])
def list_todos(completed: Optional[bool] = None):
    if completed is not None:
        return [t for t in todos if t.completed == completed]
    return todos

@app.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    for todo in todos:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(todo: TodoCreate):
    global next_id
    new_todo = Todo(id=next_id, **todo.dict())
    todos.append(new_todo)
    next_id += 1
    return new_todo

@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo: TodoCreate):
    for i, t in enumerate(todos):
        if t.id == todo_id:
            todos[i] = Todo(id=todo_id, **todo.dict())
            return todos[i]
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    for i, t in enumerate(todos):
        if t.id == todo_id:
            todos.pop(i)
            return
    raise HTTPException(status_code=404, detail="Todo not found")
```

**Key Takeaways:**
- Flask is simpler, FastAPI has more features
- FastAPI auto-generates documentation at `/docs`
- Pydantic models validate request/response data
- Type hints make code self-documenting

---

# Imitation

### Challenge 1: Add Pagination

**Task:** Add pagination to the list_todos endpoint.

```python
GET /todos?page=1&per_page=10
```

<details>
<summary>Solution</summary>

```python
@app.get("/todos")
def list_todos(page: int = 1, per_page: int = 10):
    start = (page - 1) * per_page
    end = start + per_page
    return {
        "data": todos[start:end],
        "page": page,
        "per_page": per_page,
        "total": len(todos)
    }
```

</details>

### Challenge 2: Add Search

**Task:** Add a search endpoint that filters by title.

<details>
<summary>Solution</summary>

```python
@app.get("/todos/search")
def search_todos(q: str = Query(..., min_length=1)):
    results = [t for t in todos if q.lower() in t.title.lower()]
    return {"query": q, "results": results}
```

</details>

---

# Practice

### Exercise 1: User API
**Difficulty:** Beginner

Build a complete User CRUD API with:
- Create user (name, email required)
- List users with pagination
- Get user by ID
- Update user
- Delete user

### Exercise 2: Nested Routes
**Difficulty:** Intermediate

Create an API for posts and comments:
- `GET /posts/{post_id}/comments` - List comments
- `POST /posts/{post_id}/comments` - Add comment
- `DELETE /posts/{post_id}/comments/{comment_id}` - Delete comment

---

## Summary

**What you learned:**
- Basic routing with Flask and FastAPI
- Path and query parameters
- Request body validation with Pydantic
- CRUD operations

**Next Steps:**
- Read: [Python OOP](/api/guides/python/oop)
- Practice: Build a REST API for your portfolio
- Deploy: Put your API on Railway or Heroku

---

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
