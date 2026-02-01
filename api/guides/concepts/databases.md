---
title: "Database Fundamentals"
subTitle: "Storing and Retrieving Data"
excerpt: "Your application is only as good as its data layer."
featureImage: "/img/databases.png"
date: "2026-02-01"
order: 804
---

# Explanation

## SQL vs NoSQL

Databases come in two main flavors: SQL (relational) and NoSQL (non-relational). Each has its strengths.

### SQL Databases

- **Structure**: Tables with rows and columns
- **Schema**: Fixed, defined upfront
- **Relationships**: JOINs between tables
- **ACID**: Strong consistency guarantees
- **Examples**: PostgreSQL, MySQL, SQLite

### NoSQL Databases

- **Structure**: Documents, key-value, graphs
- **Schema**: Flexible, can evolve
- **Relationships**: Often embedded or referenced
- **Scale**: Horizontal scaling
- **Examples**: MongoDB, Redis, Cassandra

### When to Use Which?

| Use Case | Recommended |
|----------|-------------|
| Complex relationships | SQL |
| Transactions | SQL |
| Flexible schema | NoSQL |
| High write volume | NoSQL |
| Full-text search | Either (with extensions) |

---

# Demonstration

## Example 1: SQL Basics (PostgreSQL)

```sql
-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert data
INSERT INTO users (email, name) VALUES
    ('arthur@bpc.com', 'Arthur'),
    ('sarah@example.com', 'Sarah');

INSERT INTO posts (title, content, user_id, published) VALUES
    ('Hello World', 'My first post!', 1, TRUE),
    ('Draft Post', 'Work in progress', 1, FALSE),
    ('Sarah''s Post', 'Hello from Sarah', 2, TRUE);

-- Basic queries
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;
SELECT * FROM posts WHERE published = TRUE;

-- JOINs
SELECT posts.title, users.name AS author
FROM posts
JOIN users ON posts.user_id = users.id
WHERE posts.published = TRUE;

-- Aggregations
SELECT user_id, COUNT(*) AS post_count
FROM posts
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Subqueries
SELECT * FROM users
WHERE id IN (SELECT user_id FROM posts WHERE published = TRUE);

-- Update
UPDATE posts SET published = TRUE WHERE id = 2;

-- Delete
DELETE FROM posts WHERE id = 2;

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
```

## Example 2: MongoDB (NoSQL)

```javascript
// Connect
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('myapp');

// Collections
const users = db.collection('users');
const posts = db.collection('posts');

// Insert
await users.insertOne({
    email: 'arthur@bpc.com',
    name: 'Arthur',
    createdAt: new Date()
});

await users.insertMany([
    { email: 'sarah@example.com', name: 'Sarah' },
    { email: 'bob@example.com', name: 'Bob' }
]);

// Documents with embedded data
await posts.insertOne({
    title: 'Hello World',
    content: 'My first post!',
    author: {
        id: userId,
        name: 'Arthur'
    },
    tags: ['intro', 'welcome'],
    comments: [
        { user: 'Sarah', content: 'Great post!', createdAt: new Date() }
    ],
    published: true,
    createdAt: new Date()
});

// Queries
const user = await users.findOne({ email: 'arthur@bpc.com' });
const allPosts = await posts.find({ published: true }).toArray();

// Query operators
const recentPosts = await posts.find({
    createdAt: { $gte: new Date('2024-01-01') },
    'author.name': 'Arthur',
    tags: { $in: ['intro', 'tutorial'] }
}).toArray();

// Projections (select fields)
const titles = await posts.find(
    { published: true },
    { projection: { title: 1, _id: 0 } }
).toArray();

// Sorting and pagination
const paginated = await posts.find({ published: true })
    .sort({ createdAt: -1 })
    .skip(10)
    .limit(10)
    .toArray();

// Aggregation pipeline
const stats = await posts.aggregate([
    { $match: { published: true } },
    { $group: {
        _id: '$author.name',
        postCount: { $sum: 1 },
        avgComments: { $avg: { $size: '$comments' } }
    }},
    { $sort: { postCount: -1 } }
]).toArray();

// Update
await posts.updateOne(
    { _id: postId },
    { $set: { title: 'Updated Title' } }
);

// Add to array
await posts.updateOne(
    { _id: postId },
    { $push: { tags: 'updated' } }
);

// Delete
await posts.deleteOne({ _id: postId });

// Indexes
await posts.createIndex({ 'author.id': 1 });
await posts.createIndex({ tags: 1 });
await posts.createIndex({ title: 'text', content: 'text' });  // Text search
```

