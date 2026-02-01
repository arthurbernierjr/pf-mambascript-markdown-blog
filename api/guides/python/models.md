---
title: "Python Data Models"
subTitle: "Structuring Data with Pydantic and Dataclasses"
excerpt: "Good data models are the foundation of reliable software."
featureImage: "/img/python-models.png"
date: "2026-02-01"
order: 104
---

# Explanation

## Why Data Models Matter

Data models define the shape of your data. They validate input, provide autocomplete, and document your API. Python offers several ways to create models: dataclasses, Pydantic, and traditional classes.

Think of models as contracts - they guarantee what data looks like when it enters or leaves your system.

### Key Concepts

- **Schema**: The structure definition of your data
- **Validation**: Ensuring data meets requirements
- **Serialization**: Converting objects to JSON/dict
- **Type Hints**: Python's type annotation system

### Comparison

| Feature | Dataclass | Pydantic | Traditional Class |
|---------|-----------|----------|-------------------|
| Validation | Manual | Automatic | Manual |
| JSON support | Limited | Built-in | Manual |
| Performance | Fast | Good | Depends |
| Boilerplate | Low | Low | High |

---

# Demonstration

## Example 1: Pydantic Models

```python
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class Address(BaseModel):
    street: str
    city: str
    country: str = "USA"
    zip_code: str = Field(..., regex=r'^\d{5}(-\d{4})?$')

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    role: Role = Role.USER

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_strength(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain a digit')
        return v

class User(UserBase):
    id: int
    created_at: datetime
    address: Optional[Address] = None
    tags: List[str] = []

    class Config:
        # Allow ORM objects
        orm_mode = True
        # Example for docs
        schema_extra = {
            "example": {
                "id": 1,
                "name": "Arthur",
                "email": "art@bpc.com",
                "role": "admin",
                "created_at": "2024-01-15T10:30:00"
            }
        }

# Usage
user_data = {
    "name": "Arthur",
    "email": "art@bpc.com",
    "password": "SecurePass123"
}

try:
    user = UserCreate(**user_data)
    print(user.dict())  # Convert to dictionary
    print(user.json())  # Convert to JSON string
except Exception as e:
    print(f"Validation error: {e}")

# Parsing from JSON
json_data = '{"name": "Sarah", "email": "sarah@example.com", "password": "Test1234"}'
user2 = UserCreate.parse_raw(json_data)
```

## Example 2: Dataclasses

```python
from dataclasses import dataclass, field, asdict
from typing import Optional, List
from datetime import datetime
import json

@dataclass
class Product:
    name: str
    price: float
    category: str = "general"
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        # Validation after initialization
        if self.price < 0:
            raise ValueError("Price cannot be negative")
        if len(self.name) < 2:
            raise ValueError("Name too short")

    @property
    def display_price(self) -> str:
        return f"${self.price:.2f}"

    def apply_discount(self, percent: float) -> float:
        discount = self.price * (percent / 100)
        self.price -= discount
        return self.price

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self) -> str:
        data = self.to_dict()
        data['created_at'] = data['created_at'].isoformat()
        return json.dumps(data)

    @classmethod
    def from_dict(cls, data: dict) -> 'Product':
        if 'created_at' in data and isinstance(data['created_at'], str):
            data['created_at'] = datetime.fromisoformat(data['created_at'])
        return cls(**data)

@dataclass(frozen=True)  # Immutable
class ImmutableConfig:
    api_key: str
    base_url: str
    timeout: int = 30

# Usage
product = Product("Laptop", 999.99, tags=["electronics", "computer"])
print(product.display_price)  # $999.99
product.apply_discount(10)
print(product.to_json())

# Immutable config
config = ImmutableConfig("secret-key", "https://api.example.com")
# config.timeout = 60  # Error! Frozen dataclass
```

## Example 3: Model Relationships

```python
from pydantic import BaseModel
from typing import List, Optional, ForwardRef
from datetime import datetime

# Forward reference for circular dependencies
PostRef = ForwardRef('Post')

class Author(BaseModel):
    id: int
    name: str
    email: str
    posts: List[PostRef] = []

    class Config:
        orm_mode = True

class Comment(BaseModel):
    id: int
    content: str
    author_id: int
    created_at: datetime

class Post(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    author: Optional[Author] = None
    comments: List[Comment] = []
    tags: List[str] = []
    published: bool = False
    created_at: datetime

    class Config:
        orm_mode = True

# Update forward references
Author.update_forward_refs()

# Usage with nested data
post_data = {
    "id": 1,
    "title": "Getting Started with Python",
    "content": "Python is a great language...",
    "author_id": 1,
    "author": {
        "id": 1,
        "name": "Arthur",
        "email": "art@bpc.com"
    },
    "comments": [
        {"id": 1, "content": "Great post!", "author_id": 2, "created_at": "2024-01-15T10:00:00"}
    ],
    "tags": ["python", "tutorial"],
    "published": True,
    "created_at": "2024-01-15T09:00:00"
}

post = Post(**post_data)
print(post.author.name)  # Arthur
print(len(post.comments))  # 1
```

