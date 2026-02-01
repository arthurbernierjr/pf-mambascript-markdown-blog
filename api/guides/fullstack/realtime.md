---
title: "Real-Time Applications"
subTitle: "Building Live, Interactive Apps"
excerpt: "Real-time features make apps feel alive and connected."
featureImage: "/img/realtime.png"
date: "2026-02-01"
order: 906
---

# Explanation

## Real-Time Technologies

Real-time applications push data to clients instantly. Choose the right technology based on your needs.

### Options Comparison

| Technology | Use Case | Complexity |
|------------|----------|------------|
| WebSockets | Full duplex | Medium |
| Server-Sent Events | Server to client | Low |
| Long Polling | Fallback | Low |
| WebRTC | Peer-to-peer | High |

---

# Demonstration

## Example 1: WebSocket Server (Socket.io)

```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

// Authentication middleware
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
        const user = await verifyToken(token);
        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication failed'));
    }
});

// Connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join user's room
    socket.join(`user:${socket.user.id}`);

    // Handle chat message
    socket.on('chat:message', async (data) => {
        const message = await saveMessage({
            text: data.text,
            roomId: data.roomId,
            userId: socket.user.id
        });

        // Broadcast to room
        io.to(`room:${data.roomId}`).emit('chat:message', {
            ...message,
            user: socket.user
        });
    });

    // Join room
    socket.on('room:join', (roomId) => {
        socket.join(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit('room:userJoined', {
            user: socket.user
        });
    });

    // Leave room
    socket.on('room:leave', (roomId) => {
        socket.leave(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit('room:userLeft', {
            user: socket.user
        });
    });

    // Typing indicator
    socket.on('typing:start', (roomId) => {
        socket.to(`room:${roomId}`).emit('typing:start', {
            user: socket.user
        });
    });

    socket.on('typing:stop', (roomId) => {
        socket.to(`room:${roomId}`).emit('typing:stop', {
            user: socket.user
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
    });
});

// Send to specific user from anywhere
function sendToUser(userId, event, data) {
    io.to(`user:${userId}`).emit(event, data);
}

// Broadcast to all
function broadcast(event, data) {
    io.emit(event, data);
}

httpServer.listen(3000);
```

## Example 2: React WebSocket Client

```jsx
// SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        const newSocket = io(process.env.REACT_APP_WS_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [token, isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}

// Custom hook for socket events
export function useSocketEvent(event, handler) {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(event, handler);
        return () => socket.off(event, handler);
    }, [socket, event, handler]);
}

// ChatRoom.jsx
function ChatRoom({ roomId }) {
    const { socket, connected } = useSocket();
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);

    // Join room on mount
    useEffect(() => {
        if (!socket || !connected) return;

        socket.emit('room:join', roomId);
        return () => socket.emit('room:leave', roomId);
    }, [socket, connected, roomId]);

    // Listen for messages
    useSocketEvent('chat:message', (message) => {
        setMessages(prev => [...prev, message]);
    });

    // Typing indicators
    useSocketEvent('typing:start', ({ user }) => {
        setTypingUsers(prev => [...prev, user]);
    });

    useSocketEvent('typing:stop', ({ user }) => {
        setTypingUsers(prev => prev.filter(u => u.id !== user.id));
    });

    const sendMessage = (text) => {
        socket.emit('chat:message', { roomId, text });
    };

    return (
        <div className="chat-room">
            <MessageList messages={messages} />
            {typingUsers.length > 0 && (
                <TypingIndicator users={typingUsers} />
            )}
            <MessageInput
                onSend={sendMessage}
                onTyping={() => socket.emit('typing:start', roomId)}
                onStopTyping={() => socket.emit('typing:stop', roomId)}
            />
        </div>
    );
}
```

## Example 3: Server-Sent Events

```javascript
// Backend: SSE endpoint
router.get('/events', authenticate, (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.userId })}\n\n`);

    // Store client connection
    const clientId = Date.now();
    clients.set(clientId, { res, userId: req.userId });

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);

    // Cleanup on close
    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(clientId);
    });
});

