---
title: "Full-Stack Authentication"
subTitle: "End-to-End Auth Implementation"
excerpt: "Secure your entire stack with proper authentication."
featureImage: "/img/fullstack-auth.png"
date: "2026-02-01"
order: 904
---

# Explanation

## Full-Stack Authentication

Authentication spans frontend and backend. A complete solution includes registration, login, session management, and protected routes on both sides.

### Components

| Layer | Responsibility |
|-------|----------------|
| Frontend | Forms, token storage, route guards |
| Backend | Validation, token generation, middleware |
| Database | User storage, sessions |

---

# Demonstration

## Example 1: Backend Authentication (Node.js)

```javascript
// auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email already in use'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

// Get current user
exports.me = async (req, res) => {
    const user = await User.findById(req.userId);
    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};
```

## Example 2: Auth Middleware

```javascript
// auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try {
        // Get token from cookie or header
        const token = req.cookies.token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Optional auth (for routes that work with or without auth)
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
        }
    } catch {
        // Ignore errors for optional auth
    }
    next();
};

// Role-based authorization
exports.authorize = (...roles) => {
    return async (req, res, next) => {
        const user = await User.findById(req.userId);

        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
};

// Routes
const router = require('express').Router();
const auth = require('./auth.controller');
const { authenticate, authorize } = require('./auth.middleware');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);

// Protected admin route
router.get('/admin/users', authenticate, authorize('admin'), getUsers);
```

## Example 3: React Authentication Context

```jsx
// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
```

## Example 4: Protected Routes (React)

```jsx
// ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children, roles }) {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Admin only */}
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

// Login.jsx
function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <input name="email" type="email" required />
            <input name="password" type="password" required />
            <button type="submit">Login</button>
        </form>
    );
}
```

## Example 5: Refresh Tokens

```javascript
// Backend - Token refresh
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: 'No refresh token' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        // Check if token is in database (for revocation)
        const storedToken = await RefreshToken.findOne({
            token: refreshToken,
            userId: decoded.userId
        });

        if (!storedToken) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ error: 'Token refresh failed' });
    }
};

// Frontend - Auto refresh
class AuthService {
    constructor() {
        this.accessToken = null;
        this.refreshPromise = null;
    }

    async fetch(url, options = {}) {
        const response = await this.fetchWithToken(url, options);

        if (response.status === 401) {
            // Try to refresh
            await this.refreshAccessToken();
            return this.fetchWithToken(url, options);
        }

        return response;
    }

    async fetchWithToken(url, options) {
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.accessToken}`
            },
            credentials: 'include'
        });
    }

    async refreshAccessToken() {
        // Prevent multiple simultaneous refreshes
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Refresh failed');
            return response.json();
        })
        .then(data => {
            this.accessToken = data.accessToken;
        })
        .finally(() => {
            this.refreshPromise = null;
        });

        return this.refreshPromise;
    }
}
```

## Example 6: OAuth Integration

```javascript
// Backend - OAuth routes
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user._id }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });

        res.redirect('/dashboard');
    }
);

// Frontend
function SocialLogin() {
    return (
        <div>
            <a href="/api/auth/google" className="btn-google">
                Continue with Google
            </a>
            <a href="/api/auth/github" className="btn-github">
                Continue with GitHub
            </a>
        </div>
    );
}
```

**Key Takeaways:**
- Use HTTP-only cookies for tokens
- Implement refresh token rotation
- Create auth context for React
- Protect routes on both sides
- Support OAuth providers

---

# Imitation

### Challenge 1: Complete Auth System

**Task:** Build authentication with email verification.

<details>
<summary>Solution</summary>

```javascript
// Backend
exports.register = async (req, res) => {
    const user = await User.create({
        ...req.body,
        emailVerified: false,
        emailVerifyToken: crypto.randomBytes(32).toString('hex')
    });

    await sendVerificationEmail(user.email, user.emailVerifyToken);

    res.status(201).json({ message: 'Verification email sent' });
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOneAndUpdate(
        { emailVerifyToken: token },
        { emailVerified: true, emailVerifyToken: null },
        { new: true }
    );

    if (!user) {
        return res.status(400).json({ error: 'Invalid token' });
    }

    const jwtToken = generateToken(user._id);
    res.cookie('token', jwtToken, cookieOptions);
    res.json({ user: sanitizeUser(user) });
};

// Middleware to require verified email
exports.requireVerified = async (req, res, next) => {
    const user = await User.findById(req.userId);
    if (!user.emailVerified) {
        return res.status(403).json({ error: 'Email not verified' });
    }
    next();
};
```

</details>

---

# Practice

### Exercise 1: Password Reset
**Difficulty:** Intermediate

Implement forgot/reset password flow.

### Exercise 2: Two-Factor Auth
**Difficulty:** Advanced

Add TOTP-based 2FA to the auth system.

---

## Summary

**What you learned:**
- Backend auth implementation
- JWT and refresh tokens
- React auth context
- Protected routes
- OAuth integration

**Next Steps:**
- Read: [Security](/api/guides/concepts/security)
- Practice: Add 2FA
- Explore: Passkeys, WebAuthn

---

## Resources

- [JWT.io](https://jwt.io/)
- [OWASP Auth Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
