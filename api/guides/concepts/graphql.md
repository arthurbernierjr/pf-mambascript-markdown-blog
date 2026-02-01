---
title: "GraphQL Fundamentals"
subTitle: "Query Language for APIs"
excerpt: "Get exactly the data you need with GraphQL."
featureImage: "/img/graphql.png"
date: "2026-02-01"
order: 819
---

# Explanation

## What is GraphQL?

GraphQL is a query language and runtime for APIs. It lets clients request exactly the data they need, making it efficient and flexible compared to REST.

### Key Features

| Feature | Benefit |
|---------|---------|
| Single Endpoint | No multiple requests |
| Exact Data | No over/under-fetching |
| Strong Typing | Self-documenting API |
| Introspection | Discover schema |

---

# Demonstration

## Example 1: Schema Definition

```graphql
# Type definitions
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
  friends: [User!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  comments: [Comment!]!
  tags: [String!]!
  createdAt: DateTime!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
  createdAt: DateTime!
}

# Input types
input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
}

input PostFilter {
  published: Boolean
  authorId: ID
  tags: [String!]
}

# Query type
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(filter: PostFilter, limit: Int, offset: Int): [Post!]!
  me: User
}

# Mutation type
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!

  createPost(title: String!, content: String!): Post!
  updatePost(id: ID!, title: String, content: String): Post!
  deletePost(id: ID!): Boolean!
  publishPost(id: ID!): Post!
}

# Subscription type
type Subscription {
  postCreated: Post!
  commentAdded(postId: ID!): Comment!
}

# Custom scalar
scalar DateTime
```

## Example 2: Queries

```graphql
# Simple query
query GetUser {
  user(id: "1") {
    id
    name
    email
  }
}

# Nested query
query GetUserWithPosts {
  user(id: "1") {
    id
    name
    posts {
      id
      title
      comments {
        id
        text
        author {
          name
        }
      }
    }
  }
}

# Query with variables
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    age
  }
}

# Multiple queries
query Dashboard {
  me {
    id
    name
  }
  recentPosts: posts(limit: 5) {
    id
    title
  }
  users(limit: 10) {
    id
    name
  }
}

# Fragments
fragment UserFields on User {
  id
  name
  email
}

query GetUsers {
  users {
    ...UserFields
    posts {
      id
      title
    }
  }
}

# Inline fragments (for interfaces/unions)
query Search($query: String!) {
  search(query: $query) {
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
  }
}
```

## Example 3: Mutations

```graphql
# Create mutation
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# Variables
{
  "input": {
    "name": "Arthur",
    "email": "art@bpc.com",
    "age": 30
  }
}

# Update mutation
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    age
  }
}

# Multiple mutations
mutation CreatePostAndPublish {
  post: createPost(title: "Hello", content: "World") {
    id
    title
    published
  }
  publishPost(id: "1") {
    id
    published
  }
}
```

## Example 4: Node.js Server

```javascript
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Type definitions
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(title: String!, content: String!, authorId: ID!): Post!
  }
`;

// Mock data
const users = [
  { id: '1', name: 'Arthur', email: 'art@bpc.com' }
];
const posts = [
  { id: '1', title: 'Hello GraphQL', content: 'Content here', authorId: '1' }
];

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(u => u.id === id),
    posts: () => posts,
    post: (_, { id }) => posts.find(p => p.id === id),
  },

  Mutation: {
    createUser: (_, { name, email }) => {
      const user = { id: String(users.length + 1), name, email };
      users.push(user);
      return user;
    },
    createPost: (_, { title, content, authorId }) => {
      const post = { id: String(posts.length + 1), title, content, authorId };
      posts.push(post);
      return post;
    },
  },

  // Field resolvers
  User: {
    posts: (parent) => posts.filter(p => p.authorId === parent.id),
  },

  Post: {
    author: (parent) => users.find(u => u.id === parent.authorId),
  },
};

// Start server
const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    // Add auth context
    const token = req.headers.authorization || '';
    const user = await getUser(token);
    return { user };
  },
});

console.log(`Server ready at ${url}`);
```

## Example 5: Client Usage

```javascript
// Apollo Client setup
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

// Query
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const { data } = await client.query({ query: GET_USERS });

// Mutation
const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

const { data } = await client.mutate({
  mutation: CREATE_USER,
  variables: { name: 'Arthur', email: 'art@bpc.com' },
});

// React hooks
import { useQuery, useMutation } from '@apollo/client';

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