## Example 4: Custom Validators

```python
from pydantic import BaseModel, validator, root_validator
from typing import Optional
from datetime import date

class Event(BaseModel):
    name: str
    start_date: date
    end_date: date
    max_attendees: int = 100
    current_attendees: int = 0

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.title()

    @validator('max_attendees')
    def validate_max(cls, v):
        if v < 1 or v > 10000:
            raise ValueError('Max attendees must be between 1 and 10000')
        return v

    @validator('current_attendees')
    def validate_current(cls, v, values):
        max_att = values.get('max_attendees', 100)
        if v > max_att:
            raise ValueError('Current cannot exceed max attendees')
        return v

    @root_validator
    def validate_dates(cls, values):
        start = values.get('start_date')
        end = values.get('end_date')
        if start and end and start > end:
            raise ValueError('End date must be after start date')
        return values

    @property
    def spots_available(self) -> int:
        return self.max_attendees - self.current_attendees

    @property
    def is_full(self) -> bool:
        return self.current_attendees >= self.max_attendees

# Usage
event = Event(
    name="python conference",
    start_date="2024-06-01",
    end_date="2024-06-03",
    max_attendees=500,
    current_attendees=350
)

print(event.name)  # Python Conference (title cased)
print(event.spots_available)  # 150
```

**Key Takeaways:**
- Pydantic provides automatic validation
- Dataclasses reduce boilerplate for simple models
- Use validators for complex business rules
- Models document your API automatically

---

# Imitation

### Challenge 1: Create an Order Model

**Task:** Create order and order item models with total calculation.

<details>
<summary>Solution</summary>

```python
from pydantic import BaseModel, validator
from typing import List
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

class OrderItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int = 1

    @property
    def subtotal(self) -> float:
        return self.price * self.quantity

class Order(BaseModel):
    id: int
    customer_id: int
    items: List[OrderItem]
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = None

    @validator('items')
    def must_have_items(cls, v):
        if not v:
            raise ValueError('Order must have at least one item')
        return v

    @property
    def total(self) -> float:
        return sum(item.subtotal for item in self.items)

    @property
    def item_count(self) -> int:
        return sum(item.quantity for item in self.items)
```

</details>

### Challenge 2: Create a Validated Settings Model

**Task:** Create a settings model that validates URLs, ports, and environment types.

<details>
<summary>Solution</summary>

```python
from pydantic import BaseModel, validator, HttpUrl
from typing import Optional
from enum import Enum

class Environment(str, Enum):
    DEV = "development"
    STAGING = "staging"
    PROD = "production"

class Settings(BaseModel):
    app_name: str
    environment: Environment
    api_url: HttpUrl
    port: int = 8000
    debug: bool = False
    secret_key: str

    @validator('port')
    def valid_port(cls, v):
        if not 1024 <= v <= 65535:
            raise ValueError('Port must be between 1024 and 65535')
        return v

    @validator('debug')
    def no_debug_in_prod(cls, v, values):
        if v and values.get('environment') == Environment.PROD:
            raise ValueError('Debug cannot be True in production')
        return v

    @validator('secret_key')
    def key_length(cls, v):
        if len(v) < 32:
            raise ValueError('Secret key must be at least 32 characters')
        return v
```

</details>

---

# Practice

### Exercise 1: User Profile System
**Difficulty:** Intermediate

Create models for a user profile system:
- User with profile information
- Social links (validated URLs)
- Skills with proficiency levels
- Work experience with date validation

### Exercise 2: Inventory Management
**Difficulty:** Advanced

Build models for inventory:
- Product with variants (size, color)
- Warehouse locations
- Stock levels with low-stock alerts
- Transfer between warehouses

---

## Summary

**What you learned:**
- Pydantic models with validation
- Dataclasses for simple data structures
- Custom validators and root validators
- Model relationships and nesting
- Computed properties

**Next Steps:**
- Read: [Go Introduction](/api/guides/go/intro)
- Practice: Create models for your API
- Build: Integrate models with a database

---

## Resources

- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Python Dataclasses](https://docs.python.org/3/library/dataclasses.html)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