// Send event to specific user
function sendToUser(userId, event, data) {
    for (const [, client] of clients) {
        if (client.userId === userId) {
            client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }
}

// Send to all clients
function broadcast(event, data) {
    for (const [, client] of clients) {
        client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
}

// Frontend: EventSource
function useSSE(url) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        const eventSource = new EventSource(url, {
            withCredentials: true
        });

        eventSource.onopen = () => {
            console.log('SSE connected');
        };

        eventSource.onerror = (err) => {
            setError(err);
            eventSource.close();
        };

        eventSource.addEventListener('notification', (e) => {
            setData(JSON.parse(e.data));
        });

        eventSourceRef.current = eventSource;

        return () => eventSource.close();
    }, [url]);

    return { data, error };
}

// Usage
function Notifications() {
    const { data } = useSSE('/api/events');

    useEffect(() => {
        if (data) {
            showNotification(data);
        }
    }, [data]);

    return null;
}
```

## Example 4: Presence System

```javascript
// Backend: Presence tracking
class PresenceManager {
    constructor(io, redis) {
        this.io = io;
        this.redis = redis;
    }

    async setOnline(userId) {
        await this.redis.hset('presence', userId, JSON.stringify({
            status: 'online',
            lastSeen: Date.now()
        }));

        // Notify friends
        const friends = await this.getFriends(userId);
        friends.forEach(friendId => {
            this.io.to(`user:${friendId}`).emit('presence:update', {
                userId,
                status: 'online'
            });
        });
    }

    async setOffline(userId) {
        await this.redis.hset('presence', userId, JSON.stringify({
            status: 'offline',
            lastSeen: Date.now()
        }));

        const friends = await this.getFriends(userId);
        friends.forEach(friendId => {
            this.io.to(`user:${friendId}`).emit('presence:update', {
                userId,
                status: 'offline',
                lastSeen: Date.now()
            });
        });
    }

    async getPresence(userId) {
        const data = await this.redis.hget('presence', userId);
        return data ? JSON.parse(data) : { status: 'offline' };
    }

    async getMultiplePresence(userIds) {
        const results = await this.redis.hmget('presence', ...userIds);
        return userIds.reduce((acc, id, i) => {
            acc[id] = results[i] ? JSON.parse(results[i]) : { status: 'offline' };
            return acc;
        }, {});
    }
}

// Usage with Socket.io
io.on('connection', async (socket) => {
    await presence.setOnline(socket.user.id);

    socket.on('disconnect', async () => {
        // Wait briefly in case of reconnection
        setTimeout(async () => {
            const sockets = await io.in(`user:${socket.user.id}`).fetchSockets();
            if (sockets.length === 0) {
                await presence.setOffline(socket.user.id);
            }
        }, 5000);
    });
});

// Frontend
function usePresence(userIds) {
    const { socket } = useSocket();
    const [presence, setPresence] = useState({});

    useEffect(() => {
        // Initial fetch
        fetch(`/api/presence?ids=${userIds.join(',')}`)
            .then(r => r.json())
            .then(setPresence);
    }, [userIds]);

    useSocketEvent('presence:update', ({ userId, status, lastSeen }) => {
        setPresence(prev => ({
            ...prev,
            [userId]: { status, lastSeen }
        }));
    });

    return presence;
}
```

## Example 5: Real-Time Notifications

```javascript
// Backend: Notification service
class NotificationService {
    constructor(io, db) {
        this.io = io;
        this.db = db;
    }

    async create(notification) {
        const saved = await this.db.notifications.create({
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            read: false,
            createdAt: new Date()
        });

        // Send real-time
        this.io.to(`user:${notification.userId}`).emit('notification', saved);

        // Send push notification if enabled
        if (notification.push) {
            await this.sendPushNotification(notification);
        }

        return saved;
    }

    async markRead(userId, notificationId) {
        await this.db.notifications.updateOne(
            { _id: notificationId, userId },
            { $set: { read: true } }
        );

        this.io.to(`user:${userId}`).emit('notification:read', {
            id: notificationId
        });
    }

    async markAllRead(userId) {
        await this.db.notifications.updateMany(
            { userId, read: false },
            { $set: { read: true } }
        );

        this.io.to(`user:${userId}`).emit('notification:allRead');
    }
}