function CreateUserForm() {
  const [createUser, { loading, error }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser({
      variables: { name: 'New User', email: 'new@example.com' },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        Create User
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}
```

## Example 6: Advanced Patterns

```javascript
// DataLoader for batching
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  const users = await User.find({ _id: { $in: ids } });
  return ids.map(id => users.find(u => u.id === id));
});

const resolvers = {
  Post: {
    author: (post, _, { loaders }) => {
      return loaders.userLoader.load(post.authorId);
    },
  },
};

// Context with loaders
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    loaders: {
      userLoader: new DataLoader(batchUsers),
    },
  }),
});

// Authentication directive
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');

function authDirective(directiveName) {
  return {
    authDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,
    authDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
          if (directive) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = async function (source, args, context, info) {
              if (!context.user) {
                throw new Error('Not authenticated');
              }
              return resolve(source, args, context, info);
            };
          }
          return fieldConfig;
        },
      }),
  };
}

// Pagination
const typeDefs = `#graphql
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    posts(first: Int, after: String, last: Int, before: String): PostConnection!
  }
`;

const resolvers = {
  Query: {
    posts: async (_, { first = 10, after }) => {
      const cursor = after ? decodeCursor(after) : null;
      const posts = await Post.find(cursor ? { _id: { $gt: cursor } } : {})
        .limit(first + 1)
        .sort({ _id: 1 });

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map(post => ({
        cursor: encodeCursor(post.id),
        node: post,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!cursor,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: await Post.countDocuments(),
      };
    },
  },
};
```

**Key Takeaways:**
- Schema defines the API contract
- Resolvers implement data fetching
- Use DataLoader for N+1 prevention
- Implement proper pagination
- Add authentication/authorization

---

# Imitation

### Challenge 1: Build a Blog API

**Task:** Create a GraphQL API for a blog with users, posts, and comments.

<details>
<summary>Solution</summary>

```javascript
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
    createdAt: String!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
    createdAt: String!
  }

  type Query {
    posts(published: Boolean): [Post!]!
    post(id: ID!): Post
    user(id: ID!): User
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    publishPost(id: ID!): Post!
    addComment(postId: ID!, text: String!): Comment!
  }
`;

const resolvers = {
  Query: {
    posts: (_, { published }, { db }) => {
      if (published !== undefined) {
        return db.posts.filter(p => p.published === published);
      }
      return db.posts;
    },
    post: (_, { id }, { db }) => db.posts.find(p => p.id === id),
    user: (_, { id }, { db }) => db.users.find(u => u.id === id),
  },

  Mutation: {
    createPost: (_, { title, content }, { user, db }) => {
      if (!user) throw new Error('Unauthorized');
      const post = {
        id: String(db.posts.length + 1),
        title,
        content,
        published: false,
        authorId: user.id,
        createdAt: new Date().toISOString(),
      };
      db.posts.push(post);
      return post;
    },
    publishPost: (_, { id }, { user, db }) => {
      const post = db.posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      if (post.authorId !== user.id) throw new Error('Forbidden');
      post.published = true;
      return post;
    },
    addComment: (_, { postId, text }, { user, db }) => {
      if (!user) throw new Error('Unauthorized');
      const comment = {
        id: String(db.comments.length + 1),
        text,
        postId,
        authorId: user.id,
        createdAt: new Date().toISOString(),
      };
      db.comments.push(comment);
      return comment;
    },
  },

  User: {
    posts: (user, _, { db }) => db.posts.filter(p => p.authorId === user.id),
    comments: (user, _, { db }) => db.comments.filter(c => c.authorId === user.id),
  },

  Post: {
    author: (post, _, { db }) => db.users.find(u => u.id === post.authorId),
    comments: (post, _, { db }) => db.comments.filter(c => c.postId === post.id),
  },

  Comment: {
    author: (comment, _, { db }) => db.users.find(u => u.id === comment.authorId),
    post: (comment, _, { db }) => db.posts.find(p => p.id === comment.postId),
  },
};
```

</details>

---

# Practice

### Exercise 1: Add Subscriptions
**Difficulty:** Intermediate

Add real-time subscriptions for new posts and comments.

### Exercise 2: Implement Caching
**Difficulty:** Advanced

Add caching with Redis for expensive queries.

---

## Summary

**What you learned:**
- Schema definition language
- Queries and mutations
- Resolvers and data fetching
- Client usage
- Advanced patterns

**Next Steps:**
- Read: [API Design](/api/guides/fullstack/api-design)
- Practice: Build a full API
- Explore: Federation, subscriptions

---

## Resources

- [GraphQL Documentation](https://graphql.org/learn/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
