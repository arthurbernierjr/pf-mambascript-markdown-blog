---
title: "Python APIs"
subTitle: "Building RESTful Services with Python"
excerpt: "An API is a promise between two pieces of software."
featureImage: "/img/python-api.png"
date: "2026-02-01"
order: 103
---

# Explanation

## What is an API?

An API (Application Programming Interface) is how software talks to other software. Think of it as a waiter in a restaurant - you (the client) tell the waiter (API) what you want, they communicate with the kitchen (server), and bring back your food (response).

### Key Concepts

- **REST**: Representational State Transfer - architectural style
- **Endpoint**: A specific URL that accepts requests
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: 200 (OK), 201 (Created), 404 (Not Found), 500 (Server Error)
- **JSON**: The lingua franca of APIs

### REST Principles

1. **Stateless**: Each request contains all needed information
2. **Resource-Based**: URLs represent resources (`/users`, `/posts`)
3. **HTTP Methods**: Use verbs appropriately
4. **Consistent Structure**: Predictable URL patterns

---

# Demonstration

## Example 1: FastAPI Complete API

```python
from fastapi import FastAPI, HTTPException, Query, Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(
    title="User Management API",
    description="A complete CRUD API for user management",
    version="1.0.0"
)

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None

class User(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime

# In-memory database
users_db: dict[str, User] = {}

# CREATE - POST /users
@app.post("/users", response_model=User, status_code=201)
def create_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=datetime.now()
    )
    users_db[user_id] = new_user
    return new_user

# READ ALL - GET /users
@app.get("/users", response_model=List[User])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = None
):
    users = list(users_db.values())

    # Filter by role if provided
    if role:
        users = [u for u in users if u.role == role]

    return users[skip:skip + limit]

# READ ONE - GET /users/{user_id}
@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: str = Path(..., description="The user ID")):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

# UPDATE - PUT /users/{user_id}
@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: str, user_update: UserUpdate):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    stored_user = users_db[user_id]
    update_data = user_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(stored_user, field, value)

    return stored_user

# DELETE - DELETE /users/{user_id}
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    del users_db[user_id]
```

## Example 2: Flask REST API with Blueprints

```python
from flask import Flask, Blueprint, request, jsonify
from functools import wraps

app = Flask(__name__)

# Simple auth decorator
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != 'Bearer secret-token':
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

# Blueprint for API versioning
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# In-memory storage
products = {}
next_id = 1

@api_v1.route('/products', methods=['GET'])
def list_products():
    # Query parameters
    category = request.args.get('category')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    result = list(products.values())

    if category:
        result = [p for p in result if p['category'] == category]
    if min_price:
        result = [p for p in result if p['price'] >= min_price]
    if max_price:
        result = [p for p in result if p['price'] <= max_price]

    return jsonify({
        'data': result,
        'count': len(result)
    })

@api_v1.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    if product_id not in products:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'data': products[product_id]})

@api_v1.route('/products', methods=['POST'])
@require_auth
def create_product():
    global next_id
    data = request.get_json()

    # Validation
    required = ['name', 'price']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    product = {
        'id': next_id,
        'name': data['name'],
        'price': data['price'],
        'category': data.get('category', 'general')
    }
    products[next_id] = product
    next_id += 1

    return jsonify({'data': product}), 201

@api_v1.route('/products/<int:product_id>', methods=['PUT'])
@require_auth
def update_product(product_id):
    if product_id not in products:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()
    products[product_id].update(data)

    return jsonify({'data': products[product_id]})

@api_v1.route('/products/<int:product_id>', methods=['DELETE'])
@require_auth
def delete_product(product_id):
    if product_id not in products:
        return jsonify({'error': 'Product not found'}), 404

    del products[product_id]
    return '', 204

# Register blueprint
app.register_blueprint(api_v1)

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500
```

## Example 3: API Response Patterns

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')

# Generic response wrapper
class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    page: int
    per_page: int
    total: int
    total_pages: int

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: str

# Usage
@app.get("/users/{user_id}")
def get_user(user_id: str) -> ApiResponse[User]:
    user = find_user(user_id)
    if not user:
        return ApiResponse(
            success=False,
            message="User not found"
        )
    return ApiResponse(data=user)

@app.get("/users")
def list_users(page: int = 1, per_page: int = 10) -> PaginatedResponse[User]:
    users = get_all_users()
    total = len(users)
    start = (page - 1) * per_page
    end = start + per_page

    return PaginatedResponse(
        data=users[start:end],
        page=page,
        per_page=per_page,
        total=total,
        total_pages=(total + per_page - 1) // per_page
    )
```

**Key Takeaways:**
- Use Pydantic for automatic validation
- Return consistent response structures
- Use proper HTTP status codes
- Implement pagination for list endpoints
- Add authentication where needed

---

# Imitation

### Challenge 1: Add Search Endpoint

**Task:** Add a search endpoint that searches users by name or email.

<details>
<summary>Solution</summary>

```python
@app.get("/users/search")
def search_users(
    q: str = Query(..., min_length=1),
    field: str = Query("all", regex="^(name|email|all)$")
):
    results = []
    for user in users_db.values():
        query = q.lower()
        if field == "name" and query in user.name.lower():
            results.append(user)
        elif field == "email" and query in user.email.lower():
            results.append(user)
        elif field == "all":
            if query in user.name.lower() or query in user.email.lower():
                results.append(user)

    return {"query": q, "count": len(results), "data": results}
```

</details>

### Challenge 2: Add Bulk Operations

**Task:** Create endpoints for bulk create and bulk delete.

<details>
<summary>Solution</summary>

```python
@app.post("/users/bulk", response_model=List[User], status_code=201)
def bulk_create_users(users: List[UserCreate]):
    created = []
    for user_data in users:
        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            created_at=datetime.now()
        )
        users_db[user_id] = new_user
        created.append(new_user)
    return created

@app.delete("/users/bulk")
def bulk_delete_users(user_ids: List[str]):
    deleted = []
    not_found = []

    for user_id in user_ids:
        if user_id in users_db:
            del users_db[user_id]
            deleted.append(user_id)
        else:
            not_found.append(user_id)

    return {
        "deleted": deleted,
        "not_found": not_found
    }
```

</details>

---

# Practice

### Exercise 1: Blog API
**Difficulty:** Intermediate

Create a complete blog API with:
- Posts (title, content, author, tags)
- Comments on posts
- Nested routes: `/posts/{id}/comments`
- Filter posts by tag or author

### Exercise 2: E-commerce API
**Difficulty:** Advanced

Build a shopping API with:
- Products with categories
- Shopping cart functionality
- Order creation from cart
- Inventory tracking

---

## Summary

**What you learned:**
- REST API design principles
- CRUD operations with FastAPI and Flask
- Request validation with Pydantic
- Response patterns and pagination
- Authentication basics

**Next Steps:**
- Read: [Python Models](/api/guides/python/models)
- Practice: Build a complete REST API
- Deploy: Host your API on Railway or Render

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Flask RESTful](https://flask-restful.readthedocs.io/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