// Frontend: Notification center
function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch on mount
    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(data => {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            });
    }, []);

    // Real-time updates
    useSocketEvent('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast
        toast(notification.title, {
            description: notification.body,
            action: notification.data?.url && {
                label: 'View',
                onClick: () => navigate(notification.data.url)
            }
        });
    });

    useSocketEvent('notification:read', ({ id }) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    });

    const markRead = async (id) => {
        await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    };

    return (
        <Popover>
            <PopoverTrigger>
                <Bell />
                {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
            </PopoverTrigger>
            <PopoverContent>
                {notifications.map(n => (
                    <NotificationItem
                        key={n.id}
                        notification={n}
                        onRead={() => markRead(n.id)}
                    />
                ))}
            </PopoverContent>
        </Popover>
    );
}
```

## Example 6: Live Collaboration

```javascript
// Collaborative document editing
const { Server } = require('socket.io');
const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

// Server-side document sync
class CollaborationServer {
    constructor(io) {
        this.io = io;
        this.documents = new Map();
    }

    getDocument(docId) {
        if (!this.documents.has(docId)) {
            this.documents.set(docId, new Y.Doc());
        }
        return this.documents.get(docId);
    }

    setupNamespace() {
        const collab = this.io.of('/collaboration');

        collab.on('connection', (socket) => {
            const docId = socket.handshake.query.docId;
            const doc = this.getDocument(docId);

            socket.join(docId);

            // Send current state
            const state = Y.encodeStateAsUpdate(doc);
            socket.emit('sync', state);

            // Handle updates
            socket.on('update', (update) => {
                Y.applyUpdate(doc, update);
                socket.to(docId).emit('update', update);
            });

            // Cursor awareness
            socket.on('cursor', (cursor) => {
                socket.to(docId).emit('cursor', {
                    id: socket.user.id,
                    ...cursor
                });
            });

            socket.on('disconnect', () => {
                socket.to(docId).emit('cursor:remove', {
                    id: socket.user.id
                });
            });
        });
    }
}

// React: Collaborative editor
function CollaborativeEditor({ docId }) {
    const editorRef = useRef(null);
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        const doc = new Y.Doc();
        const socket = io('/collaboration', { query: { docId } });

        // Sync initial state
        socket.on('sync', (state) => {
            Y.applyUpdate(doc, new Uint8Array(state));
        });

        // Apply remote updates
        socket.on('update', (update) => {
            Y.applyUpdate(doc, new Uint8Array(update));
        });

        // Local changes
        doc.on('update', (update, origin) => {
            if (origin !== 'remote') {
                socket.emit('update', Array.from(update));
            }
        });

        // Cursor awareness
        socket.on('cursor', (cursor) => {
            setCursors(prev => ({ ...prev, [cursor.id]: cursor }));
        });

        socket.on('cursor:remove', ({ id }) => {
            setCursors(prev => {
                const { [id]: _, ...rest } = prev;
                return rest;
            });
        });

        return () => socket.close();
    }, [docId]);

    return (
        <div className="editor">
            <Editor ref={editorRef} />
            {Object.entries(cursors).map(([id, cursor]) => (
                <RemoteCursor key={id} {...cursor} />
            ))}
        </div>
    );
}
```

**Key Takeaways:**
- WebSockets for bidirectional communication
- SSE for server-to-client streaming
- Implement presence for user status
- Handle reconnection gracefully
- Use rooms for scoped messaging

---

# Imitation

### Challenge 1: Live Chat System

**Task:** Build a complete chat application with rooms and typing indicators.

<details>
<summary>Solution</summary>

See the full implementation in Example 1 and 2 above, which covers server setup, client integration, and room-based messaging.

</details>

---

# Practice

### Exercise 1: Live Dashboard
**Difficulty:** Intermediate

Build a real-time analytics dashboard with charts.

### Exercise 2: Multiplayer Game
**Difficulty:** Advanced

Create a simple multiplayer game with state sync.

---

## Summary

**What you learned:**
- WebSocket implementation
- Server-Sent Events
- Presence systems
- Real-time notifications
- Live collaboration

**Next Steps:**
- Read: [WebSockets](/api/guides/concepts/websockets)
- Practice: Add real-time features
- Explore: WebRTC, PubSub

---

## Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [MDN: WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
