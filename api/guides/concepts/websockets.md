---
title: "WebSockets"
subTitle: "Real-Time Bidirectional Communication"
excerpt: "When HTTP polling isn't fast enough."
featureImage: "/img/websockets.png"
date: "2026-02-01"
order: 807
---

# Explanation

## What are WebSockets?

WebSockets provide full-duplex communication over a single TCP connection. Unlike HTTP request-response, both client and server can send messages anytime.

### Key Concepts

- **Full-Duplex**: Both sides can send simultaneously
- **Persistent**: Connection stays open
- **Low Latency**: No HTTP overhead per message
- **Events**: Message-based communication

### WebSocket vs HTTP Polling

| Aspect | WebSocket | HTTP Polling |
|--------|-----------|--------------|
| Connection | Persistent | New each request |
| Latency | Very low | Higher |
| Server push | Native | Simulated |
| Overhead | Low | High |
| Complexity | Higher | Lower |

---

# Demonstration

## Example 1: Basic WebSocket Server (Node.js)

```javascript
// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Connection handling
wss.on('connection', (ws, req) => {
    console.log('Client connected from:', req.socket.remoteAddress);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to server'
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message);

            // Echo back
            ws.send(JSON.stringify({
                type: 'echo',
                data: message
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON'
            }));
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
});

// Ping all clients periodically
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

console.log('WebSocket server running on ws://localhost:8080');
```

## Example 2: Client-Side WebSocket

```javascript
// client.js
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('Connected');
                this.reconnectAttempts = 0;
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Invalid message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('Disconnected:', event.code, event.reason);
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('Error:', error);
                reject(error);
            };
        });
    }

    handleMessage(message) {
        const { type, ...data } = message;
        const handlers = this.listeners.get(type) || [];
        handlers.forEach(handler => handler(data));
    }

    on(type, handler) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push(handler);
    }

    off(type, handler) {
        const handlers = this.listeners.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) handlers.splice(index, 1);
        }
    }

    send(type, data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        } else {
            console.warn('WebSocket not connected');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => this.connect(), delay);
    }

    disconnect() {
        this.maxReconnectAttempts = 0;
        this.ws?.close();
    }
}

// Usage
const client = new WebSocketClient('ws://localhost:8080');

client.on('welcome', (data) => {
    console.log('Welcome:', data.message);
});

client.on('chat', (data) => {
    console.log(`${data.user}: ${data.message}`);
});

await client.connect();
client.send('chat', { message: 'Hello!' });
```

## Example 3: Chat Room Implementation

```javascript
// chatServer.js
const WebSocket = require('ws');

class ChatServer {
    constructor(port) {
        this.wss = new WebSocket.Server({ port });
        this.rooms = new Map();
        this.clients = new Map();

        this.wss.on('connection', (ws) => this.handleConnection(ws));
        console.log(`Chat server running on port ${port}`);
    }

    handleConnection(ws) {
        const clientId = this.generateId();
        this.clients.set(ws, { id: clientId, rooms: new Set() });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(ws, message);
            } catch (error) {
                this.sendError(ws, 'Invalid message format');
            }
        });

        ws.on('close', () => {
            const client = this.clients.get(ws);
            if (client) {
                client.rooms.forEach(room => this.leaveRoom(ws, room));
                this.clients.delete(ws);
            }
        });

        this.send(ws, 'connected', { clientId });
    }

    handleMessage(ws, message) {
        const { type, ...data } = message;

        switch (type) {
            case 'join':
                this.joinRoom(ws, data.room, data.username);
                break;
            case 'leave':
                this.leaveRoom(ws, data.room);
                break;
            case 'message':
                this.broadcastMessage(ws, data.room, data.content);
                break;
            case 'typing':
                this.broadcastTyping(ws, data.room);
                break;
            default:
                this.sendError(ws, 'Unknown message type');
        }
    }

    joinRoom(ws, roomName, username) {
        const client = this.clients.get(ws);
        if (!client) return;

        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Set());
        }

        const room = this.rooms.get(roomName);
        room.add(ws);
        client.rooms.add(roomName);
        client.username = username;

        this.send(ws, 'joined', { room: roomName });
        this.broadcast(roomName, 'userJoined', {
            room: roomName,
            user: username,
            userCount: room.size
        }, ws);
    }

    leaveRoom(ws, roomName) {
        const client = this.clients.get(ws);
        const room = this.rooms.get(roomName);

        if (room) {
            room.delete(ws);
            if (room.size === 0) {
                this.rooms.delete(roomName);
            } else {
                this.broadcast(roomName, 'userLeft', {
                    room: roomName,
                    user: client?.username,
                    userCount: room.size
                });
            }
        }

        if (client) {
            client.rooms.delete(roomName);
        }
    }

    broadcastMessage(ws, roomName, content) {
        const client = this.clients.get(ws);
        if (!client?.rooms.has(roomName)) return;

        this.broadcast(roomName, 'message', {
            room: roomName,
            user: client.username,
            content,
            timestamp: Date.now()
        });
    }

    broadcastTyping(ws, roomName) {
        const client = this.clients.get(ws);
        if (!client?.rooms.has(roomName)) return;

        this.broadcast(roomName, 'typing', {
            room: roomName,
            user: client.username
        }, ws);
    }

    broadcast(roomName, type, data, exclude = null) {
        const room = this.rooms.get(roomName);
        if (!room) return;

        room.forEach(client => {
            if (client !== exclude && client.readyState === WebSocket.OPEN) {
                this.send(client, type, data);
            }
        });
    }

    send(ws, type, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, ...data }));
        }
    }

    sendError(ws, message) {
        this.send(ws, 'error', { message });
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

new ChatServer(8080);
```