## Example 3: ORM/ODM Usage

```javascript
// Sequelize (SQL ORM)
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

// Define models
const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Post = sequelize.define('Post', {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Relationships
User.hasMany(Post);
Post.belongsTo(User);

// Usage
const user = await User.create({ email: 'art@bpc.com', name: 'Arthur' });

const post = await Post.create({
    title: 'Hello',
    content: 'World',
    UserId: user.id
});

// Queries
const users = await User.findAll({
    include: Post,
    where: { name: { [Op.like]: '%Art%' } }
});

// Mongoose (MongoDB ODM)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    published: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Usage
const user = await User.create({ email: 'art@bpc.com', name: 'Arthur' });
const post = await Post.create({ title: 'Hello', author: user._id });

// Population (like JOIN)
const posts = await Post.find({ published: true })
    .populate('author', 'name email')
    .sort('-createdAt');
```

## Example 4: Transactions and Migrations

```javascript
// SQL Transactions
const { sequelize } = require('./models');

async function transferMoney(fromId, toId, amount) {
    const transaction = await sequelize.transaction();

    try {
        await Account.decrement('balance', {
            by: amount,
            where: { id: fromId },
            transaction
        });

        await Account.increment('balance', {
            by: amount,
            where: { id: toId },
            transaction
        });

        await transaction.commit();
        return { success: true };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// MongoDB Transactions (4.0+)
async function transferMoney(fromId, toId, amount) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Account.updateOne(
            { _id: fromId },
            { $inc: { balance: -amount } },
            { session }
        );

        await Account.updateOne(
            { _id: toId },
            { $inc: { balance: amount } },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

// Migrations (Sequelize)
// migrations/20240115-create-users.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: Sequelize.STRING,
                unique: true
            },
            name: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('users');
    }
};
```

**Key Takeaways:**
- SQL for complex relationships and transactions
- NoSQL for flexibility and scale
- Use ORMs/ODMs to simplify database code
- Always use transactions for related operations
- Index frequently queried fields

---

# Imitation

### Challenge 1: Design a Blog Schema

**Task:** Design tables/collections for a blog with users, posts, comments, and tags.

<details>
<summary>Solution</summary>

```sql
-- SQL Schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    parent_id INTEGER REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_comments_post ON comments(post_id);
```

</details>

### Challenge 2: Implement Soft Delete

**Task:** Implement soft delete pattern for posts.

<details>
<summary>Solution</summary>

```javascript
// Add deleted_at column
// Migration
await queryInterface.addColumn('posts', 'deleted_at', {
    type: Sequelize.DATE,
    allowNull: true
});

// Model with default scope
const Post = sequelize.define('Post', {
    // ... fields
    deletedAt: DataTypes.DATE
}, {
    defaultScope: {
        where: { deletedAt: null }
    },
    scopes: {
        withDeleted: {},
        onlyDeleted: {
            where: { deletedAt: { [Op.ne]: null } }
        }
    }
});

// Soft delete method
Post.prototype.softDelete = async function() {
    this.deletedAt = new Date();
    return this.save();
};

// Restore method
Post.prototype.restore = async function() {
    this.deletedAt = null;
    return this.save();
};

// Usage
const post = await Post.findByPk(1);
await post.softDelete();

// Include deleted
const allPosts = await Post.scope('withDeleted').findAll();

// Only deleted
const deletedPosts = await Post.scope('onlyDeleted').findAll();
```

</details>

---

# Practice

### Exercise 1: Build a Query Builder
**Difficulty:** Intermediate

Create a simple query builder class:
```javascript
const users = await query('users')
    .select('name', 'email')
    .where('active', true)
    .orderBy('name')
    .limit(10)
    .execute();
```

### Exercise 2: Connection Pool
**Difficulty:** Advanced

Implement connection pooling:
- Pool of reusable connections
- Acquire/release connections
- Handle timeouts
- Monitor pool health

---

## Summary

**What you learned:**
- SQL vs NoSQL trade-offs
- CRUD operations in both
- Using ORMs and ODMs
- Transactions for data integrity
- Schema design patterns

**Next Steps:**
- Read: [API Design Patterns](/api/guides/concepts/api-design)
- Practice: Build a database-backed API
- Explore: Query optimization

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