## Example 4: Socket.IO (Higher-Level Library)

```javascript
// Socket.IO Server
const { Server } = require('socket.io');
const io = new Server(3000, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room
    socket.on('join', (room) => {
        socket.join(room);
        socket.to(room).emit('userJoined', socket.id);
    });

    // Chat message
    socket.on('message', (data) => {
        io.to(data.room).emit('message', {
            user: socket.id,
            ...data
        });
    });

    // Typing indicator
    socket.on('typing', (room) => {
        socket.to(room).emit('typing', socket.id);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Socket.IO Client
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected:', socket.id);
    socket.emit('join', 'general');
});

socket.on('message', (data) => {
    console.log(`${data.user}: ${data.content}`);
});

socket.on('typing', (user) => {
    console.log(`${user} is typing...`);
});

// Send message
socket.emit('message', {
    room: 'general',
    content: 'Hello everyone!'
});
```

**Key Takeaways:**
- WebSockets enable real-time communication
- Handle reconnection and heartbeats
- Use rooms for grouping connections
- Socket.IO simplifies common patterns
- Always validate incoming messages

---

# Imitation

### Challenge 1: Build a Live Notification System

**Task:** Create a notification system that broadcasts to specific users.

<details>
<summary>Solution</summary>

```javascript
class NotificationServer {
    constructor(wss) {
        this.wss = wss;
        this.userConnections = new Map();

        wss.on('connection', (ws) => this.handleConnection(ws));
    }

    handleConnection(ws) {
        ws.on('message', (data) => {
            const { type, userId } = JSON.parse(data);

            if (type === 'auth') {
                this.registerUser(userId, ws);
            }
        });

        ws.on('close', () => {
            this.unregisterUser(ws);
        });
    }

    registerUser(userId, ws) {
        if (!this.userConnections.has(userId)) {
            this.userConnections.set(userId, new Set());
        }
        this.userConnections.get(userId).add(ws);
        ws.userId = userId;
    }

    unregisterUser(ws) {
        if (ws.userId) {
            const connections = this.userConnections.get(ws.userId);
            connections?.delete(ws);
            if (connections?.size === 0) {
                this.userConnections.delete(ws.userId);
            }
        }
    }

    notify(userId, notification) {
        const connections = this.userConnections.get(userId);
        if (!connections) return false;

        const message = JSON.stringify({
            type: 'notification',
            ...notification,
            timestamp: Date.now()
        });

        connections.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });

        return true;
    }

    broadcast(notification) {
        const message = JSON.stringify({
            type: 'broadcast',
            ...notification,
            timestamp: Date.now()
        });

        this.wss.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    }
}
```

</details>

---

# Practice

### Exercise 1: Collaborative Editor
**Difficulty:** Advanced

Build a simple collaborative text editor:
- Real-time sync between users
- Cursor position sharing
- Conflict resolution

### Exercise 2: Live Dashboard
**Difficulty:** Intermediate

Create a dashboard with live updates:
- Server pushes metrics
- Multiple dashboard views
- Graceful degradation to polling

---

## Summary

**What you learned:**
- WebSocket fundamentals
- Client and server implementation
- Room-based messaging
- Reconnection strategies
- Socket.IO for simplified usage

**Next Steps:**
- Read: [Real-Time Architecture](/api/guides/concepts/realtime)
- Practice: Build a chat application
- Explore: WebRTC for peer-to-peer

---

## Resources

- [MDN: WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Socket.IO](https://socket.io/docs/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
